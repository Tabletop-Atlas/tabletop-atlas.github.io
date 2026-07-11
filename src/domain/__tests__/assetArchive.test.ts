import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Guards `images/manifest.json` against the archive on disk (`.scratch/asset-archive/PRD.md`).
 * Skips entirely when the archive directory is absent, since `images/` is git-ignored except the
 * manifest itself - this test only bites for whoever has actually run the retrieval.
 */
const imagesDir = new URL('../../../images/', import.meta.url)
const archivePresent = existsSync(imagesDir) && readdirSync(imagesDir).some((f) => f !== 'manifest.json')

const describeIfArchived = archivePresent ? describe : describe.skip

function walk(dir: URL, base = ''): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  let files: string[] = []
  for (const entry of entries) {
    // Source material, not an archive asset: the manifest itself, and the raw TTS mod JSON #01-#05 read from.
    if (entry.name === 'manifest.json' || entry.name === 'spirit_island_tabletop_simulator_mod.json') continue
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files = files.concat(walk(new URL(`${entry.name}/`, dir), rel))
    } else {
      files.push(`images/${rel}`)
    }
  }
  return files
}

type ManifestRow = { file: string; source_url: string | null; asset_type: string; spirit: string | null; name: string | null }

// Read lazily inside each `it`, not at describe-body scope: vitest evaluates a describe.skip's
// factory function even though its tests don't run, so eager readFileSync here would throw
// whenever the archive (and therefore the manifest) is absent - defeating the skip.
function loadManifest(): ManifestRow[] {
  return JSON.parse(readFileSync(new URL('manifest.json', imagesDir), 'utf-8')) as ManifestRow[]
}

describeIfArchived('asset archive manifest', () => {

  it('has a manifest row for every file on disk, and a file for every row', () => {
    const manifest = loadManifest()
    // The archive directory is case-insensitive but case-preserving on macOS (images/Scenarios
    // and images/scenarios are literally the same directory), so comparisons here are
    // case-insensitive to match the filesystem's own semantics.
    const onDisk = new Set(walk(imagesDir).map((f) => f.toLowerCase()))
    const inManifest = new Set(manifest.map((r) => r.file.toLowerCase()))
    for (const row of manifest) {
      expect(existsSync(new URL(`../../../${row.file}`, import.meta.url)), `manifest row missing on disk: ${row.file}`).toBe(true)
    }
    for (const file of onDisk) {
      expect(inManifest, `on-disk file missing from manifest: ${file}`).toContain(file)
    }
  })

  it('every row has a source URL and an asset type', () => {
    const manifest = loadManifest()
    for (const row of manifest) {
      expect(row.source_url, `${row.file} has no source_url`).toBeTruthy()
      expect(row.asset_type, `${row.file} has no asset_type`).toBeTruthy()
    }
  })

  // Sanity counts printed on the game's own components (REFERENCE.md), pinned the same way
  // aspectCanon.test.ts and adversaryCanon.test.ts pin their sets.
  it('has exactly 31 aspect cards', () => {
    const manifest = loadManifest()
    expect(manifest.filter((r) => r.asset_type === 'aspect_card')).toHaveLength(31)
  })

  it('has exactly 8 adversary panels', () => {
    const manifest = loadManifest()
    expect(manifest.filter((r) => r.asset_type === 'adversary_panel')).toHaveLength(8)
  })

  it('has exactly 37 spirit panel fronts and 37 lore backs', () => {
    const manifest = loadManifest()
    expect(manifest.filter((r) => r.asset_type === 'panel_front')).toHaveLength(37)
    expect(manifest.filter((r) => r.asset_type === 'panel_back_lore')).toHaveLength(37)
  })

  it('has exactly 15 distinct scenarios (Surges of Colonization counts once for its two setup variants)', () => {
    const manifest = loadManifest()
    const names = manifest
      .filter((r) => r.asset_type === 'scenario_front' || r.asset_type === 'scenario_back')
      .map((r) => (r.name ?? '').replace(/ \((Normal|Larger) Surges\)$/, ''))
    expect(new Set(names).size).toBe(15)
  })

  it('has approximately 64 event cards (Branch and Claw 25 + Jagged Earth 30 + Nature Incarnate 9)', () => {
    const manifest = loadManifest()
    const count = manifest.filter((r) => r.asset_type === 'event').length
    expect(count, `event count ${count} is nowhere near the expected ~64`).toBeGreaterThanOrEqual(60)
    expect(count, `event count ${count} is nowhere near the expected ~64`).toBeLessThanOrEqual(70)
  })

  // Power/fear/blight aren't printed as a single canonical number anywhere in REFERENCE.md -
  // the manifest itself (populated from cards.js, #02) is the source of truth, so this just
  // checks disk agrees with what the manifest says, rather than pinning a magic count here.
  it('has a matching disk count for every asset type the manifest declares', () => {
    const manifest = loadManifest()
    const byType = new Map<string, number>()
    for (const row of manifest) {
      byType.set(row.asset_type, (byType.get(row.asset_type) ?? 0) + 1)
    }
    for (const [type, count] of byType) {
      const actual = manifest.filter((r) => r.asset_type === type && existsSync(new URL(`../../../${r.file}`, import.meta.url))).length
      expect(actual, `asset_type "${type}" expected ${count} files on disk`).toBe(count)
    }
  })
})
