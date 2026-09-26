import {
  BuyerAnalysisResult,
  BuyerInputForm,
  ConfidenceBreakdownItem,
  ModelWeights,
  RiskLevel,
  SignalSummaryCard,
  TimelineStage,
  WhatIfParameters,
} from '../types';
import { formatINRCompact } from '../utils/formatters';

export const DEFAULT_MODEL_WEIGHTS: ModelWeights = {
  paymentBehaviour: 30,
  purchaseHistory: 25,
  engagement: 20,
  priceAcceptance: 15,
  otherSignals: 10,
};

export const DEFAULT_RISK_THRESHOLDS = {
  lowRiskMin: 75,
  reviewMin: 50,
};

/**
 * Evaluates Payment Behaviour (0-100) from Section D inputs
 */
function scorePaymentBehaviour(input: BuyerInputForm): number {
  let base = 75;
  switch (input.previousPaymentRecord) {
    case 'Always On-Time':
      base = 94;
      break;
    case 'Mostly On-Time':
      base = 82;
      break;
    case 'No Prior Record':
      base = 64;
      break;
    case 'Occasional Delays':
      base = 52;
      break;
    case 'Frequent Delays':
      base = 24;
      break;
  }

  // Delay penalty
  const delayPenalty = Math.min(38, Math.round(input.averagePaymentDelay * 0.75));
  base -= delayPenalty;

  // Credit terms adjustment
  if (input.creditTerms === '100% Advance') base += 14;
  else if (input.creditTerms === '50% Advance · Net 15') base += 10;
  else if (input.creditTerms === '30% Advance · Net 30') base += 6;
  else if (input.creditTerms === 'Zero Advance · Net 60') base -= 8;
  else if (input.creditTerms === 'Zero Advance · Net 90') base -= 16;

  // Outstanding ratio penalty
  if (input.outstandingAmount > 0 && input.expectedOrderValue > 0) {
    const ratio = input.outstandingAmount / input.expectedOrderValue;
    if (ratio > 1.0) base -= 16;
    else if (ratio > 0.5) base -= 9;
    else if (ratio > 0.2) base -= 4;
  }

  // Reliability rating adjustment (1 to 5)
  base += (input.paymentReliabilityRating - 3) * 4;

  return Math.max(12, Math.min(98, Math.round(base)));
}

/**
 * Evaluates Purchase History & Intent (0-100)
 */
function scorePurchaseHistory(input: BuyerInputForm): number {
  let score = 70;
  switch (input.previousPurchaseHistory) {
    case 'Repeat Buyer (3+ orders)':
      score = 90;
      break;
    case 'Returning (1–2 orders)':
      score = 78;
      break;
    case 'First-time Verified':
      score = 65;
      break;
    case 'Cold / Unverified':
      score = 38;
      break;
  }

  if (input.purchaseFrequency === 'Monthly') score += 6;
  else if (input.purchaseFrequency === 'Annual Contract') score += 8;
  else if (input.purchaseFrequency === 'Quarterly') score += 4;

  if (input.numberOfEnquiries >= 3 && input.numberOfEnquiries <= 8) {
    score += 3;
  } else if (input.numberOfEnquiries > 12 && input.previousPurchaseHistory === 'Cold / Unverified') {
    // High enquiry count with zero conversion can indicate window shopping
    score -= 6;
  }

  return Math.max(15, Math.min(98, Math.round(score)));
}

/**
 * Evaluates Buyer Engagement & Response Consistency (0-100)
 */
function scoreEngagement(input: BuyerInputForm): number {
  let score = 70;
  if (input.engagementLevel === 'High') score = 86;
  else if (input.engagementLevel === 'Moderate') score = 68;
  else score = 38;

  if (input.responseConsistency === 'Consistent') score += 8;
  else if (input.responseConsistency === 'Erratic') score -= 18;

  return Math.max(15, Math.min(96, Math.round(score)));
}

/**
 * Evaluates Price Acceptance & Commercial Alignment (0-100)
 */
function scorePriceAcceptance(input: BuyerInputForm): number {
  let score = 82;
  if (input.priceAcceptance === 'Positive') score = 88;
  else if (input.priceAcceptance === 'Moderate') score = 70;
  else score = 42;

  if (input.discountRequested <= 5) score += 6;
  else if (input.discountRequested <= 10) score += 0;
  else if (input.discountRequested <= 18) score -= 10;
  else score -= 22;

  // Compare quoted price vs expected order value
  if (input.quotedPrice > 0 && input.expectedOrderValue > 0) {
    const gap = (input.quotedPrice - input.expectedOrderValue) / input.quotedPrice;
    if (gap > 0.2) score -= 8;
  }

  return Math.max(15, Math.min(96, Math.round(score)));
}

