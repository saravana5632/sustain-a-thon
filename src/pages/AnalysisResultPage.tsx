import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  Pencil,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  BuyerAnalysisResult,
  CreditTermsOption,
  PageRoute,
  PurchaseFrequency,
} from '../types';
import { ConfidenceGauge } from '../components/ConfidenceGauge';
import { RiskIndicator } from '../components/RiskIndicator';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { TrustExplainability } from '../components/TrustExplainability';
import { SearchGroundingPanel } from '../components/SearchGroundingPanel';
import { formatINRCompact } from '../utils/formatters';

interface AnalysisResultPageProps {
  result: BuyerAnalysisResult;
  onNavigate: (page: PageRoute) => void;
  onOpenBuyerDetails: (buyer: BuyerAnalysisResult) => void;
  onEditBuyerSignals: (buyer: BuyerAnalysisResult) => void;
  onDeleteBuyer: (buyerId: string) => void;
  onUpdateResultTerms: (updatedTerms: {
    expectedOrderValue: number;
    discountRequested: number;
    creditTerms: CreditTermsOption;
    purchaseFrequency: PurchaseFrequency;
    projectedScore: number;
  }) => void;
  onUpdateBuyerRecord: (updatedBuyer: BuyerAnalysisResult, toastMessage?: string) => void;
}

