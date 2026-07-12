/** Spirit Island supports 1-6 players. Clamped once here so every setter of playerCount
 * (wizard input, sidebar input) shares one rule instead of re-implementing bounds checking. */
export const MIN_PLAYERS = 1
export const MAX_PLAYERS = 6

export function clampPlayerCount(n: number): number {
  if (Number.isNaN(n)) return MIN_PLAYERS
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.trunc(n)))
}
