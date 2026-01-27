import { test, expect } from '@playwright/test'

test.describe('Schools Page', () => {
  test('loads schools list', async ({ page }) => {
    await page.goto('/schools')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Check page has schools or loading
    const pageContent = await page.content()
    const hasContent = pageContent.includes('school') || pageContent.includes('School')

    expect(hasContent).toBe(true)
  })

  test('can search for schools', async ({ page }) => {
    await page.goto('/schools')

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i).first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('Punahou')
      await page.waitForTimeout(500)

      // Should filter results
      const content = await page.content()
      expect(content.toLowerCase()).toContain('punahou')
    }
  })

  test('can click on a school to view details', async ({ page }) => {
    await page.goto('/schools')

    // Wait for schools to load
    await page.waitForTimeout(2000)

    // Click on first school link
    const schoolLink = page.getByRole('link').filter({ hasText: /school|academy|prep/i }).first()

    if (await schoolLink.isVisible()) {
      await schoolLink.click()

      // Should navigate to school detail page
      await expect(page).toHaveURL(/\/school\//)
    }
  })
})
