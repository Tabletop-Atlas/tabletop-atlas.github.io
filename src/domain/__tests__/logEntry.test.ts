import { describe, expect, it } from 'vitest'
import { clampOptionalInt } from '../logEntry'

describe('clampOptionalInt', () => {
  it('treats an empty field as not recorded, never a fabricated 0', () => {
    expect(clampOptionalInt('', 1, 3)).toBeUndefined()
    expect(clampOptionalInt('   ', 0)).toBeUndefined()
  })

  it('treats a non-numeric value (a bad paste) as not recorded', () => {
    expect(clampOptionalInt('abc', 1, 3)).toBeUndefined()
    expect(clampOptionalInt('--', 0)).toBeUndefined()
  })

  it('passes an in-range value through unchanged', () => {
    expect(clampOptionalInt('2', 1, 3)).toBe(2)
    expect(clampOptionalInt('5', 0)).toBe(5)
  })

  it('clamps a value above the max, whether typed or pasted', () => {
    expect(clampOptionalInt('4', 1, 3)).toBe(3)
    expect(clampOptionalInt('999', 1, 3)).toBe(3)
  })

  it('clamps a value below the min', () => {
    expect(clampOptionalInt('0', 1, 3)).toBe(1)
    expect(clampOptionalInt('-5', 0)).toBe(0)
  })

  it('rounds a decimal value before clamping', () => {
    expect(clampOptionalInt('2.7', 1, 3)).toBe(3)
    expect(clampOptionalInt('2.4', 1, 3)).toBe(2)
  })
})
