import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from '../../App'
import { RecommenderMain, RecommenderProvider, RecommenderSide } from '../Recommender'

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

  it('renders the shell and the first wizard question', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('SPIRIT ISLAND')
    expect(html).toContain('Recommend')
    expect(html).toContain('Tier list')
    // Fresh state (memory storage) starts at the wizard, step 0.
    expect(html).toContain('How many players')
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
})
