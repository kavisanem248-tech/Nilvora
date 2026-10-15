import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/rbac';
import { PropertyItem } from '@/types';
import { getRequestSession } from '@/lib/auth/request-session';
import { getPropertyTypeImage } from '@/lib/property-images';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyType = searchParams.get('propertyType');
  const listingType = searchParams.get('listingType');
  const locality = searchParams.get('locality');
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined;

  const session = getRequestSession(request);
  const broker = session?.user.role === 'broker'
    ? db.getData().brokers.find((profile) => profile.profileId === session.user.id)
    : undefined;
  let filtered = db.getProperties().filter((property) => {
    if (property.status === 'published') return true;
    if (!session) return false;
    return session.user.role === 'admin' ||
      (session.user.role === 'seller' && property.ownerId === session.user.id) ||
      (session.user.role === 'broker' && property.assignedBrokerId === broker?.id);
  });

  if (propertyType && propertyType !== 'all') {
    filtered = filtered.filter((p) => p.propertyType === propertyType);
  }

  if (listingType && listingType !== 'all') {
    filtered = filtered.filter((p) => p.listingType === listingType);
  }

  if (locality && locality !== 'all') {
    filtered = filtered.filter((p) => p.locality.toLowerCase().includes(locality.toLowerCase()));
  }

  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  if (bedrooms !== undefined && !isNaN(bedrooms)) {
    filtered = filtered.filter((p) => p.bedrooms === bedrooms);
  }

  const visibleProperties = filtered.map((property) => {
    const currentProperty = {
      ...property,
      isFeatured: Boolean(property.isFeatured && (!property.featuredUntil || new Date(property.featuredUntil) > new Date())),
      likesCount: db.getPropertyLikeCount(property.id),
    };
    const canSeePrivateDocuments = session?.user.role === 'admin' ||
      (session?.user.role === 'seller' && property.ownerId === session.user.id);
    return canSeePrivateDocuments
      ? currentProperty
      : { ...currentProperty, documents: currentProperty.documents?.filter((document) => !document.isPrivate) };
  });

  return NextResponse.json({
    success: true,
    count: visibleProperties.length,
    data: visibleProperties,
    meta: {
      timestamp: new Date().toISOString(),
      state: 'Tamil Nadu',
      sroJurisdiction: 'Ambattur / North Chennai Sub-Registrar',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sign in as a property owner, broker, or admin to list a property.' },
        { status: 401 }
      );
    }

    const canCreateProperty = ['seller', 'broker', 'admin'].includes(session.user.role) &&
      hasPermission(session.user.role, 'properties:create');
    if (!canCreateProperty) {
      return NextResponse.json(
        { success: false, error: 'Only property owners, brokers, and admins can create listings.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 1. Mandatory Fields Validation
    if (!body.title || !body.price || !body.propertyType || !body.locality || !body.areaSqft) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mandatory fields missing: title, price, propertyType, locality, and areaSqft are required.',
        },
        { status: 400 }
      );
    }

    const priceNum = Number(body.price);
    const areaNum = Number(body.areaSqft);

    // 2. Realistic Price & Area Sanity Checks (Anti-Fraud)
    if (isNaN(priceNum) || priceNum < 500000 && body.listingType !== 'rent') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid price: Properties for sale within Chennai limits must have a realistic valuation of at least ₹5,00,000.',
        },
        { status: 400 }
      );
    }

    if (isNaN(areaNum) || areaNum < 100) {
      return NextResponse.json(
        { success: false, error: 'Area must be at least 100 square feet.' },
        { status: 400 }
      );
    }

    // 3. Evidence-Based Verification Scope (Evidence Scoped Trust, Never Fabricated)
    const ownerId = session.user.id;

    const newProperty: PropertyItem = {
      id: `prop-${Date.now()}`,
      ownerId,
      assignedBrokerId: session.user.role === 'admin' && typeof body.assignedBrokerId === 'string'
        ? body.assignedBrokerId
        : undefined,
      title: body.title.trim(),
      titleTa: body.titleTa,
      description: body.description || '',
      propertyType: body.propertyType,
      listingType: body.listingType || 'sale',
      status: 'under_review', // Listings start under_review per compliance rules
      price: priceNum,
      priceNegotiable: Boolean(body.priceNegotiable),
      state: body.state || 'Tamil Nadu',
      district: body.district || 'Chennai',
      locality: body.locality.trim(),
      subLocality: body.subLocality || '',
      pincode: body.pincode || '600053',
      surveyNumber: body.surveyNumber ? body.surveyNumber.trim() : 'PENDING_SURVEY_VERIFICATION',
      pattaNumber: body.pattaNumber ? body.pattaNumber.trim() : 'PENDING_PATTA_VERIFICATION',
      areaSqft: areaNum,
      bedrooms: Number(body.bedrooms || 0),
      bathrooms: Number(body.bathrooms || 0),
      floorNumber: body.floorNumber ? Number(body.floorNumber) : undefined,
      totalFloors: body.totalFloors ? Number(body.totalFloors) : undefined,
      furnishingStatus: body.furnishingStatus || 'unfurnished',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : [getPropertyTypeImage(body.propertyType)],
      reels: [],
      trustScore: 80, // Base self-declaration score
      trustScope: {
        sellerDeclaration: true,
        docChecked: false, // Document check requires advocate or admin review
        legalReviewed: false,
        reraVerified: Boolean(body.propertyType === 'builder_project' && body.reraNumber),
        ecVerified: false,
        pattaVerified: false,
        lastCheckedDate: new Date().toISOString().split('T')[0],
        reviewerName: 'Pending NILVORA Advocate Assignment',
        disclaimer: 'Owner self-declaration recorded. Document investigation by advocate is pending.',
      },
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      builderProjectName: body.builderProjectName,
    };

    // 4. Persist to Persistent Database
    db.createProperty(newProperty);

    // 5. Audit Log Entry
    db.addAuditLog({
      userId: ownerId,
      action: 'PROPERTY_LISTING_CREATED',
      resource: 'properties',
      resourceId: newProperty.id,
      details: {
        title: newProperty.title,
        price: newProperty.price,
        locality: newProperty.locality,
        status: newProperty.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Property submitted for review.',
        data: newProperty,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error processing listing creation.' },
      { status: 500 }
    );
  }
}
