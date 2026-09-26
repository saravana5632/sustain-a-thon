import { RiskLevel } from '../types';

/**
 * Formats an INR number into concise Indian B2B notation (e.g. ₹2.4L, ₹75,000, ₹1.25Cr)
 */
export function formatINRCompact(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return '₹0';
  }
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)}Cr`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an INR number with full Indian comma grouping (e.g. ₹2,40,000)
 */
export function formatINRFull(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns semantic label for RiskLevel
 */
export function getRiskDisplayLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return 'LOW RISK';
    case 'Review':
      return 'NEEDS REVIEW';
    case 'High':
      return 'HIGH RISK';
  }
}

/**
 * Returns color classes for RiskLevel
 */
export function getRiskColorClasses(risk: RiskLevel): {
  text: string;
  dot: string;
  border: string;
  bgSubtle: string;
  stroke: string;
} {
  switch (risk) {
    case 'Low':
      return {
        text: 'text-emerald-700',
        dot: 'bg-emerald-600',
        border: 'border-emerald-200',
        bgSubtle: 'bg-emerald-50/70',
        stroke: '#059669',
      };
    case 'Review':
      return {
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        border: 'border-amber-200',
        bgSubtle: 'bg-amber-50/70',
        stroke: '#D97706',
      };
    case 'High':
      return {
        text: 'text-red-700',
        dot: 'bg-red-600',
        border: 'border-red-200',
        bgSubtle: 'bg-red-50/70',
        stroke: '#DC2626',
      };
  }
}
