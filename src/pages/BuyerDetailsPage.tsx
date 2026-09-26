import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileSearch,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import {
  BuyerAnalysisResult,
  BuyerInputForm,
  CommercialNote,
  PageRoute,
  PastInvoiceRecord,
  TimelineStage,
} from '../types';
import { formatINRCompact, formatINRFull } from '../utils/formatters';
import { RiskIndicator } from '../components/RiskIndicator';
import { SearchGroundingPanel } from '../components/SearchGroundingPanel';
import { BuyerQuickFormModal } from '../components/BuyerQuickFormModal';

interface BuyerDetailsPageProps {
  buyer: BuyerAnalysisResult;
  allBuyers: BuyerAnalysisResult[];
  onSelectBuyer: (buyer: BuyerAnalysisResult) => void;
  onOpenAnalysisResult: (buyer: BuyerAnalysisResult) => void;
  onReanalyzeBuyer: (buyer: BuyerAnalysisResult) => void;
  onUpdateBuyerRecord: (
    updatedBuyer: BuyerAnalysisResult,
    toastMessage?: string
  ) => void;
  onQuickSaveBuyer: (formInput: BuyerInputForm, existingId?: string) => void;
  onDeleteBuyer: (buyerId: string) => void;
  onNavigate: (page: PageRoute) => void;
}

