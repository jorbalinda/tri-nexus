import type {
  RaceDistance,
  GoalType,
  MindsetPlan,
  AthleteClassification,
} from '@/lib/types/race-plan'
import { isDraftLegal } from '@/lib/types/race-plan'

// ---------------------------------------------------------------------------
// Mindset plan generator — parameterized by goal, distance & classification
// ---------------------------------------------------------------------------

export function generateMindsetPlan(
  goalType: GoalType,
  raceDistance: RaceDistance,
  raceName: string,
  classification: AthleteClassification
): MindsetPlan {
  return {
    mantras: generateMantras(goalType),
    visualizationScript: generateVisualization(raceDistance, raceName, classification),
    processGoals: generateProcessGoals(goalType, raceDistance, classification),
    duringRaceStrategies: getDuringRaceStrategies(),
    raceWeekTips: getRaceWeekTips(),
    proTactics: classification === 'professional' ? getProTactics(raceDistance) : null,
  }
}

function generateMantras(goalType: GoalType): string[] {
  const base = ['Smooth is fast. Relax the shoulders.', 'I have done the work. My body is ready.']

  const goalMantras: Record<string, string[]> = {
    finish: ['One stroke, one pedal, one step at a time.', 'I am stronger than I think.', 'Forward is a pace. Keep moving.'],
    pr: ['Trust the plan. Execute the process.', 'Discomfort is temporary. A new PR is forever.', 'This is what I trained for.'],
    ag_podium: ['Race my race. Let them come to me.', 'Discipline over emotion. Stick to the numbers.', 'I earned this spot. Now I take it.'],
    ag_win: ['Race my race. Let them come to me.', 'Discipline over emotion. Stick to the numbers.', 'I earned this spot. Now I take it.'],
    qualify_im_kona: ['Every second counts. Stay locked in.', 'I am prepared. I am relentless.', 'This is my moment. Seize it.'],
    qualify_im_703_worlds: ['Every second counts. Stay locked in.', 'I am prepared. I am relentless.', 'This is my moment. Seize it.'],
    qualify_wt_ag_worlds: ['Execute. Compete. Qualify.', 'I belong on this start line.'],
    qualify_usat_nationals: ['Execute. Compete. Qualify.', 'I belong on this start line.'],
    legacy_qualification: ['12 finishes. Each one a chapter. This is the next.', 'Consistency is my superpower.'],
    win_podium: ['I race to win. No hesitation.', 'Attack when strong. Endure when tested.'],
    pro_card_qualification: ['Today I earn it. No one gives it away.', 'Push through the line.'],
    im_pro_slot: ['This is business. Execute the plan.', 'Every watt, every second matters.'],
    pto_ranking_points: ['Rankings are built race by race. This one counts.'],
    wt_series_points: ['Smart racing. Position. Execute.'],
    prize_money: ['Race smart. Finish strong. Cash the check.'],
    course_record: ['Leave nothing on the course.', 'Pain is temporary. Records are permanent.'],
  }

  return [...base, ...(goalMantras[goalType] || goalMantras.finish)]
}

function generateVisualization(raceDistance: RaceDistance, raceName: string, classification: AthleteClassification): string {
  const isLong = raceDistance === '140.6' || raceDistance === '70.3'
  const draftLegal = isDraftLegal(raceDistance)
  const isPro = classification === 'professional'

  return `Close your eyes and take three deep breaths.

Picture yourself at ${raceName || 'the race venue'}. It's race morning. Your gear is ready, your nutrition is dialed, and your body is tapered and fresh.

THE SWIM: You walk to the water's edge.${isPro ? ' You see your competitors — you\'ve trained harder.' : ''} The horn sounds. You find clear water, settle into your rhythm. Your stroke is smooth and efficient. Breathe, sight, breathe. You exit the water feeling strong.

T1: You run to your bike. Wetsuit off, helmet on, shoes on — all rehearsed. Smooth transitions are fast transitions.

THE BIKE: You mount and find your power.${draftLegal ? ' You slot into the pack, riding smart, saving energy for the run. You respond to surges but don\'t initiate.' : ` ${isLong ? 'The miles tick by. You fuel on schedule. You stay patient through the middle miles. Discipline wins in the back half.' : 'You ride steady and strong.'}`} You approach T2 feeling ready to run.

T2: Bike racked, shoes swapped. Quick and efficient.

THE RUN: The first kilometer feels different off the bike — this is normal. You ease into your pace. ${isLong ? 'Mile by mile, you settle in. You fuel at every aid station. When it gets hard, you narrow your focus: just the next aid station.' : 'Your legs find their rhythm quickly.'} The finish line comes into view.

THE FINISH: You hear the crowd. ${raceDistance === '140.6' ? 'The announcer says your name: "You are an Ironman!"' : 'You cross the line with everything you had.'} Pride, relief, joy. You did it.

Open your eyes. That feeling is real. Race day is the celebration of the work.`
}

