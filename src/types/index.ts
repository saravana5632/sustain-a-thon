export type PageRoute =
  | 'landing'
  | 'dashboard'
  | 'analyze'
  | 'result'
  | 'history'
  | 'details'
  | 'insights'
  | 'settings';

export type RiskLevel = 'Low' | 'Review' | 'High';

export type BusinessType =
  | 'Private Limited'
  | 'LLP / Partnership'
  | 'Proprietorship'
  | 'Public / Enterprise';

export type PurchaseFrequency =
  | 'One-time'
  | 'Quarterly'
  | 'Monthly'
  | 'Annual Contract';

export type EngagementLevel = 'High' | 'Moderate' | 'Low';

export type ResponseConsistency = 'Consistent' | 'Average' | 'Erratic';

export type PriceAcceptanceLevel = 'Positive' | 'Moderate' | 'Pushback';

export type PreviousPurchaseRecord =
  | 'Repeat Buyer (3+ orders)'
  | 'Returning (1–2 orders)'
  | 'First-time Verified'
  | 'Cold / Unverified';

export type PreviousPaymentRecord =
  | 'Always On-Time'
  | 'Mostly On-Time'
  | 'Occasional Delays'
  | 'Frequent Delays'
  | 'No Prior Record';

export type CreditTermsOption =
  | '100% Advance'
  | '50% Advance · Net 15'
  | '30% Advance · Net 30'
  | 'Zero Advance · Net 30'
  | 'Zero Advance · Net 45'
  | 'Zero Advance · Net 60'
  | 'Zero Advance · Net 90';

export interface BuyerInputForm {
  // Section A — Buyer Information
  buyerName: string;
  companyName: string;
  industry: string;
  location: string;
  businessType: BusinessType;

  // Section B — Purchase Information
  productService: string;
  expectedOrderValue: number; // in INR (e.g. 240000 for ₹2.4L)
  purchaseFrequency: PurchaseFrequency;
  quotedPrice: number; // in INR
  discountRequested: number; // percentage 0 - 35

  // Section C — Buyer Behaviour
  previousPurchaseHistory: PreviousPurchaseRecord;
  numberOfEnquiries: number;
  engagementLevel: EngagementLevel;
  responseConsistency: ResponseConsistency;
  priceAcceptance: PriceAcceptanceLevel;

  // Section D — Payment Behaviour
  previousPaymentRecord: PreviousPaymentRecord;
  averagePaymentDelay: number; // days beyond due date (0 - 90)
  outstandingAmount: number; // in INR
  creditTerms: CreditTermsOption;
  paymentReliabilityRating: number; // 1 to 5
}

export interface ModelWeights {
  paymentBehaviour: number; // default 30
  purchaseHistory: number; // default 25
  engagement: number; // default 20
  priceAcceptance: number; // default 15
  otherSignals: number; // default 10
}

export interface SignalSummaryCard {
  id: string;
  label: string;
  status: string;
  tone: 'positive' | 'neutral' | 'warning';
  explanation: string;
  scoreOutOf100: number;
}

export interface ConfidenceBreakdownItem {
  key: keyof ModelWeights;
  label: string;
  weightPercentage: number;
  factorScore: number; // 0-100
  weightedContribution: number;
  explanation: string;
}

export interface TimelineStage {
  stage: 'Enquiry' | 'Quote' | 'Negotiation' | 'Purchase' | 'Payment';
  status: 'completed' | 'active' | 'pending' | 'flagged';
  date: string;
  summary: string;
  metric: string;
}

export interface PastInvoiceRecord {
  invoiceId: string;
  date: string;
  amount: number;
  terms: string;
  settledInDays: number;
  status: 'Settled On-Time' | 'Delayed Settlement' | 'In Credit Window';
}

export interface CommercialNote {
  id: string;
  author: string;
  date: string;
  category: 'Credit Check' | 'Negotiation' | 'Payment Follow-up' | 'General';
  content: string;
}

export interface BuyerAnalysisResult {
  id: string;
  assessedAt: string;
  dateLabel: string;
  input: BuyerInputForm;
  confidenceScore: number; // 0 - 100
  riskLevel: RiskLevel;
  aiAssessmentSummary: string;
  aiRecommendationHeadline: string;
  recommendedNextSteps: string[];
  completedStepIndices?: number[];
  signalCards: SignalSummaryCard[];
  breakdown: ConfidenceBreakdownItem[];
  trustFactors: {
    label: string;
    percentage: number;
    description: string;
  }[];
  statusLabel: string;
  totalOrdersCount: number;
  averageOrderValue: number;
  timeline: TimelineStage[];
  pastInvoices: PastInvoiceRecord[];
  notes?: CommercialNote[];
}

export interface WhatIfParameters {
  orderValue: number;
  discount: number;
  paymentTermsDays: number; // 0, 15, 30, 45, 60, 90
  advancePaymentPercent: number; // 0, 20, 30, 50, 100
  purchaseFrequency: PurchaseFrequency;
}

export interface AppSettings {
  ownerName: string;
  ownerRole: string;
  ownerEmail: string;
  companyName: string;
  gstNumber: string;
  primaryIndustry: string;
  defaultCreditPolicy: string;
  weights: ModelWeights;
  thresholds: {
    lowRiskMin: number; // default 75
    reviewMin: number; // default 50
  };
  notifications: {
    highRiskEmailAlerts: boolean;
    paymentDelayReminders: boolean;
    weeklyPipelineDigest: boolean;
  };
  twoFactorEnabled: boolean;
}
