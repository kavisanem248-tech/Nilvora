// NILVORA Tamil & Natural Language Search Query Parser
// Converts colloquial Tamil & English real-estate phrases into structured search filters.

export interface ParsedSearchFilters {
  rawQuery: string;
  detectedLanguage: 'tamil' | 'tanglish' | 'english';
  locality?: string;
  listingType?: 'sale' | 'rent';
  propertyType?: 'apartment' | 'villa' | 'plot' | 'independent_house' | 'commercial';
  bedrooms?: number;
  maxPrice?: number;
  minPrice?: number;
  amenities?: string[];
  explanation: string;
}

export const parseNaturalLanguageQuery = (query: string): ParsedSearchFilters => {
  const lower = query.toLowerCase().trim();
  const filters: ParsedSearchFilters = {
    rawQuery: query,
    detectedLanguage: 'english',
    explanation: 'Interpreted as standard search criteria.',
  };

  // Detect Tanglish or Tamil
  const isTanglishOrTamil =
    /la|kulla|venum|irukkura|kaattu|kitta|vaanga|vadagai|veedu|manai|kodi|lakh/i.test(lower);
  if (isTanglishOrTamil) {
    filters.detectedLanguage = 'tanglish';
  }

  // 1. Locality Extraction
  if (lower.includes('ambattur') || lower.includes('அம்பத்தூர்')) {
    filters.locality = 'Ambattur';
  } else if (lower.includes('mogappair') || lower.includes('முகப்பேர்')) {
    filters.locality = 'Mogappair';
  } else if (lower.includes('anna nagar') || lower.includes('அண்ணா நகர்')) {
    filters.locality = 'Anna Nagar';
  } else if (lower.includes('korattur') || lower.includes('கொரட்டூர்')) {
    filters.locality = 'Korattur';
  } else if (lower.includes('avadi') || lower.includes('ஆவடி')) {
    filters.locality = 'Avadi';
  }

  // 2. Listing Type (Sale vs Rent)
  if (lower.includes('rent') || lower.includes('vadagai') || lower.includes('வாடகை')) {
    filters.listingType = 'rent';
  } else if (lower.includes('buy') || lower.includes('sale') || lower.includes('vaanga') || lower.includes('விலைக்கு')) {
    filters.listingType = 'sale';
  }

  // 3. Property Type
  if (lower.includes('villa') || lower.includes('வில்லா')) {
    filters.propertyType = 'villa';
  } else if (lower.includes('plot') || lower.includes('manai') || lower.includes('land') || lower.includes('மனை')) {
    filters.propertyType = 'plot';
  } else if (lower.includes('office') || lower.includes('commercial') || lower.includes('வணிக')) {
    filters.propertyType = 'commercial';
  } else if (lower.includes('independent') || lower.includes('thani veedu') || lower.includes('தனி வீடு')) {
    filters.propertyType = 'independent_house';
  } else if (lower.includes('flat') || lower.includes('apartment') || lower.includes('bhk') || lower.includes('குடியிருப்பு')) {
    filters.propertyType = 'apartment';
  }

  // 4. Bedrooms (BHK)
  if (lower.includes('1bhk') || lower.includes('1 bhk') || lower.includes('one bhk')) {
    filters.bedrooms = 1;
  } else if (lower.includes('2bhk') || lower.includes('2 bhk') || lower.includes('two bhk') || lower.includes('2 bed')) {
    filters.bedrooms = 2;
  } else if (lower.includes('3bhk') || lower.includes('3 bhk') || lower.includes('three bhk') || lower.includes('3 bed')) {
    filters.bedrooms = 3;
  } else if (lower.includes('4bhk') || lower.includes('4 bhk')) {
    filters.bedrooms = 4;
  }

  // 5. Price extraction (in Lakhs or Crores)
  const lakhMatch = lower.match(/(\d+)\s*(lakh|lakhs|l|லட்சம்)/i);
  if (lakhMatch) {
    const lakhValue = parseInt(lakhMatch[1], 10);
    filters.maxPrice = lakhValue * 100000;
  }

  const croreMatch = lower.match(/(\d+(\.\d+)?)\s*(cr|crore|crores|கோடி)/i);
  if (croreMatch) {
    const crValue = parseFloat(croreMatch[1]);
    filters.maxPrice = Math.round(crValue * 10000000);
  }

  // Generate clear user-facing explanation of the parsed query
  const parts = [];
  if (filters.locality) parts.push(`Locality: ${filters.locality}`);
  if (filters.propertyType) parts.push(`Type: ${filters.propertyType}`);
  if (filters.bedrooms) parts.push(`${filters.bedrooms} BHK`);
  if (filters.maxPrice) {
    const formatted =
      filters.maxPrice >= 10000000
        ? `₹${(filters.maxPrice / 10000000).toFixed(2)} Cr`
        : `₹${(filters.maxPrice / 100000).toFixed(0)} Lakhs`;
    parts.push(`Budget up to ${formatted}`);
  }
  if (filters.listingType) parts.push(`For ${filters.listingType.toUpperCase()}`);

  filters.explanation =
    parts.length > 0
      ? `AI Query Parsed: ${parts.join(' • ')}`
      : 'Natural language search active. Showing verified listings matching your keywords.';

  return filters;
};
