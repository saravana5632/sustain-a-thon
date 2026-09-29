/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  AppSettings,
  BuyerAnalysisResult,
  BuyerInputForm,
  CreditTermsOption,
  PageRoute,
  PurchaseFrequency,
} from './types';
import {
  DEMO_BENCHMARK_BUYER_INPUT,
  INITIAL_BUYER_ASSESSMENTS,
} from './data/mockBuyers';
import {
  DEFAULT_MODEL_WEIGHTS,
  DEFAULT_RISK_THRESHOLDS,
  evaluateBuyerSignals,
} from './services/confidenceEngine';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeBuyerPage } from './pages/AnalyzeBuyerPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { BuyerHistoryPage } from './pages/BuyerHistoryPage';
import { BuyerDetailsPage } from './pages/BuyerDetailsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TursoDatabaseModal } from './components/TursoDatabaseModal';
import {
  fetchBuyersFromDb,
  saveBuyerToDbApi,
  deleteBuyerFromDbApi,
  resetBuyersInDbApi,
  fetchSettingsFromDb,
  saveSettingsToDbApi,
} from './services/apiService';

const STORAGE_KEYS = {
  BUYERS: 'paysure_ai_buyers_v1',
  SETTINGS: 'paysure_ai_settings_v1',
};

const INITIAL_SETTINGS: AppSettings = {
  ownerName: 'Rajesh Kulkarni',
  ownerRole: 'Managing Director & Credit Head',
  ownerEmail: 'rajesh@kulkarniprecision.in',
  companyName: 'Kulkarni Precision Components Pvt Ltd',
  gstNumber: '27AABCK4921M1Z5',
  primaryIndustry: 'Industrial Manufacturing & B2B Supply',
  defaultCreditPolicy: '30% Advance · Net 30',
  weights: { ...DEFAULT_MODEL_WEIGHTS },
  thresholds: { ...DEFAULT_RISK_THRESHOLDS },
  notifications: {
    highRiskEmailAlerts: true,
    paymentDelayReminders: true,
    weeklyPipelineDigest: true,
  },
  twoFactorEnabled: true,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('landing');

  const [buyers, setBuyers] = useState<BuyerAnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUYERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to default dataset
    }
    return INITIAL_BUYER_ASSESSMENTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to initial settings
    }
    return INITIAL_SETTINGS;
  });

  // Active result shown on Analysis Result page (defaults to 82/100 Benchmark Buyer)
  const [activeResult, setActiveResult] = useState<BuyerAnalysisResult>(
    () =>
      buyers.find((b) => b.confidenceScore === 82) ||
      buyers[0] ||
      INITIAL_BUYER_ASSESSMENTS[0]
  );

  // Active buyer shown on Buyer Details page (defaults to first buyer)
  const [activeDetailBuyer, setActiveDetailBuyer] =
    useState<BuyerAnalysisResult>(
      () => buyers[0] || INITIAL_BUYER_ASSESSMENTS[0]
    );

  // Pre-populated form state & editing ID for Analyze Buyer page
  const [draftFormInput, setDraftFormInput] = useState<
    BuyerInputForm | undefined
  >(DEMO_BENCHMARK_BUYER_INPUT);
  const [editingBuyerId, setEditingBuyerId] = useState<string | null>(null);

  // Turso Database Status & Configuration Modal
  const [tursoModalOpen, setTursoModalOpen] = useState(false);

  // Toast feedback for CRUD operations
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Sync data from Turso Database on initial app mount
  useEffect(() => {
    let isMounted = true;
    async function syncFromTurso() {
      try {
        const dbBuyers = await fetchBuyersFromDb();
        if (isMounted && Array.isArray(dbBuyers) && dbBuyers.length > 0) {
          setBuyers(dbBuyers);
          setActiveResult((prev) => dbBuyers.find((b) => b.id === prev.id) || dbBuyers[0]);
          setActiveDetailBuyer((prev) => dbBuyers.find((b) => b.id === prev.id) || dbBuyers[0]);
        }
      } catch (err) {
        console.warn('Initial Turso buyer sync notice:', err);
      }

      try {
        const dbSettings = await fetchSettingsFromDb();
        if (isMounted && dbSettings) {
          setSettings(dbSettings);
        }
      } catch (err) {
        console.warn('Initial Turso settings sync notice:', err);
      }
    }
    syncFromTurso();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Persist buyers and settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(buyers));
    } catch {
      // Ignore storage quota errors
    }
  }, [buyers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  const handleNavigate = (page: PageRoute) => {
    if (page === 'analyze' && currentPage !== 'analyze') {
      // If navigating via sidebar directly, clear editing mode unless explicitly set
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- CREATE OR UPDATE BUYER VIA FULL 4-SECTION FORM ---
  const handleSubmitAnalysis = (
    formData: BuyerInputForm,
    overrideScore?: number,
    existingBuyerId?: string
  ) => {
    const evaluated = evaluateBuyerSignals(
      formData,
      settings.weights,
      settings.thresholds,
      overrideScore
    );

    if (existingBuyerId) {
      const existing = buyers.find((b) => b.id === existingBuyerId);
      const updatedRecord: BuyerAnalysisResult = {
        ...evaluated,
        id: existingBuyerId,
        dateLabel: 'Updated just now',
        pastInvoices: existing ? existing.pastInvoices : evaluated.pastInvoices,
        notes: existing ? existing.notes : evaluated.notes,
        completedStepIndices: existing?.completedStepIndices || [0],
      };

      setBuyers((prev) =>
        prev.map((b) => (b.id === existingBuyerId ? updatedRecord : b))
      );
      setActiveResult(updatedRecord);
      setActiveDetailBuyer(updatedRecord);
      setEditingBuyerId(null);
      saveBuyerToDbApi(updatedRecord).catch((e) => console.error('Turso save error:', e));
      showToast(
        `Updated assessment for ${updatedRecord.input.companyName} (${updatedRecord.confidenceScore}/100) in Turso DB.`
      );
    } else {
      setBuyers((prev) => [evaluated, ...prev]);
      setActiveResult(evaluated);
      setActiveDetailBuyer(evaluated);
      saveBuyerToDbApi(evaluated).catch((e) => console.error('Turso save error:', e));
      showToast(
        `Created new assessment for ${evaluated.input.companyName} (${evaluated.confidenceScore}/100) in Turso DB.`
      );
    }

    setCurrentPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- QUICK CREATE OR UPDATE BUYER VIA MODAL ---
  const handleQuickSaveBuyer = (
    formInput: BuyerInputForm,
    existingId?: string
  ) => {
    const evaluated = evaluateBuyerSignals(
      formInput,
      settings.weights,
      settings.thresholds
    );

    if (existingId) {
      const existing = buyers.find((b) => b.id === existingId);
      const updatedRecord: BuyerAnalysisResult = {
        ...evaluated,
        id: existingId,
        dateLabel: 'Updated just now',
        pastInvoices: existing ? existing.pastInvoices : evaluated.pastInvoices,
        notes: existing ? existing.notes : evaluated.notes,
        completedStepIndices: existing?.completedStepIndices || [0],
      };

      setBuyers((prev) =>
        prev.map((b) => (b.id === existingId ? updatedRecord : b))
      );
      if (activeResult.id === existingId) setActiveResult(updatedRecord);
      if (activeDetailBuyer.id === existingId)
        setActiveDetailBuyer(updatedRecord);

      saveBuyerToDbApi(updatedRecord).catch((e) => console.error('Turso save error:', e));
      showToast(
        `Updated ${updatedRecord.input.companyName} — New Score: ${updatedRecord.confidenceScore}/100 in Turso DB.`
      );
    } else {
      setBuyers((prev) => [evaluated, ...prev]);
      setActiveResult(evaluated);
      setActiveDetailBuyer(evaluated);
      saveBuyerToDbApi(evaluated).catch((e) => console.error('Turso save error:', e));
      showToast(
        `Created buyer record for ${evaluated.input.companyName} (${evaluated.confidenceScore}/100) in Turso DB.`
      );
    }
  };

  // --- DIRECT RECORD UPDATE (INVOICES, NOTES, TIMELINE STAGES, ACTION STEPS) ---
  const handleUpdateBuyerRecord = (
    updatedBuyer: BuyerAnalysisResult,
    customToast?: string
  ) => {
    setBuyers((prev) =>
      prev.map((b) => (b.id === updatedBuyer.id ? updatedBuyer : b))
    );
    if (activeResult.id === updatedBuyer.id) {
      setActiveResult(updatedBuyer);
    }
    if (activeDetailBuyer.id === updatedBuyer.id) {
      setActiveDetailBuyer(updatedBuyer);
    }
    saveBuyerToDbApi(updatedBuyer).catch((e) => console.error('Turso save error:', e));
    if (customToast) {
      showToast(customToast);
    }
  };

  // --- DELETE BUYER RECORD ---
  const handleDeleteBuyer = (buyerId: string) => {
    const target = buyers.find((b) => b.id === buyerId);
    const remaining = buyers.filter((b) => b.id !== buyerId);
    const nextList =
      remaining.length > 0 ? remaining : INITIAL_BUYER_ASSESSMENTS;

    setBuyers(nextList);

    if (activeResult.id === buyerId) {
      setActiveResult(nextList[0]);
    }
    if (activeDetailBuyer.id === buyerId) {
      setActiveDetailBuyer(nextList[0]);
    }

    if (currentPage === 'result' || currentPage === 'details') {
      setCurrentPage('history');
    }

    deleteBuyerFromDbApi(buyerId).catch((e) => console.error('Turso delete error:', e));
    showToast(
      target
        ? `Deleted buyer record "${target.input.companyName}" from Turso DB.`
        : 'Buyer record deleted from Turso DB.'
    );
  };

  // --- RESTORE DEFAULT DEMO DATASET ---
  const handleRestoreDefaults = async () => {
    try {
      const reset = await resetBuyersInDbApi();
      setBuyers(reset);
      setActiveResult(
        reset.find((b) => b.confidenceScore === 82) || reset[0]
      );
      setActiveDetailBuyer(reset[0]);
    } catch {
      setBuyers(INITIAL_BUYER_ASSESSMENTS);
      setActiveResult(
        INITIAL_BUYER_ASSESSMENTS.find((b) => b.confidenceScore === 82) ||
          INITIAL_BUYER_ASSESSMENTS[0]
      );
      setActiveDetailBuyer(INITIAL_BUYER_ASSESSMENTS[0]);
    }
    setEditingBuyerId(null);
    localStorage.removeItem(STORAGE_KEYS.BUYERS);
    showToast('Restored all 9 default Indian B2B sample buyer records in Turso DB.');
  };

  // --- UPDATE TERMS FROM WHAT-IF SIMULATOR ---
  const handleUpdateResultTerms = (updatedTerms: {
    expectedOrderValue: number;
    discountRequested: number;
    creditTerms: CreditTermsOption;
    purchaseFrequency: PurchaseFrequency;
    projectedScore: number;
  }) => {
    const updatedInput: BuyerInputForm = {
      ...activeResult.input,
      expectedOrderValue: updatedTerms.expectedOrderValue,
      discountRequested: updatedTerms.discountRequested,
      creditTerms: updatedTerms.creditTerms,
      purchaseFrequency: updatedTerms.purchaseFrequency,
    };

    const recalculated = evaluateBuyerSignals(
      updatedInput,
      settings.weights,
      settings.thresholds,
      updatedTerms.projectedScore
    );

    const updatedRecord: BuyerAnalysisResult = {
      ...recalculated,
      id: activeResult.id,
      dateLabel: 'Updated just now',
      pastInvoices: activeResult.pastInvoices,
      notes: activeResult.notes,
      completedStepIndices: activeResult.completedStepIndices,
    };

    setActiveResult(updatedRecord);
    setActiveDetailBuyer(updatedRecord);
    setBuyers((prev) =>
      prev.map((b) => (b.id === updatedRecord.id ? updatedRecord : b))
    );
    saveBuyerToDbApi(updatedRecord).catch((e) => console.error('Turso save error:', e));
    showToast(
      `Applied simulated terms to ${updatedRecord.input.companyName} (${updatedRecord.confidenceScore}/100) and synced to Turso DB.`
    );
  };

  const handleSelectBuyerForDetails = (buyer: BuyerAnalysisResult) => {
    setActiveDetailBuyer(buyer);
    setCurrentPage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBuyerForResult = (buyer: BuyerAnalysisResult) => {
    setActiveResult(buyer);
    setCurrentPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Opens the full 4-section form in EDIT mode for an existing buyer
  const handleEditBuyerInFullForm = (buyer: BuyerAnalysisResult) => {
    setDraftFormInput({ ...buyer.input });
    setEditingBuyerId(buyer.id);
    setCurrentPage('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickInspectFromLanding = (buyerId: string) => {
    const found = buyers.find((b) => b.id === buyerId) || buyers[0];
    if (found) {
      setActiveResult(found);
      setActiveDetailBuyer(found);
      setCurrentPage('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentPage === 'landing') {
    return (
      <LandingPage
        onNavigate={handleNavigate}
        onQuickInspectBuyer={handleQuickInspectFromLanding}
      />
    );
  }

  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'analyze') {
            setEditingBuyerId(null);
          }
          handleNavigate(page);
        }}
        selectedBuyerCompany={
          currentPage === 'details'
            ? activeDetailBuyer?.input.companyName
            : activeResult?.input.companyName
        }
      >
        {currentPage === 'dashboard' && (
          <DashboardPage
            buyers={buyers}
            onNavigate={handleNavigate}
            onSelectBuyerForDetails={handleSelectBuyerForDetails}
            onSelectBuyerForResult={handleSelectBuyerForResult}
            onQuickSaveBuyer={handleQuickSaveBuyer}
            onDeleteBuyer={handleDeleteBuyer}
            onEditBuyerInFullForm={handleEditBuyerInFullForm}
            onRestoreDefaults={handleRestoreDefaults}
          />
        )}

        {currentPage === 'analyze' && (
          <AnalyzeBuyerPage
            initialForm={draftFormInput}
            editingBuyerId={editingBuyerId}
            onClearEditingMode={() => {
              setEditingBuyerId(null);
              setDraftFormInput(DEMO_BENCHMARK_BUYER_INPUT);
            }}
            onSubmitAnalysis={handleSubmitAnalysis}
          />
        )}

        {currentPage === 'result' && (
          <AnalysisResultPage
            result={activeResult}
            onNavigate={handleNavigate}
            onOpenBuyerDetails={handleSelectBuyerForDetails}
            onEditBuyerSignals={handleEditBuyerInFullForm}
            onDeleteBuyer={handleDeleteBuyer}
            onUpdateResultTerms={handleUpdateResultTerms}
            onUpdateBuyerRecord={handleUpdateBuyerRecord}
          />
        )}

        {currentPage === 'history' && (
          <BuyerHistoryPage
            buyers={buyers}
            onSelectBuyerForDetails={handleSelectBuyerForDetails}
            onSelectBuyerForResult={handleSelectBuyerForResult}
            onNavigate={handleNavigate}
            onQuickSaveBuyer={handleQuickSaveBuyer}
            onDeleteBuyer={handleDeleteBuyer}
            onEditBuyerInFullForm={handleEditBuyerInFullForm}
            onRestoreDefaults={handleRestoreDefaults}
          />
        )}

        {currentPage === 'details' && (
          <BuyerDetailsPage
            buyer={activeDetailBuyer}
            allBuyers={buyers}
            onSelectBuyer={(b) => setActiveDetailBuyer(b)}
            onOpenAnalysisResult={handleSelectBuyerForResult}
            onReanalyzeBuyer={handleEditBuyerInFullForm}
            onUpdateBuyerRecord={handleUpdateBuyerRecord}
            onQuickSaveBuyer={handleQuickSaveBuyer}
            onDeleteBuyer={handleDeleteBuyer}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'insights' && (
          <InsightsPage
            buyers={buyers}
            onSelectBuyerForResult={handleSelectBuyerForResult}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage
            settings={settings}
            onSaveSettings={(newSettings) => {
              setSettings(newSettings);
              saveSettingsToDbApi(newSettings).catch((e) => console.error('Turso save settings error:', e));
              showToast('Saved workspace settings and AI model weights to Turso DB.');
            }}
            onRestoreDefaults={handleRestoreDefaults}
            onOpenDatabaseModal={() => setTursoModalOpen(true)}
            totalBuyersCount={buyers.length}
          />
        )}
      </AppLayout>

      {/* Non-intrusive CRUD Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer ml-1"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <TursoDatabaseModal
        isOpen={tursoModalOpen}
        onClose={() => setTursoModalOpen(false)}
        onDataReset={handleRestoreDefaults}
      />
    </>
  );
}
