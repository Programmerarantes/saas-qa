import { NewsQuery } from '../schemas/news.schema'
import { getNews } from '../services/newsService'

export function executeGetNews(input: NewsQuery) {
  return getNews(input)
}
