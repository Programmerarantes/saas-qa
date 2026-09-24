import { ReactNode, useEffect } from 'react'
import type { Locale } from '@/lib/i18n'
import { translations } from '@/lib/i18n'
import { BRAND } from '@/lib/branding'
import type { Theme } from '@/lib/theme'

interface LayoutProps { locale: Locale; theme: Theme; onThemeToggle: () => void; onLocaleChange: (locale: Locale) => void; onNavigate: (path: string) => void; children: ReactNode }

export default function Layout({ locale, theme, onThemeToggle, onLocaleChange, onNavigate, children }: LayoutProps) {
  const t = translations[locale]
  useEffect(() => { document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en' }, [locale])
  function link(path: string) { return (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); window.history.pushState({}, '', path); onNavigate(path) } }
  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="/" onClick={link('/')}><span className="brand-mark">SQ</span><span><strong>{BRAND.name}</strong><small>{BRAND.role}</small></span></a>
      <nav aria-label="Primary navigation" className="main-nav">
        {([['/', t.nav.home], ['/about', t.nav.about], ['/articles', t.nav.articles], ['/cases', t.nav.cases], ['/test-lab', t.nav.lab], ['/contact', locale === 'pt-BR' ? 'Contato' : 'Contact']] as const).map(([path, label]) => <a key={path} href={path} onClick={link(path)}>{label}</a>)}
      </nav>
      <div className="header-actions"><button className="theme-toggle" type="button" onClick={onThemeToggle} aria-label={theme === 'light' ? t.theme.switchToDark : t.theme.switchToLight} title={theme === 'light' ? t.theme.switchToDark : t.theme.switchToLight}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span><span className="theme-toggle-label">{theme === 'light' ? 'Dark' : 'Light'}</span></button><label className="language-switch"><span className="sr-only">{t.language}</span><select value={locale} onChange={(event) => onLocaleChange(event.target.value as Locale)}><option value="pt-BR">PT-BR</option><option value="en">EN</option></select></label><a className="admin-link" href="/admin/login" onClick={link('/admin/login')}>{t.nav.admin}</a></div>
    </header>
    <main>{children}</main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {BRAND.name}</span><span>Built as a quality engineering study.</span></footer>
  </div>
}
