import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('schools page is accessible', async ({ page }) => {
    await page.goto('/schools')

    // Should load successfully
    await expect(page).toHaveURL(/\/schools/)

    const content = await page.content()
    expect(content.length).toBeGreaterThan(1000)
  })

  test('leaderboard page is accessible', async ({ page }) => {
    await page.goto('/leaderboard')

    // Should load successfully
    await expect(page).toHaveURL(/\/leaderboard/)
  })

  test('community page is accessible', async ({ page }) => {
    await page.goto('/community')

    // Should load successfully
    await expect(page).toHaveURL(/\/community/)
  })

  test('live page is accessible', async ({ page }) => {
    await page.goto('/live')

    // Should load successfully
    await expect(page).toHaveURL(/\/live/)
  })

  test('homepage is accessible', async ({ page }) => {
    await page.goto('/')

    // Should load successfully
    await expect(page).toHaveURL('/')
  })
})
