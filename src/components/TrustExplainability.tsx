import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface TrustFactor {
  label: string;
  percentage: number;
  description: string;
}

interface TrustExplainabilityProps {
  factors: TrustFactor[];
  defaultOpen?: boolean;
}

/**
 * Generates visual block bar representation e.g. ████████░░
 */
function buildSegmentedBlocks(percentage: number): {
  filled: number;
  empty: number;
} {
  const filled = Math.max(1, Math.min(10, Math.round(percentage / 10)));
  return { filled, empty: 10 - filled };
}

export const TrustExplainability: React.FC<TrustExplainabilityProps> = ({
  factors,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Why should I trust this score?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Transparent factor-by-factor signal audit — no opaque black-box guesswork.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0 ml-4">
          <span className="hidden sm:inline">
            {isOpen ? 'Hide Signal Audit' : 'Inspect Signal Audit'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            {factors.map((factor) => {
              const blocks = buildSegmentedBlocks(factor.percentage);
              return (
                <div
                  key={factor.label}
                  className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-900">
                      {factor.label}
                    </span>
                    <div className="flex items-center gap-2 font-mono-tabular text-xs font-semibold text-slate-800">
                      <span
                        className="tracking-widest text-sky-700 select-none"
                        aria-hidden="true"
                      >
                        {'█'.repeat(blocks.filled)}
                        <span className="text-slate-300">
                          {'░'.repeat(blocks.empty)}
                        </span>
                      </span>
                      <span>{factor.percentage}%</span>
                    </div>
                  </div>

                  {/* Clean Continuous Visual Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        factor.percentage >= 75
                          ? 'bg-emerald-600'
                          : factor.percentage >= 55
                          ? 'bg-amber-500'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${factor.percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <span>
              Methodology: Weighted multi-signal rubric combining historical settlement discipline, order intent, and commercial margin alignment.
            </span>
            <span className="font-mono-tabular text-slate-700 font-medium shrink-0">
              Prediction ≠ Guarantee
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
