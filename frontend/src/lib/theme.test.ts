import { describe, expect, it } from 'vitest'
import { applyTheme, getInitialTheme, toggleTheme, type Theme } from './theme'

function storage(initial?: string) {
  let value = initial ?? null
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => { value = next },
    read: () => value,
  }
}

describe('theme preference', () => {
  it('restores a valid user choice before consulting the system preference', () => {
    expect(getInitialTheme(storage('light'), true)).toBe('light')
    expect(getInitialTheme(storage('dark'), false)).toBe('dark')
  })

  it('uses the system preference when the user has not chosen a theme', () => {
    expect(getInitialTheme(storage(), true)).toBe('dark')
    expect(getInitialTheme(storage(), false)).toBe('light')
  })

  it('toggles between the two supported themes', () => {
    expect(toggleTheme('light')).toBe('dark')
    expect(toggleTheme('dark')).toBe('light')
  })

  it('applies and persists the theme on the document root', () => {
    const saved = storage()
    const root = { dataset: {} as DOMStringMap, style: { colorScheme: '' } as CSSStyleDeclaration }
    applyTheme('dark' as Theme, saved, root)
    expect(root.dataset.theme).toBe('dark')
    expect(root.style.colorScheme).toBe('dark')
    expect(saved.read()).toBe('dark')
  })
})
