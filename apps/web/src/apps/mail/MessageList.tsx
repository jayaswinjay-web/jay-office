import { formatDistanceToNow } from 'date-fns'
import { Star, StarOff } from 'lucide-react'
import type { MailMessage } from './mail.service'
import styles from './MessageList.module.css'

interface MessageListProps {
  messages: MailMessage[]
  selectedId: string | null
  onSelect: (message: MailMessage) => void
  onToggleStar: (id: string, currentlyStarred: boolean) => void
  loading: boolean
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  onToggleStar,
  loading,
}: MessageListProps) {
  const grouped = groupByThread(messages)

  return (
    <div className={styles.list}>
      {grouped.map((group) => {
        const latest = group[group.length - 1]!
        const isThread = group.length > 1

        return (
          <div
            key={latest.id}
            className={`${styles.item} ${selectedId === latest.id ? styles.itemSelected : ''} ${!latest.isRead ? styles.itemUnread : ''}`}
            onClick={() => onSelect(latest)}
          >
            <button
              className={styles.starButton}
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar(latest.id, latest.isStarred)
              }}
            >
              {latest.isStarred ? <Star size={16} /> : <StarOff size={16} />}
            </button>
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <span className={styles.sender}>{latest.fromName ?? latest.from}</span>
                <span className={styles.time}>
                  {formatDistanceToNow(new Date(latest.receivedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className={styles.subjectLine}>
                <span className={styles.subject}>{latest.subject}</span>
                {isThread && <span className={styles.threadBadge}>{group.length}</span>}
              </div>
              <p className={styles.preview}>{latest.preview ?? latest.body.substring(0, 100)}</p>
            </div>
          </div>
        )
      })}
      {loading && (
        <div className={styles.loading}>
          <p>Loading...</p>
        </div>
      )}
    </div>
  )
}

function groupByThread(messages: MailMessage[]): MailMessage[][] {
  const threadMap = new Map<string, MailMessage[]>()
  const unthreaded: MailMessage[] = []

  messages.forEach((msg) => {
    if (msg.threadId) {
      if (!threadMap.has(msg.threadId)) {
        threadMap.set(msg.threadId, [])
      }
      threadMap.get(msg.threadId)!.push(msg)
    } else {
      unthreaded.push(msg)
    }
  })

  const groups: MailMessage[][] = []
  threadMap.forEach((group) => {
    group.sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime())
    groups.push(group)
  })
  unthreaded.forEach((msg) => groups.push([msg]))

   groups.sort((a, b) => {
     const aLatest = a[a.length - 1]!
     const bLatest = b[b.length - 1]!
     return new Date(bLatest.receivedAt).getTime() - new Date(aLatest.receivedAt).getTime()
   })

  return groups
}
