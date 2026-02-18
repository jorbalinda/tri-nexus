// Static qualification standards data for public pages (no Supabase auth required)
// Source: 2026 standards seeded from rolling 5-year averages

export interface StaticQualificationStandard {
  championship: string
  qualifying_year: number
  gender: string
  age_group: string
  standard_multiplier: number | null
  estimated_cutoff_seconds: number
}

export const QUALIFICATION_STANDARDS: StaticQualificationStandard[] = [
  // --- IRONMAN Kona (Male) ---
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '18-24', standard_multiplier: 1.000, estimated_cutoff_seconds: 34200 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '25-29', standard_multiplier: 1.000, estimated_cutoff_seconds: 34200 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '30-34', standard_multiplier: 1.005, estimated_cutoff_seconds: 34600 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '35-39', standard_multiplier: 1.020, estimated_cutoff_seconds: 35000 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '40-44', standard_multiplier: 1.045, estimated_cutoff_seconds: 35800 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '45-49', standard_multiplier: 1.075, estimated_cutoff_seconds: 37000 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '50-54', standard_multiplier: 1.115, estimated_cutoff_seconds: 38400 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '55-59', standard_multiplier: 1.165, estimated_cutoff_seconds: 40200 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '60-64', standard_multiplier: 1.230, estimated_cutoff_seconds: 42600 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '65-69', standard_multiplier: 1.310, estimated_cutoff_seconds: 45600 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '70-74', standard_multiplier: 1.410, estimated_cutoff_seconds: 49200 },
  { championship: 'kona', qualifying_year: 2026, gender: 'male', age_group: '75-79', standard_multiplier: 1.530, estimated_cutoff_seconds: 54000 },
  // --- IRONMAN Kona (Female) ---
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '18-24', standard_multiplier: 1.000, estimated_cutoff_seconds: 37800 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '25-29', standard_multiplier: 1.000, estimated_cutoff_seconds: 37800 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '30-34', standard_multiplier: 1.005, estimated_cutoff_seconds: 38200 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '35-39', standard_multiplier: 1.020, estimated_cutoff_seconds: 38700 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '40-44', standard_multiplier: 1.045, estimated_cutoff_seconds: 39600 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '45-49', standard_multiplier: 1.075, estimated_cutoff_seconds: 40800 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '50-54', standard_multiplier: 1.115, estimated_cutoff_seconds: 42300 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '55-59', standard_multiplier: 1.165, estimated_cutoff_seconds: 44400 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '60-64', standard_multiplier: 1.230, estimated_cutoff_seconds: 46800 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '65-69', standard_multiplier: 1.310, estimated_cutoff_seconds: 50400 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '70-74', standard_multiplier: 1.410, estimated_cutoff_seconds: 54600 },
  { championship: 'kona', qualifying_year: 2026, gender: 'female', age_group: '75-79', standard_multiplier: 1.530, estimated_cutoff_seconds: 59400 },
  // --- 70.3 Worlds (Male) ---
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '18-24', standard_multiplier: 1.000, estimated_cutoff_seconds: 16500 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '25-29', standard_multiplier: 1.000, estimated_cutoff_seconds: 16500 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '30-34', standard_multiplier: 1.005, estimated_cutoff_seconds: 16700 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '35-39', standard_multiplier: 1.015, estimated_cutoff_seconds: 16900 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '40-44', standard_multiplier: 1.035, estimated_cutoff_seconds: 17300 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '45-49', standard_multiplier: 1.060, estimated_cutoff_seconds: 17800 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '50-54', standard_multiplier: 1.095, estimated_cutoff_seconds: 18400 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '55-59', standard_multiplier: 1.140, estimated_cutoff_seconds: 19200 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '60-64', standard_multiplier: 1.200, estimated_cutoff_seconds: 20400 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '65-69', standard_multiplier: 1.275, estimated_cutoff_seconds: 21900 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '70-74', standard_multiplier: 1.370, estimated_cutoff_seconds: 23700 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'male', age_group: '75-79', standard_multiplier: 1.480, estimated_cutoff_seconds: 26100 },
  // --- 70.3 Worlds (Female) ---
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '18-24', standard_multiplier: 1.000, estimated_cutoff_seconds: 18300 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '25-29', standard_multiplier: 1.000, estimated_cutoff_seconds: 18300 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '30-34', standard_multiplier: 1.005, estimated_cutoff_seconds: 18500 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '35-39', standard_multiplier: 1.015, estimated_cutoff_seconds: 18700 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '40-44', standard_multiplier: 1.035, estimated_cutoff_seconds: 19100 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '45-49', standard_multiplier: 1.060, estimated_cutoff_seconds: 19600 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '50-54', standard_multiplier: 1.095, estimated_cutoff_seconds: 20400 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '55-59', standard_multiplier: 1.140, estimated_cutoff_seconds: 21300 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '60-64', standard_multiplier: 1.200, estimated_cutoff_seconds: 22500 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '65-69', standard_multiplier: 1.275, estimated_cutoff_seconds: 24300 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '70-74', standard_multiplier: 1.370, estimated_cutoff_seconds: 26100 },
  { championship: '70.3_worlds', qualifying_year: 2026, gender: 'female', age_group: '75-79', standard_multiplier: 1.480, estimated_cutoff_seconds: 28500 },
  // --- WT AG Sprint (Male) ---
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '18-24', standard_multiplier: null, estimated_cutoff_seconds: 3780 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '25-29', standard_multiplier: null, estimated_cutoff_seconds: 3780 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '30-34', standard_multiplier: null, estimated_cutoff_seconds: 3840 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '35-39', standard_multiplier: null, estimated_cutoff_seconds: 3900 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '40-44', standard_multiplier: null, estimated_cutoff_seconds: 4020 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '45-49', standard_multiplier: null, estimated_cutoff_seconds: 4200 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '50-54', standard_multiplier: null, estimated_cutoff_seconds: 4440 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '55-59', standard_multiplier: null, estimated_cutoff_seconds: 4740 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'male', age_group: '60-64', standard_multiplier: null, estimated_cutoff_seconds: 5100 },
  // --- WT AG Sprint (Female) ---
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '18-24', standard_multiplier: null, estimated_cutoff_seconds: 4380 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '25-29', standard_multiplier: null, estimated_cutoff_seconds: 4380 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '30-34', standard_multiplier: null, estimated_cutoff_seconds: 4440 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '35-39', standard_multiplier: null, estimated_cutoff_seconds: 4500 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '40-44', standard_multiplier: null, estimated_cutoff_seconds: 4680 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '45-49', standard_multiplier: null, estimated_cutoff_seconds: 4920 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '50-54', standard_multiplier: null, estimated_cutoff_seconds: 5160 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '55-59', standard_multiplier: null, estimated_cutoff_seconds: 5520 },
  { championship: 'wt_ag_sprint', qualifying_year: 2026, gender: 'female', age_group: '60-64', standard_multiplier: null, estimated_cutoff_seconds: 5940 },
  // --- WT AG Standard (Male) ---
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '18-24', standard_multiplier: null, estimated_cutoff_seconds: 7560 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '25-29', standard_multiplier: null, estimated_cutoff_seconds: 7560 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '30-34', standard_multiplier: null, estimated_cutoff_seconds: 7680 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '35-39', standard_multiplier: null, estimated_cutoff_seconds: 7860 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '40-44', standard_multiplier: null, estimated_cutoff_seconds: 8160 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '45-49', standard_multiplier: null, estimated_cutoff_seconds: 8460 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '50-54', standard_multiplier: null, estimated_cutoff_seconds: 8820 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '55-59', standard_multiplier: null, estimated_cutoff_seconds: 9360 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'male', age_group: '60-64', standard_multiplier: null, estimated_cutoff_seconds: 10020 },
  // --- WT AG Standard (Female) ---
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '18-24', standard_multiplier: null, estimated_cutoff_seconds: 8760 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '25-29', standard_multiplier: null, estimated_cutoff_seconds: 8760 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '30-34', standard_multiplier: null, estimated_cutoff_seconds: 8880 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '35-39', standard_multiplier: null, estimated_cutoff_seconds: 9060 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '40-44', standard_multiplier: null, estimated_cutoff_seconds: 9360 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '45-49', standard_multiplier: null, estimated_cutoff_seconds: 9720 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '50-54', standard_multiplier: null, estimated_cutoff_seconds: 10200 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '55-59', standard_multiplier: null, estimated_cutoff_seconds: 10920 },
  { championship: 'wt_ag_standard', qualifying_year: 2026, gender: 'female', age_group: '60-64', standard_multiplier: null, estimated_cutoff_seconds: 11820 },
]

export const CHAMPIONSHIP_LABELS: Record<string, string> = {
  kona: 'IRONMAN World Championship (Kona)',
  '70.3_worlds': 'IRONMAN 70.3 World Championship',
  wt_ag_sprint: 'World Triathlon AG Worlds — Sprint',
  wt_ag_standard: 'World Triathlon AG Worlds — Standard',
}

export const CHAMPIONSHIP_DISTANCES: Record<string, { swim_m: number; bike_km: number; run_km: number }> = {
  kona: { swim_m: 3800, bike_km: 180, run_km: 42.2 },
  '70.3_worlds': { swim_m: 1900, bike_km: 90, run_km: 21.1 },
  wt_ag_sprint: { swim_m: 750, bike_km: 20, run_km: 5 },
  wt_ag_standard: { swim_m: 1500, bike_km: 40, run_km: 10 },
}
