'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { MindsetPlan } from '@/lib/types/race-plan'

interface MindsetCardProps {
  mindset: MindsetPlan
}

export default function MindsetCard({ mindset }: MindsetCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)

  return (
    <div className="card-squircle p-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Mindset & Mental Prep
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {mindset.mantras.length} mantras &middot; {mindset.processGoals.length} process goals
          </p>
        </div>
        {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Mantras */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-3">
              Your Mantras
            </p>
            <div className="flex flex-col gap-2">
              {mindset.mantras.map((mantra, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30"
                >
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 italic">
                    &ldquo;{mantra}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Process Goals */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">
              Process Goals
            </p>
            <ul className="space-y-2">
              {mindset.processGoals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visualization */}
          <div>
            <button
              onClick={() => setShowVisualization(!showVisualization)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              {showVisualization ? 'Hide' : 'Read'} Visualization Script
              {showVisualization ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showVisualization && (
              <div className="mt-3 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                {mindset.visualizationScript.split('\n\n').map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* During Race Strategies */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3">
              During Race Strategies
            </p>
            <div className="flex flex-col gap-2">
              {mindset.duringRaceStrategies.map((strategy, i) => {
                const [title, ...rest] = strategy.split(': ')
                return (
                  <div key={i} className="border-l-4 border-l-amber-400 pl-3 py-1">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{title}</p>
                    {rest.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rest.join(': ')}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Race Week Tips */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-green-500 mb-3">
              Race Week Tips
            </p>
            <div className="flex flex-col gap-2">
              {mindset.raceWeekTips.map((tip, i) => {
                const [title, ...rest] = tip.split(': ')
                return (
                  <div key={i} className="border-l-4 border-l-green-400 pl-3 py-1">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{title}</p>
                    {rest.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rest.join(': ')}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pro Tactics */}
          {mindset.proTactics && mindset.proTactics.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3">
                Pro Race Tactics
              </p>
              <div className="flex flex-col gap-2">
                {mindset.proTactics.map((tactic, i) => {
                  const [title, ...rest] = tactic.split(': ')
                  return (
                    <div key={i} className="border-l-4 border-l-red-400 pl-3 py-1">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{title}</p>
                      {rest.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rest.join(': ')}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
