import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Test 1: Tamil Nadu Stamp Duty and Registration Calculations
describe('Tamil Nadu Stamp Duty & Registration Engine', () => {
  const calculateTamilNaduRegistrationCharges = (propertyValue, propertyType = 'apartment') => {
    const stampDutyPercent = 7.0;
    const isResidential = ['apartment', 'villa', 'independent_house'].includes(propertyType);
    const registrationFeePercent = isResidential ? 2.0 : 4.0;

    const stampDutyAmount = Math.round((propertyValue * stampDutyPercent) / 100);
    const registrationFeeAmount = Math.round((propertyValue * registrationFeePercent) / 100);
    const approxLegalAdvocateFee = 25000;
    const subRegistrarComputerFee = 1500;

    const totalGovtAndLegalCharges =
      stampDutyAmount + registrationFeeAmount + approxLegalAdvocateFee + subRegistrarComputerFee;

    return {
      propertyValue,
      stampDutyPercent,
      stampDutyAmount,
      registrationFeePercent,
      registrationFeeAmount,
      totalGovtAndLegalCharges,
      effectiveTotalCost: propertyValue + totalGovtAndLegalCharges,
    };
  };

  test('calculates 7% stamp duty and 2% registration fee for residential apartment', () => {
    const res = calculateTamilNaduRegistrationCharges(5000000, 'apartment'); // 50 Lakhs
    assert.equal(res.stampDutyAmount, 350000); // 7% of 50L = 3.5L
    assert.equal(res.registrationFeeAmount, 100000); // 2% of 50L = 1.0L
    assert.equal(res.totalGovtAndLegalCharges, 350000 + 100000 + 25000 + 1500);
    assert.equal(res.effectiveTotalCost, 5000000 + res.totalGovtAndLegalCharges);
  });

  test('calculates 4% registration fee for commercial or vacant plots', () => {
    const res = calculateTamilNaduRegistrationCharges(10000000, 'plot'); // 1 Crore
    assert.equal(res.stampDutyAmount, 700000); // 7% of 1Cr = 7L
    assert.equal(res.registrationFeeAmount, 400000); // 4% of 1Cr = 4L
  });
});

// Test 2: Broker Commission & Revenue Accounting Split
describe('Broker Commission & Revenue Accounting Separation', () => {
  const calculateCommissionSplit = (propertyValue, agreedCommissionPercent, platformFeePercent = 10.0) => {
    const grossCommission = (propertyValue * agreedCommissionPercent) / 100;
    const platformRevenue = (grossCommission * platformFeePercent) / 100;
    const netBrokerPayout = grossCommission - platformRevenue;

    return {
      propertyValue,
      agreedCommissionPercent,
      grossCommission,
      platformFeePercent,
      platformRevenue,
      netBrokerPayout,
    };
  };

  test('calculates correct commission split and preserves platform vs broker segregation', () => {
    const val = 10000000; // 1 Crore
    const split = calculateCommissionSplit(val, 1.5, 10.0); // 1.5% commission with 10% platform share

    assert.equal(split.grossCommission, 150000); // 1.5 Lakhs
    assert.equal(split.platformRevenue, 15000); // 15,000 platform share
    assert.equal(split.netBrokerPayout, 135000); // 1,35,000 net broker payout
    assert.equal(split.platformRevenue + split.netBrokerPayout, split.grossCommission);
  });
});

// Test 3: Natural Language & Tamil Query Parser
describe('Natural Language & Tanglish Query Parser', () => {
  const parseNaturalLanguageQuery = (query) => {
    const lower = query.toLowerCase().trim();
    const filters = { rawQuery: query };

    if (lower.includes('ambattur')) filters.locality = 'Ambattur';
    if (lower.includes('mogappair')) filters.locality = 'Mogappair';
    if (lower.includes('villa')) filters.propertyType = 'villa';
    if (lower.includes('2bhk') || lower.includes('2 bhk')) filters.bedrooms = 2;
    if (lower.includes('3bhk') || lower.includes('3 bhk')) filters.bedrooms = 3;

    const lakhMatch = lower.match(/(\d+)\s*(lakh|lakhs|l)/i);
    if (lakhMatch) {
      filters.maxPrice = parseInt(lakhMatch[1], 10) * 100000;
    }

    return filters;
  };

  test('correctly parses colloquial Tanglish query: Ambattur-la 50 lakh-kulla 2BHK venum', () => {
    const res = parseNaturalLanguageQuery('Ambattur-la 50 lakh-kulla 2BHK venum');
    assert.equal(res.locality, 'Ambattur');
    assert.equal(res.bedrooms, 2);
    assert.equal(res.maxPrice, 5000000);
  });

  test('correctly parses English query: Mogappair 3BHK villa', () => {
    const res = parseNaturalLanguageQuery('Mogappair 3BHK villa');
    assert.equal(res.locality, 'Mogappair');
    assert.equal(res.bedrooms, 3);
    assert.equal(res.propertyType, 'villa');
  });
});

