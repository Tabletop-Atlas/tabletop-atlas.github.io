import { describe, expect, it } from 'vitest'
import { GLOSSARY, GLOSSARY_SOURCES, type GlossaryEntry } from '../glossary'

/**
 * Tripwire against blank or unsourced glossary definitions — the same discipline as
 * aspectCanon / adversaryCanon. Rules prose is a fabrication risk; every entry must carry
 * non-empty text and a valid source.
 */
describe('glossary canon', () => {
  it('gives every entry non-empty text and a valid source', () => {
    const entries = Object.entries(GLOSSARY) as [string, GlossaryEntry][]
    expect(entries.length).toBeGreaterThan(0)
    for (const [id, entry] of entries) {
      expect(entry.text.trim(), `${id} has empty text`).not.toBe('')
      expect(GLOSSARY_SOURCES, `${id} has invalid source`).toContain(entry.source)
    }
  })
})
