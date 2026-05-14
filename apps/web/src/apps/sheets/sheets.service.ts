import { api } from '@/platform/api'

interface Sheet {
  id: string
  title: string
  content: string | null
  version: number
  createdAt: Date
  updatedAt: Date
}

export async function listSheets() {
  return api.get<{ sheets: Sheet[] }>('/sheets')
}

export async function createSheet(title?: string) {
  return api.post<{ sheet: Sheet }>('/sheets', { title: title ?? 'Untitled Sheet' })
}

export async function getSheet(id: string) {
  return api.get<{ sheet: Sheet }>(`/sheets/${id}`)
}

export async function updateSheet(id: string, updates: { title?: string; content?: string }) {
  return api.patch<{ sheet: Sheet }>(`/sheets/${id}`, updates)
}
