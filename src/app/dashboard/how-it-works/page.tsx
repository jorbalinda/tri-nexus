import {
  Upload,
  Plus,
  Activity,
  Flag,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Info,
  Waves,
  Bike,
  Footprints,
  Zap,
  Heart,
  Target,
  TrendingUp,
} from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-squircle p-5 sm:p-6 flex flex-col gap-4">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      {children}
    </div>
  )
}

function Item({
  icon: Icon,
  label,
  children,
  color = 'text-blue-600',
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  color?: string
}) {
  return (
    <div className="flex gap-3">
      <div className={`mt-0.5 shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

function Tier({
  tier,
  label,
  band,
  confidence,
  color,
  description,
}: {
  tier: number
  label: string
  band: string
  confidence: string
  color: string
  description: string
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Tier {tier}
        </span>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{confidence}</span>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">{label}</p>
      <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1.5">{band}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function TsbRow({ range, label, color }: { range: string; label: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{range}</span>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Documentation
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">How It Works</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Everything you need to know about Race Day and how it builds your race prediction.
        </p>
      </div>

      {/* Adding Workouts */}
      <Section title="Adding Workouts">
        <Item icon={Upload} label="Upload a .FIT file" color="text-blue-600">
          Drag and drop a .FIT file from your Garmin, Wahoo, or other GPS device onto the Import
          card on your dashboard. Race Day reads your pace, power, heart rate, cadence, distance,
          and elevation automatically. You can import any number of past files at once.
        </Item>
        <Item icon={Plus} label="Log a manual workout" color="text-green-600">
          Tap the Add Workout card to open the 3-step form. Step 1 picks your sport (swim, bike, or
          run). Step 2 captures the date, duration, distance, and whether it was indoors. Step 3 lets
          you add optional performance data like average HR, max HR, power, cadence, elevation gain,
          RPE, calories, and notes. Only sport, date, and duration are required.
        </Item>
        <Item icon={Activity} label="Both methods feed the same engine" color="text-orange-500">
          Uploaded files and manual entries are treated identically once saved. The richer the data
          you provide, the more accurate your TSS and projections will be.
        </Item>
      </Section>

      {/* TSS Auto-Calculation */}
      <Section title="Training Stress Score (TSS) Auto-Calculation">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          TSS measures how hard a workout stressed your body. Race Day calculates it automatically
          when you do not enter one manually. It works through a 5-level priority waterfall:
        </p>
        <div className="flex flex-col gap-3">
          <Item icon={Zap} label="1. Device TSS" color="text-blue-600">
            If your file already contains a TSS value (common with Garmin, Wahoo, and most GPS device exports),
            that number is used directly and treated as the most accurate source.
          </Item>
          <Item icon={Target} label="2. Power or Pace" color="text-purple-600">
            For bike, your normalized power is divided by your FTP to get an Intensity Factor. For
            swim and run, your average pace is compared against your threshold pace (CSS or run
            threshold). TSS is then calculated from duration multiplied by IF squared.
          </Item>
          <Item icon={Heart} label="3. Heart Rate" color="text-red-500">
            If pace or power data is unavailable but you wore a HR monitor, Race Day estimates
            your HR-based Intensity Factor using your resting and max HR. Set these in your Profile
            for best results.
          </Item>
          <Item icon={TrendingUp} label="4. RPE" color="text-orange-500">
            If you logged a perceived effort (RPE 1-10), Race Day maps that to a standard IF. An
            RPE of 5 maps to a moderate 0.75 IF, for example.
          </Item>
          <Item icon={Info} label="5. Default fallback" color="text-gray-500">
            If none of the above signals are present, Race Day assumes a moderate effort (IF 0.75)
            and calculates TSS from your workout duration. A 30-minute workout with no data at all
            yields roughly 28 TSS as a fallback.
          </Item>
        </div>
        <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>Tip:</strong> The best way to improve TSS accuracy is to set your FTP, CSS
            (critical swim speed), and run threshold pace in your Profile. Once those are set,
            pace-based TSS is extremely close to a power meter reading.
          </p>
        </div>
      </Section>

      {/* Training Load */}
      <Section title="Training Load: CTL, ATL, and TSB">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Your Training Load card on the dashboard shows four numbers at all times. These are
          industry-standard Performance Management Chart (PMC) metrics used by coaches and
          sports scientists worldwide.
        </p>
        <div className="flex flex-col gap-3">
          <Item icon={Activity} label="TSS (Today)" color="text-gray-500">
            Training Stress Score is the raw load from your workouts on a given day. One hour at
            your threshold effort equals 100 TSS. Easier or shorter sessions score lower. Harder
            or longer sessions score higher. On a rest day TSS is zero, which is intentional.
          </Item>
          <Item icon={Activity} label="CTL (Fitness)" color="text-blue-600">
            Chronic Training Load is a 42-day exponentially weighted average of your daily TSS.
            Each day, your existing CTL decays by a factor of e to the power of negative one over
            42, and today's TSS is added in proportion to what remains. This means fitness builds
            slowly over months of consistent work and fades gradually during rest. A higher CTL
            generally correlates with a faster race.
          </Item>
          <Item icon={AlertCircle} label="ATL (Fatigue)" color="text-orange-500">
            Acute Training Load is the same calculation with a 7-day time constant instead of 42.
            Because the window is much shorter, ATL responds quickly. A hard training block drives
            it up within days. A recovery week brings it back down just as fast.
          </Item>
          <Item icon={TrendingUp} label="TSB (Form)" color="text-green-600">
            Training Stress Balance is CTL minus ATL. A positive number means you are fresher than
            your fitness baseline, which is the target state for race day. A negative number means
            you are carrying more fatigue than your fitness baseline, which is normal during hard
            training blocks and expected to resolve during taper.
          </Item>
        </div>

        <div className="flex flex-col mt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            TSB Form States
          </p>
          <TsbRow range="+25 and above" label="Very Fresh" color="text-blue-500" />
          <TsbRow range="+10 to +24" label="Fresh" color="text-green-500" />
          <TsbRow range="-10 to +9" label="Neutral" color="text-gray-500" />
          <TsbRow range="-25 to -11" label="Tired" color="text-orange-500" />
          <TsbRow range="Below -25" label="Fatigued" color="text-red-500" />
        </div>

        <div className="rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-4">
          <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
            <strong>Race day tip:</strong> Most athletes perform best with a TSB of +5 to +20 on
            race day. This is why a proper taper matters. Race Day projects your TSB forward to race
            day on the race detail page so you can see where you are tracking.
          </p>
        </div>
      </Section>

      {/* Why We Calculate What We Do */}
      <Section title="Why We Calculate What We Do">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Every formula Race Day uses is grounded in peer-reviewed sports science. Here is why
          each metric is calculated the way it is.
        </p>
        <div className="flex flex-col gap-3">
          <Item icon={Zap} label="Why true exponential decay and not a simple average" color="text-blue-600">
            A simple rolling average treats every day in the window equally and then drops off a
            cliff when a day falls out of range. True exponential decay gives the most recent days
            the most weight and gradually reduces the influence of older sessions rather than
            cutting them off entirely. This mirrors how the body actually adapts. A workout you
            did 40 days ago still has some residual effect on your fitness today, just a very small
            one. The decay constant for CTL is e to the power of negative one over 42, and for ATL
            it is e to the power of negative one over 7. These constants were established in
            Banister's impulse response model and refined for endurance sport by Andrew Coggan.
          </Item>
          <Item icon={Activity} label="Why 42 days for CTL and 7 days for ATL" color="text-orange-500">
            The 42-day window for fitness reflects how long it takes aerobic adaptations to
            accumulate and stabilize. Building meaningful cardiovascular fitness is a months-long
            process. The 7-day window for fatigue reflects how quickly acute stress accumulates
            and dissipates. Most athletes feel the effects of a hard week within two to three days
            and recover within five to seven. Using different time constants for fitness and fatigue
            is what makes TSB a useful race day indicator rather than just a smoothed training log.
          </Item>
          <Item icon={TrendingUp} label="Why TSB is the form metric instead of something simpler" color="text-green-600">
            TSB captures the relationship between what you have built and what you are currently
            carrying. A high CTL with a high ATL means you are fit but tired. A high CTL with a
            low ATL means you are fit and fresh, which is the ideal race day state. A simple
            weekly load number cannot tell you both things at once. TSB can.
          </Item>
          <Item icon={Target} label="Why TSS uses IF squared and not IF directly" color="text-purple-600">
            The squared term in the TSS formula reflects the non-linear relationship between
            intensity and physiological cost. Going slightly harder than threshold is
            disproportionately more stressful than going slightly easier. Squaring the Intensity
            Factor captures this curve so that a hard two-hour ride scores appropriately higher
            than two easy one-hour rides with the same total duration.
          </Item>
          <Item icon={Heart} label="Why rest days show zero TSS but CTL does not drop to zero" color="text-red-500">
            TSS is a measure of what you did today. Zero training means zero stress, and that is
            accurate. CTL and ATL do not drop to zero because they are running averages weighted
            by all prior days. A single rest day contributes zero to the numerator but the
            accumulated fitness from prior weeks is still present in the denominator. CTL will
            decay slightly on a rest day by its natural exponential factor, which reflects the
            real biological truth that fitness is not permanent but also does not vanish overnight.
          </Item>
        </div>
      </Section>

      {/* Data Requirements for Projections */}
      <Section title="Data Requirements for Race Projections">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Race Day unlocks projections progressively. Each tier requires a minimum number of qualifying
          workouts per sport within the past 8 weeks (2 swims, 3 bikes, 3 runs), but the minimum
          workout duration increases as you move up. Longer workouts count toward both the base
          requirement and any long workout requirements at the same time.
        </p>

        {[
          {
            tier: 1,
            label: 'Tier 1 — Rough Estimate',
            color: 'border-orange-100 dark:border-orange-900/30 bg-orange-50/40 dark:bg-orange-950/10',
            rows: [
              { icon: Waves, sport: 'Swim', req: '2 swims, 10+ min each', color: 'text-blue-500' },
              { icon: Bike, sport: 'Bike', req: '3 rides, 20+ min each', color: 'text-orange-500' },
              { icon: Footprints, sport: 'Run', req: '3 runs, 20+ min each', color: 'text-green-500' },
            ],
          },
          {
            tier: 2,
            label: 'Tier 2 — Standard',
            color: 'border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/10',
            rows: [
              { icon: Waves, sport: 'Swim', req: '2 swims, 20+ min each', color: 'text-blue-500' },
              { icon: Bike, sport: 'Bike', req: '3 rides, 30+ min each', color: 'text-orange-500' },
              { icon: Footprints, sport: 'Run', req: '3 runs, 30+ min each', color: 'text-green-500' },
            ],
          },
          {
            tier: 3,
            label: 'Tier 3 — Refined',
            color: 'border-green-100 dark:border-green-900/30 bg-green-50/40 dark:bg-green-950/10',
            rows: [
              { icon: Waves, sport: 'Swim', req: '2 swims, 20+ min each + 2 of 30+ min', color: 'text-blue-500' },
              { icon: Bike, sport: 'Bike', req: '3 rides, 30+ min each + 2 of 60+ min', color: 'text-orange-500' },
              { icon: Footprints, sport: 'Run', req: '3 runs, 30+ min each + 2 of 45+ min', color: 'text-green-500' },
            ],
          },
        ].map(({ tier, label, color, rows }) => (
          <div key={tier} className={`rounded-xl border p-4 flex flex-col gap-2 ${color}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            {rows.map(({ icon: Icon, sport, req, color: iconColor }) => (
              <div key={sport} className="flex items-center gap-2">
                <Icon size={14} className={`${iconColor} shrink-0`} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8">{sport}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{req}</span>
              </div>
            ))}
          </div>
        ))}

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Workouts shorter than the minimums or older than 8 weeks do not count toward the gate.
          The race detail page shows exactly how many qualifying workouts you have per sport and
          what you need to unlock the next tier.
        </p>
      </Section>

      {/* Prediction Tiers */}
      <Section title="Prediction Tiers">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Once you add a race, Race Day assigns a prediction tier based on how much data is
          available. The more you train and the more threshold data you set, the more realistic your prediction becomes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Tier
            tier={0}
            label="No Prediction"
            band="Not enough data"
            confidence="Below 20 confidence"
            color="bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            description="Fewer than 2 disciplines have passed their gate. Keep logging workouts and come back."
          />
          <Tier
            tier={1}
            label="Rough Estimate"
            band="Early estimate — directionally useful"
            confidence="20 to 44 confidence"
            color="bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30"
            description="At least 2 disciplines are gated and confidence is building. The range is wide but gives you a real starting point."
          />
          <Tier
            tier={2}
            label="Standard"
            band="Solid estimate — reliable finish time window"
            confidence="45 to 69 confidence"
            color="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30"
            description="All 3 disciplines are gated. The model has enough data to produce a reliable finish time window."
          />
          <Tier
            tier={3}
            label="Refined"
            band="Most realistic race day prediction"
            confidence="70 and above confidence"
            color="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30"
            description="All 3 disciplines are gated and all threshold data is set. This is the most realistic race day prediction Race Day can produce."
          />
        </div>
      </Section>

      {/* Confidence Score */}
      <Section title="Confidence Score (0-100)">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          The confidence score is a composite of 4 dimensions, each worth up to 25 points:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Volume', desc: 'How many qualifying workouts you have across all sports' },
            { label: 'Discipline Balance', desc: 'Whether swim, bike, and run are all represented' },
            { label: 'Threshold Quality', desc: 'Whether FTP, CSS, or run pace has been calibrated' },
            { label: 'Data Completeness', desc: 'Whether workouts include HR, pace, power, and other fields' },
          ].map(({ label, desc }) => (
            <div
              key={label}
              className="rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-3"
            >
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-0.5">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Your race card always shows your current score and the top 3 actions that will improve it
          the most. Focus on those to move up a tier.
        </p>
      </Section>

      {/* Missing and Incomplete Data */}
      <Section title="What Happens With Missing or Incomplete Data">
        <div className="flex flex-col gap-3">
          <Item icon={CheckCircle2} label="Missing a single field" color="text-green-600">
            Race Day will estimate or skip that field rather than breaking. A workout without pace
            data still contributes to TSS via HR or RPE. A workout without HR still contributes
            via pace or power.
          </Item>
          <Item icon={AlertCircle} label="No threshold data set" color="text-orange-500">
            Without FTP, CSS, or run threshold pace in your Profile, TSS falls back to heart rate
            or RPE. Your confidence score will be lower and the prediction band will be wider.
            Setting your thresholds in Profile is the single fastest way to improve accuracy.
          </Item>
          <Item icon={Info} label="Not enough qualifying workouts" color="text-blue-600">
            If a discipline has fewer than 5 qualifying workouts in the last 8 weeks, that sport
            is not gated and its time cannot be projected. Race Day will tell you exactly how many
            more workouts you need and will show the specific sport that is blocking you.
          </Item>
          <Item icon={AlertCircle} label="Fewer than 2 disciplines gated" color="text-red-500">
            If fewer than 2 of the 3 sports have passed their gate, Race Day cannot generate any
            race prediction. You will see Tier 0 on your race card with a step-by-step list of
            what to do next.
          </Item>
          <Item icon={Activity} label="Very recent data only" color="text-purple-600">
            Workouts older than 8 weeks do not count toward the gate but still affect your CTL
            since CTL uses a 42-day window. Older training still influences your fitness baseline
            even if it does not count toward prediction eligibility.
          </Item>
        </div>
      </Section>

      {/* Race Projections */}
      <Section title="How Race Projections Work">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          When you add a race, Race Day uses your training history to estimate finish times for
          each leg and the overall race. Here is what goes into each projection:
        </p>
        <div className="flex flex-col gap-3">
          <Item icon={Waves} label="Swim projection" color="text-blue-500">
            Derived from your CSS (critical swim speed) or average pace across recent swim sessions,
            adjusted for open water versus pool conditions and your current fitness level.
          </Item>
          <Item icon={Bike} label="Bike projection" color="text-orange-500">
            Based on your FTP, average normalized power, and heart rate trends from recent rides.
            The model accounts for race distance and typical pacing strategies.
          </Item>
          <Item icon={Footprints} label="Run projection" color="text-green-500">
            Derived from your run threshold pace and recent long run data, then adjusted downward
            for the cumulative fatigue of swimming and biking before the run leg.
          </Item>
          <Item icon={Flag} label="Transitions" color="text-gray-500">
            T1 and T2 are estimated using standard benchmarks for your race distance and adjusted
            based on your race experience level if you have logged previous race results.
          </Item>
          <Item icon={TrendingUp} label="Race day form projection" color="text-purple-600">
            Race Day projects your TSB forward to race day assuming your current training load
            continues. It shows whether you will arrive fresh, neutral, or fatigued based on
            your current training trajectory.
          </Item>
        </div>
      </Section>

      {/* Profile and Thresholds */}
      <Section title="Profile and Threshold Settings">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Your Profile page holds the data that unlocks the most accurate predictions. You can set
          these values manually or let Race Day detect them from your workout files.
        </p>
        <div className="flex flex-col gap-3">
          <Item icon={Zap} label="FTP (Functional Threshold Power)" color="text-orange-500">
            Your 60-minute average power in watts. This is used to calculate bike TSS and pacing.
            A common test: 95% of your best 20-minute power output. Set this in Profile under
            Bike Thresholds.
          </Item>
          <Item icon={Waves} label="CSS (Critical Swim Speed)" color="text-blue-500">
            Your pace per 100 meters at threshold effort. A common test: swim 400m and 200m all-out
            and calculate CSS from the difference. Set this in Profile under Swim Thresholds.
          </Item>
          <Item icon={Footprints} label="Run Threshold Pace" color="text-green-500">
            Your pace per kilometer at threshold effort. Typically your best 30-60 minute race pace
            or the result of a standard lactate threshold test. Set this in Profile under Run Thresholds.
          </Item>
          <Item icon={Heart} label="Resting and Max Heart Rate" color="text-red-500">
            Used as a fallback to calculate TSS when pace and power are not available. More importantly,
            resting HR is used with max HR to estimate LTHR (lactate threshold HR) for HR-based
            intensity calculations.
          </Item>
        </div>
      </Section>

      {/* Races Page */}
      <Section title="The Races Page">
        <Item icon={Flag} label="Adding a race" color="text-blue-600">
          Tap the add button on the Races page and enter your race name, distance type (sprint,
          Olympic, 70.3, full Ironman, or custom), and race date. That is all that is required.
        </Item>
        <Item icon={BarChart3} label="Race detail view" color="text-purple-600">
          Tapping a race opens the full deep-dive: your predicted finish time with a confidence band,
          per-leg time breakdowns, fitness and form trends projected to race day, a readiness score,
          and the top actions to improve your prediction.
        </Item>
        <Item icon={TrendingUp} label="Projection updates automatically" color="text-green-600">
          Every time you log a workout, your projections update. You do not need to do anything
          manually. Add more swims and watch your swim projection sharpen. Hit a new power peak
          and watch your bike time improve.
        </Item>
        <Item icon={CheckCircle2} label="Multiple races" color="text-orange-500">
          You can add as many races as you want. Each race gets its own prediction based on your
          current data. The race card on your dashboard shows your nearest upcoming event.
        </Item>
      </Section>

      {/* Dashboard overview */}
      <Section title="Dashboard Overview">
        <Item icon={Activity} label="Weekly Calendar" color="text-blue-600">
          The top of your dashboard shows the current week. You can swipe left and right to browse
          past and future weeks. Each day shows your logged workouts as color-coded pills by sport.
          Tap any workout to see full details.
        </Item>
        <Item icon={BarChart3} label="Weekly Volume" color="text-purple-600">
          Below the action row you will see your swim, bike, run, and total volume for the current
          week in distance and time.
        </Item>
        <Item icon={TrendingUp} label="Fitness Trends chart" color="text-green-600">
          The chart below your volume summary plots your CTL, ATL, and TSB over time so you can
          visualize your training load progression and plan your taper.
        </Item>
        <Item icon={Flag} label="Upcoming Race card" color="text-orange-500">
          Your next race is shown below Fitness Trends with your current prediction tier, confidence
          score, and predicted finish time. Tap it to open the full race detail page.
        </Item>
        <Item icon={Activity} label="Activity Feed" color="text-gray-500">
          The bottom of the dashboard shows your recent workouts in reverse chronological order.
          Tap any entry to see the full workout detail including laps, HR, pace, and power.
        </Item>
      </Section>

      {/* File format FAQ */}
      <Section title="Common Questions">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              What file formats are supported for upload?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Race Day currently supports .FIT files, which is the native format exported by Garmin,
              Wahoo, Polar, Suunto, and most modern GPS devices. You can export .FIT files from your
              device directly or from the Garmin Connect, Wahoo, or Suunto apps.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Does Race Day connect directly to Garmin Connect?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Direct Garmin Connect sync is coming soon. For now, export your .FIT file from Garmin
              Connect or your device and drop it onto the Import card on your dashboard.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Will logging outdoor and indoor workouts differently affect my prediction?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Mark indoor workouts as Indoor when logging them. This tells Race Day not to include
              elevation gain and to use slightly different pacing assumptions. Your TSS is still
              calculated the same way regardless of indoor or outdoor mode.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              I just signed up and have no data. Where do I start?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Start by uploading your past .FIT files in bulk. You can drop multiple files at once.
              If you do not have files, log your recent workouts manually. Set your Profile thresholds
              once you have a few workouts in. Then add your first race and watch your prediction
              tier climb as your data builds.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              My workouts count toward my gate but my TSS is still 0. Why?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              TSS requires at least 5 minutes of workout duration to calculate. Workouts shorter
              than 5 minutes return a TSS of 0 by design, as they are too short to generate
              meaningful training stress. Also confirm that the workout date is set correctly and
              that your Profile thresholds are filled in for the best calculation.
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
