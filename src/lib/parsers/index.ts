import { ParsedWorkout } from './types'

export type { ParsedWorkout } from './types'

export async function parseFile(file: File): Promise<ParsedWorkout[]> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'fit': {
      const { parseFitFile } = await import('./fit-parser')
      return parseFitFile(file)
    }
    case 'tcx': {
      const { parseTcxFile } = await import('./tcx-parser')
      return parseTcxFile(file)
    }
    case 'gpx': {
      const { parseGpxFile } = await import('./gpx-parser')
      return parseGpxFile(file)
    }
    case 'csv': {
      const { parseCsvFile } = await import('./csv-parser')
      return parseCsvFile(file)
    }
    default:
      throw new Error(`Unsupported file format: .${ext}. Supported formats: .fit, .tcx, .gpx, .csv`)
  }
}
