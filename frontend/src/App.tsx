import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import About from '@/pages/About'
import ContentList from '@/pages/ContentList'
import ContentDetail from '@/pages/ContentDetail'
import TestLab from '@/pages/TestLab'
import AuthenticationLab from '@/pages/AuthenticationLab'
import AdminLogin from '@/pages/AdminLogin'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminEditor from '@/pages/AdminEditor'
import Contact from '@/pages/Contact'
import type { Locale } from '@/lib/i18n'

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [locale, setLocale] = useState<Locale>((localStorage.getItem('sql_locale') as Locale) || 'pt-BR')
  useEffect(() => { const handler = () => setPath(window.location.pathname); window.addEventListener('popstate', handler); return () => window.removeEventListener('popstate', handler) }, [])
  function navigate(nextPath: string) { setPath(nextPath) }
  function changeLocale(next: Locale) { localStorage.setItem('sql_locale', next); setLocale(next) }
  if (path === '/admin/login') return <AdminLogin onNavigate={navigate} />
  if (path === '/admin' || path === '/admin/content') return <AdminDashboard onNavigate={navigate} />
  if (path === '/admin/content/new') return <AdminEditor onNavigate={navigate} />
  if (path.startsWith('/admin/content/')) return <AdminEditor id={path.split('/').pop()} onNavigate={navigate} />
  let page = <Home locale={locale} onNavigate={navigate} />
  if (path === '/about') page = <About locale={locale} />
  else if (path === '/contact') page = <Contact locale={locale} />
  else if (path === '/articles') page = <ContentList type="ARTICLE" locale={locale} onNavigate={navigate} />
  else if (path === '/cases') page = <ContentList type="CASE_STUDY" locale={locale} onNavigate={navigate} />
  else if (path.startsWith('/articles/')) page = <ContentDetail type="ARTICLE" slug={path.split('/').pop()!} locale={locale} />
  else if (path.startsWith('/cases/')) page = <ContentDetail type="CASE_STUDY" slug={path.split('/').pop()!} locale={locale} />
  else if (path === '/test-lab') page = <TestLab locale={locale} onNavigate={navigate} />
  else if (path === '/test-lab/authentication') page = <AuthenticationLab locale={locale} />
  return <Layout locale={locale} onLocaleChange={changeLocale} onNavigate={navigate}>{page}</Layout>
}
