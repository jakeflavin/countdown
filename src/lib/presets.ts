import { HOUR, MINUTE } from './duration'

export type Preset = {
  label: string
  ms: number
}

/**
 * The durations worth one tap: a steep, a break, a pomodoro, a class, an hour. Kept in
 * ascending order, so the row reads as a scale rather than as a list of favourites.
 */
export const presets: Preset[] = [
  { label: '1m', ms: 1 * MINUTE },
  { label: '2m', ms: 2 * MINUTE },
  { label: '3m', ms: 3 * MINUTE },
  { label: '5m', ms: 5 * MINUTE },
  { label: '10m', ms: 10 * MINUTE },
  { label: '25m', ms: 25 * MINUTE },
  { label: '30m', ms: 30 * MINUTE },
  { label: '45m', ms: 45 * MINUTE },
  // "1h" rather than "1hr", to match how every other span in the app is written.
  { label: '1h', ms: 1 * HOUR },
  { label: '2h', ms: 2 * HOUR },
]
