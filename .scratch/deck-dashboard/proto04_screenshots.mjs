import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:5183'
const OUT = '/Users/adamkubovic/Coding Projects/spirit_island/.scratch/deck-dashboard/screenshots-04-proto'
const VARIANTS = ['A', 'B', 'C']
const SEGMENTS = ['Fear', 'Event']

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
for (const v of VARIANTS) {
  await page.goto(`${BASE}/?variant=${v}`)
  await page.waitForSelector('text=Spirit Island', { timeout: 15000 })
  await page.click('button:has-text("Dashboard")')
  await page.waitForTimeout(200)
  for (const seg of SEGMENTS) {
    await page.click(`.dashboard-segments button:has-text("${seg}")`)
    await page.waitForTimeout(250)
    await page.screenshot({ path: `${OUT}/${v}-${seg}.png`, fullPage: true })
    console.log(`done ${v}-${seg}`)
  }
}
await browser.close()
