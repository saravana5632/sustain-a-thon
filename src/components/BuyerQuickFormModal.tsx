import React, { useEffect, useState } from 'react';
import { Building2, Save, SlidersHorizontal, X } from 'lucide-react';
import {
  BusinessType,
  BuyerAnalysisResult,
  BuyerInputForm,
  CreditTermsOption,
  PurchaseFrequency,
} from '../types';
import { DEMO_BENCHMARK_BUYER_INPUT } from '../data/mockBuyers';
import { formatINRCompact } from '../utils/formatters';

interface BuyerQuickFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialBuyer?: BuyerAnalysisResult | null;
  onClose: () => void;
  onSave: (formInput: BuyerInputForm, existingId?: string) => void;
  onOpenFullEditor?: (formInput: BuyerInputForm, existingId?: string) => void;
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

const CREDIT_TERMS: CreditTermsOption[] = [
  '100% Advance',
  '50% Advance · Net 15',
  '30% Advance · Net 30',
  'Zero Advance · Net 30',
  'Zero Advance · Net 45',
  'Zero Advance · Net 60',
  'Zero Advance · Net 90',
];

export const BuyerQuickFormModal: React.FC<BuyerQuickFormModalProps> = ({
  isOpen,
  mode,
  initialBuyer,
  onClose,
  onSave,
  onOpenFullEditor,
}) => {
  const [form, setForm] = useState<BuyerInputForm>(
    initialBuyer?.input || {
      ...DEMO_BENCHMARK_BUYER_INPUT,
      buyerName: '',
      companyName: '',
      location: 'Mumbai, Maharashtra',
      productService: 'Commercial Supply Batch',
      expectedOrderValue: 250000,
    }
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBuyer) {
      setForm({ ...initialBuyer.input });
    } else {
      setForm({
        ...DEMO_BENCHMARK_BUYER_INPUT,
        buyerName: '',
        companyName: '',
        location: 'Mumbai, Maharashtra',
        productService: 'Commercial Supply Consignment',
        expectedOrderValue: 250000,
      });
    }
    setError(null);
  }, [initialBuyer, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.companyName.trim()) {
      setError('Buyer Contact Name and Company Name are required.');
      return;
    }
    if (!form.location.trim() || !form.productService.trim()) {
      setError('Location and Product/Service description are required.');
      return;
    }
    onSave(form, mode === 'edit' ? initialBuyer?.id : undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-buyer-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-xl my-8">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="quick-buyer-modal-title"
                className="text-lg sm:text-xl font-bold text-slate-900"
              >
                {mode === 'edit'
                  ? `Update Buyer Assessment: ${initialBuyer?.input.companyName}`
                  : 'Create New Buyer Assessment'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'edit'
                  ? 'Modify key commercial and payment signals. Confidence score & risk tier recalculate automatically.'
                  : 'Enter core buyer signals to generate and store a new assessment record.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Buyer / Contact Name *
              </label>
              <input
                type="text"
                value={form.buyerName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, buyerName: e.target.value }))
                }
                placeholder="e.g., Rohan Mehta"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, companyName: e.target.value }))
                }
                placeholder="e.g., Mehta Industrial Corp"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Industry Sector
              </label>
              <select
                value={form.industry}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, industry: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Location (City, State) *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g., Bengaluru, Karnataka"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Product / Service Description *
              </label>
              <input
                type="text"
                value={form.productService}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    productService: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <label>Expected Order Value (INR)</label>
                <span className="font-mono-tabular text-sky-700">
                  {formatINRCompact(form.expectedOrderValue)}
                </span>
              </div>
              <input
                type="number"
                min={10000}
                step={5000}
                value={form.expectedOrderValue}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    expectedOrderValue: Number(e.target.value),
                    quotedPrice: Math.round(Number(e.target.value) * 1.05),
                  }))
                }
                className="w-full px-3 py-2 font-mono-tabular text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Credit / Payment Terms
              </label>
              <select
                value={form.creditTerms}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    creditTerms: e.target.value as CreditTermsOption,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {CREDIT_TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <label>Avg Payment Delay (Days)</label>
                <span className="font-mono-tabular">
                  {form.averagePaymentDelay}d
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={form.averagePaymentDelay}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    averagePaymentDelay: Number(e.target.value),
                  }))
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <label>Discount Requested (%)</label>
                <span className="font-mono-tabular">
                  {form.discountRequested}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={form.discountRequested}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    discountRequested: Number(e.target.value),
                  }))
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Business Structure
              </label>
              <select
                value={form.businessType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    businessType: e.target.value as BusinessType,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Private Limited">Private Limited</option>
                <option value="LLP / Partnership">LLP / Partnership</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="Public / Enterprise">Public / Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Purchase Frequency
              </label>
              <select
                value={form.purchaseFrequency}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    purchaseFrequency: e.target.value as PurchaseFrequency,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="One-time">One-time</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Monthly">Monthly</option>
                <option value="Annual Contract">Annual Contract</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {onOpenFullEditor ? (
              <button
                type="button"
                onClick={() =>
                  onOpenFullEditor(
                    form,
                    mode === 'edit' ? initialBuyer?.id : undefined
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Open Full 4-Section Signal Form</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {mode === 'edit'
                    ? 'Save & Recalculate Score'
                    : 'Create & Analyze Buyer'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
