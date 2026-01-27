import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()

    // Should have some content
    const content = await page.content()
    expect(content.length).toBeGreaterThan(1000)
  })

  test('has navigation or header', async ({ page }) => {
    await page.goto('/')

    // Check for navigation (may be nav element or header)
    const nav = page.locator('nav').first()
    const navVisible = await nav.isVisible().catch(() => false)

    const header = page.locator('header').first()
    const headerVisible = await header.isVisible().catch(() => false)

    expect(navVisible || headerVisible).toBe(true)
  })

  test('has navigation elements', async ({ page }) => {
    await page.goto('/')

    // Should have clickable navigation
    const links = await page.getByRole('link').count()
    expect(links).toBeGreaterThan(0)
  })

  test('has main content', async ({ page }) => {
    await page.goto('/')

    // Should have a heading
    const headings = await page.getByRole('heading').count()
    expect(headings).toBeGreaterThan(0)
  })
})
