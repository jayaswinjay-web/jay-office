import { api } from './api'

export interface SearchResult {
  type: string
  id: string
  title: string
  url: string
  snippet?: string
}

export interface SearchFilters {
  app?: string
  dateFrom?: string
  dateTo?: string
  owner?: string
}

export async function globalSearch(query: string, filters?: SearchFilters) {
  const params = new URLSearchParams({ q: query })
  if (filters?.app) params.set('app', filters.app)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.owner) params.set('owner', filters.owner)
  return api.get<{ results: SearchResult[] }>(`/search?${params}`)
}
