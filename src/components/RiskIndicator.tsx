import React from 'react';
import { RiskLevel } from '../types';
import { getRiskColorClasses, getRiskDisplayLabel } from '../utils/formatters';

interface RiskIndicatorProps {
  risk: RiskLevel;
  compact?: boolean;
}

/**
 * Clean, high-legibility semantic risk status indicator
 * Pairs semantic color with explicit text label for accessibility
 */
export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  risk,
  compact = false,
}) => {
  const colors = getRiskColorClasses(risk);
  const label = compact ? (risk === 'Low' ? 'Low' : risk === 'Review' ? 'Review' : 'High') : getRiskDisplayLabel(risk);

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold text-xs whitespace-nowrap ${colors.text}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