export const BuyerDetailsPage: React.FC<BuyerDetailsPageProps> = ({
  buyer,
  allBuyers,
  onSelectBuyer,
  onOpenAnalysisResult,
  onReanalyzeBuyer,
  onUpdateBuyerRecord,
  onQuickSaveBuyer,
  onDeleteBuyer,
  onNavigate,
}) => {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(3);
  const [quickEditModalOpen, setQuickEditModalOpen] = useState(false);
  const [confirmDeleteBuyer, setConfirmDeleteBuyer] = useState(false);

  // Timeline Stage Edit State
  const [editingStage, setEditingStage] = useState(false);
  const [stageDraft, setStageDraft] = useState<TimelineStage | null>(null);

  // Invoice CRUD State
  const [addingInvoice, setAddingInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState<PastInvoiceRecord>({
    invoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: '26 Sep 2026',
    amount: buyer.input.expectedOrderValue || 180000,
    terms: buyer.input.creditTerms,
    settledInDays: 28,
    status: 'Settled On-Time',
  });
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceDraft, setInvoiceDraft] = useState<PastInvoiceRecord | null>(
    null
  );

  // Commercial Notes CRUD State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] =
    useState<CommercialNote['category']>('Credit Check');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const activeStage = buyer.timeline[selectedStageIndex] || buyer.timeline[0];

  const defaultNotes: CommercialNote[] = [
    {
      id: 'note-1',
      author: 'Credit Desk',
      date: '2 days ago',
      category: 'Credit Check',
      content: `Verified GST filing regularity and trade references in ${
        buyer.input.location.split(',')[0]
      }.`,
    },
    {
      id: 'note-2',
      author: 'Sales Lead',
      date: 'Yesterday',
      category: 'Negotiation',
      content: `Discussed ${buyer.input.creditTerms} terms for ${buyer.input.productService}.`,
    },
  ];

  const buyerNotes = buyer.notes || defaultNotes;

  // --- TIMELINE STAGE UPDATE HANDLER ---
  const handleStartEditStage = () => {
    if (!activeStage) return;
    setStageDraft({ ...activeStage });
    setEditingStage(true);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageDraft) return;
    const updatedTimeline = buyer.timeline.map((st, idx) =>
      idx === selectedStageIndex ? stageDraft : st
    );
    onUpdateBuyerRecord(
      {
        ...buyer,
        timeline: updatedTimeline,
      },
      `Updated "${stageDraft.stage}" timeline stage.`
    );
    setEditingStage(false);
  };

  // --- INVOICE CRUD HANDLERS ---
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.invoiceId.trim() || newInvoice.amount <= 0) return;
    const updatedInvoices = [newInvoice, ...buyer.pastInvoices];
    const totalVal = updatedInvoices.reduce((s, inv) => s + inv.amount, 0);
    const avgVal = Math.round(totalVal / updatedInvoices.length);

    onUpdateBuyerRecord(
      {
        ...buyer,
        pastInvoices: updatedInvoices,
        totalOrdersCount: buyer.totalOrdersCount + 1,
        averageOrderValue: avgVal,
      },
      `Logged invoice ${newInvoice.invoiceId} (${formatINRCompact(
        newInvoice.amount
      )}).`
    );
    setAddingInvoice(false);
    setNewInvoice({
      invoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: '26 Sep 2026',
      amount: buyer.input.expectedOrderValue || 180000,
      terms: buyer.input.creditTerms,
      settledInDays: 28,
      status: 'Settled On-Time',
    });
  };

  const handleSaveInvoiceEdit = () => {
    if (!invoiceDraft || !editingInvoiceId) return;
    const updatedInvoices = buyer.pastInvoices.map((inv) =>
      inv.invoiceId === editingInvoiceId ? invoiceDraft : inv
    );
    const totalVal = updatedInvoices.reduce((s, inv) => s + inv.amount, 0);
    const avgVal =
      updatedInvoices.length > 0
        ? Math.round(totalVal / updatedInvoices.length)
        : buyer.averageOrderValue;

    onUpdateBuyerRecord(
      {
        ...buyer,
        pastInvoices: updatedInvoices,
        averageOrderValue: avgVal,
      },
      `Updated invoice ${invoiceDraft.invoiceId}.`
    );
    setEditingInvoiceId(null);
    setInvoiceDraft(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const updatedInvoices = buyer.pastInvoices.filter(
      (inv) => inv.invoiceId !== invoiceId
    );
    onUpdateBuyerRecord(
      {
        ...buyer,
        pastInvoices: updatedInvoices,
        totalOrdersCount: Math.max(0, buyer.totalOrdersCount - 1),
      },
      `Deleted invoice ${invoiceId} from ledger.`
    );
  };

  // --- COMMERCIAL NOTES CRUD HANDLERS ---
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const created: CommercialNote = {
      id: `note-${Date.now()}`,
      author: 'Business Owner',
      date: 'Just now',
      category: newNoteCategory,
      content: newNoteContent.trim(),
    };
    onUpdateBuyerRecord(
      {
        ...buyer,
        notes: [created, ...buyerNotes],
      },
      'Added commercial note to buyer profile.'
    );
    setNewNoteContent('');
  };

  const handleSaveNoteEdit = (noteId: string) => {
    if (!editingNoteText.trim()) return;
    const updatedNotes = buyerNotes.map((n) =>
      n.id === noteId ? { ...n, content: editingNoteText.trim() } : n
    );
    onUpdateBuyerRecord(
      {
        ...buyer,
        notes: updatedNotes,
      },
      'Updated commercial note.'
    );
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = buyerNotes.filter((n) => n.id !== noteId);
    onUpdateBuyerRecord(
      {
        ...buyer,
        notes: updatedNotes,
      },
      'Removed commercial note.'
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation & Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('history')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Buyer History</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Switch Buyer Profile:</span>
          <select
            value={buyer.id}
            onChange={(e) => {
              const found = allBuyers.find((b) => b.id === e.target.value);
              if (found) onSelectBuyer(found);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            {allBuyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.input.companyName} ({b.confidenceScore}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buyer Profile Header Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{buyer.input.businessType}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {buyer.input.location}
              </span>
              <span>·</span>
              <span>Primary Contact: {buyer.input.buyerName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
              {buyer.input.companyName}
            </h1>

            <p className="text-sm text-slate-600 mt-1">
              Active Product Line:{' '}
              <strong className="text-slate-800">
                {buyer.input.productService}
              </strong>
            </p>
          </div>

          {/* Score & Risk Readout + CRUD Actions */}
          <div className="flex flex-wrap items-center gap-5 bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-500">
                Confidence
              </div>
              <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
                {buyer.confidenceScore}{' '}
                <span className="text-sm font-normal text-slate-400">
                  / 100
                </span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div>
              <div className="text-[11px] font-semibold text-slate-500">
                Risk Classification
              </div>
              <div className="mt-1">
                <RiskIndicator risk={buyer.riskLevel} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto sm:ml-2">
              <button
                type="button"
                onClick={() => onOpenAnalysisResult(buyer)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                <span>AI Score & What-If</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickEditModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-sky-600" />
                <span>Quick Edit</span>
              </button>
              {confirmDeleteBuyer ? (
                <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => onDeleteBuyer(buyer.id)}
                    className="px-2 py-0.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteBuyer(false)}
                    className="px-1.5 py-0.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteBuyer(true)}
                  className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                  title="Delete Buyer Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Buyer Overview Grid */}
        <div className="pt-6">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
            Buyer Overview
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70">
              <div className="text-xs text-slate-500">Industry</div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {buyer.input.industry}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70">
              <div className="text-xs text-slate-500">Location</div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {buyer.input.location}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70">
              <div className="text-xs text-slate-500">Total Orders</div>
              <div className="font-mono-tabular text-lg font-bold text-slate-900 mt-1">
                {buyer.totalOrdersCount}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({buyer.input.purchaseFrequency})
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70">
              <div className="text-xs text-slate-500">Average Order Value</div>
              <div className="font-mono-tabular text-lg font-bold text-slate-900 mt-1">
                {formatINRCompact(buyer.averageOrderValue)}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-lg bg-slate-50/70 border border-slate-200/70">
              <div className="text-xs text-slate-500">Payment Reliability</div>
              <div className="text-sm font-bold text-emerald-700 mt-1">
                {buyer.input.previousPaymentRecord} (
                <span className="font-mono-tabular">
                  {buyer.input.paymentReliabilityRating}/5
                </span>
                )
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Behaviour Timeline: Enquiry -> Quote -> Negotiation -> Purchase -> Payment (With Stage Update CRUD) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Behaviour Timeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              End-to-end commercial progression from initial enquiry to payment settlement. Select any stage to inspect or update.
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-slate-500">
            Terms: {buyer.input.creditTerms}
          </span>
        </div>

        {/* 5-Stage Interactive Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6">
          {buyer.timeline.map((step, index) => {
            const isSelected = selectedStageIndex === index;
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            const isFlagged = step.status === 'flagged';

            return (
              <button
                key={step.stage}
                type="button"
                onClick={() => {
                  setSelectedStageIndex(index);
                  setEditingStage(false);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-900'
                    : isFlagged
                    ? 'border-red-200 bg-red-50/50 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono-tabular text-xs font-bold ${
                        isSelected ? 'text-sky-400' : 'text-slate-400'
                      }`}
                    >
                      0{index + 1}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isSelected ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      />
                    ) : (
                      <Clock
                        className={`w-4 h-4 ${
                          isSelected
                            ? 'text-sky-400'
                            : isActive
                            ? 'text-sky-600'
                            : 'text-slate-400'
                        }`}
                      />
                    )}
                  </div>

                  <div className="text-base font-bold mt-2">{step.stage}</div>
                  <div
                    className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {step.summary}
                  </div>
                </div>

                <div
                  className={`mt-4 pt-2.5 border-t text-[11px] font-mono-tabular flex items-center justify-between ${
                    isSelected
                      ? 'border-slate-800 text-sky-300'
                      : 'border-slate-200/70 text-slate-500'
                  }`}
                >
                  <span>{step.date}</span>
                  <span className="font-semibold">{step.metric}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detailed Callout or Inline Stage Editor */}
        {activeStage && (
          <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200/80">
            {editingStage && stageDraft ? (
              <form onSubmit={handleSaveStage} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Edit Timeline Stage: {stageDraft.stage}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingStage(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Stage Status
                    </label>
                    <select
                      value={stageDraft.status}
                      onChange={(e) =>
                        setStageDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                status: e.target
                                  .value as TimelineStage['status'],
                              }
                            : null
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    >
                      <option value="completed">Completed</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="flagged">Flagged</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Date / Timing Label
                    </label>
                    <input
                      type="text"
                      value={stageDraft.date}
                      onChange={(e) =>
                        setStageDraft((prev) =>
                          prev ? { ...prev, date: e.target.value } : null
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Key Metric
                    </label>
                    <input
                      type="text"
                      value={stageDraft.metric}
                      onChange={(e) =>
                        setStageDraft((prev) =>
                          prev ? { ...prev, metric: e.target.value } : null
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 cursor-pointer"
                    >
                      Save Stage Update
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Stage Summary Note
                  </label>
                  <input
                    type="text"
                    value={stageDraft.summary}
                    onChange={(e) =>
                      setStageDraft((prev) =>
                        prev ? { ...prev, summary: e.target.value } : null
                      )
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                  />
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-sky-700">
                    Stage Focus: {activeStage.stage} ({activeStage.date})
                  </div>
                  <p className="text-sm text-slate-800 font-medium mt-0.5">
                    {activeStage.summary} — Recorded metric:{' '}
                    <strong className="font-mono-tabular">
                      {activeStage.metric}
                    </strong>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleStartEditStage}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-sky-600" />
                    <span>Edit Stage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAnalysisResult(buyer)}
                    className="text-xs font-semibold text-slate-900 hover:text-sky-700 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSearch className="w-4 h-4 text-sky-600" />
                    <span>Simulate Terms Impact</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Historical Invoice & Settlement Ledger (WITH FULL CREATE / READ / UPDATE / DELETE) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Historical Settlement & Credit Record (Invoices CRUD)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Log new invoices, update settlement days or payment status, or remove records for {buyer.input.companyName}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-tabular text-slate-600">
              Outstanding:{' '}
              <strong className="text-slate-900">
                {formatINRFull(buyer.input.outstandingAmount)}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setAddingInvoice((prev) => !prev)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addingInvoice ? 'Close Form' : 'Log New Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Inline Create Invoice Form */}
        {addingInvoice && (
          <form
            onSubmit={handleCreateInvoice}
            className="p-6 bg-sky-50/40 border-b border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Create New Invoice Settlement Record
              </span>
              <button
                type="button"
                onClick={() => setAddingInvoice(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Invoice ID
                </label>
                <input
                  type="text"
                  value={newInvoice.invoiceId}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      invoiceId: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-white border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="text"
                  value={newInvoice.date}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={newInvoice.amount}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-white border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Credit Terms
                </label>
                <input
                  type="text"
                  value={newInvoice.terms}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      terms: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Settled Days
                </label>
                <input
                  type="number"
                  min={0}
                  max={180}
                  value={newInvoice.settledInDays}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      settledInDays: Number(e.target.value),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-white border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={newInvoice.status}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      status: e.target.value as PastInvoiceRecord['status'],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                >
                  <option value="Settled On-Time">Settled On-Time</option>
                  <option value="Delayed Settlement">Delayed Settlement</option>
                  <option value="In Credit Window">In Credit Window</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Invoice Record</span>
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-6">Invoice ID</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4 text-right">Invoice Amount</th>
                <th className="py-3 px-4">Agreed Credit Terms</th>
                <th className="py-3 px-4 text-right">Actual Settlement Days</th>
                <th className="py-3 px-4">Settlement Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {buyer.pastInvoices.map((inv) => {
                const isEditing =
                  editingInvoiceId === inv.invoiceId && invoiceDraft;
                if (isEditing) {
                  return (
                    <tr key={inv.invoiceId} className="bg-sky-50/50">
                      <td className="py-2.5 px-6 font-mono-tabular font-semibold text-slate-900">
                        {inv.invoiceId}
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={invoiceDraft.date}
                          onChange={(e) =>
                            setInvoiceDraft({
                              ...invoiceDraft,
                              date: e.target.value,
                            })
                          }
                          className="w-28 px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          value={invoiceDraft.amount}
                          onChange={(e) =>
                            setInvoiceDraft({
                              ...invoiceDraft,
                              amount: Number(e.target.value),
                            })
                          }
                          className="w-28 px-2 py-1 text-xs font-mono-tabular text-right bg-white border border-slate-200 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={invoiceDraft.terms}
                          onChange={(e) =>
                            setInvoiceDraft({
                              ...invoiceDraft,
                              terms: e.target.value,
                            })
                          }
                          className="w-36 px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          value={invoiceDraft.settledInDays}
                          onChange={(e) =>
                            setInvoiceDraft({
                              ...invoiceDraft,
                              settledInDays: Number(e.target.value),
                            })
                          }
                          className="w-16 px-2 py-1 text-xs font-mono-tabular text-right bg-white border border-slate-200 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={invoiceDraft.status}
                          onChange={(e) =>
                            setInvoiceDraft({
                              ...invoiceDraft,
                              status: e.target
                                .value as PastInvoiceRecord['status'],
                            })
                          }
                          className="px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        >
                          <option value="Settled On-Time">
                            Settled On-Time
                          </option>
                          <option value="Delayed Settlement">
                            Delayed Settlement
                          </option>
                          <option value="In Credit Window">
                            In Credit Window
                          </option>
                        </select>
                      </td>
                      <td className="py-2.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleSaveInvoiceEdit}
                            className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingInvoiceId(null);
                              setInvoiceDraft(null);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={inv.invoiceId} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-mono-tabular font-semibold text-slate-900">
                      {inv.invoiceId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.date}</td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-slate-900">
                      {formatINRFull(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.terms}</td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-slate-800">
                      {inv.settledInDays} days
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          inv.status === 'Settled On-Time'
                            ? 'text-emerald-700'
                            : inv.status === 'In Credit Window'
                            ? 'text-sky-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingInvoiceId(inv.invoiceId);
                            setInvoiceDraft({ ...inv });
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Invoice Record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv.invoiceId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Invoice Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Commercial Notes & Credit Log (FULL CRUD) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="pb-4 mb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Commercial Touchpoints & Credit Notes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Log internal credit checks, negotiation updates, and payment follow-up notes for {buyer.input.companyName}.
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-slate-500">
            {buyerNotes.length} notes logged
          </span>
        </div>

        {/* Create Note Form */}
        <form
          onSubmit={handleAddNote}
          className="flex flex-col sm:flex-row gap-2.5 mb-6"
        >
          <select
            value={newNoteCategory}
            onChange={(e) =>
              setNewNoteCategory(
                e.target.value as CommercialNote['category']
              )
            }
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          >
            <option value="Credit Check">Credit Check</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Payment Follow-up">Payment Follow-up</option>
            <option value="General">General Note</option>
          </select>

          <input
            type="text"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Add a commercial note, reference check, or payment commitment detail..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        </form>

        {/* Notes List */}
        <div className="space-y-3">
          {buyerNotes.map((note) => {
            const isEditing = editingNoteId === note.id;
            return (
              <div
                key={note.id}
                className="p-4 rounded-lg bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-sky-700">
                      {note.category}
                    </span>
                    <span>·</span>
                    <span>{note.author}</span>
                    <span>·</span>
                    <span>{note.date}</span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-md"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNoteEdit(note.id)}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-800">
                      {note.content}
                    </p>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditingNoteText(note.content);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded-md cursor-pointer"
                      title="Edit Note"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Google Search Grounding for Buyer Entity & Industry */}
      <SearchGroundingPanel
        companyName={buyer.input.companyName}
        industry={buyer.input.industry}
        location={buyer.input.location}
        contextType="buyer-verification"
        title={`Live Google Search Verification: ${buyer.input.companyName}`}
        subtitle="Query live web intelligence, regional market news, and sector credit benchmarks with Google Search Grounding."
      />

      <BuyerQuickFormModal
        isOpen={quickEditModalOpen}
        mode="edit"
        initialBuyer={buyer}
        onClose={() => setQuickEditModalOpen(false)}
        onSave={(formInput, existingId) => {
          onQuickSaveBuyer(formInput, existingId);
          setQuickEditModalOpen(false);
        }}
        onOpenFullEditor={() => {
          setQuickEditModalOpen(false);
          onReanalyzeBuyer(buyer);
        }}
      />
    </div>
  );
};
