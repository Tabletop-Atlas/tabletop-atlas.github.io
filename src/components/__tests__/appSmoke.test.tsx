import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import { EXPANSIONS, EVENT_CLASSES, FEAR_TAGS, type Spirit } from '../../domain/types'
import { subtypeLabel } from '../tagColors'
import App from '../../App'
import { collectionStore } from '../../domain/collectionStore'
import { gameLog } from '../../domain/gameLog'
import { tierStore } from '../../domain/tierStore'
import type { FearCard } from '../../domain/impactBreakdown'
import type { EventCard } from '../../domain/valenceBreakdown'
import { AvatarChip } from '../AvatarChip'
import { DashboardTab } from '../DashboardTab'
import { EventValenceView } from '../EventValenceView'
import { FearImpactView } from '../FearImpactView'
import { GameLog } from '../GameLog'
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

  it('phone shell: the hamburger toggle carries aria-expanded/aria-controls/label, and the closed drawer still holds the nav (mobile-panel)', () => {
    const html = renderToStaticMarkup(<App />)
    // The drawer starts closed…
    expect(html).toContain('data-drawer-open="false"')
    expect(html).toContain('aria-expanded="false" aria-controls="deck-drawer" aria-label="Menu"')
    // …but the nav destinations are rendered-but-off-canvas, never absent: the full label list
    // lives inside the drawer element itself.
    const drawer = html.slice(html.indexOf('id="deck-drawer"'), html.indexOf('</nav>'))
    expect(drawer).toContain('deck-nav')
    for (const label of ['Browse', 'Recommend', 'Archive', 'Dashboard', 'Tier list', 'Log', 'Settings']) {
      expect(drawer).toContain(`>${label}<`)
    }
    // The top bar's logo is a second Home button — still the only route home, no >Home< label.
    expect(html.match(/aria-label="Home"/g)!.length).toBe(2)
  })

  it('Recommend phone disclosure: "Your answers" is a details element above the results, collapsed by default (mobile-panel)', () => {
    const html = renderToStaticMarkup(
      <RecommenderProvider initialPhase="board">
        <RecommenderMain />
      </RecommenderProvider>,
    )
    // Collapsed by default: no `open` attribute on the disclosure.
    expect(html).toMatch(/<details class="deck-answers-disclosure">/)
    expect(html).toContain('<summary')
    expect(html).toContain('Your answers')
    // The disclosure precedes the results in the markup — controls sit above the shortlist.
    expect(html.indexOf('deck-answers-disclosure')).toBeLessThan(html.indexOf('Your top'))
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
    // Default boot is now Red's Final Tier List — a cited list credits its author, title and link.
    const board = renderToStaticMarkup(<TierBoard />)
    expect(board).toContain('By Red')
    // The apostrophe renders HTML-escaped (Red&#x27;s), so assert an apostrophe-free substring.
    expect(board).toContain('Final Tier List: Part 11: UPDATED 2/20/2025')
    expect(board).toContain('href="https://www.youtube.com/watch?v=LoP2T4GO4xo"')

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
    // Default boot is now Red's cited list — no edit affordance.
    const citedBoard = renderToStaticMarkup(<TierBoard />)
    expect(citedBoard).not.toContain('Edit tiers')
    expect(citedBoard).toContain('switch to a personal list to make changes')

    // A personal list gets the affordance.
    const created = tierStore.createList({ name: 'Smoke Personal', type: 'strength', subject: 'configurations' })
    tierStore.setActiveListId(created.id)
    try {
      expect(renderToStaticMarkup(<TierBoard />)).toContain('Edit tiers')
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

  it('the Dashboard tab renders a Minor/Major/Fear/Event segmented control (deck-dashboard #06/#03)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('>Dashboard<')
    for (const segment of ['Minor', 'Major', 'Fear', 'Event']) {
      expect(html).toContain(`>${segment}<`)
    }
    expect(html).toContain('cards')
  })

  it('the Dashboard Minor segment shows the full-deck assumption label (deck-dashboard #07)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('Odds assume a full deck, nothing drawn.')
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

  it('the Dashboard Minor segment shows the speed/cost facets (deck-dashboard #09/#03)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('Facets')
    expect(html).toContain('Fast')
    expect(html).toContain('Slow')
  })

  it('reads at phone width like the rest of the mobile-panel treatment: no UpSet-only phone chrome is left behind', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).not.toContain('deck-upset')
    expect(html).not.toContain('Show full matrix')
  })

  it('with no spirit picked, the Minor segment shows a prompt, not a chart (element-demand #02)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('evenly across all 8')
    expect(html).not.toContain('deck-demand-table')
    expect(html).not.toContain('Element-gap odds')
  })

  it('picking a spirit renders the demand block: headline stat, a row per demanded element, off-affinity marked (element-demand #02)', () => {
    const html = renderToStaticMarkup(<DashboardTab initialSpiritId="lightnings-swift-strike" />)
    expect(html).toMatch(/\d+% of minors hit 2 or more of what you want/)
    expect(html).toContain('deck-demand-table')
    expect(html).toContain('no affinity')
    // Fire, Air, Water are demanded; Sun, Moon, Earth, Plant, Animal collapse to the footer.
    expect(html).toContain('No innate demand:')
  })

  it('a spirit whose aspect modifies its innate(s) carries the base-thresholds caption (element-demand #02)', () => {
    const html = renderToStaticMarkup(<DashboardTab initialSpiritId="lightnings-swift-strike::Pandemonium" />)
    expect(html).toContain('Thresholds shown are the base spirit&#x27;s')
  })

  it('a spirit whose aspects never touch its innate(s) gets no caption (element-demand #02)', () => {
    const html = renderToStaticMarkup(<DashboardTab initialSpiritId="oceans-hungry-grasp" />)
    expect(html).not.toContain('Thresholds shown are the base spirit&#x27;s')
  })

  it('the demand block renders on both the Minor and Major segments', () => {
    const minorHtml = renderToStaticMarkup(<DashboardTab initialSpiritId="lightnings-swift-strike" />)
    expect(minorHtml).toContain('deck-demand-table')

    const majorHtml = renderToStaticMarkup(<DashboardTab initialSegment="Major" initialSpiritId="lightnings-swift-strike" />)
    expect(majorHtml).toContain('deck-demand-table')
  })

  it('the Dashboard has a spirit picker defaulting to "No spirit", listing all 37 spirits (deck-dashboard #10)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('Highlight my spirit')
    expect(html).toContain('>No spirit<')
    for (const spirit of spirits) {
      expect(html).toContain(spirit.name.replace(/&/g, '&amp;').replace(/'/g, '&#x27;'))
    }
  })

  it('the free-form element picker is an 8-chip icon strip and a 1–6 count chip row, not a native select/number (dashboard-picker-glossary #01)', () => {
    const html = renderToStaticMarkup(<DashboardTab />)
    expect(html).toContain('dashboard-element-strip')
    expect(html).toContain('dashboard-count-chips')
    expect(html).toContain('How many of an element do I want?')
    // Eight element chips (icon + name) and six count chips (class names are exact, not the strip containers).
    expect((html.match(/class="dashboard-element-chip"/g) ?? []).length).toBe(8)
    expect((html.match(/class="dashboard-count-chip"/g) ?? []).length).toBe(6)
    // The free-form block no longer ships a "Pick one" dropdown or a number box.
    expect(html).not.toContain('>Pick one<')
    expect(html).not.toMatch(/type="number"/)
  })

  it('picking a spirit seeds the free-form picker to that spirit\u2019s lowest-odds demanded element (dashboard-picker-glossary #02)', () => {
    // Lightning\u2019s first-rung demand is Fire 3 / Air 1; Fire has the lower odds on the minor pool.
    const html = renderToStaticMarkup(<DashboardTab initialSpiritId="lightnings-swift-strike" />)
    expect(html).toMatch(/dashboard-element-chip[^>]*data-active="true"[^>]*>[\s\S]*?Fire/)
    expect(html).toMatch(/dashboard-count-chip[^>]*data-active="true"[^>]*>3</)
    expect(html).toMatch(/% chance of drawing at least 3 Fire/)
  })

  it('the Dashboard Fear segment shows the variant-D impact view: stat tiles, stacked bar, tag facet, hidden-subset framing copy, no by-expansion facet (deck-dashboard #19)', () => {
    const html = renderToStaticMarkup(<DashboardTab initialSegment="Fear" />)
    expect(html).toContain('cards')
    expect(html).toContain('hidden subset of this pool')
    expect(html).toContain('this pool&#x27;s share')
    expect(html).toContain('rating-tiles')
    expect(html).toContain('weak')
    expect(html).toContain('solid')
    expect(html).toContain('strong')
    expect(html).toContain('rating-stacked-bar')
    expect(html).toContain('By fear tag')
    for (const tag of FEAR_TAGS) {
      expect(html).toContain(subtypeLabel(tag))
    }
    expect(html).not.toContain('By expansion')
    expect(html).not.toContain('rating-chip-drill')
    expect(html).not.toContain('Fear segment — coming soon.')
  })

  it('Fear and Event views wire defined glossary terms as dotted-underline Term buttons (dashboard-picker-glossary #03)', () => {
    const fear = renderToStaticMarkup(<DashboardTab initialSegment="Fear" />)
    expect(fear).toContain('class="term"')
    expect(fear).toContain('>weak<')
    expect(fear).toContain('>solid<')
    expect(fear).toContain('>strong<')
    // Fear tags are defined in the map → Term affordance present.
    expect(fear).toContain('>Removal<')

    const event = renderToStaticMarkup(<DashboardTab initialSegment="Event" />)
    expect(event).toContain('class="term"')
    expect(event).toContain('>Harmful<')
    expect(event).toContain('>Mixed<')
    expect(event).toContain('>Beneficial<')
    // Event classes have no in-repo definition → plain text (no term button wrapping Choice alone
    // would be hard to assert; the owner-TODO list documents the absence). Labels still render.
    expect(event).toContain('Choice')
  })

  it('the Fear impact view drills a stat tile into its exact cards, with a clear control (deck-dashboard #19)', () => {
    const cards: FearCard[] = [
      { name: 'Weak One', expansion: 'Base', kind: 'fear', image: 'cards/fear/weak_one.webp', tags: [], impact: 1, impactSource: 'judgment' },
      { name: 'Solid One', expansion: 'Base', kind: 'fear', image: 'cards/fear/solid_one.webp', tags: ['removal'], impact: 2, impactSource: 'judgment' },
    ]
    const html = renderToStaticMarkup(<FearImpactView cards={cards} />)
    expect(html).not.toContain('rating-chip-drill')

    const withDrill = renderToStaticMarkup(<FearImpactView cards={cards} initialPicked={{ impact: 1, tag: null }} />)
    expect(withDrill).toContain('rating-chip-drill')
    expect(withDrill).toContain('Weak One')
    expect(withDrill).not.toContain('Solid One')
    expect(withDrill).toContain('Clear')
  })

  it('the Dashboard Event segment shows the variant-D valence view: stat tiles, stacked bar, class facet, no by-expansion facet (deck-dashboard #20)', () => {
    const html = renderToStaticMarkup(<DashboardTab initialSegment="Event" />)
    expect(html).toContain('cards')
    expect(html).toContain('this pool&#x27;s share')
    expect(html).toContain('rating-tiles')
    expect(html).toContain('Harmful')
    expect(html).toContain('Mixed')
    expect(html).toContain('Beneficial')
    expect(html).toContain('rating-stacked-bar')
    expect(html).toContain('By event class')
    for (const eventClass of EVENT_CLASSES) {
      expect(html).toContain(subtypeLabel(eventClass))
    }
    expect(html).not.toContain('By expansion')
    expect(html).not.toContain('rating-chip-drill')
    expect(html).not.toContain('Event segment — coming soon.')
  })

  it('the Event valence view drills a stat tile into its exact cards, with a clear control (deck-dashboard #20)', () => {
    const cards: EventCard[] = [
      { name: 'Harmful One', expansion: 'Base', kind: 'event', image: 'cards/event/harmful_one.webp', eventClass: 'choice', valence: 'harmful', valenceSource: 'judgment' },
      { name: 'Beneficial One', expansion: 'Base', kind: 'event', image: 'cards/event/beneficial_one.webp', eventClass: 'stage', valence: 'beneficial', valenceSource: 'judgment' },
    ]
    const html = renderToStaticMarkup(<EventValenceView cards={cards} />)
    expect(html).not.toContain('rating-chip-drill')

    const withDrill = renderToStaticMarkup(<EventValenceView cards={cards} initialPicked={{ valence: 'harmful', eventClass: null }} />)
    expect(withDrill).toContain('rating-chip-drill')
    expect(withDrill).toContain('Harmful One')
    expect(withDrill).not.toContain('Beneficial One')
    expect(withDrill).toContain('Clear')
  })

  it('AvatarChip renders spirit, adversary and scenario modes without crashing (log-modernize #02)', () => {
    const spirit = spirits[0]
    expect(() => renderToStaticMarkup(<AvatarChip kind="spirit" spirit={spirit} name={spirit.name} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<AvatarChip kind="adversary" name="England" />)).not.toThrow()
    expect(() => renderToStaticMarkup(<AvatarChip kind="scenario" name="Blitz" />)).not.toThrow()
    const html = renderToStaticMarkup(
      <>
        <AvatarChip kind="spirit" spirit={spirit} name={spirit.name} />
        <AvatarChip kind="adversary" name="England" />
        <AvatarChip kind="scenario" name="Blitz" />
      </>,
    )
    expect((html.match(/avatar-chip/g) ?? []).length).toBeGreaterThanOrEqual(3)
    expect(html).toContain(spirit.name.replace(/&/g, '&amp;').replace(/'/g, '&#x27;'))
    expect(html).toContain('England')
    expect(html).toContain('Blitz')
  })

  it('the modernised Log renders the panelled form, table history, avatar chips and delete control (log-modernize #01/#03/#04)', () => {
    const previous = gameLog.list()
    gameLog.replaceAll([])
    try {
      gameLog.append({
        date: '2026-07-23T12:00:00.000Z',
        players: [
          { name: 'Adam', configId: 'lightnings-swift-strike' },
          { name: 'Jo', configId: 'river-surges-in-sunlight' },
        ],
        adversary: 'England',
        adversaryLevel: 3,
        scenario: 'Blitz',
        outcome: 'win',
        notes: 'close game',
      })
      const html = renderToStaticMarkup(<GameLog />)
      expect(html).toContain('Game log')
      expect(html).toContain('log-panel')
      expect(html).toContain('Record a game')
      expect(html).toContain('Notes (optional)')
      expect(html).toContain('log-textarea')
      expect(html).toContain('Statistics')
      expect(html).toContain('log-table')
      expect(html).toContain('avatar-chip')
      expect(html).toContain('England')
      expect(html).toContain('Blitz')
      expect(html).toContain('close game')
      expect(html).toContain('log-delete')
      expect(html).toContain('only in this browser')
      expect(html).toContain('backup export')
    } finally {
      gameLog.replaceAll(previous)
    }
  })

  it('the Dashboard Event segment states plainly that a base-game-only set has no events, rather than an error or blank screen (deck-dashboard #12)', () => {
    // Base-game-only: exclude every other expansion so the checked set (defaulting to the
    // Collection) narrows to Base, which ships zero events.
    for (const expansion of EXPANSIONS) {
      if (expansion !== 'Base') collectionStore.setOwned(expansion, false)
    }
    try {
      const html = renderToStaticMarkup(<DashboardTab initialSegment="Event" />)
      expect(html).toContain('0 cards')
      expect(html).toContain('No events in this set')
      expect(html).not.toContain('By event class')
    } finally {
      collectionStore.resetAll()
    }
  })
})
