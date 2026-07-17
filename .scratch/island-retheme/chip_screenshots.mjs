import { chromium } from 'playwright'

const BASE = 'http://localhost:5183'
const OUT = '/Users/adamkubovic/Coding Projects/spirit_island/.scratch/island-retheme/screenshots-03'
const CHIPS = ['original', 'warm']
const WIDTHS = [{ label: '1280', w: 1280, h: 900 }, { label: '375', w: 375, h: 800 }]

const browser = await chromium.launch()

for (const chips of CHIPS) {
  for (const { label: widthLabel, w, h } of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/?theme=A&chips=${chips}`)
    await page.waitForSelector('text=Spirit Island')

    await page.getByRole('button', { name: 'Browse', exact: true }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/${chips}-Browse-${widthLabel}.png` })

    if (widthLabel === '1280') {
      await page.locator('.spirit-tile-open').first().click()
      await page.waitForSelector('.modal.spirit-detail')
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${OUT}/${chips}-SpiritDetail-${widthLabel}.png` })
      await page.locator('.modal-close').click()
      await page.waitForTimeout(200)
    }

    await page.getByRole('button', { name: 'Archive', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Rows', exact: true }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/${chips}-Archive-Powers-Rows-${widthLabel}.png` })

    await page.getByRole('button', { name: 'Fear', exact: true }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/${chips}-Archive-Fear-Rows-${widthLabel}.png` })

    await page.getByRole('button', { name: 'Scenarios', exact: true }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${OUT}/${chips}-Archive-Scenarios-${widthLabel}.png` })

    await page.close()
    console.log(`done ${chips} @ ${widthLabel}`)
  }
}
await browser.close()
