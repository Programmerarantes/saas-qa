import { syncHackerNews } from '../services/syncNewsService'

export function executeSyncNews(limit?: number) {
  return syncHackerNews(limit)
}
