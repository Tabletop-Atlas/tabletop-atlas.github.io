/** #01's arrow-key step: advance/retreat one position in the panel+starting-cards sequence,
 * looping from the last image back to the first (and vice versa) - pure so the wrap behaviour
 * is unit-testable without dispatching a real keydown event. */
export function stepGalleryIndex(current: number, direction: 'left' | 'right', length: number): number {
  const next = current + (direction === 'right' ? 1 : -1)
  return (next + length) % length
}
