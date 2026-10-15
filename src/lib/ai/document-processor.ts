import { DocumentAnalysisResult } from '@/types';

export const processDocumentAI = async (
  fileName: string,
  docCategory: 'patta' | 'chitta' | 'sale_deed' | 'encumbrance_certificate'
): Promise<DocumentAnalysisResult> => {
  // Simulate OCR extraction and field parsing with realistic delays
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const isPatta = docCategory === 'patta' || docCategory === 'chitta';
  const isEC = docCategory === 'encumbrance_certificate';

  if (isPatta) {
    return {
      id: `analysis-${Date.now()}`,
      documentName: fileName,
      category: 'patta',
      surveyNumberExtracted: '412/1B2',
      pattaHolderName: 'K. Rajasekaran & Family',
      extentSqft: 2150,
      villageName: 'Ambattur Village (Block 14)',
      talukName: 'Ambattur Taluk',
      district: 'Chennai',
      identifiedEncumbrances: [],
      missingDocuments: [
        'Town Survey Land Record (TSLR) Extract from Ambattur Tahsildar',
        'Current Financial Year Property Tax Receipt (Greater Chennai Corporation)',
      ],
      riskScore: 92,
      disclaimer:
        'AUTOMATED REVENUE RECORD SCAN: Grounded in extracted Tamil Nilam patta format. This screening report does not substitute for an advocate title search under the Transfer of Property Act 1882.',
      analysisDate: new Date().toISOString(),
    };
  }

  if (isEC) {
    return {
      id: `analysis-${Date.now()}`,
      documentName: fileName,
      category: 'encumbrance_certificate',
      surveyNumberExtracted: '412/1B2',
      villageName: 'Ambattur',
      talukName: 'Ambattur',
      district: 'Chennai',
      identifiedEncumbrances: [
        'Previous Mortgage with Canara Bank Ambattur — Discharged and Cancelled on 14-Aug-2018 (Doc No. 4412/2018 at Ambattur SRO). Current status: Nil active encumbrance.',
      ],
      missingDocuments: [
        'Original Bank Loan Clearance Certificate / NOC from Canara Bank',
      ],
      riskScore: 96,
      disclaimer:
        'ENCUMBRANCE SEARCH SCREENING: Reflects registered transactions recorded with Sub-Registrar Office Ambattur. Unregistered agreements or pending civil suits in Tiruvallur/Chennai courts may not appear in an EC.',
      analysisDate: new Date().toISOString(),
    };
  }

  // Default Sale Deed
  return {
    id: `analysis-${Date.now()}`,
    documentName: fileName,
    category: 'sale_deed',
    surveyNumberExtracted: '188/3A',
    pattaHolderName: 'N. Sridhar',
    extentSqft: 980,
    villageName: 'Ambattur OT',
    talukName: 'Ambattur',
    district: 'Chennai',
    identifiedEncumbrances: [],
    missingDocuments: [
      'Original Parent Title Deed (1994 registered document)',
      'CMDA Approved Building Plan copy',
    ],
    riskScore: 88,
    disclaimer:
      'CONVEYANCE DEED EXTRACTION: Identifies vendor, consideration, and schedule of property. Title validity must be checked with parent deed continuity.',
    analysisDate: new Date().toISOString(),
  };
};
