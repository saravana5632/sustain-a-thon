import React, { useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  fetchBuyerSearchGrounding,
  SearchGroundingResponse,
} from '../services/searchGroundingService';

interface SearchGroundingPanelProps {
  companyName?: string;
  industry?: string;
  location?: string;
  contextType?: 'buyer-verification' | 'market-pulse';
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const SearchGroundingPanel: React.FC<SearchGroundingPanelProps> = ({
  companyName = '',
  industry = '',
  location = '',
  contextType = 'buyer-verification',
  title = 'Live Web & Sector Verification (Google Search Grounding)',
  subtitle = 'Fetch up-to-date public web signals, industry credit trends, and news grounded with Google Search.',
  compact = false,
}) => {
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchGroundingResponse | null>(null);

  const handleRunSearch = async (queryOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBuyerSearchGrounding({
        companyName,
        industry,
        location,
        customQuery:
          typeof queryOverride === 'string' ? queryOverride : customQuery,
        contextType,
      });
      setResult(res);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to retrieve grounded search intelligence.'
      );
    } finally {
      setLoading(false);
    }
  };

  const quickQueries =
    contextType === 'market-pulse'
      ? [
          'Indian MSME 45-day payment rule & B2B trade credit trends 2026',
          `${industry || 'Manufacturing'} supply chain payment delays India`,
          'RBI trade receivables discounting system (TReDS) MSME updates',
        ]
      : [
          `${companyName} ${location.split(',')[0]} business profile & news`,
          `${industry} B2B credit cycle and payment risk in ${location || 'India'}`,
          `Wholesale trade credit safeguards ${industry} India`,
        ];

  return (
    <section
      className={`bg-white border border-slate-200 rounded-xl ${
        compact ? 'p-5' : 'p-6 sm:p-8'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
            <Globe className="w-3.5 h-3.5" />
            <span>Powered by Google Search Grounding</span>
          </div>
          <h3
            className={`${
              compact ? 'text-base' : 'text-lg sm:text-xl'
            } font-bold text-slate-900 mt-1`}
          >
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => handleRunSearch('')}
          disabled={loading}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 self-start lg:self-auto whitespace-nowrap cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Searching Google...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {result
                  ? 'Refresh Grounded Signals'
                  : contextType === 'market-pulse'
                  ? 'Verify Live Sector Trends'
                  : `Verify ${companyName || 'Buyer'} & Sector`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Custom Search Input + Quick Search Suggestions */}
      <div className="mt-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRunSearch(customQuery);
                }
              }}
              placeholder={
                contextType === 'market-pulse'
                  ? 'Search any Indian B2B industry, MSME credit rule, or market trend...'
                  : `Search real-time web signals for "${
                      companyName || 'buyer'
                    }", ${industry}, or any public company...`
              }
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRunSearch(customQuery)}
            disabled={loading}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Run Grounded Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Suggested lookups:</span>
          {quickQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCustomQuery(q);
                handleRunSearch(q);
              }}
              disabled={loading}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-left truncate max-w-xs cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Google Search Grounding Notice</div>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Grounded Result Display */}
      {result && !loading && (
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/70 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                Grounded Commercial & Sector Synthesis
              </span>
              <span className="font-mono-tabular">
                Model: {result.modelUsed} · Grounded via Google Search
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {result.summary}
            </div>
          </div>

          {/* Search Queries Used */}
          {result.searchQueries && result.searchQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Google Search queries executed:</span>
              {result.searchQueries.map((sq, i) => (
                <span
                  key={i}
                  className="font-mono-tabular text-slate-700 bg-slate-100 px-2 py-0.5 rounded"
                >
                  “{sq}”
                </span>
              ))}
            </div>
          )}

          {/* Grounding Web Sources (groundingChunks) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Verified Web Citations ({result.sources.length})
              </span>
              <button
                type="button"
                onClick={() => handleRunSearch(customQuery)}
                className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-800 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-verify</span>
              </button>
            </div>

            {result.sources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-sky-500/60 bg-white hover:bg-sky-50/30 transition-colors flex items-center justify-between gap-2 text-xs text-slate-800 group"
                  >
                    <span className="font-medium truncate group-hover:text-sky-700">
                      {src.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Synthesized from Google Search knowledge graph; no direct external links returned for this query.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
