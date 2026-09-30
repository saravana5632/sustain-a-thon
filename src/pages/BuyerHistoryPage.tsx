import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Copy,
  FileSearch,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import {
  BuyerAnalysisResult,
  BuyerInputForm,
  PageRoute,
  RiskLevel,
} from '../types';
import { formatINRCompact } from '../utils/formatters';
import { RiskIndicator } from '../components/RiskIndicator';
import { BuyerQuickFormModal } from '../components/BuyerQuickFormModal';

interface BuyerHistoryPageProps {
  buyers: BuyerAnalysisResult[];
  onSelectBuyerForDetails: (buyer: BuyerAnalysisResult) => void;
  onSelectBuyerForResult: (buyer: BuyerAnalysisResult) => void;
  onNavigate: (page: PageRoute) => void;
  onQuickSaveBuyer: (formInput: BuyerInputForm, existingId?: string) => void;
  onDeleteBuyer: (buyerId: string) => void;
  onEditBuyerInFullForm: (buyer: BuyerAnalysisResult) => void;
  onRestoreDefaults: () => void;
}

export const BuyerHistoryPage: React.FC<BuyerHistoryPageProps> = ({
  buyers,
  onSelectBuyerForDetails,
  onSelectBuyerForResult,
  onNavigate,
  onQuickSaveBuyer,
  onDeleteBuyer,
  onEditBuyerInFullForm,
  onRestoreDefaults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [confidenceBand, setConfidenceBand] = useState<
    'All' | 'High (75+)' | 'Medium (50–74)' | 'Low (<50)'
  >('All');
  const [sortBy, setSortBy] = useState<
    'date-desc' | 'value-desc' | 'value-asc' | 'score-desc'
  >('date-desc');

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    buyer: BuyerAnalysisResult | null;
  }>({ open: false, mode: 'create', buyer: null });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const uniqueIndustries = useMemo(() => {
    const set = new Set(buyers.map((b) => b.input.industry));
    return ['All', ...Array.from(set)];
  }, [buyers]);

  const filteredAndSortedBuyers = useMemo(() => {
    return buyers
      .filter((b) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = b.input.buyerName.toLowerCase().includes(q);
          const matchCompany = b.input.companyName.toLowerCase().includes(q);
          const matchLocation = b.input.location.toLowerCase().includes(q);
          const matchProduct = b.input.productService.toLowerCase().includes(q);
          if (!matchName && !matchCompany && !matchLocation && !matchProduct) {
            return false;
          }
        }
        if (riskFilter !== 'All' && b.riskLevel !== riskFilter) {
          return false;
        }
        if (industryFilter !== 'All' && b.input.industry !== industryFilter) {
          return false;
        }
        if (confidenceBand === 'High (75+)' && b.confidenceScore < 75) {
          return false;
        }
        if (
          confidenceBand === 'Medium (50–74)' &&
          (b.confidenceScore < 50 || b.confidenceScore >= 75)
        ) {
          return false;
        }
        if (confidenceBand === 'Low (<50)' && b.confidenceScore >= 50) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'value-desc') {
          return b.input.expectedOrderValue - a.input.expectedOrderValue;
        }
        if (sortBy === 'value-asc') {
          return a.input.expectedOrderValue - b.input.expectedOrderValue;
        }
        if (sortBy === 'score-desc') {
          return b.confidenceScore - a.confidenceScore;
        }
        return (
          new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
        );
      });
  }, [buyers, searchQuery, riskFilter, industryFilter, confidenceBand, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setRiskFilter('All');
    setIndustryFilter('All');
    setConfidenceBand('All');
    setSortBy('date-desc');
  };

  const handleDuplicateBuyer = (buyer: BuyerAnalysisResult) => {
    onQuickSaveBuyer({
      ...buyer.input,
      companyName: `${buyer.input.companyName} (Copy)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-700">
            Evaluated Buyer Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Buyer History Database
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Search, filter, update commercial terms, duplicate, or delete B2B buyer records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() =>
              setModalState({ open: true, mode: 'create', buyer: null })
            }
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('analyze')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Full AI Assessment</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search buyer, company, city, or product..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {/* Industry Filter */}
          <div className="md:col-span-3">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              aria-label="Filter by industry"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'All' ? 'All Industries' : ind}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="md:col-span-2">
            <select
              value={confidenceBand}
              onChange={(e) =>
                setConfidenceBand(e.target.value as typeof confidenceBand)
              }
              aria-label="Filter by confidence score"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <option value="All">All Scores</option>
              <option value="High (75+)">High (75+)</option>
              <option value="Medium (50–74)">Medium (50–74)</option>
              <option value="Low (<50)">Low (&lt;50)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                aria-label="Sort buyers"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <option value="date-desc">Newest First</option>
                <option value="value-desc">Order Value: High</option>
                <option value="value-asc">Order Value: Low</option>
                <option value="score-desc">Confidence: High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Segmented Risk Filter Row + Active Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Low', 'Review', 'High'] as const).map((risk) => (
              <button
                key={risk}
                type="button"
                onClick={() => setRiskFilter(risk)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  riskFilter === risk
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {risk === 'All'
                  ? 'All Risk Tiers'
                  : risk === 'Low'
                  ? 'Low Risk'
                  : risk === 'Review'
                  ? 'Needs Review'
                  : 'High Risk'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Matching Buyers:{' '}
              <strong className="font-mono-tabular text-slate-900">
                {filteredAndSortedBuyers.length}
              </strong>
            </span>
            {(searchQuery ||
              riskFilter !== 'All' ||
              industryFilter !== 'All' ||
              confidenceBand !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Buyer History Table / Empty State */}
      {filteredAndSortedBuyers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No buyer records match your current filters
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Try clearing your search query, resetting the filters, or creating a new buyer record.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            <button
              type="button"
              onClick={() =>
                setModalState({ open: true, mode: 'create', buyer: null })
              }
              className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-500 transition-colors cursor-pointer"
            >
              + Create New Buyer
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3.5 px-6">Buyer</th>
                  <th className="py-3.5 px-4">Company & Industry</th>
                  <th className="py-3.5 px-4 text-right">Confidence Score</th>
                  <th className="py-3.5 px-4">Risk</th>
                  <th className="py-3.5 px-4 text-right">Order Value</th>
                  <th className="py-3.5 px-4">Last Assessment</th>
                  <th className="py-3.5 px-6 text-right">CRUD Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAndSortedBuyers.map((buyer) => {
                  const isConfirmingDelete = confirmDeleteId === buyer.id;
                  return (
                    <tr
                      key={buyer.id}
                      onClick={() => onSelectBuyerForDetails(buyer)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {buyer.input.buyerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {buyer.input.location}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {buyer.input.companyName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {buyer.input.industry} · {buyer.input.creditTerms}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="font-mono-tabular text-base font-bold text-slate-900">
                          {buyer.confidenceScore}
                        </span>
                        <span className="font-mono-tabular text-xs text-slate-400">
                          {' '}
                          / 100
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <RiskIndicator risk={buyer.riskLevel} compact />
                      </td>

                      <td className="py-4 px-4 text-right font-mono-tabular font-semibold text-slate-900 whitespace-nowrap">
                        {formatINRCompact(buyer.input.expectedOrderValue)}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        <div>{buyer.dateLabel}</div>
                        <div className="text-[11px] text-slate-400">
                          {buyer.statusLabel}
                        </div>
                      </td>

                      <td
                        className="py-4 px-6 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isConfirmingDelete ? (
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <span className="text-xs font-semibold text-red-700 mr-1">
                              Delete record?
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
                              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Open AI Confidence Score & Simulator"
                            >
                              <FileSearch className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectBuyerForDetails(buyer)}
                              className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
                            >
                              Profile
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
                              title="Edit Buyer Record"
                              aria-label={`Edit ${buyer.input.companyName}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateBuyer(buyer)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Duplicate Buyer Assessment"
                              aria-label={`Duplicate ${buyer.input.companyName}`}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(buyer.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Delete Buyer Record"
                              aria-label={`Delete ${buyer.input.companyName}`}
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

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
