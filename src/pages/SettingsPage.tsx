import React, { useState } from 'react';
import { CheckCircle2, Database, RotateCcw, Save, Shield } from 'lucide-react';
import { AppSettings, ModelWeights } from '../types';
import {
  DEFAULT_MODEL_WEIGHTS,
  DEFAULT_RISK_THRESHOLDS,
} from '../services/confidenceEngine';

interface SettingsPageProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onRestoreDefaults?: () => void;
  totalBuyersCount?: number;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onRestoreDefaults,
  totalBuyersCount = 9,
}) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const totalWeights =
    draft.weights.paymentBehaviour +
    draft.weights.purchaseHistory +
    draft.weights.engagement +
    draft.weights.priceAcceptance +
    draft.weights.otherSignals;

  const updateWeight = (key: keyof ModelWeights, val: number) => {
    setSavedMessage(null);
    setDraft((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: val,
      },
    }));
  };

  const handleResetWeights = () => {
    setSavedMessage(null);
    setDraft((prev) => ({
      ...prev,
      weights: { ...DEFAULT_MODEL_WEIGHTS },
      thresholds: { ...DEFAULT_RISK_THRESHOLDS },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(draft);
    setSavedMessage(
      'Settings and AI signal weights saved. All buyer analyses and recalculations use your updated parameters.'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-sky-700">
          Workspace Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
          Settings & Scoring Preferences
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Manage your business profile, configurable AI signal weights, risk classification thresholds, and workspace data.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Profile & 2. Business Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 pb-4 mb-5 border-b border-slate-100">
            Profile & Business Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={draft.ownerName}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, ownerName: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Role / Designation
              </label>
              <input
                type="text"
                value={draft.ownerRole}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, ownerRole: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Business Email
              </label>
              <input
                type="email"
                value={draft.ownerEmail}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, ownerEmail: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={draft.companyName}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, companyName: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                GSTIN / Tax Registration
              </label>
              <input
                type="text"
                value={draft.gstNumber}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, gstNumber: e.target.value }))
                }
                className="w-full px-3.5 py-2 font-mono-tabular text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Default Credit Policy
              </label>
              <input
                type="text"
                value={draft.defaultCreditPolicy}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    defaultCreditPolicy: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>
        </section>

        {/* 3. Configurable AI Model Weights */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Configurable AI Signal Weights
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust how PaySure AI weights each commercial dimension when generating the Buyer Payment Confidence Score.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono-tabular font-semibold ${
                  totalWeights === 100 ? 'text-emerald-700' : 'text-amber-600'
                }`}
              >
                Total Weight: {totalWeights}%
              </span>
              <button
                type="button"
                onClick={handleResetWeights}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Defaults</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(
              [
                {
                  key: 'paymentBehaviour',
                  label: 'Payment Behaviour (Delays, Credit Terms, Reliability)',
                },
                {
                  key: 'purchaseHistory',
                  label: 'Purchase History (Repeat Orders & Fulfilment Track)',
                },
                {
                  key: 'engagement',
                  label: 'Engagement Quality (Enquiry Depth & Response Speed)',
                },
                {
                  key: 'priceAcceptance',
                  label: 'Price Acceptance (Discount Pushback & Quote Alignment)',
                },
                {
                  key: 'otherSignals',
                  label: 'Other Signals (Entity Structure & Order Frequency)',
                },
              ] as { key: keyof ModelWeights; label: string }[]
            ).map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <label>{item.label}</label>
                  <span className="font-mono-tabular text-slate-900">
                    {draft.weights[item.key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={draft.weights[item.key]}
                  onChange={(e) =>
                    updateWeight(item.key, Number(e.target.value))
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 4. Risk Threshold Preferences */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 pb-4 mb-5 border-b border-slate-100">
            Risk Classification Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <label>Low Risk Minimum Score (Green Tier)</label>
                <span className="font-mono-tabular text-emerald-700">
                  {draft.thresholds.lowRiskMin} / 100
                </span>
              </div>
              <input
                type="range"
                min={65}
                max={90}
                value={draft.thresholds.lowRiskMin}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    thresholds: {
                      ...prev.thresholds,
                      lowRiskMin: Number(e.target.value),
                    },
                  }))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Buyers scoring at or above {draft.thresholds.lowRiskMin} qualify for standard credit terms.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <label>Needs Review Minimum Score (Amber Tier)</label>
                <span className="font-mono-tabular text-amber-600">
                  {draft.thresholds.reviewMin} / 100
                </span>
              </div>
              <input
                type="range"
                min={35}
                max={64}
                value={draft.thresholds.reviewMin}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    thresholds: {
                      ...prev.thresholds,
                      reviewMin: Number(e.target.value),
                    },
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Buyers scoring below {draft.thresholds.reviewMin} are flagged as High Risk.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Notifications & 6. Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
              Notifications
            </h2>
            <div className="space-y-3">
              {[
                {
                  key: 'highRiskEmailAlerts',
                  label: 'High-Risk Buyer Assessment Alerts',
                  desc: 'Notify team when an enquiry scores below Review threshold.',
                },
                {
                  key: 'paymentDelayReminders',
                  label: 'Payment Milestone Reminders',
                  desc: 'Send alerts 3 days before Net credit windows mature.',
                },
                {
                  key: 'weeklyPipelineDigest',
                  label: 'Weekly Confidence Pipeline Summary',
                  desc: 'Receive a weekly digest of evaluated order value.',
                },
              ].map((item) => {
                const k = item.key as keyof AppSettings['notifications'];
                return (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.desc}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={draft.notifications[k]}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [k]: e.target.checked,
                          },
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-sky-600 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
                Security & Workspace Data (CRUD Storage)
              </h2>
              <label className="flex items-start justify-between gap-3 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Two-Factor Authentication (2FA)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Require OTP verification for credit policy threshold updates.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.twoFactorEnabled}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      twoFactorEnabled: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-sky-600 rounded cursor-pointer"
                />
              </label>

              {onRestoreDefaults && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-sky-600" />
                      <span>Active Buyer Records ({totalBuyersCount})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Reset all created/edited buyer profiles, invoices, and notes to defaults.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onRestoreDefaults}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Reset Demo Data
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs text-slate-600">
              <Shield className="w-4 h-4 text-sky-700 shrink-0" />
              <span>
                Buyer evaluations and CRUD updates are persisted automatically in local workspace storage.
              </span>
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Workspace Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
