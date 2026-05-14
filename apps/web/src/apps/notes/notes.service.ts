import { api } from '@/platform/api'

export interface Note {
  id: string
  title: string
  content: string | null
  parentId: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export async function listNotes() {
  return api.get<{ notes: Note[] }>('/notes')
}

export async function createNote(title?: string, parentId?: string) {
  return api.post<{ note: Note }>('/notes', { title: title ?? 'Untitled', parentId })
}

export async function getNote(id: string) {
  return api.get<{ note: Note }>(`/notes/${id}`)
}

export async function updateNote(id: string, updates: { title?: string; content?: string }) {
  return api.patch<{ note: Note }>(`/notes/${id}`, updates)
}

export async function deleteNote(id: string) {
  return api.delete(`/notes/${id}`)
}
