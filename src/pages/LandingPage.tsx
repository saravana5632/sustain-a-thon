import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { MarketOpportunitySection } from '../components/MarketOpportunitySection';
import { PageRoute } from '../types';

interface LandingPageProps {
  onNavigate: (page: PageRoute) => void;
  onQuickInspectBuyer: (buyerId: string) => void;
}

interface HeroPreset {
  id: string;
  label: string;
  company: string;
  orderValue: string;
  score: number;
  riskLabel: 'LOW RISK' | 'NEEDS REVIEW' | 'HIGH RISK';
  riskTone: 'low' | 'review' | 'high';
  signals: { text: string; positive: boolean }[];
  recommendation: string;
  signalInputs: { name: string; value: string }[];
}

const HERO_PRESETS: HeroPreset[] = [
  {
    id: 'benchmark-82',
    label: 'MetroTech (82/100)',
    company: 'MetroTech Solutions Pvt Ltd',
    orderValue: '₹1.8L · Net 30',
    score: 82,
    riskLabel: 'LOW RISK',
    riskTone: 'low',
    signals: [
      { text: 'Strong purchase history', positive: true },
      { text: 'Consistent payment behavior', positive: true },
      { text: 'High engagement', positive: true },
      { text: 'Price acceptance', positive: true },
    ],
    recommendation: 'Proceed with normal payment safeguards.',
    signalInputs: [
      { name: 'Payment Ledger', value: '3d avg delay' },
      { name: 'Order History', value: 'Repeat (4 orders)' },
      { name: 'Engagement', value: 'Consistent (<24h)' },
      { name: 'Quote Alignment', value: '5% discount' },
    ],
  },
  {
    id: 'arun-86',
    label: 'Arun Retail (86/100)',
    company: 'Arun Retail Pvt Ltd',
    orderValue: '₹2.4L · 30% Adv',
    score: 86,
    riskLabel: 'LOW RISK',
    riskTone: 'low',
    signals: [
      { text: 'Strong purchase history', positive: true },
      { text: 'Consistent payment behavior', positive: true },
      { text: 'High engagement', positive: true },
      { text: 'Price acceptance', positive: true },
    ],
    recommendation: 'Proceed with normal payment safeguards.',
    signalInputs: [
      { name: 'Payment Ledger', value: 'Always on-time' },
      { name: 'Order History', value: 'Monthly repeat' },
      { name: 'Engagement', value: 'Proactive PO' },
      { name: 'Quote Alignment', value: '4% discount' },
    ],
  },
  {
    id: 'sri-lakshmi-64',
    label: 'Sri Lakshmi (64/100)',
    company: 'Sri Lakshmi Traders',
    orderValue: '₹5.2L · Net 45',
    score: 64,
    riskLabel: 'NEEDS REVIEW',
    riskTone: 'review',
    signals: [
      { text: 'Returning buyer (2 prior orders)', positive: true },
      { text: '14-day average payment lag', positive: false },
      { text: 'Moderate follow-up cadence', positive: true },
      { text: '11% discount pushback', positive: false },
    ],
    recommendation:
      'Proceed conditionally with a 30% advance payment milestone.',
    signalInputs: [
      { name: 'Payment Ledger', value: '14d avg delay' },
      { name: 'Order History', value: '2 past orders' },
      { name: 'Engagement', value: '2–4d replies' },
      { name: 'Quote Alignment', value: '11% discount' },
    ],
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onQuickInspectBuyer,
}) => {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activePreset = HERO_PRESETS[activePresetIndex];

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="focus:outline-none"
          >
            <BrandLogo variant="dark" size="md" />
          </a>

          {/* Zone 2: 4 Clean Text Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
            aria-label="Primary Navigation"
          >
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToHowItWorks();
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              How It Works
            </a>
            <a
              href="#signal-architecture"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('signal-architecture')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              Signal Rubric
            </a>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              Buyer Database
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Open Workspace
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analyze')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Analyze a Buyer
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="py-14 sm:py-20 lg:py-24 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Proposition & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-semibold text-sky-700 tracking-wide">
                Know the buyer before you commit.
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-slate-900 leading-[1.1]">
                Will This Buyer Actually Pay?
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Turn uncertain buyer interest into data-driven payment confidence. Evaluate commercial history, negotiation behavior, and credit exposure before committing your inventory or working capital.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('analyze')}
                  className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <span>Analyze a Buyer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="py-3 px-5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  See How It Works
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span>Explainable 5-factor rubric</span>
                <span aria-hidden="true">·</span>
                <span>Counterfactual “What If?” simulator</span>
                <span aria-hidden="true">·</span>
                <span>Built for Indian B2B trade workflows</span>
              </div>
            </div>

            {/* Right Column: Interactive Signal Flow + AI Analysis Card */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg">
                {/* Interactive Buyer Scenario Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-5 mb-6 border-b border-slate-800">
                  <span className="text-xs font-medium text-slate-400">
                    Live Signal Flow Preview:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                    {HERO_PRESETS.map((preset, idx) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setActivePresetIndex(idx)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                          activePresetIndex === idx
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animated Signal Flow Diagram + Hero Analysis Card */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Incoming Signals Column */}
                  <div className="sm:col-span-5 space-y-2.5">
                    <div className="text-[11px] font-medium text-slate-400 mb-1">
                      Incoming Buyer Signals
                    </div>
                    {activePreset.signalInputs.map((sig, i) => (
                      <div
                        key={i}
                        className="px-3 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700/70 flex items-center justify-between gap-2"
                      >
                        <span className="text-xs text-slate-300">{sig.name}</span>
                        <span className="font-mono-tabular text-xs font-semibold text-sky-400">
                          {sig.value}
                        </span>
                      </div>
                    ))}

                    {/* Subtle Animated Signal Connector SVG */}
                    <div className="pt-1 flex items-center gap-2 text-[11px] text-sky-400">
                      <svg
                        width="88"
                        height="16"
                        viewBox="0 0 88 16"
                        fill="none"
                        className="shrink-0"
                        aria-hidden="true"
                      >
                        <line
                          x1="2"
                          y1="8"
                          x2="82"
                          y2="8"
                          stroke="#0284C7"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="animate-flow-dash"
                        />
                        <circle cx="82" cy="8" r="3.5" fill="#38BDF8" />
                      </svg>
                      <span className="font-mono-tabular">Weighted Engine</span>
                    </div>
                  </div>

                  {/* Hero AI Analysis Result Card */}
                  <div className="sm:col-span-7 bg-white text-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold tracking-wider text-slate-500">
                        BUYER PAYMENT CONFIDENCE
                      </span>
                      <span className="font-mono-tabular text-xs text-slate-500">
                        {activePreset.orderValue}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono-tabular text-4xl sm:text-5xl font-bold text-slate-900">
                          {activePreset.score}
                        </span>
                        <span className="font-mono-tabular text-base font-medium text-slate-400">
                          / 100
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            activePreset.riskTone === 'low'
                              ? 'bg-emerald-600'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold tracking-wide ${
                            activePreset.riskTone === 'low'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {activePreset.riskLabel}
                        </span>
                      </div>
                    </div>

                    {/* 4 Key Signals List */}
                    <ul className="py-4 space-y-2 border-b border-slate-100">
                      {activePreset.signals.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800"
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                              item.positive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>

                    {/* AI Recommendation Box */}
                    <div className="pt-3.5">
                      <div className="text-[11px] font-semibold text-slate-400">
                        AI Recommendation
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
                        {activePreset.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    Evaluating: <strong className="text-slate-200">{activePreset.company}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('result')}
                    className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Full Assessment & Simulator</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-sky-700">
              Decision-Support Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              From raw buyer enquiry to structured payment confidence in 60 seconds
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Warm enquiries and positive WhatsApp or email replies do not always convert into timely invoice settlement. PaySure AI structures your evaluation before you ship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="font-mono-tabular text-sm font-bold text-sky-700">
                  01. Capture Commercial Signals
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Enter buyer, order, and payment history
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Input order value, requested discount, past payment delays, outstanding balance, and engagement consistency using guided controls.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/70 text-xs text-slate-500">
                4 structured sections · Takes under 1 minute
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="font-mono-tabular text-sm font-bold text-sky-700">
                  02. Explainable AI Scoring
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Inspect the 0–100 score and signal weights
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  See exactly why a buyer scored Low Risk, Needs Review, or High Risk across Payment Behaviour (30%), Purchase History (25%), and Engagement (20%).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/70 text-xs text-slate-500">
                Full factor audit · Zero black-box scoring
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="font-mono-tabular text-sm font-bold text-sky-700">
                  03. “What If?” Terms Simulator
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Simulate commercial safeguards before quoting
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Test how requiring a 30% advance or shortening credit terms from Net 60 to Net 30 lifts payment confidence from 64 to 81.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/70 text-xs text-slate-500">
                Actionable negotiation levers · Real-time delta
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Rubric & Proof Section */}
      <section id="signal-architecture" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-semibold text-sky-700">
                Explainable AI Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Weighted signal model built for B2B credit & sales teams
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Instead of opaque credit scores that fail to reflect live deal terms, PaySure AI combines historical payment reliability with real-time purchase intent and quote acceptance.
              </p>

              <div className="pt-2 space-y-3">
                {[
                  { label: 'Payment Behaviour & Delay History', weight: '30%' },
                  { label: 'Previous Purchase & Repeat Cadence', weight: '25%' },
                  { label: 'Buyer Engagement & Response Speed', weight: '20%' },
                  { label: 'Price Acceptance & Discount Pressure', weight: '15%' },
                  { label: 'Entity Structure & Exposure Ratio', weight: '10%' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2.5 px-4 bg-white rounded-lg border border-slate-200"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-800">
                      {row.label}
                    </span>
                    <span className="font-mono-tabular text-xs sm:text-sm font-bold text-slate-900">
                      {row.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Sample Buyer Cards */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Explore Sample Buyer Assessments
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any sample Indian B2B buyer below to inspect their full profile or simulate credit terms.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <span>Open Full Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {[
                  {
                    id: 'buyer-arun-retail',
                    company: 'Arun Retail Pvt Ltd',
                    buyer: 'Arun Traders · Bengaluru',
                    order: '₹2.4L',
                    score: 86,
                    risk: 'Low Risk',
                    tone: 'text-emerald-700',
                  },
                  {
                    id: 'buyer-metrotech',
                    company: 'MetroTech Solutions Pvt Ltd',
                    buyer: 'Vikram Deshmukh · Pune',
                    order: '₹1.8L',
                    score: 82,
                    risk: 'Low Risk',
                    tone: 'text-emerald-700',
                  },
                  {
                    id: 'buyer-sri-lakshmi',
                    company: 'Sri Lakshmi Traders',
                    buyer: 'Suresh Iyer · Coimbatore',
                    order: '₹5.2L',
                    score: 64,
                    risk: 'Needs Review',
                    tone: 'text-amber-700',
                  },
                  {
                    id: 'buyer-bluewave',
                    company: 'BlueWave Enterprises',
                    buyer: 'Rajeev Bansal · Noida',
                    order: '₹6.8L',
                    score: 34,
                    risk: 'High Risk',
                    tone: 'text-red-700',
                  },
                ].map((b) => (
                  <div
                    key={b.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {b.company}
                      </div>
                      <div className="text-xs text-slate-500">
                        {b.buyer} · Order Value:{' '}
                        <span className="font-mono-tabular font-semibold text-slate-700">
                          {b.order}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono-tabular text-sm font-bold text-slate-900">
                          {b.score} / 100
                        </div>
                        <div className={`text-xs font-semibold ${b.tone}`}>
                          {b.risk}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onQuickInspectBuyer(b.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    AI estimates payment confidence from available signals. Prediction ≠ Guarantee.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('analyze')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Evaluate Your Own Buyer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supporting Business Section: Market Opportunity (TAM / SAM / SOM) */}
      <MarketOpportunitySection onNavigate={onNavigate} />

      {/* Quiet Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <BrandLogo variant="dark" size="sm" />
            <span>·</span>
            <span>“Know the buyer before you commit.”</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="#market-opportunity"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('market-opportunity')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-slate-900 cursor-pointer"
            >
              Market Opportunity
            </a>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analyze')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Analyze Buyer
            </button>
            <button
              type="button"
              onClick={() => onNavigate('insights')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Business Insights
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