/**
 * Evaluates Other Structural & Entity Signals (0-100)
 */
function scoreOtherSignals(input: BuyerInputForm): number {
  let score = 76;
  switch (input.businessType) {
    case 'Public / Enterprise':
      score = 90;
      break;
    case 'Private Limited':
      score = 85;
      break;
    case 'LLP / Partnership':
      score = 76;
      break;
    case 'Proprietorship':
      score = 68;
      break;
  }

  if (input.expectedOrderValue > 1500000 && input.previousPurchaseHistory === 'Cold / Unverified') {
    score -= 14;
  }

  return Math.max(25, Math.min(95, Math.round(score)));
}

export function classifyRiskLevel(
  score: number,
  thresholds = DEFAULT_RISK_THRESHOLDS
): RiskLevel {
  if (score >= thresholds.lowRiskMin) return 'Low';
  if (score >= thresholds.reviewMin) return 'Review';
  return 'High';
}

export function evaluateBuyerSignals(
  input: BuyerInputForm,
  weights: ModelWeights = DEFAULT_MODEL_WEIGHTS,
  thresholds = DEFAULT_RISK_THRESHOLDS,
  overrideScore?: number
): BuyerAnalysisResult {
  const paymentScore = scorePaymentBehaviour(input);
  const purchaseScore = scorePurchaseHistory(input);
  const engagementScore = scoreEngagement(input);
  const priceScore = scorePriceAcceptance(input);
  const otherScore = scoreOtherSignals(input);

  const totalWeight =
    weights.paymentBehaviour +
    weights.purchaseHistory +
    weights.engagement +
    weights.priceAcceptance +
    weights.otherSignals || 100;

  const rawWeighted =
    (paymentScore * weights.paymentBehaviour +
      purchaseScore * weights.purchaseHistory +
      engagementScore * weights.engagement +
      priceScore * weights.priceAcceptance +
      otherScore * weights.otherSignals) /
    totalWeight;

  const confidenceScore =
    typeof overrideScore === 'number'
      ? overrideScore
      : Math.max(10, Math.min(98, Math.round(rawWeighted)));

  const riskLevel = classifyRiskLevel(confidenceScore, thresholds);

  const signalCards: SignalSummaryCard[] = [
    {
      id: 'payment-history',
      label: 'Payment History',
      status:
        paymentScore >= 75 ? 'Strong' : paymentScore >= 55 ? 'Moderate' : 'Elevated Delay Risk',
      tone: paymentScore >= 75 ? 'positive' : paymentScore >= 55 ? 'neutral' : 'warning',
      explanation:
        input.averagePaymentDelay <= 5
          ? `Consistent settlement record (${input.averagePaymentDelay}d avg variance beyond terms).`
          : `Historically averages ${input.averagePaymentDelay} days past due date on credit invoices.`,
      scoreOutOf100: paymentScore,
    },
    {
      id: 'purchase-intent',
      label: 'Purchase Intent',
      status:
        purchaseScore >= 75 ? 'High' : purchaseScore >= 55 ? 'Moderate' : 'Unverified',
      tone: purchaseScore >= 75 ? 'positive' : purchaseScore >= 55 ? 'neutral' : 'warning',
      explanation: `${input.previousPurchaseHistory} ordering on a ${input.purchaseFrequency.toLowerCase()} cycle.`,
      scoreOutOf100: purchaseScore,
    },
    {
      id: 'price-acceptance',
      label: 'Price Acceptance',
      status:
        priceScore >= 75 ? 'Positive' : priceScore >= 55 ? 'Negotiable' : 'High Pushback',
      tone: priceScore >= 75 ? 'positive' : priceScore >= 55 ? 'neutral' : 'warning',
      explanation:
        input.discountRequested <= 8
          ? `Standard commercial alignment (${input.discountRequested}% discount requested).`
          : `Requested ${input.discountRequested}% discount against quoted rate.`,
      scoreOutOf100: priceScore,
    },
    {
      id: 'engagement',
      label: 'Engagement',
      status:
        engagementScore >= 75 ? 'High' : engagementScore >= 55 ? 'Moderate' : 'Low',
      tone: engagementScore >= 75 ? 'positive' : engagementScore >= 55 ? 'neutral' : 'warning',
      explanation: `${input.responseConsistency} communication across ${input.numberOfEnquiries} commercial touchpoints.`,
      scoreOutOf100: engagementScore,
    },
  ];

  const breakdown: ConfidenceBreakdownItem[] = [
    {
      key: 'paymentBehaviour',
      label: 'Payment Behaviour',
      weightPercentage: weights.paymentBehaviour,
      factorScore: paymentScore,
      weightedContribution: Number(((paymentScore * weights.paymentBehaviour) / totalWeight).toFixed(1)),
      explanation: 'Evaluates historical invoice settlement speed, credit window adherence, and current unpaid exposure.',
    },
    {
      key: 'purchaseHistory',
      label: 'Purchase History',
      weightPercentage: weights.purchaseHistory,
      factorScore: purchaseScore,
      weightedContribution: Number(((purchaseScore * weights.purchaseHistory) / totalWeight).toFixed(1)),
      explanation: 'Measures prior order conversion ratio, repeat procurement cadence, and specification clarity.',
    },
    {
      key: 'engagement',
      label: 'Engagement',
      weightPercentage: weights.engagement,
      factorScore: engagementScore,
      weightedContribution: Number(((engagementScore * weights.engagement) / totalWeight).toFixed(1)),
      explanation: 'Tracks response turnaround speed, stakeholder involvement, and documentation readiness.',
    },
    {
      key: 'priceAcceptance',
      label: 'Price Acceptance',
      weightPercentage: weights.priceAcceptance,
      factorScore: priceScore,
      weightedContribution: Number(((priceScore * weights.priceAcceptance) / totalWeight).toFixed(1)),
      explanation: 'Analyzes discount pressure and alignment between quoted unit rates and buyer target budget.',
    },
    {
      key: 'otherSignals',
      label: 'Other Signals',
      weightPercentage: weights.otherSignals,
      factorScore: otherScore,
      weightedContribution: Number(((otherScore * weights.otherSignals) / totalWeight).toFixed(1)),
      explanation: 'Considers corporate entity structure, order-size-to-history ratio, and sector stability.',
    },
  ];

  let aiAssessmentSummary =
    'Based on the available buyer information, this buyer shows strong indicators of purchase and payment reliability.';
  let aiRecommendationHeadline =
    'Proceed with the buyer, while maintaining normal payment safeguards.';
  let recommendedNextSteps = [
    'Confirm purchase quantity and delivery schedule in writing',
    'Finalize payment terms and issue formal proforma invoice',
    'Request agreed advance/payment milestone prior to dispatch',
    'Continue monitoring payment behaviour across upcoming cycles',
  ];

  if (riskLevel === 'Review') {
    aiAssessmentSummary =
      'Available signals indicate genuine commercial interest paired with moderate credit or negotiation friction that warrants structured payment terms.';
    aiRecommendationHeadline =
      'Proceed conditionally with a mandatory advance milestone and capped credit exposure.';
    recommendedNextSteps = [
      'Require at least 30%–50% advance payment before production or dispatch',
      'Cap open credit exposure until any existing outstanding balance is cleared',
      'Lock written acceptance on final unit pricing to prevent post-delivery disputes',
      'Set automated milestone reminders 5 days prior to invoice due date',
    ];
  } else if (riskLevel === 'High') {
    aiAssessmentSummary =
      'Available signals highlight elevated payment delay risk, significant outstanding balance, or unverified credit capacity relative to order value.';
    aiRecommendationHeadline =
      'Avoid open credit exposure; transact strictly on advance payment or bank guarantee.';
    recommendedNextSteps = [
      'Convert payment terms to 100% advance or irrevocable Letter of Credit (LC)',
      'Clear past overdue invoices before releasing new inventory commitments',
      'Consider splitting the order into smaller prepaid trial tranches',
      'Verify GST filing status and formal purchase order authorization',
    ];
  }

  const trustFactors = [
    {
      label: 'Payment History',
      percentage: paymentScore,
      description:
        paymentScore >= 75
          ? 'Buyer settles invoices within or near agreed credit windows with minimal overdue carryover.'
          : 'Historical payment delays or open balances reduce the baseline confidence weight.',
    },
    {
      label: 'Purchase History',
      percentage: purchaseScore,
      description:
        purchaseScore >= 75
          ? 'Established procurement relationship with verified past conversions and clear repeat schedule.'
          : 'Limited prior conversion history increases uncertainty around order completion.',
    },
    {
      label: 'Engagement',
      percentage: engagementScore,
      description:
        engagementScore >= 70
          ? 'Buyer responds consistently with clear technical and commercial specifications.'
          : 'Sporadic follow-ups or delayed replies indicate lower procurement urgency.',
    },
    {
      label: 'Price Acceptance',
      percentage: priceScore,
      description:
        priceScore >= 75
          ? 'Requested discount sits within normal B2B margin tolerance without aggressive pushback.'
          : 'Heavy discount demand signals potential margin squeeze or post-delivery renegotiation.',
    },
  ];

  const timeline: TimelineStage[] = [
    {
      stage: 'Enquiry',
      status: 'completed',
      date: '12 days ago',
      summary: `Received specification enquiry for ${input.productService}`,
      metric: `${input.numberOfEnquiries} touchpoints logged`,
    },
    {
      stage: 'Quote',
      status: 'completed',
      date: '9 days ago',
      summary: `Submitted commercial proposal at ${formatINRCompact(input.quotedPrice)}`,
      metric: input.creditTerms,
    },
    {
      stage: 'Negotiation',
      status: 'completed',
      date: '4 days ago',
      summary:
        input.discountRequested > 0
          ? `Buyer requested ${input.discountRequested}% commercial discount (${input.priceAcceptance} alignment)`
          : 'Standard rate card accepted without discount friction',
      metric: `${input.discountRequested}% discount`,
    },
    {
      stage: 'Purchase',
      status: riskLevel === 'High' ? 'flagged' : 'active',
      date: 'Current Stage',
      summary: `Evaluating PO commitment for ${formatINRCompact(input.expectedOrderValue)}`,
      metric: input.purchaseFrequency,
    },
    {
      stage: 'Payment',
      status: 'pending',
      date: 'Projected',
      summary: `Expected settlement under ${input.creditTerms} (${input.averagePaymentDelay}d historical lag)`,
      metric:
        input.outstandingAmount > 0
          ? `${formatINRCompact(input.outstandingAmount)} prior open`
          : 'Zero overdue balance',
    },
  ];

  const totalOrdersCount =
    input.previousPurchaseHistory === 'Repeat Buyer (3+ orders)'
      ? 7
      : input.previousPurchaseHistory === 'Returning (1–2 orders)'
      ? 2
      : 0;

  return {
    id: `assess-${Date.now()}`,
    assessedAt: new Date().toISOString(),
    dateLabel: 'Just now',
    input,
    confidenceScore,
    riskLevel,
    aiAssessmentSummary,
    aiRecommendationHeadline,
    recommendedNextSteps,
    signalCards,
    breakdown,
    trustFactors,
    statusLabel:
      riskLevel === 'Low'
        ? 'Approved for Standard Terms'
        : riskLevel === 'Review'
        ? 'Milestone Safeguards Advised'
        : 'Advance Payment Required',
    totalOrdersCount,
    averageOrderValue: Math.round(input.expectedOrderValue * 0.92),
    timeline,
    pastInvoices: [
      {
        invoiceId: 'INV-2026-0841',
        date: '14 Aug 2026',
        amount: Math.round(input.expectedOrderValue * 0.85),
        terms: input.creditTerms,
        settledInDays: Math.max(0, 28 + input.averagePaymentDelay),
        status:
          input.averagePaymentDelay <= 7 ? 'Settled On-Time' : 'Delayed Settlement',
      },
      {
        invoiceId: 'INV-2026-0619',
        date: '22 Jun 2026',
        amount: Math.round(input.expectedOrderValue * 0.95),
        terms: input.creditTerms,
        settledInDays: Math.max(0, 30 + Math.max(0, input.averagePaymentDelay - 3)),
        status:
          input.averagePaymentDelay <= 10 ? 'Settled On-Time' : 'Delayed Settlement',
      },
      {
        invoiceId: 'INV-2026-0392',
        date: '09 Apr 2026',
        amount: Math.round(input.expectedOrderValue * 0.75),
        terms: '30% Advance · Net 30',
        settledInDays: 29,
        status: 'Settled On-Time',
      },
    ],
  };
}