// Test 4: Compliance Validation
describe('Property Listing Compliance Validation', () => {
  const checkListingCompliance = (prop) => {
    const warnings = [];
    if (!prop.surveyNumber || prop.surveyNumber.trim() === '') {
      warnings.push('Survey / Patta number is missing.');
    }
    if (prop.price < 500000 && prop.propertyType !== 'commercial') {
      warnings.push('Unusually low price for Chennai urban limits.');
    }
    return { isCompliant: warnings.length === 0, warnings };
  };

  test('passes validation when survey number and realistic price exist', () => {
    const valid = checkListingCompliance({
      title: 'Ambattur Villa',
      price: 11500000,
      surveyNumber: '412/1B',
      propertyType: 'villa',
    });
    assert.equal(valid.isCompliant, true);
    assert.equal(valid.warnings.length, 0);
  });

  test('flags missing survey number as compliance warning', () => {
    const invalid = checkListingCompliance({
      title: 'Ambattur Plot',
      price: 6500000,
      surveyNumber: '',
      propertyType: 'plot',
    });
    assert.equal(invalid.isCompliant, false);
    assert.equal(invalid.warnings.length, 1);
  });
});

// Test 5: Tamil Nadu Land Unit Area Converter
describe('Tamil Nadu Plot Area Converter (Sqft ↔ Cent ↔ Ground)', () => {
  const convertUnits = (sqft) => {
    const cents = Number((sqft / 435.6).toFixed(2));
    const grounds = Number((sqft / 2400).toFixed(2));
    return { sqft, cents, grounds };
  };

  test('converts 1 Ground (2400 sq.ft) accurately to 5.51 Cents', () => {
    const result = convertUnits(2400);
    assert.equal(result.sqft, 2400);
    assert.equal(result.grounds, 1.0);
    assert.equal(result.cents, 5.51);
  });

  test('converts 1 Cent (435.6 sq.ft) accurately to 0.18 Grounds', () => {
    const result = convertUnits(435.6);
    assert.equal(result.cents, 1.0);
    assert.equal(result.grounds, 0.18);
  });
});

// Test 6: Real Estate ROI & Rental Yield Engine
describe('Real Estate ROI & Wealth Forecasting Engine', () => {
  const calculateYield = (propertyPrice, monthlyRent, annualMaintenance = 0, vacancyPercent = 0) => {
    const annualGrossRent = monthlyRent * 12;
    const vacancyLoss = annualGrossRent * (vacancyPercent / 100);
    const annualNetRent = annualGrossRent - vacancyLoss - annualMaintenance;

    const grossYield = (annualGrossRent / propertyPrice) * 100;
    const netYield = (annualNetRent / propertyPrice) * 100;

    return {
      annualGrossRent,
      annualNetRent,
      grossYield: Number(grossYield.toFixed(2)),
      netYield: Number(netYield.toFixed(2)),
    };
  };

  test('calculates correct Gross and Net rental yields', () => {
    const res = calculateYield(6000000, 25000, 20000, 5);
    assert.equal(res.annualGrossRent, 300000);
    assert.equal(res.grossYield, 5.0);
    assert.equal(res.annualNetRent, 300000 - 15000 - 20000);
    assert.equal(res.netYield, 4.42);
  });

  test('calculates 10-year compound appreciation accurately', () => {
    const initialPrice = 5000000;
    const cagr = 7.0;
    const valueYear10 = Math.round(initialPrice * Math.pow(1 + cagr / 100, 10));
    assert.equal(valueYear10, 9835757);
  });
});

