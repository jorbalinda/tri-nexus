'use client'

import { X, TrendingUp, TrendingDown } from 'lucide-react'
import type { TierTransition } from '@/hooks/useProjection'

const TIER_LABELS: Record<number, string> = {
  0: 'No Prediction',
  1: 'Rough Estimate',
  2: 'Standard',
  3: 'Refined',
}

interface TierTransitionToastProps {
  transition: TierTransition
  onDismiss: () => void
}

export default function TierTransitionToast({
  transition,
  onDismiss,
}: TierTransitionToastProps) {
  const isUpgrade = transition.direction === 'up'

  return (
    <div
      className={`relative rounded-2xl border p-4 ${
        isUpgrade
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
      }`}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isUpgrade
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-amber-100 dark:bg-amber-900/30'
          }`}
        >
          {isUpgrade ? (
            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown size={16} className="text-amber-600 dark:text-amber-400" />
          )}
        </div>

        <div>
          <p
            className={`text-sm font-semibold ${
              isUpgrade
                ? 'text-green-700 dark:text-green-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {isUpgrade
              ? `You've reached ${TIER_LABELS[transition.to]}!`
              : 'Prediction confidence dropped'}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              isUpgrade
                ? 'text-green-600/80 dark:text-green-400/80'
                : 'text-amber-600/80 dark:text-amber-400/80'
            }`}
          >
            {isUpgrade
              ? 'Your predictions just got more accurate. Keep up the great training!'
              : 'Recent training gaps detected. Log more workouts to restore accuracy.'}
          </p>
        </div>
      </div>
    </div>
  )
}
