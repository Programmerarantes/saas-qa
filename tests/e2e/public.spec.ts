import { test, expect } from '@playwright/test'

test('navega da home para o Authentication Lab', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Software Quality Engineer' })).toBeVisible()
  await page.getByRole('link', { name: 'Test Lab' }).first().click()
  await expect(page.getByRole('heading', { name: 'Test Lab' })).toBeVisible()
  await page.getByRole('link', { name: /Abrir aplicação/ }).click()
  await expect(page.getByRole('heading', { name: /autenticação real/i })).toBeVisible()
})
