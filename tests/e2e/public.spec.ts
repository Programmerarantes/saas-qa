import { test, expect } from '@playwright/test'

test('navega da home para o Authentication Lab', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Software Quality Engineer' })).toBeVisible()
  await page.getByRole('link', { name: 'Test Lab' }).first().click()
  await expect(page.getByRole('heading', { name: 'Test Lab' })).toBeVisible()
  await page.getByRole('link', { name: /Abrir aplicação/ }).click()
  await expect(page.getByRole('heading', { name: /autenticação real/i })).toBeVisible()
})

test('alterna o tema e mantém a escolha depois de recarregar', async ({ page }) => {
  await page.goto('/')
  const themeButton = page.getByRole('button', { name: 'Ativar tema escuro' })
  await expect(themeButton).toBeVisible()
  await themeButton.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Ativar tema claro' })).toBeVisible()

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
