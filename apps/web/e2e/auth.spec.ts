import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login')

    // Check login page has some content
    await expect(page.locator('body')).toContainText(/sign|log|phone|email/i)
  })

  test('login page has authentication methods', async ({ page }) => {
    await page.goto('/login')

    // Page should have input fields or tabs for auth
    const pageContent = await page.content()
    const hasAuthContent = pageContent.toLowerCase().includes('phone') ||
      pageContent.toLowerCase().includes('email') ||
      pageContent.toLowerCase().includes('sign')

    expect(hasAuthContent).toBe(true)
  })

  test('redirect parameter is preserved', async ({ page }) => {
    await page.goto('/login?redirect=/profile')

    // Check URL still has redirect param
    await expect(page).toHaveURL(/redirect/)
  })
})
