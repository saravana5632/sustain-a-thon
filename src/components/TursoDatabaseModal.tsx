import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  X,
  Server,
  KeyRound,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { fetchDatabaseStatus, DatabaseStatus, resetBuyersInDbApi } from '../services/apiService';

interface TursoDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset?: () => void;
}

export const TursoDatabaseModal: React.FC<TursoDatabaseModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchDatabaseStatus();
      setStatus(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handlePing = async () => {
    setPinging(true);
    try {
      const data = await fetchDatabaseStatus();
      setStatus(data);
    } finally {
      setPinging(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset Turso database with the 9 default Indian B2B sample buyer records?')) {
      return;
    }
    setResetting(true);
    try {
      await resetBuyersInDbApi();
      await loadStatus();
      if (onDataReset) {
        onDataReset();
      }
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setResetting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Turso Database Connection</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800">
                  libSQL Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Persistent B2B trade credit records, buyers, invoices & audit logs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Live Status Card */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status?.connected ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold text-slate-900">Database Connected & Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span className="font-semibold text-slate-900">Checking Database...</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={handlePing}
                disabled={pinging || loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${pinging ? 'animate-spin' : ''}`} />
                <span>{pinging ? 'Testing...' : 'Ping Test'}</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Mode</span>
                <span className="font-semibold text-xs text-slate-900 capitalize">
                  {status?.mode === 'remote-turso' ? 'Cloud Turso' : 'Local libSQL'}
                </span>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Latency</span>
                <span className="font-semibold text-xs text-emerald-600">
                  {status?.latencyMs !== undefined && status.latencyMs >= 0 ? `${status.latencyMs} ms` : '—'}
                </span>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Buyers Stored</span>
                <span className="font-semibold text-xs text-slate-900">{status?.buyerCount ?? '—'}</span>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Past Invoices</span>
                <span className="font-semibold text-xs text-slate-900">{status?.invoiceCount ?? '—'}</span>
              </div>
            </div>

            {/* Connection URL */}
            <div className="bg-white rounded-lg p-3 border border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between overflow-hidden">
              <div className="truncate mr-2">
                <span className="text-slate-400 select-none">URL: </span>
                <span>{status?.url || 'file:local_turso.db'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(status?.url || 'file:local_turso.db', 'url')}
                className="text-slate-400 hover:text-slate-700 font-sans text-[11px] shrink-0"
              >
                {copySuccess === 'url' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Database Setup Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Connect Your Remote Turso Cloud Instance</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              PaySure AI runs seamlessly out of the box with the <strong>libSQL database engine</strong>. To connect your remote Turso cloud database (replicated globally), follow these quick steps:
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-200 p-3.5 font-mono text-xs space-y-2">
              <div className="text-slate-400 text-[11px]"># 1. Create a database in your Turso CLI or dashboard:</div>
              <div className="text-emerald-400">turso db create paysure-ai</div>
              <div className="text-slate-400 text-[11px] pt-1"># 2. Generate an authentication token:</div>
              <div className="text-emerald-400">turso db tokens create paysure-ai</div>
              <div className="text-slate-400 text-[11px] pt-1"># 3. Add to environment variables:</div>
              <div className="text-sky-300">TURSO_DATABASE_URL="libsql://paysure-ai-[your-org].turso.io"</div>
              <div className="text-sky-300">TURSO_AUTH_TOKEN="eyJhbGciOi..."</div>
            </div>
          </div>

          {/* Schema Capabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">ACID Transactions</span>
                <span className="text-slate-500">All buyer assessments and invoice settlements maintain transactional integrity.</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Zero-Latency Cache</span>
                <span className="text-slate-500">Immediate local reads and instant counterfactual What-If simulation caching.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline disabled:opacity-50"
          >
            {resetting ? 'Resetting...' : 'Re-seed Benchmark Records'}
          </button>
          <div className="flex items-center gap-2">
            <a
              href="https://turso.tech"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <span>Turso Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
