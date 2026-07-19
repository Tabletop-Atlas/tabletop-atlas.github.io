import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import { EXPANSIONS, type Spirit } from '../../domain/types'
import App from '../../App'
import { tierStore } from '../../domain/tierStore'
import { DashboardTab } from '../DashboardTab'
import { RecommenderMain, RecommenderProvider, RecommenderSide } from '../Recommender'
import { Settings } from '../Settings'
import { SpiritDetail } from '../SpiritDetail'
import { TierBoard } from '../TierBoard'

const spirits = spiritsData as Spirit[]

/**
 * The UI is deliberately not unit-tested (it's glue over the four domain seams). This is the
 * one exception: a single smoke render that fails loudly if the app cannot mount at all —
 * a broken context provider, a bad questionnaire index, a missing export. Typechecking
 * cannot catch those. Rendered on the server, so no DOM or localStorage is required.
 */
describe('app smoke', () => {
  it('renders without throwing', () => {
    expect(() => renderToStaticMarkup(<App />)).not.toThrow()
  })

  it('boots to the homepage: framing lines, three doors, disclaimer, outbound game link (#13)', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('Explore every spirit')
    expect(html).toContain('Not sure what to play?')
    expect(html).toContain('How do they rank?')
    expect(html).toContain('unofficial, fan-made companion')
    expect(html).toContain('not affiliated with the Spirit Island rights holders')
    expect(html).toContain('https://shop.greaterthangames.com/pages/spirit-island')
    // The door art ids are hand-typed in Homepage.tsx; pin them so a typo can't silently
    // fall back to another spirit's art.
    expect(html).toContain('spirits/lightnings-swift-strike.webp')
    expect(html).toContain('spirits/river-surges-in-sunlight.webp')
    expect(html).toContain('spirits/a-spread-of-rampant-green.webp')
    // Boot is the homepage, not the recommender wizard.
    expect(html).not.toContain('How do you like to beat your opponents?')
  })

  it('the logo is the only route home: a Home button wraps it, and no nav item is active on boot (#13)', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('aria-label="Home"')
    expect(html).toContain('alt="Spirit Island"')
    const nav = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'))
    expect(nav).not.toContain('data-active="true"')
    // No Home nav button: "Home" appears only as the logo's accessible label.
    expect(html.match(/>Home</g)).toBeNull()
  })

  it('nav reads exactly Browse, Recommend, Archive, Dashboard, Tier list, Log, Settings (#13/#14/#15/deck-dashboard #06)', () => {
    const html = renderToStaticMarkup(<App />)
    const nav = html.slice(html.indexOf('deck-nav'), html.indexOf('</nav>'))
    const labels = [...nav.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map((m) => m[1])
    expect(labels).toEqual(['Browse', 'Recommend', 'Archive', 'Dashboard', 'Tier list', 'Log', 'Settings'])
  })

  it('Settings holds exactly the three migrated sections (#14) plus the default-list pick (#18)', () => {
    const settings = renderToStaticMarkup(<Settings />)
    expect(settings).toContain('Backup')
    expect(settings).toContain('Default tier list')
    expect(settings).toContain('My collection')
    expect(settings).toContain('Complexity overrides')
    // "Exactly" these sections — a fifth heading would be scope creep.
    expect(settings.match(/<h3>/g)).toHaveLength(4)
  })

  it('the credit line renders for the default boot state, and a cited list credits author, title and link (#18)', () => {
    // Default boot: the owner's board — a personal list shows its personal origin, no citation.
    const board = renderToStaticMarkup(<TierBoard />)
    expect(board).toContain('your list')
    expect(board).toContain('By you')

    tierStore.setActiveListId('3mbg-strength-solo-2025')
    try {
      const cited = renderToStaticMarkup(<TierBoard />)
      expect(cited).toContain('By 3 Minute Board Games')
      expect(cited).toContain('Tier ranking all the official spirits in Spirit Island (2025)')
      expect(cited).toContain('href="https://www.youtube.com/watch?v=d130MTU08fg"')
    } finally {
      tierStore.setActiveListId('owners-board')
    }
  })

  it('a personal minor-powers list renders card tiles on the board, and a rated card lands in its row (#16)', () => {
    const created = tierStore.createList({ name: 'Smoke Card List', type: 'strength', subject: 'minor-powers' })
    tierStore.setActiveListId(created.id)
    try {
      tierStore.setTier('Call of the Dahan Ways', 'S', 'minor-powers')
      const html = renderToStaticMarkup(<TierBoard initialSubject="minor-powers" />)
      expect(html).toContain('Call of the Dahan Ways')
      expect(html).toContain('tier-tile-card-art')
      // The board shows the card pool, not spirit configurations.
      expect(html).not.toContain('tier-tile-art"')
      expect(html).toContain('101 cards here')
    } finally {
      tierStore.setActiveListId('owners-board')
    }
  })

  it('the tier board offers Edit tiers only on a personal list; a cited list gets no affordance (#15)', () => {
    // Default active list is the owner's board (personal).
    expect(renderToStaticMarkup(<TierBoard />)).toContain('Edit tiers')

    tierStore.setActiveListId('3mbg-strength-solo-2025')
    try {
      const citedBoard = renderToStaticMarkup(<TierBoard />)
      expect(citedBoard).not.toContain('Edit tiers')
      expect(citedBoard).toContain('switch to a personal list to make changes')
    } finally {
      tierStore.setActiveListId('owners-board')
    }
  })

  it('throws a useful error if recommender components are used outside the provider', () => {
    expect(() => renderToStaticMarkup(<RecommenderMain />)).toThrow(/RecommenderProvider/)
  })

  it('hides the live controls until the questionnaire is done', () => {
    // Phase starts as "wizard", so the sidebar knobs must not render yet.
    const html = renderToStaticMarkup(
      <RecommenderProvider>
        <RecommenderSide />
      </RecommenderProvider>,
    )
    expect(html).toBe('')
  })

  it('renders the spirit detail view for a spirit without throwing, even with no panel or card images present', () => {
    const spirit = spirits[0]
    expect(() => renderToStaticMarkup(<SpiritDetail spirit={spirit} onClose={() => {}} />)).not.toThrow()
    const html = renderToStaticMarkup(<SpiritDetail spirit={spirit} onClose={() => {}} />)
    expect(html).toContain('spirit-detail')
    expect(html).toContain(spirit.summary)
  })

  it('shows the labelled-bars OCFDU profile with element chips (#11; #23 flipped the fill vertical: a 5-rated axis fills the track)', () => {
    const lightning = spirits.find((s) => s.id === 'lightnings-swift-strike')! // offense 5, Air + Fire
    const html = renderToStaticMarkup(<SpiritDetail spirit={lightning} onClose={() => {}} />)
    for (const label of ['Offense', 'Control', 'Fear', 'Defense', 'Utility']) {
      expect(html).toContain(label)
    }
    expect(html).toContain('height:100%')
    expect(html).toContain('Air')
    expect(html).toContain('Fire')
  })

  it('wears the panel treatment: the modal carries the panel palette as CSS variables (panel-theming #03, owner picked C)', () => {
    const lightning = spirits.find((s) => s.id === 'lightnings-swift-strike')!
    const html = renderToStaticMarkup(<SpiritDetail spirit={lightning} onClose={() => {}} />)
    // PANEL_COLOR is injected on the modal root, so the shipped umber surface + band-tan accent
    // are present; a regression that dropped the treatment would drop these.
    expect(html).toContain('--panel-surface:#241d12')
    expect(html).toContain('--panel-accent:#d2b068')
    // The theme is presentation only — the #23 bars and #11 truth rules survive it (asserted in
    // the clamp test below); no `?panel=` scaffolding remains.
    expect(html).not.toContain('panel-switcher')
  })

  it('clamps a transcribed 6 at the full track but shows the true figure (#11/#23)', () => {
    const behemoth = spirits.find((s) => s.id === 'ember-eyed-behemoth')! // offense 6
    const html = renderToStaticMarkup(<SpiritDetail spirit={behemoth} onClose={() => {}} />)
    expect(html).toContain('height:100%')
    expect(html).not.toContain('height:120%')
    expect(html).toContain('>6<')
  })

  it('shows an outlined "unrated" chip when the active list has no tier entry (#17: honest absence)', () => {
    const unrated: Spirit = { ...spirits[0], id: 'a-spirit-no-list-has-ever-heard-of' }
    const html = renderToStaticMarkup(<SpiritDetail spirit={unrated} onClose={() => {}} />)
    expect(html).toContain('tier-chip-unrated')
    expect(html).toContain('>unrated<')
  })

  it('shows a coloured head tier chip and one chip per aspect row, from the active list (#17)', () => {
    const lightning = spirits.find((s) => s.id === 'lightnings-swift-strike')!
    const html = renderToStaticMarkup(<SpiritDetail spirit={lightning} onClose={() => {}} />)
    // Head chip: the owner's board rates the base config, so the chip carries a colour.
    expect(html).toContain('spirit-detail-tier-line')
    expect(html).toMatch(/tier-chip" style="background-color/)
    // One chip per aspect row (4 aspects) + the head chip.
    expect(html.match(/tier-chip/g)!.length).toBeGreaterThanOrEqual(5)
  })

  it('highlights the clicked aspect row when opened from an aspect tile (#17)', () => {
    const lightning = spirits.find((s) => s.id === 'lightnings-swift-strike')!
    const html = renderToStaticMarkup(
      <SpiritDetail spirit={lightning} onClose={() => {}} highlightAspect="Sparking" />,
    )
    expect(html.match(/aspect-row-highlight/g)).toHaveLength(1)
  })

  it('omits the card row entirely for a spirit with no startingCards, rather than rendering placeholders', () => {
    const noCards: Spirit = { ...spirits[0], startingCards: undefined }
    const html = renderToStaticMarkup(<SpiritDetail spirit={noCards} onClose={() => {}} />)
    expect(html).not.toContain('Starting cards')
  })

  it('the Dashboard tab renders a Minor/Major/Fear/Event segmented control, with all 8 elements as rows in the Minor segment (deck-dashboard #06)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('>Dashboard<')
    for (const segment of ['Minor', 'Major', 'Fear', 'Event']) {
      expect(html).toContain(`>${segment}<`)
    }
    for (const element of ['Sun', 'Moon', 'Fire', 'Air', 'Water', 'Earth', 'Plant', 'Animal']) {
      expect(html).toContain(`>${element}<`)
    }
    expect(html).toContain('cards')
  })

  it('the Dashboard Minor segment defaults its draw stepper to 4 and shows the full-deck assumption label (deck-dashboard #07)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('value="4"')
    expect(html).toContain('Odds assume a full deck, nothing drawn.')
    expect(html).toContain('deck-element-odds')
  })

  it('the Dashboard expansion picker lists all 7 expansions, checked by default (owns-everything Collection), no unowned annotation (deck-dashboard #08)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('Expansions in play')
    for (const expansion of EXPANSIONS) {
      expect(html).toContain(expansion.replace('&', '&amp;'))
    }
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(EXPANSIONS.length)
    expect((html.match(/checked=""/g) ?? []).length).toBe(EXPANSIONS.length)
    expect(html).not.toContain('unowned-note')
  })
})
