import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CreditCard,
  Loader2,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  BusinessType,
  BuyerInputForm,
  CreditTermsOption,
  EngagementLevel,
  PriceAcceptanceLevel,
  PreviousPaymentRecord,
  PreviousPurchaseRecord,
  PurchaseFrequency,
  ResponseConsistency,
} from '../types';
import {
  DEMO_BENCHMARK_BUYER_INPUT,
  INITIAL_BUYER_ASSESSMENTS,
} from '../data/mockBuyers';
import { formatINRCompact, formatINRFull } from '../utils/formatters';
import { SearchGroundingPanel } from '../components/SearchGroundingPanel';

interface AnalyzeBuyerPageProps {
  initialForm?: BuyerInputForm;
  editingBuyerId?: string | null;
  onClearEditingMode?: () => void;
  onSubmitAnalysis: (
    formData: BuyerInputForm,
    overrideScore?: number,
    existingBuyerId?: string
  ) => void;
}

const INDUSTRIES = [
  'Electronics & IT Hardware',
  'Retail & FMCG Distribution',
  'Industrial Manufacturing',
  'Textiles & Apparel',
  'Agro & Food Processing',
  'Auto Components',
  'Construction & Infra',
  'Pharmaceuticals & Healthcare',
  'Chemicals & Packaging',
];

const BUSINESS_TYPES: BusinessType[] = [
  'Private Limited',
  'LLP / Partnership',
  'Proprietorship',
  'Public / Enterprise',
];

const PURCHASE_FREQUENCIES: PurchaseFrequency[] = [
  'One-time',
  'Quarterly',
  'Monthly',
  'Annual Contract',
];

const PURCHASE_HISTORY_OPTIONS: PreviousPurchaseRecord[] = [
  'Repeat Buyer (3+ orders)',
  'Returning (1–2 orders)',
  'First-time Verified',
  'Cold / Unverified',
];

const PAYMENT_RECORD_OPTIONS: PreviousPaymentRecord[] = [
  'Always On-Time',
  'Mostly On-Time',
  'No Prior Record',
  'Occasional Delays',
  'Frequent Delays',
];

const CREDIT_TERMS_OPTIONS: CreditTermsOption[] = [
  '100% Advance',
  '50% Advance · Net 15',
  '30% Advance · Net 30',
  'Zero Advance · Net 30',
  'Zero Advance · Net 45',
  'Zero Advance · Net 60',
  'Zero Advance · Net 90',
];

