import React from 'react';
import { RiskLevel } from '../types';
import { getRiskColorClasses, getRiskDisplayLabel } from '../utils/formatters';

interface ConfidenceGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  size?: 'md' | 'lg';
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  score,
  riskLevel,
  size = 'lg',
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const colors = getRiskColorClasses(riskLevel);
  const svgSize = size === 'lg' ? 208 : 148;
  const strokeWidth = size === 'lg' ? 12 : 10;
  const center = svgSize / 2;
  const radius = center - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="-rotate-90 transform"
          role="img"
          aria-label={`Buyer Payment Confidence Score ${clampedScore} out of 100`}
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Subtle Reference Tick Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius - strokeWidth * 0.95}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth="1.5"
            strokeDasharray="3 5"
          />
          {/* Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Central Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium text-slate-500 tracking-wide">
            Score
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`font-mono-tabular font-bold tracking-tight text-slate-900 ${
                size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-2xl'
              }`}
            >
              {clampedScore}
            </span>
            <span
              className={`font-mono-tabular font-medium text-slate-400 ${
                size === 'lg' ? 'text-lg' : 'text-xs'
              }`}
            >
              / 100
            </span>
          </div>
          <span
            className={`mt-1.5 text-xs font-semibold tracking-wide ${colors.text}`}
          >
            {getRiskDisplayLabel(riskLevel)}
          </span>
        </div>
      </div>
    </div>
  );
};
