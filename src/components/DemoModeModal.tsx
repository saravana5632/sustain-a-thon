import React from 'react';
import { ArrowRight, CheckCircle2, Play, Sparkles, X } from 'lucide-react';
import { BuyerAnalysisResult } from '../types';
import { formatINRCompact } from '../utils/formatters';
import { RiskIndicator } from './RiskIndicator';

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyers: BuyerAnalysisResult[];
  onLaunchGuidedDemo: (buyer: BuyerAnalysisResult, mode: 'prefill-form' | 'instant-result') => void;
}

export const DemoModeModal: React.FC<DemoModeModalProps> = ({
  isOpen,
  onClose,
  buyers,
  onLaunchGuidedDemo,
}) => {
  if (!isOpen) return null;

  const featuredScenarios = [
    buyers.find((b) => b.confidenceScore === 82) || buyers[1] || buyers[0],
    buyers.find((b) => b.id === 'buyer-arun-retail') || buyers[0],
    buyers.find((b) => b.riskLevel === 'Review') || buyers[3],
    buyers.find((b) => b.riskLevel === 'High') || buyers[7],
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-mode-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
              <Sparkles className="w-4 h-4" />
              <span>Live Presentation Walkthrough</span>
            </div>
            <h2 id="demo-mode-title" className="text-xl font-bold text-slate-900 mt-1">
              PaySure AI — Guided Demo Mode
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select a realistic Indian B2B buyer scenario to automatically populate signals and run the explainable AI confidence flow.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 my-5">
          {featuredScenarios.map((scenario, idx) => (
            <div
              key={scenario.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-sky-500/60 bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-tabular text-xs font-semibold text-slate-400">
                    0{idx + 1}.
                  </span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {scenario.input.companyName}
                  </span>
                  <span className="text-slate-300">·</span>
                  <RiskIndicator risk={scenario.riskLevel} compact />
                </div>
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{scenario.input.industry}</span>
                  <span>·</span>
                  <span>Order: <strong className="font-mono-tabular text-slate-800">{formatINRCompact(scenario.input.expectedOrderValue)}</strong></span>
                  <span>·</span>
                  <span>Terms: {scenario.input.creditTerms}</span>
                  <span>·</span>
                  <span>Target Score: <strong className="font-mono-tabular text-slate-900">{scenario.confidenceScore}/100</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onLaunchGuidedDemo(scenario, 'prefill-form')}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Load in Form
                </button>
                <button
                  type="button"
                  onClick={() => onLaunchGuidedDemo(scenario, 'instant-result')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run AI Flow</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Includes live “What If?” simulator and explainable signal breakdown.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const primary = featuredScenarios[0];
              if (primary) onLaunchGuidedDemo(primary, 'instant-result');
            }}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>Quick-Run 82/100 Benchmark Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
