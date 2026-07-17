import { chromium } from 'playwright'

const BASE = 'http://localhost:5183'
const OUT = '/Users/adamkubovic/Coding Projects/spirit_island/.scratch/island-retheme/screenshots-05'
const ORNAMENT_VARIANTS = ['rules', 'corners', 'vines']
const WIDTHS = [375, 1280]

const browser = await chromium.launch()

for (const width of WIDTHS) {
  // baseline: theme=B, no ornament param
  const basePage = await browser.newPage({ viewport: { width, height: 900 } })
  await basePage.goto(`${BASE}/?theme=B`)
  await basePage.waitForSelector('text=Spirit Island')
  await basePage.getByRole('button', { name: 'Browse', exact: true }).click()
  await basePage.waitForTimeout(300)
  await basePage.screenshot({ path: `${OUT}/baseline-Shell-Browse-${width}.png` })
  await basePage.close()

  for (const ornament of ORNAMENT_VARIANTS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    await page.goto(`${BASE}/?theme=B&ornament=${ornament}`)
    await page.waitForSelector('text=Spirit Island')
    await page.getByRole('button', { name: 'Browse', exact: true }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/${ornament}-Shell-Browse-${width}.png` })
    await page.close()
    console.log(`done ${ornament} @ ${width}`)
  }
}
await browser.close()
