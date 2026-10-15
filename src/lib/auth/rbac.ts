import { UserRole, PropertyItem, DealRoomItem, OfferItem } from '@/types';

export type PublicRegistrationRole = Extract<UserRole, 'buyer' | 'seller' | 'broker'>;
export const VALID_PUBLIC_ROLES: PublicRegistrationRole[] = ['buyer', 'seller', 'broker'];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  buyer: [
    'properties:view_published',
    'properties:save',
    'appointments:book',
    'offers:create',
    'deal_rooms:view_own',
    'messages:send',
  ],
  seller: [
    'properties:view_published',
    'properties:create',
    'properties:edit_own',
    'properties:archive_own',
    'reels:upload_own',
    'offers:review_own',
    'deal_rooms:view_own',
    'leads:view_own_property',
    'messages:send',
  ],
  broker: [
    'properties:view_published',
    'properties:create',
    'leads:view_assigned',
    'leads:update_status',
    'appointments:manage_assigned',
    'offers:counter',
    'deal_rooms:manage_assigned',
    'commissions:view_own',
    'messages:send',
  ],
  builder: [
    'properties:view_published',
    'projects:manage_own',
    'units:allocate',
    'leads:view_project',
    'deal_rooms:view_own',
    'messages:send',
  ],
  legal_pro: [
    'properties:view_published',
    'documents:audit_title',
    'documents:verify_patta_ec',
    'deal_rooms:review_legal_milestones',
    'messages:send',
  ],
  admin: [
    '*', // Full unrestricted access
    'platform:oversight',
    'properties:moderate',
    'users:manage',
    'commissions:settle',
    'integrations:configure',
    'audit_logs:view',
  ],
};

/**
 * Validates that requested role during public registration is strictly non-admin.
 */
export function validatePublicRegistrationRole(role: string): { valid: boolean; error?: string } {
  if (role === 'admin') {
    return {
      valid: false,
      error: 'SECURITY VIOLATION: Super Administrator accounts cannot be created via public registration. Access must be provisioned via root server authorization.',
    };
  }
  if (!VALID_PUBLIC_ROLES.includes(role as PublicRegistrationRole)) {
    return {
      valid: false,
    error: `Invalid role specified. Permitted roles are: ${VALID_PUBLIC_ROLES.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Check if a user possesses a specific permission.
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  if (userRole === 'admin') return true;
  const userPerms = ROLE_PERMISSIONS[userRole] || [];
  return userPerms.includes(permission) || userPerms.includes('*');
}

/**
 * Ensures user is authorized to edit or modify a property.
 * Allowed: Property owner, or Platform Admin.
 */
export function canEditProperty(userId: string, userRole: UserRole, property: PropertyItem): boolean {
  if (userRole === 'admin') return true;
  return property.ownerId === userId;
}

/**
 * Ensures user is authorized to enter or view a Deal Room.
 * Allowed: Buyer, Seller, Assigned Broker, or Platform Admin.
 */
export function canAccessDealRoom(userId: string, userRole: UserRole, dealRoom: DealRoomItem): boolean {
  if (userRole === 'admin') return true;
  return (
    dealRoom.buyerId === userId ||
    dealRoom.sellerId === userId ||
    dealRoom.brokerId === userId
  );
}

/**
 * Ensures user is authorized to view or manage an offer.
 * Allowed: Buyer who submitted, Property Owner, Assigned Broker, or Admin.
 */
export function canManageOffer(userId: string, userRole: UserRole, offer: OfferItem, property?: PropertyItem): boolean {
  if (userRole === 'admin') return true;
  if (offer.buyerId === userId) return true;
  if (property && property.ownerId === userId) return true;
  if (offer.brokerId === userId) return true;
  return false;
}
