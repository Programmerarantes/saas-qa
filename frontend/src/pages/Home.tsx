import { useEffect, useState } from 'react'
import ContentCard from '@/components/ContentCard'
import { getContent, type ContentItem } from '@/lib/api'
import { translations, type Locale } from '@/lib/i18n'
import { BRAND } from '@/lib/branding'

export default function Home({ locale, onNavigate }: { locale: Locale; onNavigate: (path: string) => void }) {
  const t = translations[locale]; const [items, setItems] = useState<ContentItem[]>([])
  useEffect(() => { getContent(locale, undefined, true).then((result) => setItems(result.items)).catch(() => setItems([])) }, [locale])
  return <>
    <section className="hero section-wrap"><div className="hero-copy"><div className="eyebrow">{BRAND.name}</div><h1>{BRAND.role}<br /><span>{t.tagline}</span></h1><p>{t.intro}</p><div className="hero-actions"><a className="button button-primary" href="/articles" onClick={(e) => { e.preventDefault(); onNavigate('/articles') }}>{t.nav.articles} →</a><a className="button button-secondary" href="/test-lab" onClick={(e) => { e.preventDefault(); onNavigate('/test-lab') }}>{t.nav.lab}</a></div></div><div className="hero-note"><span>01</span><p>Observe<br />Question<br />Improve</p><small>Experiments, writing and engineering practice.</small></div></section>
    <section className="section-wrap pillars"><div><span className="pillar-number">01</span><h2>Technical content</h2><p>{t.articlesIntro}</p></div><div><span className="pillar-number">02</span><h2>Case studies</h2><p>{t.casesIntro}</p></div><div><span className="pillar-number">03</span><h2>Test Lab</h2><p>{t.labIntro}</p></div></section>
    <section className="section-wrap content-section"><div className="section-heading"><div><div className="eyebrow">{t.featured}</div><h2>Selected work</h2></div><a href="/articles" onClick={(e) => { e.preventDefault(); onNavigate('/articles') }}>{t.viewAll} →</a></div>{items.length ? <div className="card-grid">{items.map((item) => <ContentCard key={item.id} item={item} locale={locale} onNavigate={onNavigate} />)}</div> : <div className="empty-state">{t.noContent}</div>}</section>
    <section className="section-wrap contact-strip"><div><div className="eyebrow">OPEN TO CONNECTIONS</div><h2>Vamos conversar sobre qualidade?</h2><p>Links e informações profissionais podem ser configurados no conteúdo deste projeto.</p></div><div className="contact-links"><a href={BRAND.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={BRAND.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a><a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('/contact') }}>Contato →</a><a href={BRAND.resume}>Download CV ↓</a></div></section>
  </>
}
