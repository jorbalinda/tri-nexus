import type {
  PlanSport,
  WorkoutCategory,
  TrainingZone,
  LibraryWorkout,
  CategoryMeta,
  WorkoutInterval,
} from '@/lib/types/training-plan'

export const CATEGORY_META: Record<WorkoutCategory, CategoryMeta> = {
  lsd: { key: 'lsd', label: 'Long Slow Distance', shortLabel: 'LSD', zone: 2, color: 'emerald' },
  recovery: { key: 'recovery', label: 'Recovery', shortLabel: 'Recovery', zone: 1, color: 'sky' },
  tempo: { key: 'tempo', label: 'Tempo', shortLabel: 'Tempo', zone: 3, color: 'amber' },
  threshold: { key: 'threshold', label: 'Threshold', shortLabel: 'Threshold', zone: 4, color: 'orange' },
  vo2max: { key: 'vo2max', label: 'VO2 Max', shortLabel: 'VO2 Max', zone: 5, color: 'red' },
  sprint: { key: 'sprint', label: 'Sprint / Speed', shortLabel: 'Sprint', zone: 'max', color: 'rose' },
  brick: { key: 'brick', label: 'Brick', shortLabel: 'Brick', zone: 'mixed', color: 'violet' },
  race_pace: { key: 'race_pace', label: 'Race Pace', shortLabel: 'Race Pace', zone: 4, color: 'fuchsia' },
  hill_repeats: { key: 'hill_repeats', label: 'Hill Repeats', shortLabel: 'Hills', zone: 4, color: 'yellow' },
  fartlek: { key: 'fartlek', label: 'Fartlek', shortLabel: 'Fartlek', zone: 'mixed', color: 'teal' },
  drills: { key: 'drills', label: 'Drills & Technique', shortLabel: 'Drills', zone: 2, color: 'indigo' },
  test: { key: 'test', label: 'Test / Time Trial', shortLabel: 'Test/TT', zone: 5, color: 'slate' },
}

// ─── SWIM WORKOUTS ───────────────────────────────────────────────────────────