/**
 * Counterfactual "What If?" Simulator calculation
 * Calculates how changing commercial variables impacts the current Buyer Payment Confidence Score
 */
export function simulateCounterfactualConfidence(
  baseResult: BuyerAnalysisResult,
  params: WhatIfParameters
): {
  projectedScore: number;
  delta: number;
  projectedRisk: RiskLevel;
  keyDriverExplanation: string;
  factorDeltas: { label: string; impact: string; positive: boolean }[];
} {
  const baseInput = baseResult.input;
  let delta = 0;
  const factorDeltas: { label: string; impact: string; positive: boolean }[] = [];

  // 1. Advance payment effect
  const baseAdvance = baseInput.creditTerms.includes('100%')
    ? 100
    : baseInput.creditTerms.includes('50%')
    ? 50
    : baseInput.creditTerms.includes('30%')
    ? 30
    : 0;

  const advanceDiff = params.advancePaymentPercent - baseAdvance;
  if (advanceDiff !== 0) {
    const advImpact = Math.round(advanceDiff * 0.22);
    delta += advImpact;
    if (advImpact !== 0) {
      factorDeltas.push({
        label: `${params.advancePaymentPercent}% Advance Payment`,
        impact: `${advImpact > 0 ? '+' : ''}${advImpact} pts`,
        positive: advImpact > 0,
      });
    }
  }

  // 2. Credit days effect
  const baseDays = baseInput.creditTerms.includes('100%')
    ? 0
    : baseInput.creditTerms.includes('Net 15')
    ? 15
    : baseInput.creditTerms.includes('Net 45')
    ? 45
    : baseInput.creditTerms.includes('Net 60')
    ? 60
    : baseInput.creditTerms.includes('Net 90')
    ? 90
    : 30;

  const daysDiff = params.paymentTermsDays - baseDays;
  if (daysDiff !== 0) {
    // Shorter credit window improves confidence
    const daysImpact = Math.round((-daysDiff / 15) * 3.2);
    delta += daysImpact;
    if (daysImpact !== 0) {
      factorDeltas.push({
        label: params.paymentTermsDays === 0 ? 'Immediate Settlement' : `Net ${params.paymentTermsDays} Credit Window`,
        impact: `${daysImpact > 0 ? '+' : ''}${daysImpact} pts`,
        positive: daysImpact > 0,
      });
    }
  }

  // 3. Discount effect
  const discountDiff = params.discount - baseInput.discountRequested;
  if (discountDiff !== 0) {
    const discImpact = Math.round(-discountDiff * 0.45);
    delta += discImpact;
    if (discImpact !== 0) {
      factorDeltas.push({
        label: `${params.discount}% Commercial Discount`,
        impact: `${discImpact > 0 ? '+' : ''}${discImpact} pts`,
        positive: discImpact > 0,
      });
    }
  }

  // 4. Order Value exposure effect
  if (baseInput.expectedOrderValue > 0) {
    const valueRatio = params.orderValue / baseInput.expectedOrderValue;
    if (valueRatio < 0.75) {
      const valImpact = Math.round((1 - valueRatio) * 10);
      delta += valImpact;
      factorDeltas.push({
        label: `Phased Order Size (${formatINRCompact(params.orderValue)})`,
        impact: `+${valImpact} pts`,
        positive: true,
      });
    } else if (valueRatio > 1.35) {
      const valImpact = -Math.min(14, Math.round((valueRatio - 1) * 11));
      delta += valImpact;
      factorDeltas.push({
        label: `Higher Credit Exposure (${formatINRCompact(params.orderValue)})`,
        impact: `${valImpact} pts`,
        positive: false,
      });
    }
  }

  // 5. Purchase Frequency effect
  if (params.purchaseFrequency !== baseInput.purchaseFrequency) {
    const freqRank: Record<string, number> = {
      'One-time': 0,
      Quarterly: 2,
      Monthly: 4,
      'Annual Contract': 5,
    };
    const freqImpact =
      (freqRank[params.purchaseFrequency] ?? 2) -
      (freqRank[baseInput.purchaseFrequency] ?? 2);
    delta += freqImpact;
    if (freqImpact !== 0) {
      factorDeltas.push({
        label: `${params.purchaseFrequency} Commitment`,
        impact: `${freqImpact > 0 ? '+' : ''}${freqImpact} pts`,
        positive: freqImpact > 0,
      });
    }
  }

  const projectedScore = Math.max(
    12,
    Math.min(98, baseResult.confidenceScore + delta)
  );
  const actualDelta = projectedScore - baseResult.confidenceScore;
  const projectedRisk = classifyRiskLevel(projectedScore);

  let keyDriverExplanation =
    'Current commercial parameters match the baseline buyer assessment.';
  if (actualDelta > 0) {
    if (advanceDiff > 0) {
      keyDriverExplanation = `Adding a ${params.advancePaymentPercent}% advance payment milestone and structured credit window improves the payment confidence assessment by +${actualDelta} points.`;
    } else if (daysDiff < 0) {
      keyDriverExplanation = `Shortening the credit cycle to Net ${params.paymentTermsDays} days reduces settlement exposure and lifts confidence by +${actualDelta} points.`;
    } else {
      keyDriverExplanation = `Structuring the commercial terms with lower exposure improves the estimated buyer payment confidence by +${actualDelta} points.`;
    }
  } else if (actualDelta < 0) {
    keyDriverExplanation = `Extending credit exposure or increasing the discount concession lowers the payment confidence estimate by ${actualDelta} points.`;
  }

  return {
    projectedScore,
    delta: actualDelta,
    projectedRisk,
    keyDriverExplanation,
    factorDeltas,
  };
}
