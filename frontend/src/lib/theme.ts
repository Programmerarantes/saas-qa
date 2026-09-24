export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'sql_theme'

interface ThemeStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function getInitialTheme(storage: ThemeStorage, prefersDark: boolean): Theme {
  const stored = storage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}

export function toggleTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light'
}

export function applyTheme(theme: Theme, storage: ThemeStorage, root: { dataset: DOMStringMap; style: CSSStyleDeclaration }) {
  root.dataset.theme = theme
  root.style.colorScheme = theme
  storage.setItem(THEME_STORAGE_KEY, theme)
}
