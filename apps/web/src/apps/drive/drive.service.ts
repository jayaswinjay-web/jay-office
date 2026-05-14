import { api } from '@/platform/api'
import type { File, Folder } from '@jay/types'

export async function listFiles(params?: {
  folderId?: string
  search?: string
  starred?: boolean
  trashed?: boolean
}) {
  const qs = new URLSearchParams(params as Record<string, string> | undefined).toString()
  return api.get<{ files: File[] }>(`/files?${qs}`)
}

export async function listFolders() {
  return api.get<{ folders: Folder[] }>('/folders')
}

export async function createFolder(name: string, parentId?: string) {
  return api.post<{ folder: Folder }>('/folders', { name, parentId })
}

export async function uploadFile(file: globalThis.File, folderId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (folderId) formData.append('folderId', folderId)
  return api.post<{ file: File }>('/files/upload', formData)
}

export async function deleteFile(id: string) {
  return api.delete(`/files/${id}`)
}

export async function restoreFile(id: string) {
  return api.post(`/files/${id}/restore`, {})
}

export async function updateFile(
  id: string,
  updates: { name?: string; folderId?: string | null; starred?: boolean },
) {
  return api.patch<{ file: File }>(`/files/${id}`, updates)
}
