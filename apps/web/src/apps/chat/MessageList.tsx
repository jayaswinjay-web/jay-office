import { useRef, useEffect, useState, useCallback } from 'react'
import { MessageSquare, Reply } from 'lucide-react'
import styles from './MessageList.module.css'

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

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  onOpenThread: (message: ChatMessage) => void
  onReaction: (messageId: string, emoji: string) => void
  onLoadMore: () => void
  hasMore: boolean
}

const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
]

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '👀']

function getAvatarColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function formatMessageTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function highlightMentions(text: string): React.ReactNode {
  const mentionRegex = /@(\w+(?:\s+\w+)*)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <span key={match.index} className={styles.mention}>
        @{match[1]}
      </span>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function formatMessageBody(body: string): React.ReactNode {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const inlineCodeRegex = /`([^`]+)`/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={lastIndex}>{highlightMentions(body.slice(lastIndex, match.index))}</span>,
      )
    }
    parts.push(
      <pre key={match.index} className={styles.codeBlock}>
        <code>{match[2]}</code>
      </pre>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < body.length) {
    const remaining = body.slice(lastIndex)
    const formatted = remaining.split(inlineCodeRegex).map((part, i) => {
      if (i % 2 === 1) {
        return (
          <code key={i} className={styles.inlineCode}>
            {part}
          </code>
        )
      }
      return <span key={i}>{highlightMentions(part)}</span>
    })
    parts.push(...formatted)
  }

  return parts.length > 0 ? parts : highlightMentions(body)
}

export function MessageList({
  messages,
  isLoading,
  onOpenThread,
  onReaction,
  onLoadMore,
  hasMore,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || !hasMore) return

    if (container.scrollTop < 100) {
      onLoadMore()
    }
  }, [hasMore, onLoadMore])

  const groupedMessages = messages.reduce<ChatMessage[][]>((groups, msg, i) => {
    const prevMsg = messages[i - 1]
    const isNewGroup =
      !prevMsg ||
      prevMsg.userId !== msg.userId ||
      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300000

    if (isNewGroup) {
      groups.push([msg])
    } else {
      groups[groups.length - 1]?.push(msg)
    }

    return groups
  }, [])

  return (
    <div ref={containerRef} className={styles.container} onScroll={handleScroll}>
      {isLoading && messages.length === 0 && (
        <div className={styles.loading}>Loading messages...</div>
      )}

      {hasMore && (
        <button className={styles.loadMoreBtn} onClick={onLoadMore}>
          Load earlier messages
        </button>
      )}

      {groupedMessages.map((group, groupIndex) => {
        const firstMsg = group[0]!
        const showAvatar = group.length === 1 || groupIndex === 0

        return (
          <div key={firstMsg.id} className={styles.messageGroup}>
            <div
              className={styles.message}
              onMouseEnter={() => setShowReactionsFor(firstMsg.id)}
              onMouseLeave={() => setShowReactionsFor(null)}
            >
              {showAvatar ? (
                <div
                  className={styles.avatar}
                  style={{ backgroundColor: getAvatarColor(firstMsg.userId) }}
                >
                  {firstMsg.userName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className={styles.avatarSpacer} />
              )}

              <div className={styles.messageContent}>
                {showAvatar && (
                  <div className={styles.messageHeader}>
                    <span className={styles.senderName}>{firstMsg.userName}</span>
                    <span
                      className={styles.timestamp}
                      title={formatMessageTime(firstMsg.createdAt)}
                    >
                      {formatTimestamp(firstMsg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={styles.messageBody}>{formatMessageBody(firstMsg.body)}</div>

                {firstMsg.attachments.length > 0 && (
                  <div className={styles.attachments}>
                    {firstMsg.attachments.map((url, i) => (
                      <div key={i} className={styles.attachment}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url.split('/').pop()}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {firstMsg.reactions.length > 0 && (
                  <div className={styles.reactions}>
                    {firstMsg.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        className={`${styles.reactionBtn} ${reaction.userIds.includes('self') ? styles.reacted : ''}`}
                        onClick={() => onReaction(firstMsg.id, reaction.emoji)}
                      >
                        <span className={styles.reactionEmoji}>{reaction.emoji}</span>
                        <span className={styles.reactionCount}>{reaction.userIds.length}</span>
                      </button>
                    ))}
                  </div>
                )}

                {firstMsg.replyCount > 0 && (
                  <button className={styles.threadBtn} onClick={() => onOpenThread(firstMsg)}>
                    <MessageSquare size={14} />
                    {firstMsg.replyCount} {firstMsg.replyCount === 1 ? 'reply' : 'replies'}
                  </button>
                )}

                {showReactionsFor === firstMsg.id && (
                  <div className={styles.quickReactions}>
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        className={styles.quickReactionBtn}
                        onClick={() => onReaction(firstMsg.id, emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button className={styles.replyBtn} onClick={() => onOpenThread(firstMsg)}>
                      <Reply size={14} />
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {group.length > 1 &&
              group.slice(1).map((msg) => (
                <div key={msg.id} className={styles.message}>
                  <div className={styles.avatarSpacer} />
                  <div className={styles.messageContent}>
                    <div className={styles.messageBody}>{formatMessageBody(msg.body)}</div>
                    {msg.reactions.length > 0 && (
                      <div className={styles.reactions}>
                        {msg.reactions.map((reaction) => (
                          <button
                            key={reaction.emoji}
                            className={`${styles.reactionBtn} ${reaction.userIds.includes('self') ? styles.reacted : ''}`}
                            onClick={() => onReaction(msg.id, reaction.emoji)}
                          >
                            <span className={styles.reactionEmoji}>{reaction.emoji}</span>
                            <span className={styles.reactionCount}>{reaction.userIds.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )
      })}

      <div ref={messagesEndRef} />
    </div>
  )
}
