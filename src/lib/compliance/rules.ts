// NILVORA Compliance Engine
// Versioned rules for Tamil Nadu (Ambattur & Chennai) and expandable across India.

export interface RegistrationCostBreakdown {
  propertyValue: number;
  propertyType: string;
  state: string;
  stampDutyPercent: number;
  stampDutyAmount: number;
  registrationFeePercent: number;
  registrationFeeAmount: number;
  approxLegalAdvocateFee: number;
  subRegistrarComputerFee: number;
  totalGovtAndLegalCharges: number;
  effectiveTotalCost: number;
  disclaimer: string;
}

export const calculateTamilNaduRegistrationCharges = (
  propertyValue: number,
  propertyType: string = 'apartment'
): RegistrationCostBreakdown => {
  // In Tamil Nadu:
  // Stamp Duty is 7% across most property conveyances.
  // Registration Fee was recently rationalized to 2% for residential apartments / resale,
  // and 4% for commercial / vacant land / high-value plots.
  const stampDutyPercent = 7.0;
  const isResidential = ['apartment', 'villa', 'independent_house'].includes(propertyType);
  const registrationFeePercent = isResidential ? 2.0 : 4.0;

  const stampDutyAmount = Math.round((propertyValue * stampDutyPercent) / 100);
  const registrationFeeAmount = Math.round((propertyValue * registrationFeePercent) / 100);
  const approxLegalAdvocateFee = 25000; // Average drafting, search report & SRO accompaniment
  const subRegistrarComputerFee = 1500; // Standard portal fee on TNREGINET

  const totalGovtAndLegalCharges =
    stampDutyAmount + registrationFeeAmount + approxLegalAdvocateFee + subRegistrarComputerFee;

  return {
    propertyValue,
    propertyType,
    state: 'Tamil Nadu',
    stampDutyPercent,
    stampDutyAmount,
    registrationFeePercent,
    registrationFeeAmount,
    approxLegalAdvocateFee,
    subRegistrarComputerFee,
    totalGovtAndLegalCharges,
    effectiveTotalCost: propertyValue + totalGovtAndLegalCharges,
    disclaimer:
      'Calculated in accordance with Tamil Nadu Registration Department guideline rules (TNREGINET). Actual charges are calculated on the higher of the sale agreement value or the official Sub-Registrar Guideline Value of the survey number. Verify exact guideline rates with the Sub-Registrar Office, Ambattur.',
  };
};

export const checkListingCompliance = (property: {
  title: string;
  price: number;
  locality: string;
  areaSqft: number;
  surveyNumber?: string;
  propertyType: string;
}): { isCompliant: boolean; warnings: string[]; recommendations: string[] } => {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!property.surveyNumber || property.surveyNumber.trim() === '') {
    warnings.push('Survey / Patta number is missing. In Tamil Nadu, urban properties require town survey or revenue survey reference for title verification.');
  }

  if (property.price < 500000 && property.propertyType !== 'commercial') {
    warnings.push('Unusually low price for Chennai/Ambattur urban limits. Please verify if listing is for partial share or rental advance.');
  }

  if (property.propertyType === 'plot') {
    recommendations.push('Ensure CMDA layout approval number or DTCP regularisation certificate is uploaded to prevent unauthorized unapproved plot flags.');
  }

  recommendations.push('Conduct 30-year Encumbrance Certificate (EC) check via TNREGINET before entering sale agreement.');

  return {
    isCompliant: warnings.length === 0,
    warnings,
    recommendations,
  };
};
