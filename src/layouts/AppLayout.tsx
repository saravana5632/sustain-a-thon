import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  FileCheck2,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  Settings,
  UserCheck,
  X,
} from 'lucide-react';
import { PageRoute } from '../types';
import { BrandLogo } from '../components/BrandLogo';

interface AppLayoutProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  selectedBuyerCompany?: string;
  children: React.ReactNode;
}

interface NavItem {
  id: PageRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyze Buyer', icon: UserCheck },
  { id: 'result', label: 'Analysis Result', icon: FileCheck2 },
  { id: 'history', label: 'Buyer History', icon: History },
  { id: 'details', label: 'Buyer Details', icon: Building2 },
  { id: 'insights', label: 'Business Insights', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PAGE_LABELS: Record<PageRoute, string> = {
  landing: 'Product Overview',
  dashboard: 'Risk Overview Dashboard',
  analyze: 'Analyze a Buyer',
  result: 'AI Confidence Assessment',
  history: 'Buyer History Database',
  details: 'Buyer Profile & Timeline',
  insights: 'Business Insights',
  settings: 'Workspace & Model Settings',
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  selectedBuyerCompany,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-slate-200 border-r border-slate-800 z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="text-left focus:outline-none cursor-pointer"
          >
            <BrandLogo variant="light" size="md" />
          </button>
        </div>

        {/* Primary CTA in Sidebar */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => handleNavClick('analyze')}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze a Buyer</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-sky-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Decision-Support Principle Box */}
        <div className="p-4 m-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
          <div className="text-xs font-semibold text-slate-200">
            Know the buyer before you commit.
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            AI estimates payment confidence from commercial signals. Prediction ≠ Guarantee.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar (Breadcrumb + Actions) */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Button + Breadcrumb Trail */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className="text-slate-500 hover:text-slate-900 font-medium hidden sm:inline whitespace-nowrap cursor-pointer"
              >
                PaySure Workspace
              </button>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">
                {PAGE_LABELS[currentPage]}
              </span>
              {(currentPage === 'result' || currentPage === 'details') &&
                selectedBuyerCompany && (
                  <>
                    <span className="text-slate-300 hidden md:inline" aria-hidden="true">
                      /
                    </span>
                    <span className="text-slate-600 text-xs font-medium truncate hidden md:inline max-w-[220px]">
                      {selectedBuyerCompany}
                    </span>
                  </>
                )}
            </div>
          </div>

          {/* Right: Primary Action Only */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentPage !== 'analyze' && (
              <button
                type="button"
                onClick={() => handleNavClick('analyze')}
                className="py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Analyze Buyer</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-100 h-full flex flex-col z-10">
              <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
                <BrandLogo variant="light" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => handleNavClick('analyze')}
                  className="w-full py-2.5 px-4 bg-sky-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Analyze a Buyer</span>
                </button>
              </div>
              <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {MAIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto">
          {children}
        </main>

        {/* Quiet Workspace Footer */}
        <footer className="px-4 sm:px-8 py-5 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-[1360px] w-full mx-auto">
          <div>
            <span>PaySure AI · Know the buyer before you commit.</span>
          </div>
          <div>
            <span>Decision-support estimate from available signals · Not a guarantee of payment.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
