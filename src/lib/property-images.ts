import { PropertyItem, PropertyType } from '@/types';

const PROPERTY_TYPE_IMAGES: Record<PropertyType, string> = {
  plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  independent_house: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  builder_project: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
};

const PLOT_IMAGES: Record<string, string> = {
  'prop-3': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'prop-8': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'demo-plot-ambattur-01': 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80',
  'demo-plot-avadi-01': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'demo-plot-pattabiram-01': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'demo-plot-poonamallee-01': 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  'demo-plot-thirumazhisai-01': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  'demo-plot-korattur-01': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'demo-plot-agri-redhills-01': 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80',
};

export function getPropertyTypeImage(propertyType: PropertyType): string {
  return PROPERTY_TYPE_IMAGES[propertyType];
}

export function getPropertyImage(property: Pick<PropertyItem, 'id' | 'propertyType' | 'images'>, index = 0): string {
  const plotImage = property.propertyType === 'plot' ? PLOT_IMAGES[property.id] : undefined;
  if (plotImage && index === 0) return plotImage;

  const image = property.images[index];
  if (!image || image.includes('photo-1524813686514-a57563d77d66')) {
    return plotImage || getPropertyTypeImage(property.propertyType);
  }
  return image;
}
