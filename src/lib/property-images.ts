import { PropertyItem, PropertyType } from '@/types';

const PROPERTY_TYPE_IMAGES: Record<PropertyType, string> = {
  plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  independent_house: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  builder_project: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
};

export function getPropertyTypeImage(propertyType: PropertyType): string {
  return PROPERTY_TYPE_IMAGES[propertyType];
}

export function getPropertyImage(property: Pick<PropertyItem, 'propertyType' | 'images'>, index = 0): string {
  const image = property.images[index];
  if (!image || image.includes('photo-1524813686514-a57563d77d66')) {
    return getPropertyTypeImage(property.propertyType);
  }
  return image;
}
