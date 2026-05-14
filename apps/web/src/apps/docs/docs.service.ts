import { api } from '@/platform/api'

interface Doc {
  id: string
  title: string
  content: string | null
  version: number
  createdAt: Date
  updatedAt: Date
}

export async function listDocs() {
  return api.get<{ docs: Doc[] }>('/docs')
}

export async function createDoc(title?: string) {
  return api.post<{ doc: Doc }>('/docs', { title: title ?? 'Untitled Document' })
}

export async function getDoc(id: string) {
  return api.get<{ doc: Doc }>(`/docs/${id}`)
}

export async function updateDoc(id: string, updates: { title?: string; content?: string }) {
  return api.patch<{ doc: Doc }>(`/docs/${id}`, updates)
}

export async function deleteDoc(id: string) {
  return api.delete(`/docs/${id}`)
}
