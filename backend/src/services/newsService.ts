import { NewsQuery } from '../schemas/news.schema'
import { listNews, ListNewsResult } from '../repositories/newsRepository'

export function getNews(input: NewsQuery): Promise<ListNewsResult> {
  return listNews(input)
}
