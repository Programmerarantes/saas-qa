import type { ContentItem } from '@/lib/api'
import type { Locale } from '@/lib/i18n'

export default function ContentCard({ item, locale, onNavigate }: { item: ContentItem; locale: Locale; onNavigate: (path: string) => void }) {
  const title = item.translation.title
  return <article className="content-card"><div className="eyebrow">{item.type === 'CASE_STUDY' ? 'CASE STUDY' : 'ARTICLE'} · {item.category}</div><h3>{title}</h3><p>{item.translation.summary}</p><div className="card-footer"><span>{item.tags.slice(0, 2).map((tag) => `#${tag}`).join(' ')}</span><a href={`/${item.type === 'CASE_STUDY' ? 'cases' : 'articles'}/${item.slug}`} onClick={(event) => { event.preventDefault(); onNavigate(`/${item.type === 'CASE_STUDY' ? 'cases' : 'articles'}/${item.slug}`) }}>{locale === 'pt-BR' ? 'Ler conteúdo →' : 'Read content →'}</a></div></article>
}
