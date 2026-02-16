export type LabCategory = 'blood_work' | 'performance_lab' | 'diy_home' | 'genetic'

export type Priority = 'essential' | 'recommended' | 'optional'

export interface LabSubmarker {
  name: string
  optimalRange?: string
  unit?: string
  notes?: string
}

export interface LabTest {
  id: string
  category: LabCategory
  name: string
  shortName: string
  description: string
  whyItMatters: string
  optimalRange?: string
  unit?: string
  submarkers?: LabSubmarker[]
  frequency: string
  priority: Priority
  tags: string[]
}

export interface LabCategoryMeta {
  key: LabCategory
  label: string
  shortLabel: string
  icon: string
  color: string
  description: string
}
