import DOMPurify from 'dompurify'
import { marked } from 'marked'

export default function MarkdownPreview({ markdown }: { markdown: string }) {
  const html = DOMPurify.sanitize(marked.parse(markdown || '*Comece a escrever…*') as string)
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
}
