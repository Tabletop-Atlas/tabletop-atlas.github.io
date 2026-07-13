import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import type { Spirit } from '../../domain/types'
import App from '../../App'
import { RecommenderMain, RecommenderProvider, RecommenderSide } from '../Recommender'
import { Settings } from '../Settings'
import { SpiritDetail } from '../SpiritDetail'
import { TierEditor } from '../TierEditor'

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

  it('nav starts with Browse and ends with Settings (#13/#14, the locked calls)', () => {
    const html = renderToStaticMarkup(<App />)
    const nav = html.slice(html.indexOf('deck-nav'), html.indexOf('</nav>'))
    // Browse is the FIRST nav button, not merely before Recommend.
    expect(nav.match(/<button[^>]*>([^<]+)<\/button>/)?.[1]).toBe('Browse')
    const labels = [...nav.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map((m) => m[1])
    expect(labels[labels.length - 1]).toBe('Settings')
    const order = ['Browse', 'Recommend', 'Archive', 'Tier list'].map((label) => nav.indexOf(`>${label}<`))
    expect(order.every((i) => i > -1)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })

  it('Settings holds exactly the three migrated sections; Customise tiers holds none of them (#14)', () => {
    const settings = renderToStaticMarkup(<Settings />)
    expect(settings).toContain('Backup')
    expect(settings).toContain('My collection')
    expect(settings).toContain('Complexity overrides')
    // "Exactly" the three migrated sections — a fourth section heading would be scope creep.
    expect(settings.match(/<h3>/g)).toHaveLength(3)

    const editor = renderToStaticMarkup(<TierEditor />)
    expect(editor).toContain('Customise tiers')
    expect(editor).not.toContain('Backup')
    expect(editor).not.toContain('My collection')
    expect(editor).not.toContain('Complexity overrides')
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

  it('shows the labelled-bars OCFDU profile with element chips (#11: a 5-rated axis fills the track)', () => {
    const lightning = spirits.find((s) => s.id === 'lightnings-swift-strike')! // offense 5, Air + Fire
    const html = renderToStaticMarkup(<SpiritDetail spirit={lightning} onClose={() => {}} />)
    for (const label of ['Offense', 'Control', 'Fear', 'Defense', 'Utility']) {
      expect(html).toContain(label)
    }
    expect(html).toContain('width:100%')
    expect(html).toContain('Air')
    expect(html).toContain('Fire')
  })

  it('clamps a transcribed 6 at the full track but shows the true figure (#11)', () => {
    const behemoth = spirits.find((s) => s.id === 'ember-eyed-behemoth')! // offense 6
    const html = renderToStaticMarkup(<SpiritDetail spirit={behemoth} onClose={() => {}} />)
    expect(html).toContain('width:100%')
    expect(html).not.toContain('width:120%')
    expect(html).toContain('>6<')
  })

  it('says a spirit is not rated by the active list when it has no tier entry', () => {
    const unrated: Spirit = { ...spirits[0], id: 'a-spirit-no-list-has-ever-heard-of' }
    const html = renderToStaticMarkup(<SpiritDetail spirit={unrated} onClose={() => {}} />)
    expect(html).toContain('not rated by this list')
  })

  it('omits the card row entirely for a spirit with no startingCards, rather than rendering placeholders', () => {
    const noCards: Spirit = { ...spirits[0], startingCards: undefined }
    const html = renderToStaticMarkup(<SpiritDetail spirit={noCards} onClose={() => {}} />)
    expect(html).not.toContain('Starting cards')
  })
})
