import React from 'react';
import { ArrowDown, ArrowRight, Layers } from 'lucide-react';
import { PageRoute } from '../types';

interface MarketOpportunitySectionProps {
  onNavigate: (page: PageRoute) => void;
}

interface MarketTier {
  code: 'TAM' | 'SAM' | 'SOM';
  title: string;
  label: string;
  description: string;
  strategicPurpose: string;
  widthClass: string;
  barWidth: string;
  accentClass: string;
}

const MARKET_TIERS: MarketTier[] = [
  {
    code: 'TAM',
    title: 'TAM — Total Addressable Market',
    label: 'Global Potential / Theoretical Limit',
    description:
      'Represents the overall global opportunity for solutions that help businesses evaluate buyer willingness and payment confidence.',
    strategicPurpose:
      'Shows the long-term scale and potential of the industry.',
    widthClass: 'w-full',
    barWidth: 'w-full',
    accentClass: 'border-slate-300 bg-white',
  },
  {
    code: 'SAM',
    title: 'SAM — Serviceable Available Market',
    label: 'Reachable Geography & Segment',
    description:
      'Represents the part of the overall market that PaySure AI can realistically serve based on its target geography, customer segment, and product scope.',
    strategicPurpose:
      'Helps define boundaries for product localization and marketing.',
    widthClass: 'w-full lg:w-[92%]',
    barWidth: 'w-2/3',
    accentClass: 'border-slate-300 bg-white',
  },
  {
    code: 'SOM',
    title: 'SOM — Serviceable Obtainable Market',
    label: 'Actual Short-Term Target',
    description:
      'Represents the realistic initial market that PaySure AI can target during its early growth stage.',
    strategicPurpose:
      'Supports operational budgeting, sales planning, and realistic growth expectations.',
    widthClass: 'w-full lg:w-[84%]',
    barWidth: 'w-1/3',
    accentClass: 'border-sky-200 bg-sky-50/40',
  },
];

export const MarketOpportunitySection: React.FC<
  MarketOpportunitySectionProps
> = ({ onNavigate }) => {
  return (
    <section
      id="market-opportunity"
      aria-labelledby="market-opportunity-heading"
      className="py-14 sm:py-16 bg-white border-t border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Compact Header + Core Journey Reminder */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-sky-700 uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>MARKET OPPORTUNITY</span>
            </div>
            <h2
              id="market-opportunity-heading"
              className="text-xl sm:text-2xl font-bold text-slate-900 mt-1"
            >
              Commercial Scale & Target Market Funnel (TAM / SAM / SOM)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Strategic market framing for B2B buyer payment confidence and trade credit decision-support software.
            </p>
          </div>

          {/* Core Product Flow Strip so focus remains on the Buyer Analysis experience */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-900">Core Product Flow:</span>
            <span>Buyer Data</span>
            <span className="text-slate-400">→</span>
            <span>AI Analysis</span>
            <span className="text-slate-400">→</span>
            <span>Confidence Score</span>
            <span className="text-slate-400">→</span>
            <span>Risk Level</span>
            <span className="text-slate-400">→</span>
            <span>Explainability</span>
            <span className="text-slate-400">→</span>
            <span>Recommendation</span>
            <span className="text-slate-400">→</span>
            <button
              type="button"
              onClick={() => onNavigate('result')}
              className="font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-0.5 underline cursor-pointer"
            >
              <span>What-If Simulation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Connected Funnel Stack: TAM -> SAM -> SOM */}
        <div className="mt-8 flex flex-col items-center">
          {MARKET_TIERS.map((tier, idx) => (
            <React.Fragment key={tier.code}>
              <div
                className={`${tier.widthClass} rounded-xl border ${tier.accentClass} p-5 sm:p-6 transition-all`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
                  {/* Left: Tier Title, Label & Funnel Proportion Bar */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center justify-between lg:justify-start gap-2.5">
                      <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {tier.code}
                      </span>
                      <span className="text-xs font-semibold text-sky-700">
                        {tier.label}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {tier.title}
                    </h3>

                    {/* Progressive Funnel Indicator Bar */}
                    <div className="pt-1">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tier.code === 'SOM' ? 'bg-sky-600' : 'bg-slate-800'
                          } ${tier.barWidth}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Middle: Description & Strategic Purpose */}
                  <div className="lg:col-span-5 space-y-2">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {tier.description}
                    </p>
                    <div className="text-xs text-slate-600 pt-1">
                      <strong className="font-semibold text-slate-900">
                        Strategic Purpose:{' '}
                      </strong>
                      {tier.strategicPurpose}
                    </div>
                  </div>

                  {/* Right: Unfabricated Validation Status */}
                  <div className="lg:col-span-3 lg:text-right flex flex-col justify-between h-full">
                    <div className="inline-block lg:ml-auto p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-left lg:text-right">
                      <div className="text-[11px] font-medium text-slate-400">
                        Valuation Status
                      </div>
                      <div className="font-mono-tabular text-xs font-semibold text-slate-800 mt-0.5">
                        Market size — To be validated
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downward Funnel Connector (TAM ↓ SAM ↓ SOM) */}
              {idx < MARKET_TIERS.length - 1 && (
                <div
                  className="py-1.5 flex flex-col items-center text-slate-400 select-none"
                  aria-hidden="true"
                >
                  <ArrowDown className="w-4 h-4 text-sky-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
