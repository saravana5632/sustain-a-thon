import React, { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import {
  BuyerAnalysisResult,
  CreditTermsOption,
  PurchaseFrequency,
  WhatIfParameters,
} from '../types';
import { simulateCounterfactualConfidence } from '../services/confidenceEngine';
import { formatINRCompact, getRiskDisplayLabel } from '../utils/formatters';

interface WhatIfSimulatorProps {
  result: BuyerAnalysisResult;
  onApplySimulatedTerms?: (updatedTerms: {
    expectedOrderValue: number;
    discountRequested: number;
    creditTerms: CreditTermsOption;
    purchaseFrequency: PurchaseFrequency;
    projectedScore: number;
  }) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  result,
  onApplySimulatedTerms,
}) => {
  const initialAdvance = useMemo(() => {
    if (result.input.creditTerms.includes('100%')) return 100;
    if (result.input.creditTerms.includes('50%')) return 50;
    if (result.input.creditTerms.includes('30%')) return 30;
    return 0;
  }, [result.input.creditTerms]);

  const initialDays = useMemo(() => {
    if (result.input.creditTerms.includes('100%')) return 0;
    if (result.input.creditTerms.includes('Net 15')) return 15;
    if (result.input.creditTerms.includes('Net 45')) return 45;
    if (result.input.creditTerms.includes('Net 60')) return 60;
    if (result.input.creditTerms.includes('Net 90')) return 90;
    return 30;
  }, [result.input.creditTerms]);

  // Default to +30% advance preset on initial render if base had 0% advance, so the user immediately sees 82 -> 89 in action, or allow instant toggling
  const [params, setParams] = useState<WhatIfParameters>(() => ({
    orderValue: result.input.expectedOrderValue,
    discount: result.input.discountRequested,
    paymentTermsDays: initialDays,
    advancePaymentPercent: initialAdvance === 0 ? 30 : Math.min(100, initialAdvance + 20),
    purchaseFrequency: result.input.purchaseFrequency,
  }));

  const simulation = useMemo(
    () => simulateCounterfactualConfidence(result, params),
    [result, params]
  );

  const handleResetToCurrent = () => {
    setParams({
      orderValue: result.input.expectedOrderValue,
      discount: result.input.discountRequested,
      paymentTermsDays: initialDays,
      advancePaymentPercent: initialAdvance,
      purchaseFrequency: result.input.purchaseFrequency,
    });
  };

  const handleQuickPreset = (preset: 'advance30' | 'net15' | 'splitOrder') => {
    if (preset === 'advance30') {
      setParams({
        orderValue: result.input.expectedOrderValue,
        discount: result.input.discountRequested,
        paymentTermsDays: 30,
        advancePaymentPercent: 30,
        purchaseFrequency: result.input.purchaseFrequency,
      });
    } else if (preset === 'net15') {
      setParams({
        orderValue: result.input.expectedOrderValue,
        discount: Math.max(0, result.input.discountRequested - 2),
        paymentTermsDays: 15,
        advancePaymentPercent: 50,
        purchaseFrequency: 'Monthly',
      });
    } else {
      setParams({
        orderValue: Math.round(result.input.expectedOrderValue * 0.6),
        discount: result.input.discountRequested,
        paymentTermsDays: 15,
        advancePaymentPercent: 30,
        purchaseFrequency: 'Monthly',
      });
    }
  };

  const handleApply = () => {
    if (!onApplySimulatedTerms) return;
    let derivedCreditTerms: CreditTermsOption = 'Zero Advance · Net 30';
    if (params.advancePaymentPercent === 100) {
      derivedCreditTerms = '100% Advance';
    } else if (params.advancePaymentPercent >= 50) {
      derivedCreditTerms = '50% Advance · Net 15';
    } else if (params.advancePaymentPercent >= 20) {
      derivedCreditTerms = '30% Advance · Net 30';
    } else if (params.paymentTermsDays <= 30) {
      derivedCreditTerms = 'Zero Advance · Net 30';
    } else if (params.paymentTermsDays <= 45) {
      derivedCreditTerms = 'Zero Advance · Net 45';
    } else if (params.paymentTermsDays <= 60) {
      derivedCreditTerms = 'Zero Advance · Net 60';
    } else {
      derivedCreditTerms = 'Zero Advance · Net 90';
    }

    onApplySimulatedTerms({
      expectedOrderValue: params.orderValue,
      discountRequested: params.discount,
      creditTerms: derivedCreditTerms,
      purchaseFrequency: params.purchaseFrequency,
      projectedScore: simulation.projectedScore,
    });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Interactive Counterfactual Simulator</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            “What If?” Commercial Terms Simulator
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Test how adjusting advance milestones, credit windows, or order value shifts payment confidence before you negotiate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickPreset('advance30')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            +30% Advance Preset
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('net15')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-nowrap cursor-pointer"
          >
            50% Adv · Net 15
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('splitOrder')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Phased Trial Lot
          </button>
          <button
            type="button"
            onClick={handleResetToCurrent}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Advance Payment */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label className="font-semibold text-slate-800">
                Advance Payment Milestone
              </label>
              <span className="font-mono-tabular font-semibold text-sky-700">
                {params.advancePaymentPercent}% Advance
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 20, 30, 50, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      advancePaymentPercent: pct,
                      paymentTermsDays: pct === 100 ? 0 : prev.paymentTermsDays || 30,
                    }))
                  }
                  className={`py-2 px-3 text-xs font-mono-tabular font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                    params.advancePaymentPercent === pct
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* 2. Credit Window / Payment Terms */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label className="font-semibold text-slate-800">
                Credit Window (Payment Terms)
              </label>
              <span className="font-mono-tabular font-semibold text-slate-700">
                {params.paymentTermsDays === 0
                  ? 'Immediate (0 Days)'
                  : `Net ${params.paymentTermsDays} Days`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 15, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() =>
                    setParams((prev) => ({ ...prev, paymentTermsDays: days }))
                  }
                  className={`py-2 px-3 text-xs font-mono-tabular font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                    params.paymentTermsDays === days
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {days === 0 ? '0d (Adv)' : `Net ${days}`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Order Value Slider */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <label
                htmlFor="sim-order-value"
                className="font-semibold text-slate-800"
              >
                Order Value Exposure
              </label>
              <span className="font-mono-tabular font-semibold text-slate-900">
                {formatINRCompact(params.orderValue)}
              </span>
            </div>
            <input
              id="sim-order-value"
              type="range"
              min={50000}
              max={Math.max(1500000, result.input.expectedOrderValue * 2)}
              step={25000}
              value={params.orderValue}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  orderValue: Number(e.target.value),
                }))
              }
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono-tabular text-slate-400 mt-0.5">
              <span>₹50,000</span>
              <span>Baseline: {formatINRCompact(result.input.expectedOrderValue)}</span>
              <span>{formatINRCompact(Math.max(1500000, result.input.expectedOrderValue * 2))}</span>
            </div>
          </div>

          {/* 4. Discount & Purchase Frequency Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <label
                  htmlFor="sim-discount"
                  className="font-semibold text-slate-800"
                >
                  Discount Offered
                </label>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {params.discount}%
                </span>
              </div>
              <input
                id="sim-discount"
                type="range"
                min={0}
                max={30}
                step={1}
                value={params.discount}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    discount: Number(e.target.value),
                  }))
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-tabular text-slate-400">
                <span>0%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Purchase Frequency
              </label>
              <select
                value={params.purchaseFrequency}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    purchaseFrequency: e.target.value as PurchaseFrequency,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <option value="One-time">One-time Order</option>
                <option value="Quarterly">Quarterly Schedule</option>
                <option value="Monthly">Monthly Repeat</option>
                <option value="Annual Contract">Annual Rate Contract</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Outcome Comparison Panel */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-sky-400 tracking-wide">
              Simulated Assessment Impact
            </div>

            <div className="grid grid-cols-2 gap-4 my-5 pb-5 border-b border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Current Confidence</div>
                <div className="font-mono-tabular text-3xl font-bold text-slate-200 mt-1">
                  {result.confidenceScore}
                  <span className="text-sm font-normal text-slate-500"> / 100</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {getRiskDisplayLabel(result.riskLevel)}
                </div>
              </div>

              <div>
                <div className="text-xs text-sky-300 font-medium">
                  Projected Confidence
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono-tabular text-4xl font-bold text-white">
                    {simulation.projectedScore}
                  </span>
                  <span
                    className={`font-mono-tabular text-sm font-semibold ${
                      simulation.delta > 0
                        ? 'text-emerald-400'
                        : simulation.delta < 0
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {simulation.delta > 0
                      ? `+${simulation.delta}`
                      : simulation.delta === 0
                      ? '0'
                      : simulation.delta}
                  </span>
                </div>
                <div
                  className={`text-xs font-semibold mt-1 ${
                    simulation.projectedRisk === 'Low'
                      ? 'text-emerald-400'
                      : simulation.projectedRisk === 'Review'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {getRiskDisplayLabel(simulation.projectedRisk)}
                </div>
              </div>
            </div>

            {/* Dynamic Plain-English Insight */}
            <div className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
              <p>{simulation.keyDriverExplanation}</p>
            </div>

            {simulation.factorDeltas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5">
                {simulation.factorDeltas.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs text-slate-300"
                  >
                    <span>{item.label}</span>
                    <span
                      className={`font-mono-tabular font-semibold ${
                        item.positive ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onApplySimulatedTerms && (
            <button
              type="button"
              onClick={handleApply}
              className="mt-6 w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Apply Simulated Terms to Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
