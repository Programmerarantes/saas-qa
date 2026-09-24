import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

export async function renderSafeMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown, { gfm: true, breaks: true })
  return sanitizeHtml(html, {
    allowedTags: ['a', 'blockquote', 'br', 'code', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'li', 'ol', 'p', 'pre', 'strong', 'ul', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: { a: ['href', 'name', 'target', 'rel'], code: ['class'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  })
}