// Test 7: Production Authentication & Cryptographic Hashing
describe('Production Authentication & Cryptographic Hashing', () => {
  const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return { hash, salt };
  };

  const verifyPassword = (password, storedHash, salt) => {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  };

  test('hashes password with unique random salt and verifies correctly', () => {
    const pass = 'Nilvora@2026';
    const { hash, salt } = hashPassword(pass);

    assert.ok(hash.length > 32);
    assert.ok(salt.length === 32); // 16 bytes in hex = 32 chars
    assert.equal(verifyPassword(pass, hash, salt), true);
    assert.equal(verifyPassword('WrongPassword', hash, salt), false);
  });

  test('produces distinct hashes for identical passwords due to unique salts', () => {
    const pass = 'SecretPass123';
    const p1 = hashPassword(pass);
    const p2 = hashPassword(pass);

    assert.notEqual(p1.salt, p2.salt);
    assert.notEqual(p1.hash, p2.hash);
    assert.equal(verifyPassword(pass, p1.hash, p1.salt), true);
    assert.equal(verifyPassword(pass, p2.hash, p2.salt), true);
  });
});

// Test 8: RBAC Security Guard & Public Registration Boundaries
describe('RBAC Security & Public Registration Restrictions', () => {
  const validatePublicRegistrationRole = (role) => {
    const VALID_PUBLIC_ROLES = ['buyer', 'seller', 'broker', 'builder', 'legal_pro'];
    if (role === 'admin') {
      return { valid: false, error: 'SECURITY VIOLATION: Super Admin cannot be created via public registration.' };
    }
    if (!VALID_PUBLIC_ROLES.includes(role)) {
      return { valid: false, error: 'Invalid role' };
    }
    return { valid: true };
  };

  test('strictly rejects public registration requests for admin role', () => {
    const res = validatePublicRegistrationRole('admin');
    assert.equal(res.valid, false);
    assert.match(res.error, /SECURITY VIOLATION/);
  });

  test('permits legitimate roles: buyer, seller, broker, builder, legal_pro', () => {
    assert.equal(validatePublicRegistrationRole('buyer').valid, true);
    assert.equal(validatePublicRegistrationRole('seller').valid, true);
    assert.equal(validatePublicRegistrationRole('broker').valid, true);
    assert.equal(validatePublicRegistrationRole('builder').valid, true);
    assert.equal(validatePublicRegistrationRole('legal_pro').valid, true);
  });
});

// Test 9: Payment Verification & HMAC SHA-256 Signatures
describe('Payment Security & Cryptographic HMAC Verification', () => {
  const generateSignature = (orderId, paymentId, secret) => {
    return crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  };

  const verifyPaymentSignature = (orderId, paymentId, signature, secret) => {
    const expected = generateSignature(orderId, paymentId, secret);
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  };

  test('validates genuine Razorpay payment signature', () => {
    const orderId = 'order_RZP_TEST123';
    const paymentId = 'pay_RZP_PAY789';
    const secret = 'rzp_secret_key_nilvora';

    const sig = generateSignature(orderId, paymentId, secret);
    assert.equal(verifyPaymentSignature(orderId, paymentId, sig, secret), true);
  });

  test('rejects tampered payment signature', () => {
    const orderId = 'order_RZP_TEST123';
    const paymentId = 'pay_RZP_PAY789';
    const secret = 'rzp_secret_key_nilvora';

    const tamperedOrderId = 'order_RZP_TAMPERED';
    const sig = generateSignature(orderId, paymentId, secret);

    assert.equal(
      generateSignature(tamperedOrderId, paymentId, secret) === sig,
      false
    );
  });
});

// Test 10: Appointment Double-Booking Conflict Prevention
describe('Site Visit Appointment Conflict Guard', () => {
  const checkAppointmentConflict = (existingAppts, propertyId, requestedTime) => {
    return existingAppts.some(
      (a) => a.propertyId === propertyId && a.scheduledTime === requestedTime && a.status === 'confirmed'
    );
  };

  test('detects and flags conflict for same property and timeslot', () => {
    const existing = [
      { propertyId: 'prop-1', scheduledTime: '2026-03-01T11:00 AM', status: 'confirmed' },
    ];
    assert.equal(checkAppointmentConflict(existing, 'prop-1', '2026-03-01T11:00 AM'), true);
    assert.equal(checkAppointmentConflict(existing, 'prop-1', '2026-03-01T02:00 PM'), false);
    assert.equal(checkAppointmentConflict(existing, 'prop-2', '2026-03-01T11:00 AM'), false);
  });
});
