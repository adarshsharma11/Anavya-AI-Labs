'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '@/lib/utils';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

export type ScoreGaugeProps = {
  label: string;
  value: number;
  className?: string;
  size?: number;
};

export default function ScoreGauge({
  label,
  value,
  className,
  size = 220,
}: ScoreGaugeProps) {
  const normalizedValue = clamp(Math.round(value), 0, 100);
  const startAngle = -135;
  const endAngle = 135;
  const angleRange = endAngle - startAngle;
  const targetAngle = startAngle + (normalizedValue / 100) * angleRange;

  const viewBoxSize = 120;
  const cx = 60;
  const cy = 64;
  const radius = 44;
  const arcPath = describeArc(cx, cy, radius, startAngle, endAngle);

  const needleRotate = targetAngle;

  const tone =
    normalizedValue >= 80
      ? 'text-emerald-500'
      : normalizedValue >= 60
        ? 'text-amber-500'
        : 'text-rose-500';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size * 0.72 }}>
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="h-full w-full"
          role="img"
          aria-label={`${label} score ${normalizedValue} out of 100`}
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="55%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>

          <path
            d={arcPath}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.5"
            pathLength={1}
          />

          <motion.path
            d={arcPath}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: normalizedValue / 100 }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />

          <g>
            <circle cx={cx} cy={cy} r={6} fill="hsl(var(--background))" />
            <circle cx={cx} cy={cy} r={5} fill="hsl(var(--foreground))" opacity="0.9" />
          </g>

          <motion.g
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            initial={{ rotate: startAngle }}
            animate={{ rotate: needleRotate }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - 38}
              stroke="hsl(var(--foreground))"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </motion.g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className={cn('text-4xl font-bold tabular-nums', tone)}>
            {normalizedValue}
          </div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-sm font-medium">{label}</div>
      </div>
    </div>
  );
}

