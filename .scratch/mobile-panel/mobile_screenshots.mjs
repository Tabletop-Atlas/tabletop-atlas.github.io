// mobile-panel seam 2: phone-viewport screenshots for human review (not automated assertions).
// Prior art: .scratch/island-retheme/*_screenshots.mjs. Run a dev server on 5183 first:
//   npm run dev -- --port 5183
import { chromium } from 'playwright'

const BASE = 'http://localhost:5183'
const OUT = '/Users/adamkubovic/Coding Projects/spirit_island/.scratch/mobile-panel/screenshots'
const PHONE = { width: 390, height: 844 }

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: PHONE })
await page.goto(BASE)
await page.waitForSelector('text=Explore every spirit', { timeout: 15000 })

const shot = async (name, opts = {}) => {
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${OUT}/${name}.png`, ...opts })
  console.log(`done ${name}`)
}

// On phone the nav lives in the drawer — open it, then pick the destination.
const navigate = async (label) => {
  await page.click('.deck-menu-toggle')
  await page.waitForTimeout(250)
  await page.click(`#deck-drawer >> text="${label}"`)
  await page.waitForTimeout(250)
}

// 1. shell: home, then the open drawer
await shot('home-390')
await page.click('.deck-menu-toggle')
await shot('drawer-open-390')
// backdrop tap closes it — click right of the 280px drawer, since a centered click lands on the drawer
await page.click('.deck-drawer-backdrop', { position: { x: 340, y: 420 } })
await shot('drawer-closed-again-390')

// 2. browse
await navigate('Browse')
await shot('browse-390')

// 3. recommend: wizard, then answer through to the board and its disclosure
await navigate('Recommend')
await shot('recommend-wizard-390')
for (let i = 0; i < 15; i++) {
  if (await page.isVisible('text=Your top')) break
  await page.click('.deck-choices li button')
  await page.waitForTimeout(120)
  const next = page.locator('.deck-wizard-actions button:not(.deck-ghost)')
  await next.click()
  await page.waitForTimeout(120)
}
await shot('recommend-board-390', { fullPage: true })
await page.click('.deck-answers-disclosure summary')
await shot('recommend-answers-open-390')

// 4. dashboard: totals default, opened matrix, fear + event segments
await navigate('Dashboard')
await shot('dashboard-minor-totals-390', { fullPage: true })
await page.click('.deck-upset-matrix-toggle')
await shot('dashboard-minor-matrix-390')
await page.click('.deck-upset-matrix-toggle') // back to totals
await page.click('.dashboard-segments >> text="Fear"')
await shot('dashboard-fear-390', { fullPage: true })
await page.click('.dashboard-segments >> text="Event"')
await shot('dashboard-event-390', { fullPage: true })

// 5. remaining tabs, quick legibility pass
await navigate('Tier list')
await shot('tiers-390')
await navigate('Log')
await shot('log-390')
await navigate('Settings')
await shot('settings-390')

// 6. desktop sanity: the command deck must be unchanged
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await desktop.goto(BASE)
await desktop.waitForSelector('text=Explore every spirit', { timeout: 15000 })
await desktop.screenshot({ path: `${OUT}/desktop-home-1280.png` })
await desktop.click('text="Dashboard"')
await desktop.waitForTimeout(400)
await desktop.screenshot({ path: `${OUT}/desktop-dashboard-1280.png` })
console.log('done desktop sanity')

// 7. tablet band sanity: 640–900px keeps the current single-column behaviour
const tablet = await browser.newPage({ viewport: { width: 768, height: 1024 } })
await tablet.goto(BASE)
await tablet.waitForSelector('text=Explore every spirit', { timeout: 15000 })
await tablet.screenshot({ path: `${OUT}/tablet-home-768.png` })
console.log('done tablet sanity')

await browser.close()