function generateProcessGoals(goalType: GoalType, raceDistance: RaceDistance, classification: AthleteClassification): string[] {
  const base = [
    'Execute nutrition plan without deviation',
    'Hit target pacing for each segment',
    'Stay calm through transitions — no rushing',
    'Check in with body at each aid station',
  ]

  const goalSpecific: Record<string, string[]> = {
    finish: ['Complete every segment without stopping (walking in run is OK)', 'Stay positive through the tough patches', 'Enjoy the atmosphere'],
    pr: ['Hold power/pace in the second half of the bike', 'Run a negative or even split', 'Don\'t leave time in transitions'],
    ag_podium: ['Race your own plan regardless of competitors', 'Execute T1 and T2 in under target time', 'Strong finish — empty the tank in the last 20%'],
    ag_win: ['Race your own plan regardless of competitors', 'Execute T1 and T2 in under target time', 'Strong finish — empty the tank in the last 20%'],
    qualify_im_kona: ['Every minute matters — no wasted time', 'Execute a perfect nutrition strategy', 'Mental reset at each sport change'],
    qualify_im_703_worlds: ['Every minute matters — no wasted time', 'Execute a perfect nutrition strategy', 'Mental reset at each sport change'],
    win_podium: ['Control the race when possible', 'Respond to attacks decisively', 'Save the best effort for the final push'],
    pro_card_qualification: ['Race within 10-15% of the winner', 'Stay consistent across all three disciplines', 'Don\'t blow up on the bike'],
  }

  const extra = goalSpecific[goalType] || goalSpecific.finish
  if (classification === 'professional' && isDraftLegal(raceDistance)) {
    extra.push('Maintain position in the lead pack on the bike')
  }

  return [...base, ...extra]
}

function getDuringRaceStrategies(): string[] {
  return [
    'SEGMENT FOCUS: Break the race into small chunks. Only think about the current segment.',
    'PAIN MANAGEMENT: When it hurts, narrow your focus. Count 10 strokes, 10 pedal strokes, or 10 steps.',
    'SELF-TALK: Catch negative thoughts and replace with action cues ("smooth and strong", "relax the shoulders", "light feet").',
    'BREATHING RESET: 4-count inhale, 4-count exhale to calm the nervous system.',
    'SMILE: Smiling during hard effort reduces perceived exertion by up to 2%.',
    'AID STATION ROUTINE: Grab, sip, pour (on head if hot), walk 10 steps, resume running.',
  ]
}

function getRaceWeekTips(): string[] {
  return [
    'SLEEP: Prioritize 8+ hours/night. Two nights before the race is the one that counts.',
    'VISUALIZATION: 10 minutes each day mentally walking through the race.',
    'ANXIETY: Reframe nerves as excitement. Your body\'s stress response is the same.',
    'CONTROLLABLES: Focus on nutrition, pacing, attitude, gear prep. Let go of weather and competitors.',
    'GRATITUDE: Remember why you signed up. Race day is the reward for months of work.',
    'ROUTINE: Keep daily routine as normal as possible. No new foods, stretches, or habits.',
  ]
}

function getProTactics(raceDistance: RaceDistance): string[] {
  const draftLegal = isDraftLegal(raceDistance)
  const tactics: string[] = []

  if (draftLegal) {
    tactics.push(
      'SWIM POSITIONING: Exit in the front group. Being dropped in the swim can end your race in draft-legal.',
      'PACK RIDING: Sit in the pack, recover on the bike. Don\'t pull at the front unless tactically necessary.',
      'SURGE RESPONSE: When attacks happen, respond immediately or you\'ll be gapped. Sit on the wheel.',
      'RUN SETUP: The bike is about conserving energy for the run. The run decides everything in draft-legal.',
      'POSITIONING: Stay in the top 10-15 off the bike. From there you can race the run.',
    )
  } else {
    tactics.push(
      'EARLY BIKE: Don\'t chase. Let the rabbits go. Many pros blow up chasing fast starters.',
      'PACING DISCIPLINE: Stick to your power target. The back half of the bike is where you make up places.',
      'NUTRITION EXECUTION: Pros fuel at higher rates (90-120g/hr carbs). Practice this in training.',
      'RUN PATIENCE: The Ironman run is won in miles 18-26. Be patient through mile 15.',
      'RACE INTELLIGENCE: Know the competition. Know when to push and when to sit.',
    )
  }

  return tactics
}
