import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/design-system'
import {
  Inbox,
  Send,
  Star,
  Trash2,
  RefreshCw,
  PenSquare,
  Search,
  ChevronLeft,
  Archive,
} from 'lucide-react'
import { MessageList } from './MessageList'
import { MessageView } from './MessageView'
import { ComposeWindow } from './ComposeWindow'
import {
  listMessages,
  getMessage,
  sendMessage,
  markAsRead,
  toggleStar,
  deleteMessage,
  archiveMessage,
  type MailMessage,
} from './mail.service'
import styles from './MailPage.module.css'

type MailView = 'inbox' | 'sent' | 'starred' | 'trash' | 'archive'

export function MailPage() {
  const [messages, setMessages] = useState<MailMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null)
  const [currentFolder, setCurrentFolder] = useState<MailView>('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [threadMessages, setThreadMessages] = useState<MailMessage[]>([])
  const [showThread, setShowThread] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const folderMap: Record<MailView, string> = {
        inbox: 'inbox',
        sent: 'sent',
        starred: 'starred',
        trash: 'trash',
        archive: 'archive',
      }
      const result = await listMessages({
        folder: folderMap[currentFolder],
        search: searchQuery || undefined,
        page,
        limit: 20,
      })
      if (page === 1) {
        setMessages(result.messages)
      } else {
        setMessages((prev) => [...prev, ...result.messages])
      }
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }, [currentFolder, searchQuery, page])

  useEffect(() => {
    setPage(1)
    setMessages([])
    setSelectedMessage(null)
    loadMessages()
  }, [currentFolder, searchQuery, loadMessages])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCompose) return
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'j') {
        e.preventDefault()
        selectNextMessage(1)
      }
      if (e.key === 'k') {
        e.preventDefault()
        selectNextMessage(-1)
      }
      if (e.key === 'r' && selectedMessage && document.activeElement === document.body) {
        e.preventDefault()
        handleReply()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [messages, selectedMessage, showCompose])

  const selectNextMessage = (direction: number) => {
    if (messages.length === 0) return
    const idx = selectedMessage ? messages.findIndex((m) => m.id === selectedMessage.id) : -1
    const newIdx = Math.max(0, Math.min(messages.length - 1, idx + direction))
    const msg = messages[newIdx]
    if (msg) {
      setSelectedMessage(msg)
      if (!msg.isRead) {
        markAsRead(msg.id)
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)))
      }
    }
  }

  const handleSelectMessage = async (msg: MailMessage) => {
    setSelectedMessage(msg)
    setShowThread(false)
    if (!msg.isRead) {
      try {
        await markAsRead(msg.id)
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)))
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }
    try {
      const result = await getMessage(msg.id)
      const threadId = result.message.threadId
      if (threadId) {
        const threadResult = await listMessages({
          folder: 'inbox',
          threadId: threadId,
        })
        setThreadMessages(threadResult.messages)
      }
    } catch (error) {
      console.error('Failed to load message:', error)
    }
  }

  const handleToggleStar = async (id: string, currentlyStarred: boolean) => {
    try {
      await toggleStar(id, !currentlyStarred)
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isStarred: !currentlyStarred } : m)),
      )
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveMessage(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (error) {
      console.error('Failed to archive message:', error)
    }
  }

  const handleReply = () => {
    setShowCompose(true)
  }

  const handleSend = async (data: {
    to: string
    subject: string
    body: string
    cc?: string
    bcc?: string
  }) => {
    try {
      await sendMessage(data)
      setShowCompose(false)
      loadMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    setMessages([])
    loadMessages()
  }

  const folders: { id: MailView; label: string; icon: React.ReactNode }[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox size={16} /> },
    { id: 'starred', label: 'Starred', icon: <Star size={16} /> },
    { id: 'sent', label: 'Sent', icon: <Send size={16} /> },
    { id: 'archive', label: 'Archive', icon: <Archive size={16} /> },
    { id: 'trash', label: 'Trash', icon: <Trash2 size={16} /> },
  ]

  const unreadCount = messages.filter((m) => !m.isRead && currentFolder === 'inbox').length

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <Button className={styles.composeButton} onClick={() => setShowCompose(true)}>
          <PenSquare size={16} />
          Compose
        </Button>
        <nav className={styles.folderList}>
          {folders.map((folder) => (
            <button
              key={folder.id}
              className={`${styles.folderItem} ${currentFolder === folder.id ? styles.folderItemActive : ''}`}
              onClick={() => setCurrentFolder(folder.id)}
            >
              {folder.icon}
              <span className={styles.folderLabel}>{folder.label}</span>
              {folder.id === 'inbox' && unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.headerTitle}>
              {folders.find((f) => f.id === currentFolder)?.label ?? 'Mail'}
            </h2>
            <Button variant="ghost" size="small" onClick={handleRefresh}>
              <RefreshCw
                className={styles.refreshIcon}
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
              />
            </Button>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchWrapper}>
              <Search size={16} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search mail (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.listColumn}>
            {loading && messages.length === 0 ? (
              <div className={styles.loading}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyState}>
                <Inbox size={48} />
                <p>No messages</p>
              </div>
            ) : (
              <MessageList
                messages={messages}
                selectedId={selectedMessage?.id ?? null}
                onSelect={handleSelectMessage}
                onToggleStar={handleToggleStar}
                loading={loading}
              />
            )}
            {hasMore && messages.length > 0 && (
              <Button
                variant="ghost"
                size="small"
                className={styles.loadMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Load more
              </Button>
            )}
          </div>

          {selectedMessage ? (
            <div className={styles.viewColumn}>
              <div className={styles.viewHeader}>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setSelectedMessage(null)}
                  className={styles.backButton}
                >
                  <ChevronLeft size={16} />
                  Back
                </Button>
                <div className={styles.viewActions}>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleArchive(selectedMessage.id)}
                    title="Archive"
                  >
                    <Archive size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleDelete(selectedMessage.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <MessageView
                message={selectedMessage}
                threadMessages={showThread ? threadMessages : []}
                onReply={() => handleReply()}
                onToggleThread={() => setShowThread(!showThread)}
              />
            </div>
          ) : (
            <div className={styles.viewColumnEmpty}>
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      {showCompose && <ComposeWindow onClose={() => setShowCompose(false)} onSend={handleSend} />}
    </div>
  )
}