export const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({
  result,
  onNavigate,
  onOpenBuyerDetails,
  onEditBuyerSignals,
  onDeleteBuyer,
  onUpdateResultTerms,
  onUpdateBuyerRecord,
}) => {
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const [newStepText, setNewStepText] = useState('');
  const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null);
  const [editingStepValue, setEditingStepValue] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const completedIndices = result.completedStepIndices || [0];

  const toggleStep = (idx: number) => {
    const exists = completedIndices.includes(idx);
    const updatedCompleted = exists
      ? completedIndices.filter((i) => i !== idx)
      : [...completedIndices, idx];
    onUpdateBuyerRecord({
      ...result,
      completedStepIndices: updatedCompleted,
    });
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    const updatedSteps = [...result.recommendedNextSteps, newStepText.trim()];
    onUpdateBuyerRecord(
      {
        ...result,
        recommendedNextSteps: updatedSteps,
      },
      'Added new action step to buyer recommendation plan.'
    );
    setNewStepText('');
  };

  const handleSaveStepEdit = (idx: number) => {
    if (!editingStepValue.trim()) return;
    const updatedSteps = result.recommendedNextSteps.map((s, i) =>
      i === idx ? editingStepValue.trim() : s
    );
    onUpdateBuyerRecord(
      {
        ...result,
        recommendedNextSteps: updatedSteps,
      },
      'Updated recommended action step.'
    );
    setEditingStepIdx(null);
    setEditingStepValue('');
  };

  const handleDeleteStep = (idx: number) => {
    const updatedSteps = result.recommendedNextSteps.filter((_, i) => i !== idx);
    const updatedCompleted = completedIndices
      .filter((i) => i !== idx)
      .map((i) => (i > idx ? i - 1 : i));
    onUpdateBuyerRecord(
      {
        ...result,
        recommendedNextSteps: updatedSteps,
        completedStepIndices: updatedCompleted,
      },
      'Removed action step from checklist.'
    );
  };

  const getSignalIcon = (id: string) => {
    switch (id) {
      case 'payment-history':
        return <CreditCard className="w-4 h-4 text-sky-700" />;
      case 'purchase-intent':
        return <ShoppingBag className="w-4 h-4 text-sky-700" />;
      case 'price-acceptance':
        return <Tag className="w-4 h-4 text-sky-700" />;
      default:
        return <MessageSquare className="w-4 h-4 text-sky-700" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>AI Decision-Support Report</span>
            <span>·</span>
            <span>Assessed {result.dateLabel}</span>
            <span>·</span>
            <span className="font-mono-tabular">
              Order: {formatINRCompact(result.input.expectedOrderValue)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {result.input.companyName}
          </h1>
          <p className="text-sm text-slate-600">
            {result.input.buyerName} · {result.input.industry} ·{' '}
            {result.input.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenBuyerDetails(result)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Buyer Profile & Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => onEditBuyerSignals(result)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-sky-600" />
            <span>Edit Signals</span>
          </button>
          {confirmDeleteOpen ? (
            <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-red-800">
                Delete assessment?
              </span>
              <button
                type="button"
                onClick={() => onDeleteBuyer(result.id)}
                className="px-2 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
              title="Delete Buyer Assessment"
              aria-label="Delete Buyer Assessment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('analyze')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Buyer</span>
          </button>
        </div>
      </div>

      {appliedBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{appliedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedBanner(null)}
            className="text-xs font-semibold text-emerald-800 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Score & AI Assessment Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Circular Score Visualization */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center lg:border-r lg:border-slate-100 lg:pr-6">
            <div className="text-xs font-bold tracking-wider text-slate-500 mb-3">
              BUYER PAYMENT CONFIDENCE
            </div>
            <ConfidenceGauge
              score={result.confidenceScore}
              riskLevel={result.riskLevel}
              size="lg"
            />
            <div className="mt-3 text-[11px] text-slate-500 text-center">
              AI-generated signal estimate · Not a payment guarantee
            </div>
          </div>

          {/* Right: AI Assessment & Commercial Snapshot */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-sky-700">
                  AI Assessment
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {result.statusLabel}
                </h2>
              </div>
              <RiskIndicator risk={result.riskLevel} />
            </div>

            <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed">
              “{result.aiAssessmentSummary}”
            </p>

            {/* Key Commercial Context Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-[11px] text-slate-500">Order Value</div>
                <div className="font-mono-tabular text-base font-bold text-slate-900 mt-0.5">
                  {formatINRCompact(result.input.expectedOrderValue)}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-[11px] text-slate-500">Payment Terms</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {result.input.creditTerms}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-[11px] text-slate-500">Avg Payment Delay</div>
                <div className="font-mono-tabular text-base font-bold text-slate-900 mt-0.5">
                  {result.input.averagePaymentDelay} days
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-[11px] text-slate-500">Discount Requested</div>
                <div className="font-mono-tabular text-base font-bold text-slate-900 mt-0.5">
                  {result.input.discountRequested}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THIS SCORE? — 4 Signal Cards */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Why This Score?</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Core commercial and behavioural signals driving this buyer’s evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {result.signalCards.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                    {getSignalIcon(card.id)}
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-slate-500">
                    {card.scoreOutOf100}/100
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-500 mt-3.5">
                  {card.label}
                </div>
                <div
                  className={`text-base font-bold mt-0.5 ${
                    card.tone === 'positive'
                      ? 'text-emerald-700'
                      : card.tone === 'neutral'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {card.status}
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                {card.explanation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIDENCE BREAKDOWN & AI RECOMMENDATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Confidence Breakdown (5 Configurable Weights) */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Confidence Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configurable model weights applied to each signal dimension
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              Configure Weights
            </button>
          </div>

          {/* Stacked Horizontal Weight Visualization Bar */}
          <div className="mb-6">
            <div className="w-full h-4 rounded-lg overflow-hidden flex gap-0.5 bg-slate-100 p-0.5">
              <div
                style={{ width: '30%' }}
                className="bg-slate-900 h-full rounded-l-sm"
                title="Payment Behaviour — 30%"
              />
              <div
                style={{ width: '25%' }}
                className="bg-sky-700 h-full"
                title="Purchase History — 25%"
              />
              <div
                style={{ width: '20%' }}
                className="bg-sky-500 h-full"
                title="Engagement — 20%"
              />
              <div
                style={{ width: '15%' }}
                className="bg-teal-500 h-full"
                title="Price Acceptance — 15%"
              />
              <div
                style={{ width: '10%' }}
                className="bg-slate-400 h-full rounded-r-sm"
                title="Other Signals — 10%"
              />
            </div>
          </div>

          <div className="space-y-4">
            {result.breakdown.map((item) => (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono-tabular text-xs font-semibold text-sky-700">
                      Weight {item.weightPercentage}%
                    </span>
                  </div>
                  <div className="font-mono-tabular text-xs font-bold text-slate-800">
                    Signal Score: {item.factorScore}/100
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${item.factorScore}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500">{item.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI-GENERATED RECOMMENDATION & NEXT STEPS (WITH FULL CRUD) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-sky-700">
              AI-Generated Recommendation
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5 leading-snug">
              “{result.aiRecommendationHeadline}”
            </h2>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 tracking-wide">
                  Recommended Next Steps
                </span>
                <span className="text-[11px] text-slate-400">
                  Click to toggle · Edit or add steps
                </span>
              </div>

              <div className="space-y-2.5">
                {result.recommendedNextSteps.map((step, index) => {
                  const isDone = completedIndices.includes(index);
                  const isEditingThis = editingStepIdx === index;

                  if (isEditingThis) {
                    return (
                      <div
                        key={index}
                        className="p-2.5 rounded-lg border border-sky-300 bg-sky-50/40 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={editingStepValue}
                          onChange={(e) => setEditingStepValue(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveStepEdit(index)}
                          className="px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStepIdx(null)}
                          className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-2 transition-colors group ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-slate-50/60 border-slate-200/80 text-slate-800 hover:bg-slate-100/70'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleStep(index)}
                        className="flex items-start gap-3 text-left flex-1 cursor-pointer"
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono-tabular shrink-0 mt-0.5 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            isDone
                              ? 'line-through text-slate-500'
                              : 'text-slate-900'
                          }`}
                        >
                          {step}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStepIdx(index);
                            setEditingStepValue(step);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
                          title="Edit step"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(index)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="Remove step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Action Step Form */}
              <form onSubmit={handleAddStep} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newStepText}
                  onChange={(e) => setNewStepText(e.target.value)}
                  placeholder="Add custom safeguard or action step..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Interactive action checklist
            </span>
            <span className="font-mono-tabular font-semibold text-slate-700">
              {completedIndices.length} / {result.recommendedNextSteps.length}{' '}
              completed
            </span>
          </div>
        </section>
      </div>

      {/* UNIQUE FEATURE 1 — “WHAT IF?” SIMULATOR */}
      <WhatIfSimulator
        result={result}
        onApplySimulatedTerms={(updated) => {
          onUpdateResultTerms(updated);
          setAppliedBanner(
            `Commercial terms updated (${updated.creditTerms}, Order ${formatINRCompact(
              updated.expectedOrderValue
            )}). Confidence score recalculated to ${updated.projectedScore}/100.`
          );
        }}
      />

      {/* UNIQUE FEATURE 2 — “WHY SHOULD I TRUST THIS SCORE?” */}
      <TrustExplainability factors={result.trustFactors} defaultOpen={true} />

      {/* LIVE GOOGLE SEARCH GROUNDING INTELLIGENCE */}
      <SearchGroundingPanel
        companyName={result.input.companyName}
        industry={result.input.industry}
        location={result.input.location}
        contextType="buyer-verification"
        title={`Live Web & Sector Intelligence for ${result.input.companyName}`}
        subtitle="Augment internal buyer signals with live Google Search grounding across company news, regional trade credit conditions, and industry payment cycles."
      />

      {/* MANDATORY DECISION-SUPPORT DISCLAIMER */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-100 border border-slate-200/90 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
        <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-900">
            Important Decision-Support Disclaimer:{' '}
          </strong>
          This score is a decision-support estimate based on the information provided. It does not guarantee that a buyer will purchase or pay.
        </div>
      </div>
    </div>
  );
};
