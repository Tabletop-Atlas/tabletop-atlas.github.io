import { describe, expect, it } from 'vitest'
import { clampPlayerCount } from '../playerCount'

describe('clampPlayerCount', () => {
  it('clamps below the minimum up to 1', () => {
    expect(clampPlayerCount(0)).toBe(1)
    expect(clampPlayerCount(-3)).toBe(1)
  })

  it('clamps above the maximum down to 6', () => {
    expect(clampPlayerCount(9)).toBe(6)
    expect(clampPlayerCount(47)).toBe(6)
  })

  it('passes through valid counts unchanged', () => {
    expect(clampPlayerCount(1)).toBe(1)
    expect(clampPlayerCount(4)).toBe(4)
    expect(clampPlayerCount(6)).toBe(6)
  })

  it('treats an empty/invalid field as the minimum rather than crashing', () => {
    expect(clampPlayerCount(Number(''))).toBe(1)
    expect(clampPlayerCount(NaN)).toBe(1)
  })
})