export const AnalyzeBuyerPage: React.FC<AnalyzeBuyerPageProps> = ({
  initialForm,
  editingBuyerId,
  onClearEditingMode,
  onSubmitAnalysis,
}) => {
  const [form, setForm] = useState<BuyerInputForm>(
    initialForm || DEMO_BENCHMARK_BUYER_INPUT
  );
  const [presetOverrideScore, setPresetOverrideScore] = useState<
    number | undefined
  >(initialForm ? undefined : 82);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState(
    'Analyzing buyer signals...'
  );

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
      setPresetOverrideScore(undefined);
    }
  }, [initialForm, editingBuyerId]);

  const updateField = <K extends keyof BuyerInputForm>(
    key: K,
    value: BuyerInputForm[K]
  ) => {
    setPresetOverrideScore(undefined);
    setValidationError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLoadPreset = (
    type: 'benchmark82' | 'arun86' | 'review64' | 'highrisk34' | 'blank'
  ) => {
    setValidationError(null);
    if (onClearEditingMode) onClearEditingMode();
    if (type === 'benchmark82') {
      setForm(DEMO_BENCHMARK_BUYER_INPUT);
      setPresetOverrideScore(82);
    } else if (type === 'arun86') {
      setForm(INITIAL_BUYER_ASSESSMENTS[0].input);
      setPresetOverrideScore(86);
    } else if (type === 'review64') {
      setForm(INITIAL_BUYER_ASSESSMENTS[3].input);
      setPresetOverrideScore(64);
    } else if (type === 'highrisk34') {
      setForm(INITIAL_BUYER_ASSESSMENTS[7].input);
      setPresetOverrideScore(34);
    } else {
      setPresetOverrideScore(undefined);
      setForm({
        buyerName: '',
        companyName: '',
        industry: 'Industrial Manufacturing',
        location: '',
        businessType: 'Private Limited',
        productService: '',
        expectedOrderValue: 250000,
        purchaseFrequency: 'Quarterly',
        quotedPrice: 265000,
        discountRequested: 6,
        previousPurchaseHistory: 'First-time Verified',
        numberOfEnquiries: 3,
        engagementLevel: 'High',
        responseConsistency: 'Consistent',
        priceAcceptance: 'Positive',
        previousPaymentRecord: 'Mostly On-Time',
        averagePaymentDelay: 4,
        outstandingAmount: 0,
        creditTerms: '30% Advance · Net 30',
        paymentReliabilityRating: 4,
      });
    }
  };

  const runAnalysisFlow = (targetUpdateId?: string) => {
    if (!form.buyerName.trim() || !form.companyName.trim()) {
      setValidationError(
        'Please enter both the Buyer Contact Name and Company Name in Section A.'
      );
      return;
    }
    if (!form.location.trim()) {
      setValidationError(
        'Please specify the Buyer Location (City, State) in Section A.'
      );
      return;
    }
    if (!form.productService.trim()) {
      setValidationError(
        'Please enter the Product or Service being ordered in Section B.'
      );
      return;
    }
    if (form.expectedOrderValue <= 0) {
      setValidationError('Expected Order Value must be greater than ₹0.');
      return;
    }

    setIsAnalyzing(true);
    setLoadingStepText('Analyzing buyer signals...');

    setTimeout(() => {
      setLoadingStepText(
        'Weighing payment behaviour (30%), purchase history (25%), and engagement (20%)...'
      );
    }, 450);

    setTimeout(() => {
      setLoadingStepText(
        'Generating explainable confidence score & counterfactual terms simulation...'
      );
    }, 900);

    setTimeout(() => {
      setIsAnalyzing(false);
      onSubmitAnalysis(form, presetOverrideScore, targetUpdateId);
    }, 1350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysisFlow(editingBuyerId || undefined);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center mb-5 shadow-md">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Analyzing buyer signals...
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md">
          {loadingStepText}
        </p>
        <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-sky-600 rounded-full w-4/5 animate-pulse" />
        </div>
        <div className="mt-6 text-xs text-slate-400 font-mono-tabular">
          Evaluating: {form.companyName} ·{' '}
          {formatINRCompact(form.expectedOrderValue)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Active Edit Mode Banner */}
      {editingBuyerId && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-sky-950">
            <Pencil className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              <strong>Update Mode:</strong> You are editing the existing buyer record for{' '}
              <strong>{form.companyName || 'this buyer'}</strong>. Submitting will update their record and recalculate their score.
            </span>
          </div>
          {onClearEditingMode && (
            <button
              type="button"
              onClick={onClearEditingMode}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:text-sky-950 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Switch to Create New Mode</span>
            </button>
          )}
        </div>
      )}

      {/* Page Title + Quick Sample Loader Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-sky-700">
              {editingBuyerId
                ? 'Update Existing Buyer Signals'
                : 'Structured B2B Signal Evaluation'}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
              {editingBuyerId
                ? `Edit Buyer: ${form.companyName}`
                : 'Analyze Buyer Payment Confidence'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Provide commercial, behavioural, and payment signals across the 4 sections below.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Quick-Fill Sample Scenarios:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadPreset('benchmark82')}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Benchmark (82 · Low Risk)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('arun86')}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Arun Retail (86)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('review64')}
                className="px-2.5 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Review Case (64)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('highrisk34')}
                className="px-2.5 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                High Risk (34)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('blank')}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer whitespace-nowrap"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* SECTION A — Buyer Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-tabular font-semibold text-sky-700">
                SECTION A
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Buyer Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="buyer-name"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Buyer / Contact Name *
              </label>
              <input
                id="buyer-name"
                type="text"
                value={form.buyerName}
                onChange={(e) => updateField('buyerName', e.target.value)}
                placeholder="e.g., Arun Sharma — Arun Traders"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label
                htmlFor="company-name"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Company / Legal Entity Name *
              </label>
              <input
                id="company-name"
                type="text"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="e.g., Arun Retail Pvt Ltd"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label
                htmlFor="industry-select"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Industry Sector
              </label>
              <select
                id="industry-select"
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="location-input"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Location (City, State) *
              </label>
              <input
                id="location-input"
                type="text"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g., Bengaluru, Karnataka"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Business Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BUSINESS_TYPES.map((bType) => (
                  <button
                    key={bType}
                    type="button"
                    onClick={() => updateField('businessType', bType)}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                      form.businessType === bType
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {bType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B — Purchase Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-tabular font-semibold text-sky-700">
                SECTION B
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Purchase Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label
                htmlFor="product-service"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Product / Service Description *
              </label>
              <input
                id="product-service"
                type="text"
                value={form.productService}
                onChange={(e) => updateField('productService', e.target.value)}
                placeholder="e.g., Industrial IoT Gateway Modules (180 Units)"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="order-value"
                  className="text-xs font-semibold text-slate-800"
                >
                  Expected Order Value (INR)
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {formatINRCompact(form.expectedOrderValue)}
                </span>
              </div>
              <input
                id="order-value"
                type="number"
                min={10000}
                step={5000}
                value={form.expectedOrderValue}
                onChange={(e) =>
                  updateField('expectedOrderValue', Number(e.target.value))
                }
                className="w-full px-3.5 py-2.5 font-mono-tabular text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[75000, 180000, 240000, 520000, 870000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateField('expectedOrderValue', val)}
                    className="px-2 py-1 text-[11px] font-mono-tabular bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                  >
                    {formatINRCompact(val)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="quoted-price"
                  className="text-xs font-semibold text-slate-800"
                >
                  Initial Quoted Price (INR)
                </label>
                <span className="font-mono-tabular text-xs font-medium text-slate-500">
                  {formatINRFull(form.quotedPrice)}
                </span>
              </div>
              <input
                id="quoted-price"
                type="number"
                min={10000}
                step={5000}
                value={form.quotedPrice}
                onChange={(e) =>
                  updateField('quotedPrice', Number(e.target.value))
                }
                className="w-full px-3.5 py-2.5 font-mono-tabular text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Standard catalogue or proforma quote prior to buyer negotiation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Expected Purchase Frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PURCHASE_FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => updateField('purchaseFrequency', freq)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                      form.purchaseFrequency === freq
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="discount-slider"
                  className="text-xs font-semibold text-slate-800"
                >
                  Discount Requested by Buyer
                </label>
                <span className="font-mono-tabular text-xs font-bold text-slate-900">
                  {form.discountRequested}%
                </span>
              </div>
              <input
                id="discount-slider"
                type="range"
                min={0}
                max={30}
                step={1}
                value={form.discountRequested}
                onChange={(e) =>
                  updateField('discountRequested', Number(e.target.value))
                }
                className="w-full accent-sky-600 cursor-pointer mt-1"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                What percentage concession is the buyer demanding off your standard quote?
              </p>
            </div>
          </div>
        </section>

        {/* SECTION C — Buyer Behaviour */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-tabular font-semibold text-sky-700">
                SECTION C
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Buyer Behaviour
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Previous Purchase History
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {PURCHASE_HISTORY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField('previousPurchaseHistory', opt)}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer text-left ${
                      form.previousPurchaseHistory === opt
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Engagement Level
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['High', 'Moderate', 'Low'] as EngagementLevel[]).map(
                    (lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateField('engagementLevel', lvl)}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          form.engagementLevel === lvl
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Response Consistency
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    ['Consistent', 'Average', 'Erratic'] as ResponseConsistency[]
                  ).map((rc) => (
                    <button
                      key={rc}
                      type="button"
                      onClick={() => updateField('responseConsistency', rc)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        form.responseConsistency === rc
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Price Acceptance
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    ['Positive', 'Moderate', 'Pushback'] as PriceAcceptanceLevel[]
                  ).map((pa) => (
                    <button
                      key={pa}
                      type="button"
                      onClick={() => updateField('priceAcceptance', pa)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        form.priceAcceptance === pa
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pa}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="enquiries-range"
                  className="text-xs font-semibold text-slate-800"
                >
                  Number of Enquiries / Commercial Touchpoints
                </label>
                <span className="font-mono-tabular text-xs font-bold text-slate-900">
                  {form.numberOfEnquiries} interactions
                </span>
              </div>
              <input
                id="enquiries-range"
                type="range"
                min={1}
                max={15}
                value={form.numberOfEnquiries}
                onChange={(e) =>
                  updateField('numberOfEnquiries', Number(e.target.value))
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                How many quote revisions, sample requests, or follow-up calls have occurred?
              </p>
            </div>
          </div>
        </section>

        {/* SECTION D — Payment Behaviour */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-tabular font-semibold text-sky-700">
                SECTION D
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Payment Behaviour
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Previous Payment Record
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PAYMENT_RECORD_OPTIONS.map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => updateField('previousPaymentRecord', rec)}
                    className={`py-2.5 px-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      form.previousPaymentRecord === rec
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="payment-delay-slider"
                    className="text-xs font-semibold text-slate-800"
                  >
                    Average Payment Delay
                  </label>
                  <span className="font-mono-tabular text-xs font-bold text-slate-900">
                    {form.averagePaymentDelay} days past due
                  </span>
                </div>
                <input
                  id="payment-delay-slider"
                  type="range"
                  min={0}
                  max={60}
                  step={1}
                  value={form.averagePaymentDelay}
                  onChange={(e) =>
                    updateField('averagePaymentDelay', Number(e.target.value))
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  How many days does this buyer usually take beyond the agreed payment date?
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="outstanding-amount"
                    className="text-xs font-semibold text-slate-800"
                  >
                    Outstanding Amount (INR)
                  </label>
                  <span className="font-mono-tabular text-xs font-semibold text-slate-700">
                    {formatINRCompact(form.outstandingAmount)}
                  </span>
                </div>
                <input
                  id="outstanding-amount"
                  type="number"
                  min={0}
                  step={5000}
                  value={form.outstandingAmount}
                  onChange={(e) =>
                    updateField('outstandingAmount', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 font-mono-tabular text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Current unpaid balance across previous invoices, if any.
                </p>
              </div>

              <div>
                <label
                  htmlFor="credit-terms-select"
                  className="block text-xs font-semibold text-slate-800 mb-1.5"
                >
                  Credit / Payment Terms
                </label>
                <select
                  id="credit-terms-select"
                  value={form.creditTerms}
                  onChange={(e) =>
                    updateField('creditTerms', e.target.value as CreditTermsOption)
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  {CREDIT_TERMS_OPTIONS.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Proposed advance milestone and credit settlement period.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Payment History Reliability (1–5 Scale)
                  </label>
                  <span className="font-mono-tabular text-xs font-bold text-sky-700">
                    {form.paymentReliabilityRating} / 5
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        updateField('paymentReliabilityRating', rating)
                      }
                      className={`py-2 font-mono-tabular text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        form.paymentReliabilityRating === rating
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  1 = Frequent friction · 5 = Institutional settlement discipline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Google Search Grounding Pre-Check */}
        <SearchGroundingPanel
          companyName={form.companyName}
          industry={form.industry}
          location={form.location}
          contextType="buyer-verification"
          title="Live Company & Sector Check (Google Search Grounding)"
          subtitle="Verify real-time public web signals, recent news, and sector credit conditions for this buyer before running the confidence score."
          compact
        />

        {/* Submit & Trust Footer */}
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white">
                Explainable AI Confidence Engine
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Your information is analyzed to generate an explainable buyer confidence assessment.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {editingBuyerId && (
              <button
                type="button"
                onClick={() => runAnalysisFlow(undefined)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Save as New Record Instead
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto py-3.5 px-7 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
            >
              <span>
                {editingBuyerId
                  ? 'Update Buyer & Recalculate AI Score'
                  : 'Analyze Buyer with AI'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
