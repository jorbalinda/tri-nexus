'use client'

import {
  Waves, Bike, PersonStanding, Mountain, Route, Construction,
  Thermometer, Droplets, Wind, ThermometerSun, Info, HelpCircle,
  Clock
} from 'lucide-react'
import type { RaceCourse, RaceWeather } from '@/lib/types/race-plan'

interface CourseConditionsProps {
  course: RaceCourse | null
  weather: RaceWeather | null
  loading: boolean
  daysUntilRace: number
}

const PROFILE_LABELS: Record<string, string> = {
  flat: 'Flat',
  rolling: 'Rolling',
  hilly: 'Hilly',
  mountainous: 'Mountainous',
}

const QUALITY_LABELS: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: 'text-[#4cc9a0]' },
  good: { label: 'Good', color: 'text-[#57a2ea]' },
  fair: { label: 'Fair', color: 'text-[#e2622c]' },
  poor: { label: 'Poor', color: 'text-[#d62828]' },
}

function windCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function CourseConditions({
  course,
  weather,
  loading,
  daysUntilRace,
}: CourseConditionsProps) {
  if (loading) {
    return (
      <div className="card-squircle p-4 sm:p-6">
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!course) return null

  const daysUntilWeather = Math.max(0, daysUntilRace - 15)
  const quality = QUALITY_LABELS[course.road_quality] ?? QUALITY_LABELS.good

  return (
    <div className="card-squircle p-4 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
        Course & Conditions
      </p>

      {/* Static course data — always shown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Waves size={12} className="text-[#219ebc]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Swim</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {course.swim_distance_m ? `${course.swim_distance_m.toLocaleString()}m` : '-'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Bike size={12} className="text-[#fb8500]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Bike</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {course.bike_distance_km ? `${course.bike_distance_km}km` : '-'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <PersonStanding size={12} className="text-[#4cc9a0]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Run</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {course.run_distance_km ? `${course.run_distance_km}km` : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Mountain size={12} className="text-[#fb8500]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Elevation</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {course.elevation_gain_m != null ? `${course.elevation_gain_m.toLocaleString()}m` : '-'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Route size={12} className="text-[#4361ee]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Profile</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {PROFILE_LABELS[course.course_profile] ?? course.course_profile}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Construction size={12} className="text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Road</span>
          </div>
          <p className={`text-sm font-bold ${quality.color}`}>
            {quality.label}
          </p>
        </div>
      </div>

      {/* Notable features */}
      {course.notable_features && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          {course.notable_features}
        </p>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

      {/* Weather section */}
      {weather ? (
        /* Live weather data */
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer size={12} className="text-[#d62828]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Temperature</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {weather.temp_low_f ?? '-'}&deg; &ndash; {weather.temp_high_f ?? '-'}&deg;F
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Droplets size={12} className="text-[#219ebc]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Humidity</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {weather.humidity_pct != null ? `${weather.humidity_pct}%` : '-'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Wind size={12} className="text-[#2a9d8f]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Wind</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {weather.wind_speed_mph != null
                  ? `${Math.round(Number(weather.wind_speed_mph))} mph`
                  : '-'}
                {weather.wind_direction_deg != null && (
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                    {windCompass(Number(weather.wind_direction_deg))}
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <ThermometerSun size={12} className="text-[#219ebc]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Water Temp</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {weather.water_temp_f != null ? `${weather.water_temp_f}\u00B0F` : (course.typical_water_temp_f != null ? `~${course.typical_water_temp_f}\u00B0F` : '-')}
              </p>
            </div>
          </div>
          {weather.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{weather.description}</p>
          )}
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            Updated {timeAgo(weather.fetched_at)}
          </p>
        </div>
      ) : daysUntilWeather > 0 ? (
        /* TBD placeholder — race is more than 15 days away */
        <div
          className="relative rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 overflow-hidden"
        >
          {/* Diagonal stripe background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(156,163,175,0.06) 10px, rgba(156,163,175,0.06) 20px)',
            }}
          />
          <div className="relative flex flex-col items-center text-center gap-2">
            <HelpCircle size={24} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              Weather Forecast
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Clock size={12} />
              <span>Available in {daysUntilWeather} day{daysUntilWeather !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Within 15 days but weather hasn't been fetched yet */
        <div className="p-4 rounded-xl bg-[#fb8500]/5 border border-[#fb8500]/20">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-[#fb8500] mt-0.5 shrink-0" />
            <p className="text-xs text-[#fb8500]/80">
              Weather data is being fetched. Check back shortly.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
