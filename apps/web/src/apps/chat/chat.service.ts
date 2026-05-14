import { api } from '@/platform/api'

interface ChatMessage {
  id: string
  channelId: string
  userId: string
  userName: string
  body: string
  attachments: string[]
  reactions: Array<{ emoji: string; userIds: string[] }>
  threadId: string | null
  replyCount: number
  createdAt: Date
}

interface Channel {
  id: string
  name: string
  description: string | null
  memberCount: number
  unreadCount: number
}

export async function listChannels() {
  return api.get<{ channels: Channel[] }>('/chat/channels')
}

export async function createChannel(name: string, description?: string) {
  return api.post<{ channel: Channel }>('/chat/channels', { name, description })
}

export async function listMessages(channelId: string, before?: string) {
  return api.get<{ messages: ChatMessage[] }>(
    `/chat/channels/${channelId}/messages${before ? `?before=${before}` : ''}`,
  )
}

export async function sendMessage(channelId: string, body: string, threadId?: string) {
  return api.post<{ message: ChatMessage }>(`/chat/channels/${channelId}/messages`, {
    body,
    threadId,
  })
}

export async function addReaction(channelId: string, messageId: string, emoji: string) {
  return api.post<{ message: ChatMessage }>(
    `/chat/channels/${channelId}/messages/${messageId}/reactions`,
    { emoji },
  )
}
