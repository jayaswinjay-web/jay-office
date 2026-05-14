import React, { useState, useRef, useEffect } from 'react'
import { X, Send, ChevronDown, ChevronUp } from 'lucide-react'
import styles from './ThreadPanel.module.css'

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

interface ThreadPanelProps {
  parentMessage: ChatMessage
  messages: ChatMessage[]
  onSendReply: (body: string) => void
  onClose: () => void
  onReaction: (messageId: string, emoji: string) => void
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

export function ThreadPanel({
  parentMessage,
  messages,
  onSendReply,
  onClose,
  onReaction,
}: ThreadPanelProps) {
  const [replyBody, setReplyBody] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSendReply = () => {
    if (replyBody.trim()) {
      onSendReply(replyBody.trim())
      setReplyBody('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Thread</h3>
        <div className={styles.headerActions}>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.parentMessage}>
          <div
            className={styles.avatar}
            style={{ backgroundColor: getAvatarColor(parentMessage.userId) }}
          >
            {parentMessage.userName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.messageContent}>
            <div className={styles.messageHeader}>
              <span className={styles.senderName}>{parentMessage.userName}</span>
              <span className={styles.timestamp}>{formatTimestamp(parentMessage.createdAt)}</span>
            </div>
            <p className={styles.messageBody}>{parentMessage.body}</p>
          </div>
        </div>

        {!collapsed && (
          <>
            <div className={styles.divider}>
              <span className={styles.dividerText}>
                {messages.length} {messages.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>

            <div className={styles.replies}>
              {messages.map((msg) => (
                <div key={msg.id} className={styles.reply}>
                  <div
                    className={styles.avatar}
                    style={{
                      backgroundColor: getAvatarColor(msg.userId),
                    }}
                  >
                    {msg.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <span className={styles.senderName}>{msg.userName}</span>
                      <span className={styles.timestamp}>{formatTimestamp(msg.createdAt)}</span>
                    </div>
                    <p className={styles.messageBody}>{msg.body}</p>
                    {msg.reactions.length > 0 && (
                      <div className={styles.reactions}>
                        {msg.reactions.map((reaction) => (
                          <button
                            key={reaction.emoji}
                            className={`${styles.reactionBtn} ${reaction.userIds.includes('self') ? styles.reacted : ''}`}
                            onClick={() => onReaction(msg.id, reaction.emoji)}
                          >
                            {reaction.emoji} <span>{reaction.userIds.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.replyInput}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder="Reply in thread..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSendReply}
                disabled={!replyBody.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
