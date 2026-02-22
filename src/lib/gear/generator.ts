type Category = 'swim' | 'bike' | 'run' | 'transition' | 'post_race'

interface GearItemDef {
  item_name: string
  category: Category
  is_required: boolean
}

interface GearContext {
  race_type: 'triathlon' | 'duathlon' | 'aquabike'
  race_distance: 'sprint' | 'olympic' | '70.3' | '140.6' | 'custom'
  water_type?: 'open_water' | 'pool' | null
  wetsuit?: boolean
  expected_temp_f?: number | null
}

const SWIM_BASE: GearItemDef[] = [
  { item_name: 'Goggles', category: 'swim', is_required: true },
  { item_name: 'Backup goggles', category: 'swim', is_required: false },
  { item_name: 'Swim cap (provided)', category: 'swim', is_required: true },
  { item_name: 'Tri suit', category: 'swim', is_required: true },
  { item_name: 'Body Glide (anti-chafe)', category: 'swim', is_required: true },
  { item_name: 'Earplugs', category: 'swim', is_required: false },
]

const SWIM_WETSUIT: GearItemDef[] = [
  { item_name: 'Wetsuit', category: 'swim', is_required: true },
  { item_name: 'Wetsuit lubricant', category: 'swim', is_required: true },
]

const BIKE_BASE: GearItemDef[] = [
  { item_name: 'Bike (checked & tuned)', category: 'bike', is_required: true },
  { item_name: 'Helmet', category: 'bike', is_required: true },
  { item_name: 'Cycling shoes', category: 'bike', is_required: true },
  { item_name: 'Sunglasses', category: 'bike', is_required: true },
  { item_name: 'Water bottle(s)', category: 'bike', is_required: true },
  { item_name: 'Flat repair kit (tube, CO2, levers)', category: 'bike', is_required: true },
  { item_name: 'Bike computer / GPS', category: 'bike', is_required: false },
]

const BIKE_LONG: GearItemDef[] = [
  { item_name: 'Nutrition on bike (gels, bars)', category: 'bike', is_required: true },
  { item_name: 'Bento box / top-tube bag', category: 'bike', is_required: false },
  { item_name: 'Second water bottle', category: 'bike', is_required: true },
  { item_name: 'Aero bottle (between aerobars)', category: 'bike', is_required: false },
]

const RUN_BASE: GearItemDef[] = [
  { item_name: 'Running shoes', category: 'run', is_required: true },
  { item_name: 'Race belt with bib number', category: 'run', is_required: true },
  { item_name: 'Hat or visor', category: 'run', is_required: true },
  { item_name: 'GPS watch', category: 'run', is_required: false },
]

const RUN_LONG: GearItemDef[] = [
  { item_name: 'Run nutrition (gels)', category: 'run', is_required: true },
  { item_name: 'Body Glide for run', category: 'run', is_required: true },
  { item_name: 'Salt/electrolyte capsules', category: 'run', is_required: false },
]

const TRANSITION_BASE: GearItemDef[] = [
  { item_name: 'Towel', category: 'transition', is_required: true },
  { item_name: 'Sunscreen', category: 'transition', is_required: true },
  { item_name: 'Race number', category: 'transition', is_required: true },
  { item_name: 'Transition bag(s)', category: 'transition', is_required: false },
]

const TRANSITION_LONG: GearItemDef[] = [
  { item_name: 'Special needs bag (bike)', category: 'transition', is_required: false },
  { item_name: 'Special needs bag (run)', category: 'transition', is_required: false },
  { item_name: 'Extra socks', category: 'transition', is_required: false },
]

const POST_RACE: GearItemDef[] = [
  { item_name: 'Change of clothes', category: 'post_race', is_required: true },
  { item_name: 'Flip flops / sandals', category: 'post_race', is_required: true },
  { item_name: 'Recovery drink / snack', category: 'post_race', is_required: true },
  { item_name: 'Phone & charger', category: 'post_race', is_required: false },
  { item_name: 'Cash / credit card', category: 'post_race', is_required: false },
  { item_name: 'Towel for after', category: 'post_race', is_required: false },
]

const COLD_WEATHER: GearItemDef[] = [
  { item_name: 'Arm warmers', category: 'bike', is_required: false },
  { item_name: 'Toe covers', category: 'bike', is_required: false },
  { item_name: 'Thermal cap (under helmet)', category: 'bike', is_required: false },
  { item_name: 'Gloves', category: 'run', is_required: false },
  { item_name: 'Warm-up jacket (pre-race)', category: 'transition', is_required: false },
]

export function generateGearList(context: GearContext): GearItemDef[] {
  const items: GearItemDef[] = []
  const isLong = context.race_distance === '70.3' || context.race_distance === '140.6'
  const isCold = context.expected_temp_f != null && context.expected_temp_f < 60

  // Swim gear (skip for duathlon)
  if (context.race_type !== 'duathlon') {
    items.push(...SWIM_BASE)
    if (context.wetsuit || context.water_type === 'open_water') {
      items.push(...SWIM_WETSUIT)
    }
  }

  // Bike gear (skip for aquabike only if no bike - actually aquabike has bike)
  items.push(...BIKE_BASE)
  if (isLong) {
    items.push(...BIKE_LONG)
  }

  // Run gear (skip for aquabike)
  if (context.race_type !== 'aquabike') {
    items.push(...RUN_BASE)
    if (isLong) {
      items.push(...RUN_LONG)
    }
  }

  // Transition
  items.push(...TRANSITION_BASE)
  if (isLong) {
    items.push(...TRANSITION_LONG)
  }

  // Post-race
  items.push(...POST_RACE)

  // Cold weather additions
  if (isCold) {
    items.push(...COLD_WEATHER)
  }

  return items
}
