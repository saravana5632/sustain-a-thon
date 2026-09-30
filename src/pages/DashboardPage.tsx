import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart2,
  FileSearch,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { BuyerAnalysisResult, BuyerInputForm, PageRoute, RiskLevel } from '../types';
import { formatINRCompact } from '../utils/formatters';
import { RiskIndicator } from '../components/RiskIndicator';
import { BuyerQuickFormModal } from '../components/BuyerQuickFormModal';

interface DashboardPageProps {
  buyers: BuyerAnalysisResult[];
  onNavigate: (page: PageRoute) => void;
  onSelectBuyerForDetails: (buyer: BuyerAnalysisResult) => void;
  onSelectBuyerForResult: (buyer: BuyerAnalysisResult) => void;
  onQuickSaveBuyer: (formInput: BuyerInputForm, existingId?: string) => void;
  onDeleteBuyer: (buyerId: string) => void;
  onEditBuyerInFullForm: (buyer: BuyerAnalysisResult) => void;
  onRestoreDefaults: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  buyers,
  onNavigate,
  onSelectBuyerForDetails,
  onSelectBuyerForResult,
  onQuickSaveBuyer,
  onDeleteBuyer,
  onEditBuyerInFullForm,
  onRestoreDefaults,
}) => {
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    buyer: BuyerAnalysisResult | null;
  }>({ open: false, mode: 'create', buyer: null });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalCount = buyers.length;
  const currentHigh = buyers.filter((b) => b.riskLevel === 'Low').length;
  const currentReview = buyers.filter((b) => b.riskLevel === 'Review').length;
  const currentRisk = buyers.filter((b) => b.riskLevel === 'High').length;
  const currentTotalValue = buyers.reduce(
    (acc, b) => acc + (b.input.expectedOrderValue || 0),
    0
  );

  const kpis = {
    buyersAnalyzed: totalCount,
    highConfidence: currentHigh,
    needsReview: currentReview,
    highRisk: currentRisk,
    totalPotentialValue: currentTotalValue,
  };

  const filteredBuyers = useMemo(() => {
    if (riskFilter === 'All') return buyers;
    return buyers.filter((b) => b.riskLevel === riskFilter);
  }, [buyers, riskFilter]);

  const highPct = totalCount > 0 ? Math.round((kpis.highConfidence / totalCount) * 100) : 0;
  const reviewPct = totalCount > 0 ? Math.round((kpis.needsReview / totalCount) * 100) : 0;
  const riskPct = totalCount > 0 ? Math.max(0, 100 - highPct - reviewPct) : 0;

  return (
    <div className="space-y-8">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500">
            Workspace Overview · Real-time Buyer Risk Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Buyer Risk Overview
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-0.5">
            Monitor buyer payment reliability and commercial risk signals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              setModalState({ open: true, mode: 'create', buyer: null })
            }
            className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            All Buyers ({buyers.length})
          </button>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <section
        aria-label="Key Risk Metrics"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Buyers Analyzed
          </div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {kpis.buyersAnalyzed}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total active in database
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            High Confidence
          </div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">
            {kpis.highConfidence}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Score 75–100 · Standard terms
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Needs Review</div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-amber-600 mt-2">
            {kpis.needsReview}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Score 50–74 · Advance advised
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">High Risk</div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-red-600 mt-2">
            {kpis.highRisk}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Score &lt;50 · Avoid open credit
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Total Potential Value
          </div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {formatINRCompact(kpis.totalPotentialValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active evaluated pipeline
          </div>
        </div>
      </section>

      {/* Primary Action Card + Buyer Confidence Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Primary Card: Analyze a New Buyer */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between border border-slate-800">
          <div>
            <div className="text-xs font-semibold text-sky-400 tracking-wide">
              AI Payment Confidence Assessment
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
              Analyze a New Buyer
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Evaluate buying and payment confidence before committing your resources. Generate an explainable 0–100 score, key signal drivers, and counterfactual terms simulation.
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('analyze')}
              className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Analyze Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const benchmark =
                  buyers.find((b) => b.confidenceScore === 82) || buyers[0];
                if (benchmark) onSelectBuyerForResult(benchmark);
              }}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Inspect Latest Result (82/100)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Section: Buyer Confidence Overview */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Buyer Confidence Overview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution across {kpis.buyersAnalyzed} sample assessments by confidence tier
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('insights')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>View Business Insights</span>
              </button>
            </div>

            {/* Proportional Segmented Bar Visualization */}
            <div className="mt-6">
              <div
                className="w-full h-5 rounded-lg overflow-hidden flex gap-1 bg-slate-100 p-0.5"
                role="img"
                aria-label={`Buyer confidence distribution: ${highPct}% High Confidence, ${reviewPct}% Medium Confidence, ${riskPct}% High Risk`}
              >
                <div
                  style={{ width: `${highPct}%` }}
                  className="bg-emerald-600 h-full rounded-l-md transition-all duration-500"
                  title={`High Confidence: ${highPct}%`}
                />
                <div
                  style={{ width: `${reviewPct}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Medium Confidence (Needs Review): ${reviewPct}%`}
                />
                <div
                  style={{ width: `${riskPct}%` }}
                  className="bg-red-600 h-full rounded-r-md transition-all duration-500"
                  title={`High Risk: ${riskPct}%`}
                />
              </div>
            </div>

            {/* 3 Tier Breakdown Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <button
                type="button"
                onClick={() =>
                  setRiskFilter(riskFilter === 'Low' ? 'All' : 'Low')
                }
                className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  riskFilter === 'Low'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    High Confidence
                  </span>
                  <span className="font-mono-tabular">{highPct}%</span>
                </div>
                <div className="font-mono-tabular text-xl font-bold text-slate-900 mt-1.5">
                  {kpis.highConfidence}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    buyers
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Low Risk · Score 75–100
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setRiskFilter(riskFilter === 'Review' ? 'All' : 'Review')
                }
                className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  riskFilter === 'Review'
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Medium Confidence
                  </span>
                  <span className="font-mono-tabular">{reviewPct}%</span>
                </div>
                <div className="font-mono-tabular text-xl font-bold text-slate-900 mt-1.5">
                  {kpis.needsReview}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    buyers
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Needs Review · Score 50–74
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setRiskFilter(riskFilter === 'High' ? 'All' : 'High')
                }
                className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  riskFilter === 'High'
                    ? 'border-red-600 bg-red-50/50'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-red-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    High Risk
                  </span>
                  <span className="font-mono-tabular">{riskPct}%</span>
                </div>
                <div className="font-mono-tabular text-xl font-bold text-slate-900 mt-1.5">
                  {kpis.highRisk}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    buyers
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  High Risk · Score 0–49
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Buyer Assessments Table with Full CRUD Controls */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Buyer Assessments
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, inspect, edit commercial signals, or remove buyer assessments directly from your workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Interactive Filter Segmented Bar */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['All', 'Low', 'Review', 'High'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRiskFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    riskFilter === tab
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'All'
                    ? 'All'
                    : tab === 'Low'
                    ? 'Low Risk'
                    : tab === 'Review'
                    ? 'Review'
                    : 'High Risk'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-6">Buyer</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4 text-right">Confidence</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBuyers.slice(0, 8).map((buyer) => {
                const isConfirmingDelete = confirmDeleteId === buyer.id;
                return (
                  <tr
                    key={buyer.id}
                    className="hover:bg-slate-50/90 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-medium text-slate-900 whitespace-nowrap">
                      {buyer.input.buyerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <span>{buyer.input.companyName}</span>
                      <span className="text-slate-300 mx-1.5">·</span>
                      <span className="text-xs text-slate-500">
                        {buyer.input.location.split(',')[0]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-slate-900 whitespace-nowrap">
                      {formatINRCompact(buyer.input.expectedOrderValue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular font-bold text-slate-900 whitespace-nowrap">
                      {buyer.confidenceScore}
                      <span className="text-xs font-normal text-slate-400">
                        /100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RiskIndicator risk={buyer.riskLevel} compact />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {buyer.dateLabel}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      {isConfirmingDelete ? (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <span className="text-xs text-red-700 font-semibold mr-1">
                            Delete?
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteBuyer(buyer.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectBuyerForResult(buyer)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Open AI Confidence Score & What-If Simulator"
                          >
                            <FileSearch className="w-3.5 h-3.5 text-sky-600" />
                            <span>AI Score</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectBuyerForDetails(buyer)}
                            className="px-3 py-1 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100/80 rounded-md transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setModalState({
                                open: true,
                                mode: 'edit',
                                buyer,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit Buyer Signals"
                            aria-label={`Edit ${buyer.input.companyName}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(buyer.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Buyer Assessment"
                            aria-label={`Delete ${buyer.input.companyName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Showing {Math.min(8, filteredBuyers.length)} of{' '}
              {filteredBuyers.length} assessments
            </span>
            <button
              type="button"
              onClick={onRestoreDefaults}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              title="Reset buyer list to original 9 sample buyers"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Sample Data</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="font-semibold text-slate-800 hover:text-sky-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Buyer History Database</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      <BuyerQuickFormModal
        isOpen={modalState.open}
        mode={modalState.mode}
        initialBuyer={modalState.buyer}
        onClose={() =>
          setModalState({ open: false, mode: 'create', buyer: null })
        }
        onSave={(formInput, existingId) => {
          onQuickSaveBuyer(formInput, existingId);
          setModalState({ open: false, mode: 'create', buyer: null });
        }}
        onOpenFullEditor={(formInput, existingId) => {
          setModalState({ open: false, mode: 'create', buyer: null });
          if (modalState.buyer && existingId) {
            onEditBuyerInFullForm({
              ...modalState.buyer,
              input: formInput,
            });
          } else {
            onNavigate('analyze');
          }
        }}
      />
    </div>
  );
};