const swimWorkouts: LibraryWorkout[] = [
  // LSD
  {
    id: 'swim-lsd-1', sport: 'swim', category: 'lsd', name: 'Steady Endurance Swim',
    description: 'Continuous aerobic swim at a comfortable pace to build base fitness and efficiency.',
    zone: 2, duration_minutes: 60, distance_meters: 3000, rpe_range: [3, 4],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Main set', distance_meters: 2400, zone: 2, notes: 'Steady pace, focus on stroke count' },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['endurance', 'aerobic', 'base'], difficulty: 'easy',
  },
  {
    id: 'swim-lsd-2', sport: 'swim', category: 'lsd', name: 'Long Pull Set',
    description: 'Extended pull buoy session building upper body endurance and body position awareness.',
    zone: 2, duration_minutes: 70, distance_meters: 3500, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Pull set', distance_meters: 400, repeat: 6, zone: 2, rest_seconds: 15, notes: 'Pull buoy' },
      { label: 'Easy swim', distance_meters: 300, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['endurance', 'pull', 'upper body'], difficulty: 'easy',
  },
  {
    id: 'swim-lsd-3', sport: 'swim', category: 'lsd', name: 'Ironman Pace Swim',
    description: 'Long continuous swim at iron-distance race pace to simulate open water endurance.',
    zone: 2, duration_minutes: 75, distance_meters: 3800, rpe_range: [3, 4],
    structure: [
      { label: 'Warm-up', distance_meters: 300, zone: 1 },
      { label: 'Main swim', distance_meters: 3200, zone: 2, notes: 'Sight every 10 strokes' },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['endurance', 'ironman', 'open water'], difficulty: 'moderate',
  },
  // Recovery
  {
    id: 'swim-recovery-1', sport: 'swim', category: 'recovery', name: 'Easy Recovery Swim',
    description: 'Low-intensity swim focused on loosening muscles and promoting blood flow.',
    zone: 1, duration_minutes: 30, distance_meters: 1500, rpe_range: [2, 3],
    structure: [
      { label: 'Easy freestyle', distance_meters: 500, zone: 1 },
      { label: 'Backstroke', distance_meters: 400, zone: 1 },
      { label: 'Easy freestyle', distance_meters: 400, zone: 1 },
      { label: 'Choice stroke', distance_meters: 200, zone: 1 },
    ],
    tags: ['recovery', 'easy', 'active rest'], difficulty: 'easy',
  },
  {
    id: 'swim-recovery-2', sport: 'swim', category: 'recovery', name: 'Kick & Pull Recovery',
    description: 'Alternating kick and pull segments at very easy effort for active recovery.',
    zone: 1, duration_minutes: 35, distance_meters: 1800, rpe_range: [2, 3],
    structure: [
      { label: 'Easy swim', distance_meters: 300, zone: 1 },
      { label: 'Kick', distance_meters: 200, zone: 1, notes: 'With board' },
      { label: 'Pull', distance_meters: 200, zone: 1, notes: 'Pull buoy' },
      { label: 'Easy swim', distance_meters: 300, zone: 1 },
      { label: 'Kick', distance_meters: 200, zone: 1 },
      { label: 'Pull', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['recovery', 'kick', 'pull'], difficulty: 'easy',
  },
  {
    id: 'swim-recovery-3', sport: 'swim', category: 'recovery', name: 'Mixed Stroke Recovery',
    description: 'Gentle multi-stroke swim to promote recovery while working different muscle groups.',
    zone: 1, duration_minutes: 30, distance_meters: 1500, rpe_range: [1, 3],
    structure: [
      { label: 'Freestyle', distance_meters: 400, zone: 1 },
      { label: 'Backstroke', distance_meters: 300, zone: 1 },
      { label: 'Breaststroke', distance_meters: 300, zone: 1 },
      { label: 'Freestyle', distance_meters: 300, zone: 1 },
      { label: 'Choice', distance_meters: 200, zone: 1 },
    ],
    tags: ['recovery', 'multi-stroke'], difficulty: 'easy',
  },
  // Tempo
  {
    id: 'swim-tempo-1', sport: 'swim', category: 'tempo', name: 'Tempo 200s',
    description: 'Sustained tempo effort on 200m repeats to build lactate clearance and pacing.',
    zone: 3, duration_minutes: 55, distance_meters: 3000, rpe_range: [5, 6],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Drill set', distance_meters: 200, zone: 2, notes: 'Catch-up drill' },
      { label: '200m tempo', distance_meters: 200, repeat: 8, zone: 3, rest_seconds: 20 },
      { label: 'Easy', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['tempo', 'pacing', 'lactate'], difficulty: 'moderate',
  },
  {
    id: 'swim-tempo-2', sport: 'swim', category: 'tempo', name: 'Tempo Pyramid',
    description: 'Ascending then descending distances at tempo pace for sustained effort variety.',
    zone: 3, duration_minutes: 60, distance_meters: 3200, rpe_range: [5, 7],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: '100m tempo', distance_meters: 100, zone: 3, rest_seconds: 10 },
      { label: '200m tempo', distance_meters: 200, zone: 3, rest_seconds: 15 },
      { label: '300m tempo', distance_meters: 300, zone: 3, rest_seconds: 20 },
      { label: '400m tempo', distance_meters: 400, zone: 3, rest_seconds: 25 },
      { label: '300m tempo', distance_meters: 300, zone: 3, rest_seconds: 20 },
      { label: '200m tempo', distance_meters: 200, zone: 3, rest_seconds: 15 },
      { label: '100m tempo', distance_meters: 100, zone: 3, rest_seconds: 10 },
      { label: 'Easy swim', distance_meters: 400, zone: 1 },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['tempo', 'pyramid', 'pacing'], difficulty: 'moderate',
  },
  {
    id: 'swim-tempo-3', sport: 'swim', category: 'tempo', name: 'Continuous Tempo 1500',
    description: 'Sustained 1500m at tempo pace simulating Olympic distance race effort.',
    zone: 3, duration_minutes: 50, distance_meters: 2800, rpe_range: [5, 6],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Build 4×50', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: 'Tempo swim', distance_meters: 1500, zone: 3, notes: 'Steady tempo, negative split if possible' },
      { label: 'Easy', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['tempo', 'olympic', 'continuous'], difficulty: 'moderate',
  },
  // Threshold
  {
    id: 'swim-threshold-1', sport: 'swim', category: 'threshold', name: 'Threshold 100s',
    description: 'Short threshold repeats with minimal rest to push lactate threshold higher.',
    zone: 4, duration_minutes: 50, distance_meters: 2800, rpe_range: [6, 8],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Build 4×75', distance_meters: 75, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: '100m @threshold', distance_meters: 100, repeat: 10, zone: 4, rest_seconds: 15 },
      { label: 'Easy 200', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['threshold', 'intervals', 'speed endurance'], difficulty: 'hard',
  },
  {
    id: 'swim-threshold-2', sport: 'swim', category: 'threshold', name: 'Broken 400s Threshold',
    description: 'Threshold pace 400s broken into 100s with short rest to maintain quality.',
    zone: 4, duration_minutes: 55, distance_meters: 3000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Drill', distance_meters: 200, zone: 2, notes: 'Fingertip drag drill' },
      { label: '4×100 @threshold', distance_meters: 100, repeat: 4, zone: 4, rest_seconds: 10, notes: 'Set 1 - hold pace' },
      { label: 'Rest', duration_minutes: 1 },
      { label: '4×100 @threshold', distance_meters: 100, repeat: 4, zone: 4, rest_seconds: 10, notes: 'Set 2' },
      { label: 'Rest', duration_minutes: 1 },
      { label: '4×100 @threshold', distance_meters: 100, repeat: 4, zone: 4, rest_seconds: 10, notes: 'Set 3' },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['threshold', 'broken', 'race prep'], difficulty: 'hard',
  },
  {
    id: 'swim-threshold-3', sport: 'swim', category: 'threshold', name: 'Descending Threshold Set',
    description: 'Descending interval lengths at threshold to build fatigue resistance.',
    zone: 4, duration_minutes: 50, distance_meters: 2600, rpe_range: [6, 8],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: '400m threshold', distance_meters: 400, zone: 4, rest_seconds: 30 },
      { label: '300m threshold', distance_meters: 300, zone: 4, rest_seconds: 25 },
      { label: '200m threshold', distance_meters: 200, zone: 4, rest_seconds: 20 },
      { label: '100m threshold', distance_meters: 100, zone: 4, rest_seconds: 15 },
      { label: 'Easy', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['threshold', 'descending', 'speed endurance'], difficulty: 'hard',
  },
  // VO2 Max
  {
    id: 'swim-vo2max-1', sport: 'swim', category: 'vo2max', name: 'VO2 Max 50s',
    description: 'High-intensity 50m repeats at maximum aerobic effort to boost VO2 max.',
    zone: 5, duration_minutes: 45, distance_meters: 2400, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Build 4×50', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: '50m max aerobic', distance_meters: 50, repeat: 12, zone: 5, rest_seconds: 30 },
      { label: 'Easy', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['vo2max', 'high intensity', 'speed'], difficulty: 'very_hard',
  },
  {
    id: 'swim-vo2max-2', sport: 'swim', category: 'vo2max', name: 'VO2 Max 100s',
    description: 'Longer VO2 max intervals at near-race pace to improve aerobic ceiling.',
    zone: 5, duration_minutes: 50, distance_meters: 2800, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Activation 4×50', distance_meters: 50, repeat: 4, zone: 3, rest_seconds: 10 },
      { label: '100m VO2 max', distance_meters: 100, repeat: 8, zone: 5, rest_seconds: 45 },
      { label: 'Easy', distance_meters: 300, zone: 1 },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['vo2max', 'race pace', 'intensity'], difficulty: 'very_hard',
  },
  {
    id: 'swim-vo2max-3', sport: 'swim', category: 'vo2max', name: 'VO2 Max Ladder',
    description: 'Ascending distances at VO2 max effort for progressive overload.',
    zone: 5, duration_minutes: 50, distance_meters: 2600, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: '50m fast', distance_meters: 50, repeat: 2, zone: 5, rest_seconds: 20 },
      { label: '75m fast', distance_meters: 75, repeat: 2, zone: 5, rest_seconds: 25 },
      { label: '100m fast', distance_meters: 100, repeat: 2, zone: 5, rest_seconds: 30 },
      { label: '150m fast', distance_meters: 150, repeat: 2, zone: 5, rest_seconds: 40 },
      { label: 'Easy', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['vo2max', 'ladder', 'progressive'], difficulty: 'very_hard',
  },
  // Sprint
  {
    id: 'swim-sprint-1', sport: 'swim', category: 'sprint', name: 'All-Out 25s',
    description: 'Maximum effort 25m sprints developing neuromuscular speed and power.',
    zone: 'max', duration_minutes: 40, distance_meters: 2000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Build 4×50', distance_meters: 50, repeat: 4, zone: 3, rest_seconds: 10 },
      { label: '25m sprint', distance_meters: 25, repeat: 12, zone: 'max', rest_seconds: 45, notes: 'All-out effort, dive start if possible' },
      { label: 'Easy', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['sprint', 'speed', 'power'], difficulty: 'very_hard',
  },
  {
    id: 'swim-sprint-2', sport: 'swim', category: 'sprint', name: 'Sprint 50s',
    description: 'Fast 50m repeats with full recovery to develop speed endurance.',
    zone: 'max', duration_minutes: 45, distance_meters: 2400, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Activation', distance_meters: 200, zone: 3 },
      { label: '50m sprint', distance_meters: 50, repeat: 10, zone: 'max', rest_seconds: 60 },
      { label: 'Easy', distance_meters: 300, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['sprint', 'speed', 'anaerobic'], difficulty: 'very_hard',
  },
  {
    id: 'swim-sprint-3', sport: 'swim', category: 'sprint', name: 'Race Start Practice',
    description: 'Sprint starts and fast 75m repeats to sharpen race-day opening speed.',
    zone: 'max', duration_minutes: 45, distance_meters: 2200, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Build 4×50', distance_meters: 50, repeat: 4, zone: 3, rest_seconds: 10 },
      { label: '75m race start', distance_meters: 75, repeat: 8, zone: 'max', rest_seconds: 60, notes: 'Simulate race start, fast first 25m' },
      { label: 'Easy', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['sprint', 'race start', 'speed'], difficulty: 'very_hard',
  },
  // Race Pace
  {
    id: 'swim-race_pace-1', sport: 'swim', category: 'race_pace', name: 'Olympic Race Pace',
    description: '1500m broken at Olympic triathlon race pace to dial in pacing strategy.',
    zone: 4, duration_minutes: 50, distance_meters: 2800, rpe_range: [6, 8],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Activation 4×50', distance_meters: 50, repeat: 4, zone: 3, rest_seconds: 10 },
      { label: '500m race pace', distance_meters: 500, repeat: 3, zone: 4, rest_seconds: 30, notes: 'Olympic tri target pace' },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['race pace', 'olympic', 'triathlon'], difficulty: 'hard',
  },
  {
    id: 'swim-race_pace-2', sport: 'swim', category: 'race_pace', name: 'Sprint Tri Race Pace',
    description: 'Race pace simulation for sprint triathlon 750m swim distance.',
    zone: 4, duration_minutes: 40, distance_meters: 2200, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Build 4×50', distance_meters: 50, repeat: 4, zone: 3, rest_seconds: 10 },
      { label: '750m race pace', distance_meters: 750, zone: 4, rest_seconds: 60, notes: 'Sprint tri target pace' },
      { label: 'Easy 200', distance_meters: 200, zone: 1 },
      { label: '750m race pace', distance_meters: 750, zone: 4, notes: 'Negative split' },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['race pace', 'sprint tri', 'simulation'], difficulty: 'hard',
  },
  {
    id: 'swim-race_pace-3', sport: 'swim', category: 'race_pace', name: 'Half-Iron Race Simulation',
    description: '1900m at half-Ironman race pace to build confidence and pacing.',
    zone: 4, duration_minutes: 55, distance_meters: 3000, rpe_range: [6, 7],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: '1900m race pace', distance_meters: 1900, zone: 4, notes: 'Half-iron pace, sight every 8 strokes' },
      { label: 'Easy', distance_meters: 300, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['race pace', 'half ironman', '70.3'], difficulty: 'hard',
  },
  // Fartlek
  {
    id: 'swim-fartlek-1', sport: 'swim', category: 'fartlek', name: 'Swim Fartlek Mix',
    description: 'Alternating fast and easy lengths for unstructured speed play in the pool.',
    zone: 'mixed', duration_minutes: 45, distance_meters: 2500, rpe_range: [4, 8],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Fast 50 / Easy 50', distance_meters: 100, repeat: 10, zone: 'mixed', rest_seconds: 10, notes: 'Alternate fast and easy 50s' },
      { label: 'Easy swim', distance_meters: 200, zone: 1 },
      { label: 'Fast 25 / Easy 75', distance_meters: 100, repeat: 6, zone: 'mixed', rest_seconds: 10 },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['fartlek', 'speed play', 'variety'], difficulty: 'moderate',
  },
  {
    id: 'swim-fartlek-2', sport: 'swim', category: 'fartlek', name: 'Descend Each 100',
    description: 'Sets of 100s where each one gets faster, building to race pace.',
    zone: 'mixed', duration_minutes: 50, distance_meters: 2800, rpe_range: [4, 8],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: '4×100 descend 1-4', distance_meters: 100, repeat: 4, zone: 'mixed', rest_seconds: 15, notes: 'Set 1: get faster each 100' },
      { label: 'Easy 100', distance_meters: 100, zone: 1 },
      { label: '4×100 descend 1-4', distance_meters: 100, repeat: 4, zone: 'mixed', rest_seconds: 15, notes: 'Set 2' },
      { label: 'Easy 100', distance_meters: 100, zone: 1 },
      { label: '4×100 descend 1-4', distance_meters: 100, repeat: 4, zone: 'mixed', rest_seconds: 15, notes: 'Set 3' },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['fartlek', 'descend', 'progressive'], difficulty: 'moderate',
  },
  {
    id: 'swim-fartlek-3', sport: 'swim', category: 'fartlek', name: 'Broken Medley Fartlek',
    description: 'Mixed stroke and pace play for fun variety and working different energy systems.',
    zone: 'mixed', duration_minutes: 45, distance_meters: 2400, rpe_range: [4, 7],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Fast fly 25 + easy free 75', distance_meters: 100, repeat: 4, zone: 'mixed', rest_seconds: 15 },
      { label: 'Fast back 50 + easy free 50', distance_meters: 100, repeat: 4, zone: 'mixed', rest_seconds: 15 },
      { label: 'Fast breast 25 + easy free 75', distance_meters: 100, repeat: 4, zone: 'mixed', rest_seconds: 15 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['fartlek', 'medley', 'multi-stroke'], difficulty: 'moderate',
  },
  // Drills (swim gets extra since no hills/bricks)
  {
    id: 'swim-drills-1', sport: 'swim', category: 'drills', name: 'Catch & Pull Drills',
    description: 'Focused drill session on the catch phase and pull-through for stroke efficiency.',
    zone: 2, duration_minutes: 45, distance_meters: 2200, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Catch-up drill', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: 'Fingertip drag', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: 'Fist drill', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: 'Swim with focus', distance_meters: 100, repeat: 4, zone: 2, rest_seconds: 10, notes: 'Apply drill cues' },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['drills', 'technique', 'catch', 'pull'], difficulty: 'easy',
  },
  {
    id: 'swim-drills-2', sport: 'swim', category: 'drills', name: 'Kick & Body Position',
    description: 'Drill session targeting kick timing and streamlined body position.',
    zone: 2, duration_minutes: 45, distance_meters: 2000, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Side kick drill', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 15 },
      { label: 'Vertical kick', duration_minutes: 1, repeat: 4, zone: 3, rest_seconds: 30, notes: '30s on, 30s rest' },
      { label: '6-kick switch', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: 'Streamline kick', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10 },
      { label: 'Swim with kick focus', distance_meters: 200, repeat: 2, zone: 2, rest_seconds: 15 },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['drills', 'kick', 'body position'], difficulty: 'easy',
  },
  {
    id: 'swim-drills-3', sport: 'swim', category: 'drills', name: 'Bilateral Breathing Drills',
    description: 'Breathing pattern work to improve bilateral balance and oxygen efficiency.',
    zone: 2, duration_minutes: 40, distance_meters: 2000, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Breathe every 3', distance_meters: 200, zone: 2, notes: 'Bilateral' },
      { label: 'Breathe every 5', distance_meters: 100, repeat: 4, zone: 2, rest_seconds: 15 },
      { label: 'Breathe every 7', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 15 },
      { label: 'Normal breathing', distance_meters: 200, zone: 2 },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['drills', 'breathing', 'bilateral'], difficulty: 'easy',
  },
  {
    id: 'swim-drills-4', sport: 'swim', category: 'drills', name: 'Open Water Skills',
    description: 'Sighting, drafting simulation, and navigation drills for race preparation.',
    zone: 2, duration_minutes: 45, distance_meters: 2200, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Sighting drill', distance_meters: 100, repeat: 4, zone: 2, rest_seconds: 10, notes: 'Head up every 6 strokes' },
      { label: 'Tarzan swim', distance_meters: 50, repeat: 4, zone: 3, rest_seconds: 15, notes: 'Head up, water polo style' },
      { label: 'Pack swim sim', distance_meters: 200, repeat: 3, zone: 3, rest_seconds: 20, notes: 'Close to lane line' },
      { label: 'Cool-down', distance_meters: 300, zone: 1 },
    ],
    tags: ['drills', 'open water', 'sighting'], difficulty: 'moderate',
  },
  {
    id: 'swim-drills-5', sport: 'swim', category: 'drills', name: 'Stroke Counting Session',
    description: 'Distance per stroke optimization by counting and reducing strokes per length.',
    zone: 2, duration_minutes: 40, distance_meters: 2000, rpe_range: [3, 4],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Count strokes per 50', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 10, notes: 'Record count' },
      { label: 'Reduce by 1 stroke', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 15, notes: 'Glide more' },
      { label: 'Reduce by 2 strokes', distance_meters: 50, repeat: 4, zone: 2, rest_seconds: 15 },
      { label: 'Swim normal applying cues', distance_meters: 200, repeat: 2, zone: 2, rest_seconds: 10 },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['drills', 'stroke count', 'efficiency'], difficulty: 'easy',
  },
  {
    id: 'swim-drills-6', sport: 'swim', category: 'drills', name: 'Turns & Transitions',
    description: 'Flip turn technique and T-pace wall work for faster transitions in the pool.',
    zone: 2, duration_minutes: 40, distance_meters: 2000, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', distance_meters: 400, zone: 2 },
      { label: 'Flip turn focus 50s', distance_meters: 50, repeat: 8, zone: 2, rest_seconds: 10, notes: 'Focus on tight streamline off wall' },
      { label: 'Breakout speed 25s', distance_meters: 25, repeat: 8, zone: 3, rest_seconds: 15, notes: '3 dolphin kicks off wall' },
      { label: 'Full swim with turn focus', distance_meters: 200, repeat: 2, zone: 2, rest_seconds: 15 },
      { label: 'Cool-down', distance_meters: 200, zone: 1 },
    ],
    tags: ['drills', 'turns', 'walls'], difficulty: 'easy',
  },
  // Test
  {
    id: 'swim-test-1', sport: 'swim', category: 'test', name: 'CSS Test (Critical Swim Speed)',
    description: 'Timed 400m and 200m to calculate Critical Swim Speed for training zones.',
    zone: 5, duration_minutes: 40, distance_meters: 1800, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', distance_meters: 600, zone: 2 },
      { label: '400m time trial', distance_meters: 400, zone: 5, notes: 'All-out, record time' },
      { label: 'Rest', duration_minutes: 5 },
      { label: '200m time trial', distance_meters: 200, zone: 5, notes: 'All-out, record time' },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['test', 'CSS', 'benchmark'], difficulty: 'very_hard',
  },
  {
    id: 'swim-test-2', sport: 'swim', category: 'test', name: 'T-Pace Test (3×300)',
    description: 'Three 300m repeats to establish threshold pace for structured training.',
    zone: 5, duration_minutes: 45, distance_meters: 2200, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', distance_meters: 500, zone: 2 },
      { label: '300m TT', distance_meters: 300, repeat: 3, zone: 5, rest_seconds: 60, notes: 'Best consistent effort, record times' },
      { label: 'Easy swim', distance_meters: 200, zone: 1 },
      { label: 'Cool-down', distance_meters: 400, zone: 1 },
    ],
    tags: ['test', 'T-pace', 'threshold test'], difficulty: 'very_hard',
  },
]

// ─── BIKE WORKOUTS ───────────────────────────────────────────────────────────

const bikeWorkouts: LibraryWorkout[] = [
  // LSD
  {
    id: 'bike-lsd-1', sport: 'bike', category: 'lsd', name: 'Endurance Base Ride',
    description: 'Long steady ride at conversational pace to build aerobic base and fat oxidation.',
    zone: 2, duration_minutes: 150, distance_meters: 60000, rpe_range: [3, 4],
    structure: [
      { label: 'Easy spin warm-up', duration_minutes: 15, zone: 1 },
      { label: 'Steady endurance', duration_minutes: 120, zone: 2, notes: 'Cadence 85-95 rpm' },
      { label: 'Cool-down spin', duration_minutes: 15, zone: 1 },
    ],
    tags: ['endurance', 'base', 'aerobic'], difficulty: 'moderate',
  },
  {
    id: 'bike-lsd-2', sport: 'bike', category: 'lsd', name: 'Long Weekend Ride',
    description: 'Extended weekend ride building muscular endurance and time in saddle.',
    zone: 2, duration_minutes: 210, distance_meters: 90000, rpe_range: [3, 4],
    structure: [
      { label: 'Warm-up', duration_minutes: 20, zone: 1 },
      { label: 'Endurance effort', duration_minutes: 170, zone: 2, notes: 'Nutrition every 30 min' },
      { label: 'Cool-down', duration_minutes: 20, zone: 1 },
    ],
    tags: ['endurance', 'long ride', 'weekend'], difficulty: 'moderate',
  },
  {
    id: 'bike-lsd-3', sport: 'bike', category: 'lsd', name: 'Iron-Distance Base Ride',
    description: 'Very long ride simulating the demands of an Ironman bike leg.',
    zone: 2, duration_minutes: 300, distance_meters: 140000, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', duration_minutes: 20, zone: 1 },
      { label: 'Endurance', duration_minutes: 260, zone: 2, notes: 'Practice race nutrition plan' },
      { label: 'Cool-down', duration_minutes: 20, zone: 1 },
    ],
    tags: ['endurance', 'ironman', 'ultra'], difficulty: 'hard',
  },
  // Recovery
  {
    id: 'bike-recovery-1', sport: 'bike', category: 'recovery', name: 'Easy Spin Recovery',
    description: 'Very easy spin to flush legs and promote recovery without additional fatigue.',
    zone: 1, duration_minutes: 45, distance_meters: 20000, rpe_range: [1, 3],
    structure: [
      { label: 'Easy spin', duration_minutes: 45, zone: 1, notes: 'High cadence 90-100, low gear' },
    ],
    tags: ['recovery', 'easy', 'spin'], difficulty: 'easy',
  },
  {
    id: 'bike-recovery-2', sport: 'bike', category: 'recovery', name: 'Coffee Ride',
    description: 'Social-pace ride keeping heart rate in zone 1 for active recovery.',
    zone: 1, duration_minutes: 60, distance_meters: 25000, rpe_range: [2, 3],
    structure: [
      { label: 'Easy ride', duration_minutes: 60, zone: 1, notes: 'Conversational pace, flat route' },
    ],
    tags: ['recovery', 'social', 'easy'], difficulty: 'easy',
  },
  {
    id: 'bike-recovery-3', sport: 'bike', category: 'recovery', name: 'Openers Spin',
    description: 'Recovery ride with a few short openers to keep legs fresh before race day.',
    zone: 1, duration_minutes: 40, distance_meters: 18000, rpe_range: [2, 4],
    structure: [
      { label: 'Easy spin', duration_minutes: 15, zone: 1 },
      { label: 'Opener', duration_minutes: 1, repeat: 3, zone: 3, rest_seconds: 120, notes: '30s pickup to zone 3' },
      { label: 'Easy spin', duration_minutes: 15, zone: 1 },
    ],
    tags: ['recovery', 'openers', 'pre-race'], difficulty: 'easy',
  },
  // Tempo
  {
    id: 'bike-tempo-1', sport: 'bike', category: 'tempo', name: 'Steady State Tempo',
    description: 'Sustained tempo effort to develop muscular endurance and lactate clearance.',
    zone: 3, duration_minutes: 75, distance_meters: 35000, rpe_range: [5, 6],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Tempo effort', duration_minutes: 45, zone: 3, notes: 'Steady power, cadence 85-90' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['tempo', 'steady state', 'power'], difficulty: 'moderate',
  },
  {
    id: 'bike-tempo-2', sport: 'bike', category: 'tempo', name: 'Tempo Intervals',
    description: '3×15min tempo blocks with recovery to build sustained effort capacity.',
    zone: 3, duration_minutes: 80, distance_meters: 38000, rpe_range: [5, 7],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Tempo block', duration_minutes: 15, repeat: 3, zone: 3, rest_seconds: 300 },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['tempo', 'intervals', 'power'], difficulty: 'moderate',
  },
  {
    id: 'bike-tempo-3', sport: 'bike', category: 'tempo', name: 'Progressive Tempo Ride',
    description: 'Gradually increasing intensity from zone 2 to zone 3 over the ride.',
    zone: 3, duration_minutes: 90, distance_meters: 42000, rpe_range: [4, 7],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 1 },
      { label: 'Endurance', duration_minutes: 20, zone: 2 },
      { label: 'Low tempo', duration_minutes: 20, zone: 3, notes: 'Lower end of zone 3' },
      { label: 'High tempo', duration_minutes: 20, zone: 3, notes: 'Upper end of zone 3' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['tempo', 'progressive', 'build'], difficulty: 'moderate',
  },
  // Threshold
  {
    id: 'bike-threshold-1', sport: 'bike', category: 'threshold', name: 'FTP Intervals (2×20)',
    description: 'Classic 2×20min at FTP to build sustainable race power.',
    zone: 4, duration_minutes: 75, distance_meters: 36000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'FTP interval', duration_minutes: 20, repeat: 2, zone: 4, rest_seconds: 300, notes: '95-100% FTP' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['threshold', 'FTP', 'power'], difficulty: 'hard',
  },
  {
    id: 'bike-threshold-2', sport: 'bike', category: 'threshold', name: 'Over-Under Intervals',
    description: 'Alternating above and below threshold to improve lactate clearance under fatigue.',
    zone: 4, duration_minutes: 80, distance_meters: 38000, rpe_range: [7, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: '2min over (105% FTP)', duration_minutes: 2, zone: 5, notes: 'Over: 105% FTP' },
      { label: '3min under (90% FTP)', duration_minutes: 3, zone: 3, notes: 'Under: 90% FTP' },
      { label: '2min over', duration_minutes: 2, zone: 5 },
      { label: '3min under', duration_minutes: 3, zone: 3 },
      { label: 'Recovery', duration_minutes: 5, zone: 1 },
      { label: '2min over', duration_minutes: 2, zone: 5 },
      { label: '3min under', duration_minutes: 3, zone: 3 },
      { label: '2min over', duration_minutes: 2, zone: 5 },
      { label: '3min under', duration_minutes: 3, zone: 3 },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['threshold', 'over-under', 'lactate'], difficulty: 'very_hard',
  },
  {
    id: 'bike-threshold-3', sport: 'bike', category: 'threshold', name: 'Threshold Cruise',
    description: 'Long sustained threshold effort to build race-day power durability.',
    zone: 4, duration_minutes: 70, distance_meters: 34000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Threshold cruise', duration_minutes: 40, zone: 4, notes: 'Steady FTP, aero position' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['threshold', 'sustained', 'FTP'], difficulty: 'hard',
  },
  // VO2 Max
  {
    id: 'bike-vo2max-1', sport: 'bike', category: 'vo2max', name: 'VO2 Max 3-Minute Intervals',
    description: 'Classic 3min intervals at 115-120% FTP to push aerobic ceiling.',
    zone: 5, duration_minutes: 70, distance_meters: 32000, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: '3min VO2 max', duration_minutes: 3, repeat: 5, zone: 5, rest_seconds: 180, notes: '115-120% FTP' },
      { label: 'Easy spin', duration_minutes: 10, zone: 1 },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['vo2max', 'intervals', 'high intensity'], difficulty: 'very_hard',
  },
  {
    id: 'bike-vo2max-2', sport: 'bike', category: 'vo2max', name: 'Tabata-Style Bike',
    description: 'Short maximal efforts to improve both aerobic and anaerobic capacity.',
    zone: 5, duration_minutes: 55, distance_meters: 25000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Build', duration_minutes: 5, zone: 3 },
      { label: '40s max / 20s rest', duration_minutes: 1, repeat: 8, zone: 'max', rest_seconds: 120, notes: 'Set 1' },
      { label: 'Recovery', duration_minutes: 5, zone: 1 },
      { label: '40s max / 20s rest', duration_minutes: 1, repeat: 8, zone: 'max', rest_seconds: 120, notes: 'Set 2' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['vo2max', 'tabata', 'anaerobic'], difficulty: 'very_hard',
  },
  {
    id: 'bike-vo2max-3', sport: 'bike', category: 'vo2max', name: 'VO2 Max Pyramid',
    description: 'Ascending then descending VO2 max intervals for varied stimulus.',
    zone: 5, duration_minutes: 70, distance_meters: 30000, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: '1min VO2', duration_minutes: 1, zone: 5, rest_seconds: 60 },
      { label: '2min VO2', duration_minutes: 2, zone: 5, rest_seconds: 120 },
      { label: '3min VO2', duration_minutes: 3, zone: 5, rest_seconds: 180 },
      { label: '4min VO2', duration_minutes: 4, zone: 5, rest_seconds: 240 },
      { label: '3min VO2', duration_minutes: 3, zone: 5, rest_seconds: 180 },
      { label: '2min VO2', duration_minutes: 2, zone: 5, rest_seconds: 120 },
      { label: '1min VO2', duration_minutes: 1, zone: 5 },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['vo2max', 'pyramid', 'progressive'], difficulty: 'very_hard',
  },
  // Sprint
  {
    id: 'bike-sprint-1', sport: 'bike', category: 'sprint', name: 'Neuromuscular Sprints',
    description: 'Short all-out sprints developing peak power and neuromuscular recruitment.',
    zone: 'max', duration_minutes: 60, distance_meters: 28000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Build', duration_minutes: 5, zone: 3 },
      { label: '15s all-out sprint', duration_minutes: 1, repeat: 8, zone: 'max', rest_seconds: 180, notes: 'Max power, seated then standing' },
      { label: 'Easy spin', duration_minutes: 10, zone: 1 },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['sprint', 'power', 'neuromuscular'], difficulty: 'very_hard',
  },
  {
    id: 'bike-sprint-2', sport: 'bike', category: 'sprint', name: 'Standing Start Sprints',
    description: 'Standing start max efforts simulating race attacks and accelerations.',
    zone: 'max', duration_minutes: 55, distance_meters: 24000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Activation', duration_minutes: 5, zone: 3 },
      { label: '20s standing sprint', duration_minutes: 1, repeat: 6, zone: 'max', rest_seconds: 240, notes: 'Start from near stop, big gear' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['sprint', 'standing start', 'acceleration'], difficulty: 'very_hard',
  },
  {
    id: 'bike-sprint-3', sport: 'bike', category: 'sprint', name: 'Sprint Finish Practice',
    description: 'Longer sprint efforts simulating a race finish kick.',
    zone: 'max', duration_minutes: 60, distance_meters: 28000, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Tempo ride', duration_minutes: 15, zone: 3 },
      { label: '30s sprint finish', duration_minutes: 1, repeat: 5, zone: 'max', rest_seconds: 300, notes: 'Build into full sprint' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['sprint', 'race finish', 'kick'], difficulty: 'very_hard',
  },
  // Brick
  {
    id: 'bike-brick-1', sport: 'bike', category: 'brick', name: 'Olympic Brick Simulation',
    description: 'Bike at race effort followed by a quick transition to running shoes.',
    zone: 'mixed', duration_minutes: 90, distance_meters: 40000, rpe_range: [6, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Race effort bike', duration_minutes: 60, zone: 3, notes: 'Olympic distance intensity' },
      { label: 'High effort final 10min', duration_minutes: 10, zone: 4, notes: 'Push before T2' },
      { label: 'Transition', duration_minutes: 2, notes: 'Quick change to run gear' },
      { label: 'Run off bike', duration_minutes: 15, zone: 3, notes: 'Find your run legs' },
    ],
    tags: ['brick', 'olympic', 'transition'], difficulty: 'hard',
  },
  {
    id: 'bike-brick-2', sport: 'bike', category: 'brick', name: 'Short Brick Repeats',
    description: 'Multiple short bike-to-run transitions to practice finding run legs quickly.',
    zone: 'mixed', duration_minutes: 75, distance_meters: 30000, rpe_range: [5, 8],
    structure: [
      { label: 'Warm-up ride', duration_minutes: 10, zone: 2 },
      { label: 'Hard bike', duration_minutes: 10, zone: 4 },
      { label: 'Transition + run', duration_minutes: 5, zone: 3, notes: 'Quick T2, 5min run' },
      { label: 'Ride back', duration_minutes: 5, zone: 2 },
      { label: 'Hard bike', duration_minutes: 10, zone: 4 },
      { label: 'Transition + run', duration_minutes: 5, zone: 3 },
      { label: 'Ride back', duration_minutes: 5, zone: 2 },
      { label: 'Hard bike', duration_minutes: 10, zone: 4 },
      { label: 'Transition + run', duration_minutes: 5, zone: 3 },
      { label: 'Cool-down ride', duration_minutes: 10, zone: 1 },
    ],
    tags: ['brick', 'repeats', 'transition'], difficulty: 'hard',
  },
  // Race Pace
  {
    id: 'bike-race_pace-1', sport: 'bike', category: 'race_pace', name: 'Olympic Race Power',
    description: 'Sustained effort at target Olympic triathlon bike power/pace.',
    zone: 4, duration_minutes: 75, distance_meters: 40000, rpe_range: [6, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Race power effort', duration_minutes: 55, zone: 4, notes: 'Target race watts, aero position' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['race pace', 'olympic', 'power'], difficulty: 'hard',
  },
  {
    id: 'bike-race_pace-2', sport: 'bike', category: 'race_pace', name: '70.3 Race Simulation',
    description: 'Half-Ironman bike pace with nutrition practice over 90km.',
    zone: 4, duration_minutes: 165, distance_meters: 90000, rpe_range: [5, 7],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: '70.3 race pace', duration_minutes: 135, zone: 4, notes: 'Target 70.3 watts, nutrition every 20min' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['race pace', '70.3', 'half ironman'], difficulty: 'hard',
  },
  {
    id: 'bike-race_pace-3', sport: 'bike', category: 'race_pace', name: 'Sprint Tri Bike Effort',
    description: 'Short high-intensity effort at sprint triathlon bike pace.',
    zone: 4, duration_minutes: 50, distance_meters: 25000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Sprint tri effort', duration_minutes: 30, zone: 4, notes: 'Above Olympic power, aero tuck' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['race pace', 'sprint tri', 'high power'], difficulty: 'hard',
  },
  // Hill Repeats
  {
    id: 'bike-hill_repeats-1', sport: 'bike', category: 'hill_repeats', name: 'Hill Repeat Power',
    description: 'Climbing repeats on a 5-8% grade to build strength and threshold power.',
    zone: 4, duration_minutes: 75, distance_meters: 32000, rpe_range: [7, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Hill climb', duration_minutes: 5, repeat: 5, zone: 4, rest_seconds: 300, notes: '5-8% grade, seated' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['hills', 'climbing', 'strength'], difficulty: 'hard',
  },
  {
    id: 'bike-hill_repeats-2', sport: 'bike', category: 'hill_repeats', name: 'Short Steep Climbs',
    description: 'Short steep hill efforts developing explosive climbing power.',
    zone: 4, duration_minutes: 65, distance_meters: 28000, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Steep climb', duration_minutes: 2, repeat: 8, zone: 5, rest_seconds: 180, notes: '8-12% grade, mix seated/standing' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['hills', 'steep', 'power'], difficulty: 'very_hard',
  },
  {
    id: 'bike-hill_repeats-3', sport: 'bike', category: 'hill_repeats', name: 'Long Climb Repeats',
    description: 'Extended climbing intervals building sustained climbing endurance.',
    zone: 4, duration_minutes: 90, distance_meters: 38000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Long climb', duration_minutes: 10, repeat: 3, zone: 4, rest_seconds: 480, notes: '4-6% grade, steady cadence 70-80' },
      { label: 'Cool-down', duration_minutes: 20, zone: 1 },
    ],
    tags: ['hills', 'long climb', 'endurance'], difficulty: 'hard',
  },
  // Fartlek
  {
    id: 'bike-fartlek-1', sport: 'bike', category: 'fartlek', name: 'Terrain Fartlek Ride',
    description: 'Unstructured ride using terrain to vary intensity naturally.',
    zone: 'mixed', duration_minutes: 75, distance_meters: 35000, rpe_range: [4, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Fartlek ride', duration_minutes: 55, zone: 'mixed', notes: 'Push on hills, recover on flats, sprint signs/landmarks' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['fartlek', 'terrain', 'variety'], difficulty: 'moderate',
  },
  {
    id: 'bike-fartlek-2', sport: 'bike', category: 'fartlek', name: 'Surge Fartlek',
    description: 'Random surges within an endurance ride to simulate race dynamics.',
    zone: 'mixed', duration_minutes: 80, distance_meters: 38000, rpe_range: [4, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Endurance with surges', duration_minutes: 60, zone: 'mixed', notes: '1-2min surges to zone 4-5 every 8-10min, zone 2 between' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['fartlek', 'surges', 'race simulation'], difficulty: 'moderate',
  },
  {
    id: 'bike-fartlek-3', sport: 'bike', category: 'fartlek', name: 'Cadence Play Ride',
    description: 'Varying cadence and power throughout the ride for neuromuscular variety.',
    zone: 'mixed', duration_minutes: 70, distance_meters: 32000, rpe_range: [4, 7],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'High cadence 110+ rpm', duration_minutes: 3, zone: 3, rest_seconds: 180 },
      { label: 'Low cadence 60-65 rpm', duration_minutes: 3, zone: 3, rest_seconds: 180 },
      { label: 'High cadence 110+ rpm', duration_minutes: 3, zone: 3, rest_seconds: 180 },
      { label: 'Low cadence 60-65 rpm', duration_minutes: 3, zone: 3, rest_seconds: 180 },
      { label: 'Self-selected cadence', duration_minutes: 15, zone: 2 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['fartlek', 'cadence', 'neuromuscular'], difficulty: 'moderate',
  },
  // Drills
  {
    id: 'bike-drills-1', sport: 'bike', category: 'drills', name: 'Single-Leg Pedaling',
    description: 'Isolated leg drills to improve pedal stroke efficiency and eliminate dead spots.',
    zone: 2, duration_minutes: 60, distance_meters: 25000, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Right leg only', duration_minutes: 2, repeat: 4, zone: 2, rest_seconds: 60, notes: 'Left foot unclipped' },
      { label: 'Left leg only', duration_minutes: 2, repeat: 4, zone: 2, rest_seconds: 60, notes: 'Right foot unclipped' },
      { label: 'Both legs focus', duration_minutes: 10, zone: 2, notes: 'Apply smooth stroke' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['drills', 'pedal stroke', 'technique'], difficulty: 'easy',
  },
  {
    id: 'bike-drills-2', sport: 'bike', category: 'drills', name: 'Cadence Drills',
    description: 'High and low cadence drills to expand effective cadence range.',
    zone: 2, duration_minutes: 55, distance_meters: 24000, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Spin-ups to 120+ rpm', duration_minutes: 1, repeat: 5, zone: 2, rest_seconds: 120, notes: 'Gradually increase cadence' },
      { label: 'Slow grind 55-60 rpm', duration_minutes: 3, repeat: 3, zone: 3, rest_seconds: 120, notes: 'Big gear, smooth' },
      { label: 'Normal cadence ride', duration_minutes: 10, zone: 2 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['drills', 'cadence', 'efficiency'], difficulty: 'easy',
  },
  {
    id: 'bike-drills-3', sport: 'bike', category: 'drills', name: 'Aero Position Practice',
    description: 'Time in aero position with form checks to improve comfort and aerodynamics.',
    zone: 2, duration_minutes: 60, distance_meters: 28000, rpe_range: [3, 5],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Aero hold', duration_minutes: 5, repeat: 6, zone: 2, rest_seconds: 120, notes: 'Hands in aero bars, flat back, relaxed shoulders' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['drills', 'aero', 'position'], difficulty: 'easy',
  },
  // Test
  {
    id: 'bike-test-1', sport: 'bike', category: 'test', name: 'FTP Test (20-Minute)',
    description: 'Standard 20-minute FTP test to establish training power zones.',
    zone: 5, duration_minutes: 60, distance_meters: 28000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: 'Build 3×1min', duration_minutes: 1, repeat: 3, zone: 3, rest_seconds: 60 },
      { label: '5min blow-out', duration_minutes: 5, zone: 5, notes: 'Clear legs' },
      { label: 'Recovery', duration_minutes: 5, zone: 1 },
      { label: '20min FTP test', duration_minutes: 20, zone: 5, notes: 'Maximal sustainable effort, record avg power' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['test', 'FTP', 'benchmark'], difficulty: 'very_hard',
  },
  {
    id: 'bike-test-2', sport: 'bike', category: 'test', name: 'Ramp Test',
    description: 'Progressive ramp test increasing power each minute until failure.',
    zone: 5, duration_minutes: 40, distance_meters: 18000, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 1 },
      { label: 'Ramp protocol', duration_minutes: 20, zone: 'mixed', notes: 'Start at 100W, increase 20W/min until failure' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['test', 'ramp', 'MAP'], difficulty: 'very_hard',
  },
  {
    id: 'bike-test-3', sport: 'bike', category: 'test', name: '5K TT Bike',
    description: 'All-out 5km time trial to benchmark short-distance power.',
    zone: 5, duration_minutes: 35, distance_meters: 15000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 15, zone: 2 },
      { label: '5km time trial', distance_meters: 5000, zone: 5, notes: 'All-out, record time and power' },
      { label: 'Cool-down', duration_minutes: 15, zone: 1 },
    ],
    tags: ['test', 'TT', 'benchmark'], difficulty: 'very_hard',
  },
]

// ─── RUN WORKOUTS ────────────────────────────────────────────────────────────

const runWorkouts: LibraryWorkout[] = [
  // LSD
  {
    id: 'run-lsd-1', sport: 'run', category: 'lsd', name: 'Easy Long Run',
    description: 'Conversational-pace long run building aerobic base and running economy.',
    zone: 2, duration_minutes: 90, distance_meters: 16000, rpe_range: [3, 4],
    structure: [
      { label: 'Walk/jog warm-up', duration_minutes: 5, zone: 1 },
      { label: 'Steady run', duration_minutes: 80, zone: 2, notes: 'Conversational pace' },
      { label: 'Cool-down walk', duration_minutes: 5, zone: 1 },
    ],
    tags: ['endurance', 'base', 'long run'], difficulty: 'moderate',
  },
  {
    id: 'run-lsd-2', sport: 'run', category: 'lsd', name: 'Marathon Pace Long Run',
    description: 'Extended run with the last portion at marathon goal pace.',
    zone: 2, duration_minutes: 120, distance_meters: 22000, rpe_range: [3, 5],
    structure: [
      { label: 'Easy jog', duration_minutes: 10, zone: 1 },
      { label: 'Aerobic run', duration_minutes: 70, zone: 2 },
      { label: 'Marathon pace', duration_minutes: 30, zone: 3, notes: 'Finish at target marathon pace' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['endurance', 'marathon', 'progressive'], difficulty: 'moderate',
  },
  {
    id: 'run-lsd-3', sport: 'run', category: 'lsd', name: 'Trail Long Run',
    description: 'Off-road long run on varied terrain for strength and mental toughness.',
    zone: 2, duration_minutes: 105, distance_meters: 17000, rpe_range: [3, 5],
    structure: [
      { label: 'Easy start', duration_minutes: 10, zone: 1 },
      { label: 'Trail run', duration_minutes: 85, zone: 2, notes: 'Run by effort not pace on hills' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['endurance', 'trail', 'terrain'], difficulty: 'moderate',
  },
  // Recovery
  {
    id: 'run-recovery-1', sport: 'run', category: 'recovery', name: 'Easy Shake-Out Run',
    description: 'Very easy jog to promote blood flow and recovery after hard training.',
    zone: 1, duration_minutes: 30, distance_meters: 4000, rpe_range: [1, 3],
    structure: [
      { label: 'Easy jog', duration_minutes: 30, zone: 1, notes: '60-90s slower than normal easy pace' },
    ],
    tags: ['recovery', 'easy', 'jog'], difficulty: 'easy',
  },
  {
    id: 'run-recovery-2', sport: 'run', category: 'recovery', name: 'Walk-Run Recovery',
    description: 'Alternating walk and jog segments for active recovery with minimal impact.',
    zone: 1, duration_minutes: 35, distance_meters: 4000, rpe_range: [1, 2],
    structure: [
      { label: 'Walk', duration_minutes: 3, zone: 1 },
      { label: 'Easy jog 3min / walk 2min', duration_minutes: 5, repeat: 5, zone: 1, notes: 'Walk breaks every 3min' },
      { label: 'Walk cool-down', duration_minutes: 5, zone: 1 },
    ],
    tags: ['recovery', 'walk-run', 'gentle'], difficulty: 'easy',
  },
  {
    id: 'run-recovery-3', sport: 'run', category: 'recovery', name: 'Pre-Race Shakeout',
    description: 'Short easy run with strides to stay loose before race day.',
    zone: 1, duration_minutes: 25, distance_meters: 3500, rpe_range: [2, 4],
    structure: [
      { label: 'Easy jog', duration_minutes: 15, zone: 1 },
      { label: 'Stride', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 45, notes: 'Smooth and relaxed' },
      { label: 'Easy jog', duration_minutes: 5, zone: 1 },
    ],
    tags: ['recovery', 'pre-race', 'strides'], difficulty: 'easy',
  },
  // Tempo
  {
    id: 'run-tempo-1', sport: 'run', category: 'tempo', name: 'Classic Tempo Run',
    description: 'Sustained tempo effort at comfortably hard pace to improve lactate threshold.',
    zone: 3, duration_minutes: 50, distance_meters: 10000, rpe_range: [5, 7],
    structure: [
      { label: 'Warm-up jog', duration_minutes: 10, zone: 2 },
      { label: 'Tempo effort', duration_minutes: 30, zone: 3, notes: 'Comfortably hard, could say short sentences' },
      { label: 'Cool-down jog', duration_minutes: 10, zone: 1 },
    ],
    tags: ['tempo', 'threshold', 'lactate'], difficulty: 'moderate',
  },
  {
    id: 'run-tempo-2', sport: 'run', category: 'tempo', name: 'Cruise Intervals',
    description: 'Tempo intervals with short recovery to accumulate quality volume at threshold.',
    zone: 3, duration_minutes: 55, distance_meters: 11000, rpe_range: [5, 7],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Tempo interval', duration_minutes: 8, repeat: 3, zone: 3, rest_seconds: 90 },
      { label: 'Easy jog', duration_minutes: 5, zone: 1 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['tempo', 'cruise intervals', 'Daniels'], difficulty: 'moderate',
  },
  {
    id: 'run-tempo-3', sport: 'run', category: 'tempo', name: 'Progressive Tempo',
    description: 'Start easy and gradually build to tempo pace, finishing strong.',
    zone: 3, duration_minutes: 50, distance_meters: 10000, rpe_range: [4, 7],
    structure: [
      { label: 'Easy jog', duration_minutes: 10, zone: 1 },
      { label: 'Moderate', duration_minutes: 10, zone: 2 },
      { label: 'Tempo', duration_minutes: 10, zone: 3 },
      { label: 'Strong tempo', duration_minutes: 10, zone: 3, notes: 'Upper Z3, push the last 5min' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['tempo', 'progressive', 'negative split'], difficulty: 'moderate',
  },
  // Threshold
  {
    id: 'run-threshold-1', sport: 'run', category: 'threshold', name: 'Threshold 1Ks',
    description: '1km repeats at threshold pace building speed endurance and lactate tolerance.',
    zone: 4, duration_minutes: 55, distance_meters: 11000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Strides', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 30 },
      { label: '1km threshold', distance_meters: 1000, repeat: 5, zone: 4, rest_seconds: 90 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['threshold', 'intervals', '1K reps'], difficulty: 'hard',
  },
  {
    id: 'run-threshold-2', sport: 'run', category: 'threshold', name: 'Threshold Miles',
    description: 'Mile repeats at threshold pace for sustained high-end aerobic work.',
    zone: 4, duration_minutes: 60, distance_meters: 13000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: '1 mile threshold', distance_meters: 1600, repeat: 4, zone: 4, rest_seconds: 120 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['threshold', 'mile repeats', 'speed endurance'], difficulty: 'hard',
  },
  {
    id: 'run-threshold-3', sport: 'run', category: 'threshold', name: 'Tempo-Threshold Combo',
    description: 'Mixed tempo and threshold blocks to build fatigue resistance at pace.',
    zone: 4, duration_minutes: 55, distance_meters: 11000, rpe_range: [6, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Tempo', duration_minutes: 10, zone: 3 },
      { label: 'Threshold', duration_minutes: 5, zone: 4 },
      { label: 'Easy jog', duration_minutes: 3, zone: 1 },
      { label: 'Tempo', duration_minutes: 10, zone: 3 },
      { label: 'Threshold', duration_minutes: 5, zone: 4 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['threshold', 'tempo', 'combo'], difficulty: 'hard',
  },
  // VO2 Max
  {
    id: 'run-vo2max-1', sport: 'run', category: 'vo2max', name: 'Classic 800m Repeats',
    description: '800m intervals at VO2 max pace to maximise aerobic power.',
    zone: 5, duration_minutes: 50, distance_meters: 10000, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Strides', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 30 },
      { label: '800m VO2 max', distance_meters: 800, repeat: 5, zone: 5, rest_seconds: 180 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['vo2max', '800m', 'intervals'], difficulty: 'very_hard',
  },
  {
    id: 'run-vo2max-2', sport: 'run', category: 'vo2max', name: 'VO2 Max 3-Minute Efforts',
    description: '3-minute hard efforts to spend maximum time at VO2 max.',
    zone: 5, duration_minutes: 50, distance_meters: 10000, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: '3min hard', duration_minutes: 3, repeat: 5, zone: 5, rest_seconds: 180, notes: '3K-5K race effort' },
      { label: 'Easy jog', duration_minutes: 5, zone: 1 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['vo2max', 'intervals', 'aerobic power'], difficulty: 'very_hard',
  },
  {
    id: 'run-vo2max-3', sport: 'run', category: 'vo2max', name: 'VO2 Max 400s',
    description: 'Short fast 400m repeats at mile race pace to sharpen VO2 max.',
    zone: 5, duration_minutes: 45, distance_meters: 9000, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Strides', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 30 },
      { label: '400m fast', distance_meters: 400, repeat: 8, zone: 5, rest_seconds: 90 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['vo2max', '400m', 'speed'], difficulty: 'very_hard',
  },
  // Sprint
  {
    id: 'run-sprint-1', sport: 'run', category: 'sprint', name: 'Short Hill Sprints',
    description: 'Explosive 10-second hill sprints for neuromuscular power and running economy.',
    zone: 'max', duration_minutes: 40, distance_meters: 6000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up jog', duration_minutes: 10, zone: 2 },
      { label: 'Strides', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 30 },
      { label: '10s hill sprint', duration_minutes: 1, repeat: 8, zone: 'max', rest_seconds: 120, notes: 'All-out up steep hill, walk back down' },
      { label: 'Easy jog', duration_minutes: 5, zone: 1 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['sprint', 'hills', 'power'], difficulty: 'very_hard',
  },
  {
    id: 'run-sprint-2', sport: 'run', category: 'sprint', name: 'Flat Sprints 200m',
    description: 'All-out 200m sprints on flat ground to develop top-end speed.',
    zone: 'max', duration_minutes: 40, distance_meters: 6000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up jog', duration_minutes: 10, zone: 2 },
      { label: 'Dynamic stretches', duration_minutes: 5, zone: 1 },
      { label: '200m sprint', distance_meters: 200, repeat: 6, zone: 'max', rest_seconds: 180, notes: 'Full recovery between' },
      { label: 'Cool-down jog', duration_minutes: 10, zone: 1 },
    ],
    tags: ['sprint', 'speed', 'neuromuscular'], difficulty: 'very_hard',
  },
  {
    id: 'run-sprint-3', sport: 'run', category: 'sprint', name: 'Race Kick Practice',
    description: 'Practicing the finishing kick with sustained effort into sprint.',
    zone: 'max', duration_minutes: 45, distance_meters: 7000, rpe_range: [8, 10],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Tempo run', duration_minutes: 5, zone: 3, notes: 'Build into...' },
      { label: '200m sprint finish', distance_meters: 200, zone: 'max', rest_seconds: 180 },
      { label: 'Tempo run', duration_minutes: 5, zone: 3 },
      { label: '200m sprint finish', distance_meters: 200, zone: 'max', rest_seconds: 180 },
      { label: 'Tempo run', duration_minutes: 5, zone: 3 },
      { label: '200m sprint finish', distance_meters: 200, zone: 'max' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['sprint', 'kick', 'race finish'], difficulty: 'very_hard',
  },
  // Brick
  {
    id: 'run-brick-1', sport: 'run', category: 'brick', name: 'Post-Bike Tempo Run',
    description: 'Run at tempo pace immediately after a bike session to train transitions.',
    zone: 'mixed', duration_minutes: 75, distance_meters: 10000, rpe_range: [5, 8],
    structure: [
      { label: 'Bike warm-up', duration_minutes: 15, zone: 2, notes: 'On the bike' },
      { label: 'Bike tempo', duration_minutes: 30, zone: 3, notes: 'Build power last 10min' },
      { label: 'Transition', duration_minutes: 2, notes: 'Quick change' },
      { label: 'Run tempo', duration_minutes: 20, zone: 3, notes: 'Find legs quickly' },
      { label: 'Cool-down jog', duration_minutes: 8, zone: 1 },
    ],
    tags: ['brick', 'transition', 'bike-run'], difficulty: 'hard',
  },
  {
    id: 'run-brick-2', sport: 'run', category: 'brick', name: 'Sprint Tri Brick Run',
    description: 'Short high-intensity brick run after a hard bike effort simulating sprint tri.',
    zone: 'mixed', duration_minutes: 50, distance_meters: 7000, rpe_range: [6, 9],
    structure: [
      { label: 'Hard bike effort', duration_minutes: 20, zone: 4, notes: 'Sprint tri bike intensity' },
      { label: 'Transition', duration_minutes: 2, notes: 'Fast T2' },
      { label: 'Run hard start', duration_minutes: 5, zone: 4, notes: 'Get up to race pace' },
      { label: 'Run settle', duration_minutes: 15, zone: 3 },
      { label: 'Cool-down', duration_minutes: 8, zone: 1 },
    ],
    tags: ['brick', 'sprint tri', 'high intensity'], difficulty: 'hard',
  },
  {
    id: 'run-brick-3', sport: 'run', category: 'brick', name: 'Long Brick Run',
    description: 'Extended brick run off a long bike to practice iron-distance pacing.',
    zone: 'mixed', duration_minutes: 60, distance_meters: 10000, rpe_range: [5, 7],
    structure: [
      { label: 'Bike endurance', duration_minutes: 20, zone: 2, notes: '20min easy bike first' },
      { label: 'Transition', duration_minutes: 3, notes: 'Simulate T2' },
      { label: 'Run easy start', duration_minutes: 10, zone: 2, notes: 'Walk if needed first minute' },
      { label: 'Run steady', duration_minutes: 20, zone: 3, notes: 'Iron-distance run pace' },
      { label: 'Cool-down walk/jog', duration_minutes: 10, zone: 1 },
    ],
    tags: ['brick', 'long', 'ironman'], difficulty: 'hard',
  },
  // Race Pace
  {
    id: 'run-race_pace-1', sport: 'run', category: 'race_pace', name: '10K Race Pace Intervals',
    description: '1km repeats at 10K race pace to build specific race fitness.',
    zone: 4, duration_minutes: 50, distance_meters: 10000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Strides', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 30 },
      { label: '1km at 10K pace', distance_meters: 1000, repeat: 5, zone: 4, rest_seconds: 90 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['race pace', '10K', 'specific'], difficulty: 'hard',
  },
  {
    id: 'run-race_pace-2', sport: 'run', category: 'race_pace', name: 'Half Marathon Pace Run',
    description: 'Extended blocks at half-marathon race pace for stamina and pacing.',
    zone: 4, duration_minutes: 65, distance_meters: 13000, rpe_range: [6, 7],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'HM pace block', duration_minutes: 15, repeat: 2, zone: 4, rest_seconds: 180, notes: 'Target half marathon pace' },
      { label: 'Easy jog', duration_minutes: 5, zone: 1 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['race pace', 'half marathon', 'stamina'], difficulty: 'hard',
  },
  {
    id: 'run-race_pace-3', sport: 'run', category: 'race_pace', name: 'Tri Run Race Simulation',
    description: 'Run at Olympic triathlon 10K race pace after a moderate warm-up.',
    zone: 4, duration_minutes: 55, distance_meters: 11000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: '5K at tri pace', distance_meters: 5000, zone: 4, rest_seconds: 120, notes: 'First half, settle in' },
      { label: '5K at tri pace', distance_meters: 5000, zone: 4, notes: 'Second half, negative split' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['race pace', 'triathlon', 'simulation'], difficulty: 'hard',
  },
  // Hill Repeats
  {
    id: 'run-hill_repeats-1', sport: 'run', category: 'hill_repeats', name: 'Classic Hill Repeats',
    description: '90-second hill efforts building strength, power, and running economy.',
    zone: 4, duration_minutes: 50, distance_meters: 8000, rpe_range: [7, 9],
    structure: [
      { label: 'Warm-up jog', duration_minutes: 10, zone: 2 },
      { label: '90s hill repeat', duration_minutes: 2, repeat: 6, zone: 4, rest_seconds: 120, notes: '4-6% grade, jog down recovery' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['hills', 'strength', 'power'], difficulty: 'hard',
  },
  {
    id: 'run-hill_repeats-2', sport: 'run', category: 'hill_repeats', name: 'Long Hill Intervals',
    description: 'Extended 3-4min uphill efforts to build climbing endurance.',
    zone: 4, duration_minutes: 55, distance_meters: 9000, rpe_range: [7, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: '4min hill effort', duration_minutes: 4, repeat: 4, zone: 4, rest_seconds: 180, notes: 'Moderate grade, strong cadence' },
      { label: 'Easy jog', duration_minutes: 5, zone: 1 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['hills', 'endurance', 'climbing'], difficulty: 'hard',
  },
  {
    id: 'run-hill_repeats-3', sport: 'run', category: 'hill_repeats', name: 'Downhill Strides',
    description: 'Controlled downhill running to develop speed, turnover, and eccentric strength.',
    zone: 4, duration_minutes: 45, distance_meters: 7000, rpe_range: [5, 7],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: 'Uphill jog', duration_minutes: 2, repeat: 6, zone: 3, notes: 'Easy effort up' },
      { label: 'Downhill stride', duration_minutes: 1, repeat: 6, zone: 4, rest_seconds: 60, notes: 'Controlled, quick turnover down' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['hills', 'downhill', 'eccentric'], difficulty: 'moderate',
  },
  // Fartlek
  {
    id: 'run-fartlek-1', sport: 'run', category: 'fartlek', name: 'Classic Fartlek',
    description: 'Unstructured speed play using landmarks and feel for pace variation.',
    zone: 'mixed', duration_minutes: 45, distance_meters: 8000, rpe_range: [4, 8],
    structure: [
      { label: 'Warm-up jog', duration_minutes: 10, zone: 2 },
      { label: 'Fartlek', duration_minutes: 25, zone: 'mixed', notes: 'Alternate 1-3min hard efforts with easy jog, use landmarks' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['fartlek', 'speed play', 'fun'], difficulty: 'moderate',
  },
  {
    id: 'run-fartlek-2', sport: 'run', category: 'fartlek', name: 'Mona Fartlek',
    description: 'Structured fartlek with alternating hard and easy segments of varying length.',
    zone: 'mixed', duration_minutes: 50, distance_meters: 10000, rpe_range: [4, 8],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: '90s hard / 90s easy', duration_minutes: 3, repeat: 2, zone: 'mixed' },
      { label: '60s hard / 60s easy', duration_minutes: 2, repeat: 3, zone: 'mixed' },
      { label: '30s hard / 30s easy', duration_minutes: 1, repeat: 4, zone: 'mixed' },
      { label: '60s hard / 60s easy', duration_minutes: 2, repeat: 3, zone: 'mixed' },
      { label: '90s hard / 90s easy', duration_minutes: 3, repeat: 2, zone: 'mixed' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['fartlek', 'Mona', 'structured'], difficulty: 'moderate',
  },
  {
    id: 'run-fartlek-3', sport: 'run', category: 'fartlek', name: 'Kenyan Fartlek',
    description: 'Progressive fartlek with each hard effort faster than the last.',
    zone: 'mixed', duration_minutes: 45, distance_meters: 8000, rpe_range: [4, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: '2min moderate / 1min easy', duration_minutes: 3, zone: 3 },
      { label: '2min tempo / 1min easy', duration_minutes: 3, zone: 3 },
      { label: '2min threshold / 1min easy', duration_minutes: 3, zone: 4 },
      { label: '2min hard / 1min easy', duration_minutes: 3, zone: 5 },
      { label: '1min sprint / 2min easy', duration_minutes: 3, zone: 'max' },
      { label: 'Easy jog', duration_minutes: 5, zone: 1 },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['fartlek', 'Kenyan', 'progressive'], difficulty: 'hard',
  },
  // Drills
  {
    id: 'run-drills-1', sport: 'run', category: 'drills', name: 'Running Form Drills',
    description: 'A-skips, B-skips, butt kicks, and high knees to improve running mechanics.',
    zone: 2, duration_minutes: 35, distance_meters: 4000, rpe_range: [3, 5],
    structure: [
      { label: 'Easy jog', duration_minutes: 10, zone: 2 },
      { label: 'A-skips', distance_meters: 50, repeat: 3, zone: 2, rest_seconds: 30 },
      { label: 'B-skips', distance_meters: 50, repeat: 3, zone: 2, rest_seconds: 30 },
      { label: 'High knees', distance_meters: 50, repeat: 3, zone: 2, rest_seconds: 30 },
      { label: 'Butt kicks', distance_meters: 50, repeat: 3, zone: 2, rest_seconds: 30 },
      { label: 'Strides', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 45 },
      { label: 'Cool-down jog', duration_minutes: 5, zone: 1 },
    ],
    tags: ['drills', 'form', 'mechanics'], difficulty: 'easy',
  },
  {
    id: 'run-drills-2', sport: 'run', category: 'drills', name: 'Cadence & Turnover Drills',
    description: 'Drills focusing on increasing cadence and quick ground contact.',
    zone: 2, duration_minutes: 35, distance_meters: 5000, rpe_range: [3, 5],
    structure: [
      { label: 'Easy jog', duration_minutes: 10, zone: 2 },
      { label: 'Quick feet', distance_meters: 30, repeat: 4, zone: 2, rest_seconds: 30, notes: 'Tiny steps, max cadence' },
      { label: 'Fast strides', distance_meters: 100, repeat: 6, zone: 3, rest_seconds: 45, notes: 'Focus on 180+ spm' },
      { label: 'Easy run with cadence focus', duration_minutes: 10, zone: 2, notes: 'Maintain high cadence' },
      { label: 'Cool-down', duration_minutes: 5, zone: 1 },
    ],
    tags: ['drills', 'cadence', 'turnover'], difficulty: 'easy',
  },
  {
    id: 'run-drills-3', sport: 'run', category: 'drills', name: 'Barefoot Strides on Grass',
    description: 'Barefoot strides on soft grass to strengthen feet and improve proprioception.',
    zone: 2, duration_minutes: 30, distance_meters: 3000, rpe_range: [3, 5],
    structure: [
      { label: 'Easy jog (shoes)', duration_minutes: 10, zone: 2 },
      { label: 'Barefoot strides', distance_meters: 80, repeat: 6, zone: 2, rest_seconds: 45, notes: 'Soft grass, light feet' },
      { label: 'Barefoot easy jog', duration_minutes: 3, zone: 1, notes: 'On grass' },
      { label: 'Cool-down jog (shoes)', duration_minutes: 5, zone: 1 },
    ],
    tags: ['drills', 'barefoot', 'proprioception'], difficulty: 'easy',
  },
  // Test
  {
    id: 'run-test-1', sport: 'run', category: 'test', name: '5K Time Trial',
    description: 'All-out 5K to benchmark fitness and establish training paces.',
    zone: 5, duration_minutes: 40, distance_meters: 8000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up jog', duration_minutes: 10, zone: 2 },
      { label: 'Strides', distance_meters: 100, repeat: 4, zone: 3, rest_seconds: 30 },
      { label: '5K time trial', distance_meters: 5000, zone: 5, notes: 'All-out, record time' },
      { label: 'Cool-down walk/jog', duration_minutes: 10, zone: 1 },
    ],
    tags: ['test', '5K', 'benchmark'], difficulty: 'very_hard',
  },
  {
    id: 'run-test-2', sport: 'run', category: 'test', name: 'Lactate Threshold Test (30min)',
    description: '30-minute sustained effort to determine threshold pace and heart rate.',
    zone: 5, duration_minutes: 50, distance_meters: 10000, rpe_range: [8, 9],
    structure: [
      { label: 'Warm-up', duration_minutes: 10, zone: 2 },
      { label: '30min threshold test', duration_minutes: 30, zone: 5, notes: 'Best sustainable effort, record avg HR and pace' },
      { label: 'Cool-down', duration_minutes: 10, zone: 1 },
    ],
    tags: ['test', 'threshold', 'LTHR'], difficulty: 'very_hard',
  },
  {
    id: 'run-test-3', sport: 'run', category: 'test', name: 'Cooper Test (12-Minute)',
    description: 'Classic 12-minute run test to estimate VO2 max from distance covered.',
    zone: 5, duration_minutes: 30, distance_meters: 5000, rpe_range: [9, 10],
    structure: [
      { label: 'Warm-up jog', duration_minutes: 8, zone: 2 },
      { label: 'Strides', distance_meters: 100, repeat: 3, zone: 3, rest_seconds: 30 },
      { label: '12min Cooper test', duration_minutes: 12, zone: 5, notes: 'Max distance, record total meters' },
      { label: 'Cool-down walk/jog', duration_minutes: 8, zone: 1 },
    ],
    tags: ['test', 'Cooper', 'VO2 max estimate'], difficulty: 'very_hard',
  },
]

// ─── COMBINED LIBRARY ────────────────────────────────────────────────────────

export const WORKOUT_LIBRARY: LibraryWorkout[] = [
  ...swimWorkouts,
  ...bikeWorkouts,
  ...runWorkouts,
]

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

export function getWorkoutsBySport(sport: PlanSport): LibraryWorkout[] {
  return WORKOUT_LIBRARY.filter((w) => w.sport === sport)
}

export function getWorkoutsByCategory(sport: PlanSport, category: WorkoutCategory): LibraryWorkout[] {
  return WORKOUT_LIBRARY.filter((w) => w.sport === sport && w.category === category)
}

export function getCategoriesForSport(sport: PlanSport): WorkoutCategory[] {
  const cats = new Set(WORKOUT_LIBRARY.filter((w) => w.sport === sport).map((w) => w.category))
  return Array.from(cats)
}

export function formatStructurePreview(structure: WorkoutInterval[]): string {
  return structure
    .map((s) => {
      let part = ''
      if (s.repeat && s.repeat > 1) part += `${s.repeat}×`
      if (s.distance_meters) {
        part += s.distance_meters >= 1000 ? `${s.distance_meters / 1000}km` : `${s.distance_meters}m`
      } else if (s.duration_minutes) {
        part += `${s.duration_minutes}min`
      }
      if (s.zone) part += ` @Z${s.zone}`
      if (s.rest_seconds) part += ` (${s.rest_seconds}s)`
      return part
    })
    .filter(Boolean)
    .join(' → ')
}
