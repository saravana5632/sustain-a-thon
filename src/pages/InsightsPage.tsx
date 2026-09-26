import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { BuyerAnalysisResult, PageRoute } from '../types';
import { formatINRCompact } from '../utils/formatters';
import { RiskIndicator } from '../components/RiskIndicator';
import { SearchGroundingPanel } from '../components/SearchGroundingPanel';

interface InsightsPageProps {
  buyers: BuyerAnalysisResult[];
  onSelectBuyerForResult: (buyer: BuyerAnalysisResult) => void;
  onNavigate: (page: PageRoute) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  buyers,
  onSelectBuyerForResult,
  onNavigate,
}) => {
  const attentionBuyers = buyers.filter((b) => b.riskLevel !== 'Low');

  const industryBreakdown = [
    {
      sector: 'Pharmaceuticals & Healthcare',
      avgScore: 89,
      pipeline: '₹9.2L',
      delayAvg: '1.5 days',
      tone: 'bg-emerald-600',
    },
    {
      sector: 'Industrial Manufacturing',
      avgScore: 85,
      pipeline: '₹14.6L',
      delayAvg: '3.2 days',
      tone: 'bg-emerald-600',
    },
    {
      sector: 'Electronics & IT Hardware',
      avgScore: 82,
      pipeline: '₹7.8L',
      delayAvg: '4.0 days',
      tone: 'bg-emerald-600',
    },
    {
      sector: 'Retail & FMCG Distribution',
      avgScore: 73,
      pipeline: '₹5.5L',
      delayAvg: '8.4 days',
      tone: 'bg-amber-500',
    },
    {
      sector: 'Textiles & Construction',
      avgScore: 52,
      pipeline: '₹5.7L',
      delayAvg: '21.0 days',
      tone: 'bg-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500">
            Sample Portfolio Analytics · Illustrative Decision-Support Data
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Business Insights
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Portfolio-level payment confidence trends, credit exposure concentration, and actionable risk signals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('analyze')}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          + Evaluate New Buyer
        </button>
      </div>

      {/* Top Insights KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Average Buyer Confidence</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono-tabular text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            82{' '}
            <span className="text-base font-normal text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Across active repeat and verified B2B accounts (sample benchmark)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Potential Revenue Under Review</span>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono-tabular text-3xl sm:text-4xl font-bold text-amber-600 mt-2">
            ₹8.4L
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Orders where advance payment milestones are recommended
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Buyers Requiring Attention</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-mono-tabular text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            12
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Enquiries exhibiting elevated payment delay or discount pressure
          </p>
        </div>
      </div>

      {/* Featured AI Insight Card */}
      <section className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Insight</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              “Buyers with consistent previous purchases and lower payment delays are currently contributing most of the high-confidence pipeline.”
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              Converting first-time Net 60 enquiries to a 30% Advance + Net 30 structure improves estimated portfolio settlement confidence by an average of +14 points.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                const reviewBuyer =
                  buyers.find((b) => b.riskLevel === 'Review') || buyers[0];
                if (reviewBuyer) onSelectBuyerForResult(reviewBuyer);
              }}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Simulate Credit Policy in “What If?”</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Buyer Risk Distribution + Sector Confidence Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Buyer Risk Distribution Chart Card */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Buyer Risk Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of 248 sample buyer evaluations by risk tier
            </p>

            {/* Clean Visual Bar Chart */}
            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Low Risk (High Confidence)
                  </span>
                  <span className="font-mono-tabular font-bold text-slate-900">
                    172 buyers (69%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: '69%' }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Pipeline Value: ₹29.6L · Avg Settlement Variance: +2.4 days
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Needs Review (Medium Confidence)
                  </span>
                  <span className="font-mono-tabular font-bold text-slate-900">
                    51 buyers (21%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: '21%' }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Pipeline Value: ₹8.4L · Avg Settlement Variance: +13.8 days
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    High Risk (Low Confidence)
                  </span>
                  <span className="font-mono-tabular font-bold text-slate-900">
                    25 buyers (10%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: '10%' }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Pipeline Value: ₹4.8L · Advance / LC strictly advised
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              69% of evaluated enquiries qualify for standard commercial terms.
            </span>
          </div>
        </section>

        {/* Confidence by Industry Sector */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              Confidence & Payment Lag by Industry Sector
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing average confidence score and historical settlement delay across key B2B verticals
            </p>
          </div>

          <div className="space-y-4">
            {industryBreakdown.map((item) => (
              <div
                key={item.sector}
                className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/70"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm mb-2">
                  <span className="font-bold text-slate-900">{item.sector}</span>
                  <div className="flex items-center gap-3 font-mono-tabular text-xs">
                    <span className="text-slate-500">
                      Pipeline: <strong className="text-slate-800">{item.pipeline}</strong>
                    </span>
                    <span>·</span>
                    <span className="text-slate-500">
                      Avg Delay: <strong className="text-slate-800">{item.delayAvg}</strong>
                    </span>
                    <span>·</span>
                    <span className="font-bold text-slate-900">
                      {item.avgScore}/100
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.tone}`}
                    style={{ width: `${item.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Buyers Requiring Immediate Commercial Review */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Accounts Requiring Commercial Safeguards
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sample accounts in Review or High Risk tiers where adjusting advance payment terms can mitigate exposure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {attentionBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <RiskIndicator risk={buyer.riskLevel} compact />
                  <span className="font-mono-tabular text-sm font-bold text-slate-900">
                    {buyer.confidenceScore}/100
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {buyer.input.companyName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {buyer.input.buyerName} · Order:{' '}
                  <strong className="font-mono-tabular text-slate-800">
                    {formatINRCompact(buyer.input.expectedOrderValue)}
                  </strong>
                </p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Avg Delay: {buyer.input.averagePaymentDelay}d · Terms:{' '}
                  {buyer.input.creditTerms}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectBuyerForResult(buyer)}
                className="mt-4 w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open in “What If?” Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Live Google Search Grounding Market & Credit Pulse */}
      <SearchGroundingPanel
        industry="Indian Manufacturing, Retail & Wholesale Trade"
        location="India"
        contextType="market-pulse"
        title="Live B2B Market & Trade Credit Pulse (Google Search Grounding)"
        subtitle="Query real-time Indian MSME payment cycle regulations, sector credit risk updates, and macroeconomic supply chain news."
      />
    </div>
  );
};
