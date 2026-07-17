import { chromium } from 'playwright'

const BASE = 'http://localhost:5183'
const OUT = '/Users/adamkubovic/Coding Projects/spirit_island/.scratch/island-retheme/screenshots-02'
const THEMES = [null, 'A', 'B', 'C']
const WIDTHS = [{ label: '1280', w: 1280, h: 900 }, { label: '375', w: 375, h: 800 }]
const TABS = [
  { label: 'Browse', selector: 'button:has-text("Browse")' },
  { label: 'Archive', selector: 'button:has-text("Archive")' },
  { label: 'Tiers', selector: 'button:has-text("Tier list")' },
]

const browser = await chromium.launch()
for (const theme of THEMES) {
  const url = theme ? `${BASE}/?theme=${theme}` : `${BASE}/`
  const themeLabel = theme ?? 'baseline'
  for (const { label: widthLabel, w, h } of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    await page.goto(url)
    await page.waitForSelector('text=Spirit Island', { timeout: 15000 })
    for (const tab of TABS) {
      await page.click(tab.selector)
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${OUT}/${themeLabel}-${tab.label}-${widthLabel}.png`, fullPage: false })
    }
    await page.close()
    console.log(`done ${themeLabel} @ ${widthLabel}`)
  }
}
await browser.close()
