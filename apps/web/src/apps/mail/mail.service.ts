import { api } from '@/platform/api'

export type MailFolder = 'inbox' | 'sent' | 'starred' | 'trash' | 'archive'

export interface Attachment {
  id: string
  name: string
  size: string
  url: string
  mimeType: string
}

export interface MailMessage {
  id: string
  from: string
  fromName: string | null
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  body: string
  preview: string | null
  isRead: boolean
  isStarred: boolean
  receivedAt: string
  threadId: string | null
  attachments: Attachment[] | null
}

export interface MessagesResponse {
  messages: MailMessage[]
  total: number
  hasMore: boolean
}

export interface MessageResponse {
  message: MailMessage
}

export async function listMessages(params: {
  folder: string
  search?: string
  threadId?: string
  page?: number
  limit?: number
}): Promise<MessagesResponse> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString()
  return api.get<MessagesResponse>(`/mail/messages?${qs}`)
}

export async function getMessage(id: string): Promise<MessageResponse> {
  return api.get<MessageResponse>(`/mail/messages/${id}`)
}

export async function sendMessage(data: {
  to: string
  subject: string
  body: string
  cc?: string
  bcc?: string
}): Promise<MessageResponse> {
  return api.post<MessageResponse>('/mail/send', data)
}

export async function markAsRead(id: string): Promise<void> {
  return api.post<void>(`/mail/messages/${id}/read`, {})
}

export async function toggleStar(id: string, starred: boolean): Promise<void> {
  return api.post<void>(`/mail/messages/${id}/star`, { starred })
}

export async function deleteMessage(id: string): Promise<void> {
  return api.delete<void>(`/mail/messages/${id}`)
}

export async function archiveMessage(id: string): Promise<void> {
  return api.post<void>(`/mail/messages/${id}/archive`, {})
}
