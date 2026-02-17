'use client'

import { useState, type RefObject } from 'react'
import { Download } from 'lucide-react'
import type { RacePlan } from '@/lib/types/race-plan'

interface ExportPDFProps {
  plan: RacePlan
  contentRef: RefObject<HTMLDivElement | null>
}

function formatTime(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '--:--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatPace100m(sec: number | null): string {
  if (!sec) return '--:--'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatPaceKm(secPerKm: number | null): string {
  if (!secPerKm) return '--:--'
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const distanceLabels: Record<string, string> = {
  super_sprint: 'Super Sprint',
  sprint: 'Sprint',
  olympic: 'Olympic',
  wt_sprint: 'WT Sprint (Draft-Legal)',
  wt_standard: 'WT Standard (Draft-Legal)',
  '70.3': 'Half Ironman 70.3',
  '140.6': 'Ironman 140.6',
  custom: 'Custom',
}

const goalLabels: Record<string, string> = {
  finish: 'Finish',
  pr: 'Personal Record',
  ag_podium: 'Age Group Podium',
  ag_win: 'Age Group Win',
  qualify_im_703_worlds: 'Qualify 70.3 Worlds',
  qualify_im_kona: 'Qualify Kona',
  qualify_wt_ag_worlds: 'Qualify WT AG Worlds',
  qualify_usat_nationals: 'Qualify USAT Nationals',
  legacy_qualification: 'Legacy Qualification',
  win_podium: 'Win / Podium',
  pro_card_qualification: 'Pro Card',
  im_pro_slot: 'IM Pro Slot',
  pto_ranking_points: 'PTO Points',
  wt_series_points: 'WT Points',
  prize_money: 'Prize Money',
  course_record: 'Course Record',
}

export default function ExportPDF({ plan }: ExportPDFProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)

    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      const contentWidth = pageWidth - margin * 2
      let y = margin

      const addPage = () => {
        doc.addPage()
        y = margin
      }

      const checkSpace = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - margin) {
          addPage()
        }
      }

      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(plan.race_name, margin, y)
      y += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120)
      const classification = plan.athlete_classification === 'professional' ? 'PRO' : 'AG'
      const subtitle = `${distanceLabels[plan.race_distance] || plan.race_distance} | ${plan.race_date || 'No date'} | Goal: ${goalLabels[plan.goal_type] || plan.goal_type} | ${classification}`
      doc.text(subtitle, margin, y)
      y += 4

      if (plan.estimated_finish_seconds) {
        doc.text(
          `Estimated Finish: ${formatTime(plan.estimated_finish_seconds)} (Optimistic: ${formatTime(plan.estimated_finish_optimistic)} / Conservative: ${formatTime(plan.estimated_finish_conservative)})`,
          margin,
          y
        )
      }
      y += 8

      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 6

      // Helper to add section
      const addSectionTitle = (title: string) => {
        checkSpace(12)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0)
        doc.text(title, margin, y)
        y += 7
      }

      const addSubTitle = (title: string) => {
        checkSpace(8)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60)
        doc.text(title, margin + 2, y)
        y += 5
      }

      const addRow = (label: string, value: string) => {
        checkSpace(6)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100)
        doc.text(label, margin + 4, y)
        doc.setTextColor(40)
        doc.setFont('helvetica', 'bold')
        doc.text(value, margin + contentWidth * 0.4, y)
        doc.setFont('helvetica', 'normal')
        y += 5
      }

      const addNote = (text: string) => {
        checkSpace(10)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(130)
        const lines = doc.splitTextToSize(text, contentWidth - 8)
        doc.text(lines, margin + 4, y)
        y += lines.length * 3.5 + 2
      }

      const addBullet = (text: string) => {
        checkSpace(6)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80)
        const lines = doc.splitTextToSize(`• ${text}`, contentWidth - 10)
        doc.text(lines, margin + 6, y)
        y += lines.length * 3.5 + 1
      }

      // ---- QUALIFICATION ----
      if (plan.qualification_target && plan.estimated_qualification_competitive !== null) {
        addSectionTitle('QUALIFICATION READINESS')
        const qt = plan.qualification_target
        addRow('Championship', qt.championship)
        if (qt.estimated_qualifying_time) {
          addRow('Target Time', formatTime(qt.estimated_qualifying_time))
        }
        addRow('Competitive', plan.estimated_qualification_competitive ? 'YES - On track' : 'GAP - Need improvement')
        if (plan.pacing_plan?.qualificationPacing) {
          const qp = plan.pacing_plan.qualificationPacing
          addRow('Qual. Swim Target', formatTime(qp.swimSplitTarget))
          addRow('Qual. Bike Target', formatTime(qp.bikeSplitTarget))
          addRow('Qual. Run Target', formatTime(qp.runSplitTarget))
          if (qp.gapToCurrentFitness > 0) {
            addNote(`Gap to current fitness: +${Math.round(qp.gapToCurrentFitness / 60)} minutes`)
          }
          qp.recommendations.forEach((r) => addBullet(r))
        }
        y += 4
      }

      // ---- PACING ----
      if (plan.pacing_plan) {
        const p = plan.pacing_plan
        addSectionTitle('PACING PLAN')

        addSubTitle(`Swim${p.bike.isDraftLegal ? ' (Draft-Legal Race)' : ''}`)
        if (p.swim.dataAvailable) {
          addRow('Target Pace', `${formatPace100m(p.swim.targetPacePer100m)} /100m`)
          addRow('Est. Split', formatTime(p.swim.estimatedSplitSeconds))
          addNote(p.swim.strategy)
        } else {
          addNote('Add swim workouts to unlock swim pacing.')
        }
        y += 2

        addSubTitle('Bike')
        if (p.bike.dataAvailable) {
          if (p.bike.targetPowerWatts) {
            addRow('Target Power', `${p.bike.targetPowerWatts}W (${p.bike.targetPowerRange?.[0]}-${p.bike.targetPowerRange?.[1]}W)`)
          }
          addRow('Target HR', p.bike.targetHRZone)
          addRow('Est. Split', formatTime(p.bike.estimatedSplitSeconds))
          addNote(p.bike.strategy)
        } else {
          addNote('Add bike workouts to unlock bike pacing.')
        }
        y += 2

        addSubTitle('Run')
        if (p.run.dataAvailable) {
          addRow('Target Pace', `${formatPaceKm(p.run.targetPaceSecPerKm)} /km`)
          addRow('Target HR', p.run.targetHRZone)
          addRow('Est. Split', formatTime(p.run.estimatedSplitSeconds))
          addNote(p.run.strategy)
          addNote(p.run.brickFactorNote)
        } else {
          addNote('Add run workouts to unlock run pacing.')
        }
        y += 2

        addSubTitle('Transitions')
        addRow('T1 Target', formatTime(p.transitions.t1Seconds))
        addRow('T2 Target', formatTime(p.transitions.t2Seconds))
        y += 4
      }

      // ---- NUTRITION ----
      if (plan.nutrition_plan) {
        const n = plan.nutrition_plan
        addSectionTitle('NUTRITION PLAN')

        addSubTitle('Pre-Race (24-48h)')
        addRow('Carbs', n.preRace.carbLoadingTarget)
        addRow('Last Meal', n.preRace.lastBigMeal)
        y += 2

        addSubTitle('Race Morning')
        addRow('Meal', n.raceMorning.mealTarget)
        addRow('Caffeine', n.raceMorning.caffeine)
        addRow('Hydration', n.raceMorning.hydration)
        y += 2

        addSubTitle('During Bike')
        addRow('Carbs', n.bike.carbsPerHour)
        addRow('Hydration', n.bike.hydrationPerHour)
        addRow('Electrolytes', n.bike.electrolytesPerHour)
        y += 2

        addSubTitle('During Run')
        addRow('Carbs', n.run.carbsPerHour)
        addRow('Hydration', n.run.hydrationPerHour)
        addRow('Electrolytes', n.run.electrolytesPerHour)
        y += 2

        addSubTitle('Summary')
        addRow('Total Carbs', `${n.summary.totalCarbsGrams}g`)
        addRow('Total Calories', `${n.summary.totalCalories} cal`)
        addRow('Bike', `${n.summary.bikeCarbsGrams}g / ${n.summary.bikeCalories} cal`)
        addRow('Run', `${n.summary.runCarbsGrams}g / ${n.summary.runCalories} cal`)
        y += 4
      }

      // ---- EQUIPMENT ----
      if (plan.equipment_plan) {
        addSectionTitle('EQUIPMENT CHECKLIST')
        const categories = ['swim', 'bike', 'run', 'transition', 'nutrition', 'special_needs'] as const
        for (const cat of categories) {
          const items = plan.equipment_plan.checklist.filter((i) => i.category === cat)
          if (items.length > 0) {
            addSubTitle(cat === 'special_needs' ? 'Special Needs' : cat.charAt(0).toUpperCase() + cat.slice(1))
            items.forEach((item) => addBullet(item.name))
            y += 2
          }
        }
        y += 2

        addSubTitle('Race Week Timeline')
        for (const day of plan.equipment_plan.raceWeekTimeline) {
          checkSpace(15)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(60)
          doc.text(day.label, margin + 4, y)
          y += 4
          day.tasks.forEach((task) => addBullet(task))
          y += 2
        }
        y += 4
      }

      // ---- MINDSET ----
      if (plan.mindset_plan) {
        addSectionTitle('MINDSET & MENTAL PREP')

        addSubTitle('Your Mantras')
        plan.mindset_plan.mantras.forEach((m) => {
          checkSpace(6)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'italic')
          doc.setTextColor(80)
          doc.text(`"${m}"`, margin + 6, y)
          y += 5
        })
        y += 2

        addSubTitle('Process Goals')
        plan.mindset_plan.processGoals.forEach((g, i) => addBullet(`${i + 1}. ${g}`))
        y += 2

        addSubTitle('During Race Strategies')
        plan.mindset_plan.duringRaceStrategies.forEach((s) => {
          const [title, ...rest] = s.split(': ')
          checkSpace(10)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(60)
          doc.text(title, margin + 4, y)
          y += 3.5
          if (rest.length) addNote(rest.join(': '))
        })

        if (plan.mindset_plan.proTactics && plan.mindset_plan.proTactics.length > 0) {
          y += 2
          addSubTitle('Pro Race Tactics')
          plan.mindset_plan.proTactics.forEach((t) => {
            const [title, ...rest] = t.split(': ')
            checkSpace(10)
            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(60)
            doc.text(title, margin + 4, y)
            y += 3.5
            if (rest.length) addNote(rest.join(': '))
          })
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(180)
        doc.text(
          `TRI-NEXUS Race Plan — ${plan.race_name} — Page ${i}/${pageCount}`,
          margin,
          doc.internal.pageSize.getHeight() - 8
        )
      }

      const fileName = `${plan.race_name.replace(/[^a-zA-Z0-9]/g, '_')}_Race_Plan.pdf`
      doc.save(fileName)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer"
    >
      <Download size={16} />
      {exporting ? 'Exporting...' : 'Export PDF'}
    </button>
  )
}
