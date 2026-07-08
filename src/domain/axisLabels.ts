import type { OCFDU } from './types'

export const AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']

export const AXIS_LABEL: Record<keyof OCFDU, string> = {
  offense: 'aggression',
  control: 'battlefield control',
  fear: 'fear generation',
  defense: 'staying power',
  utility: 'flexibility',
}
