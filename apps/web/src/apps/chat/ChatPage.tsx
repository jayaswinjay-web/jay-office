import React, { useState, useCallback } from 'react'
import { ChannelList } from './ChannelList'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ThreadPanel } from './ThreadPanel'
import { listChannels, listMessages, sendMessage, createChannel } from './chat.service'
import { Hash, Search, Plus, Menu } from 'lucide-react'
import styles from './ChatPage.module.css'

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

export function ChatPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    loadChannels()
  }, [])

  React.useEffect(() => {
    if (activeChannelId) {
      loadMessages(activeChannelId)
    }
  }, [activeChannelId])

  const loadChannels = async () => {
    setError(null)
    try {
      const response = await listChannels()
      setChannels(response.channels)
      if (response.channels.length > 0 && !activeChannelId) {
        setActiveChannelId(response.channels[0]!.id)
      }
    } catch (err) {
      console.error('Failed to load channels:', err)
      setError('Failed to load channels')
    }
  }

  const loadMessages = async (channelId: string, before?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await listMessages(channelId, before)
      if (before) {
        setMessages((prev) => [...response.messages, ...prev])
      } else {
        setMessages(response.messages)
      }
      setHasMoreMessages(response.messages.length === 50)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError('Failed to load messages')
      setHasMoreMessages(false)
      if (!before) setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId)
    setThreadMessage(null)
  }, [])

  const handleSendMessage = useCallback(
    async (body: string, threadId?: string) => {
      if (!activeChannelId) return

      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        channelId: activeChannelId,
        userId: 'self',
        userName: 'You',
        body,
        attachments: [],
        reactions: [],
        threadId: threadId ?? null,
        replyCount: 0,
        createdAt: new Date(),
      }

      if (threadId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === threadId ? { ...m, replyCount: m.replyCount + 1 } : m)),
        )
      } else {
        setMessages((prev) => [...prev, optimisticMessage])
      }

      try {
        await sendMessage(activeChannelId, body, threadId)
      } catch (err) {
        console.error('Failed to send message:', err)
        if (threadId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === threadId ? { ...m, replyCount: Math.max(0, m.replyCount - 1) } : m,
            ),
          )
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        }
      }
    },
    [activeChannelId],
  )

  const handleOpenThread = useCallback((message: ChatMessage) => {
    setThreadMessage(message)
  }, [])

  const handleCloseThread = useCallback(() => {
    setThreadMessage(null)
  }, [])

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        const existing = m.reactions.find((r) => r.emoji === emoji)
        if (existing) {
          const selfIndex = existing.userIds.indexOf('self')
          if (selfIndex >= 0) {
            const newUserIds = [...existing.userIds]
            newUserIds.splice(selfIndex, 1)
            return {
              ...m,
              reactions: m.reactions
                .map((r) => (r.emoji === emoji ? { ...r, userIds: newUserIds } : r))
                .filter((r) => r.userIds.length > 0),
            }
          } else {
            return {
              ...m,
              reactions: m.reactions.map((r) =>
                r.emoji === emoji ? { ...r, userIds: [...r.userIds, 'self'] } : r,
              ),
            }
          }
        } else {
          return {
            ...m,
            reactions: [...m.reactions, { emoji, userIds: ['self'] }],
          }
        }
      }),
    )
  }, [])

  const handleCreateChannel = useCallback(async () => {
    if (!newChannelName.trim()) return
    try {
      const response = await createChannel(newChannelName.trim())
      setChannels((prev) => [...prev, response.channel])
    } catch (err) {
      console.error('Failed to create channel:', err)
    }
    setNewChannelName('')
    setShowCreateChannel(false)
  }, [newChannelName])

  const handleLoadMore = useCallback(() => {
    if (activeChannelId && hasMoreMessages) {
      const oldestMessage = messages[0]
      loadMessages(activeChannelId, oldestMessage?.id)
    }
  }, [activeChannelId, hasMoreMessages, messages])

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeChannel = channels.find((ch) => ch.id === activeChannelId)

  return (
    <div className={styles.container}>
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Messages</h2>
          <div className={styles.sidebarActions}>
            <button
              className={styles.iconBtn}
              onClick={() => setShowCreateChannel(!showCreateChannel)}
              title="Create Channel"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {showCreateChannel && (
          <div className={styles.createChannelForm}>
            <input
              type="text"
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className={styles.channelNameInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateChannel()
              }}
            />
            <button className={styles.createBtn} onClick={handleCreateChannel}>
              Create
            </button>
          </div>
        )}

        <ChannelList
          channels={filteredChannels}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
        />
      </div>

      <div className={styles.mainContent}>
        {activeChannel ? (
          <>
            <div className={styles.channelHeader}>
              <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu size={20} />
              </button>
              <Hash size={20} />
              <h3 className={styles.channelName}>{activeChannel.name}</h3>
              <span className={styles.memberCount}>{activeChannel.memberCount} members</span>
              {activeChannel.description && (
                <span className={styles.channelDescription}>{activeChannel.description}</span>
              )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <MessageList
              messages={messages}
              isLoading={isLoading}
              onOpenThread={handleOpenThread}
              onReaction={handleReaction}
              onLoadMore={handleLoadMore}
              hasMore={hasMoreMessages}
            />

            <MessageInput onSend={handleSendMessage} channelName={activeChannel.name} />
          </>
        ) : (
          <div className={styles.empty}>
            <Hash size={48} />
            <h3>Select a channel to start messaging</h3>
          </div>
        )}
      </div>

      {threadMessage && (
        <ThreadPanel
          parentMessage={threadMessage}
          messages={messages.filter((m) => m.threadId === threadMessage.id)}
          onSendReply={(body) => handleSendMessage(body, threadMessage.id)}
          onClose={handleCloseThread}
          onReaction={handleReaction}
        />
      )}
    </div>
  )
}
