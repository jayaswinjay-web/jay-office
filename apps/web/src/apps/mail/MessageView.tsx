import { format, formatDistanceToNow } from 'date-fns'
import { Reply, Forward, ChevronDown, ChevronUp, Paperclip } from 'lucide-react'
import { Button } from '@/design-system'
import type { MailMessage } from './mail.service'
import styles from './MessageView.module.css'

interface MessageViewProps {
  message: MailMessage
  threadMessages: MailMessage[]
  onReply: () => void
  onToggleThread: () => void
}

export function MessageView({
  message,
  threadMessages,
  onReply,
  onToggleThread,
}: MessageViewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.subject}>{message.subject}</h2>
        <div className={styles.actions}>
          <Button variant="ghost" size="small" onClick={onReply}>
            <Reply size={16} />
            Reply
          </Button>
          <Button variant="ghost" size="small">
            <Forward size={16} />
            Forward
          </Button>
        </div>
      </div>

      <div className={styles.messageInfo}>
        <div className={styles.avatar}>
          {(message.fromName ?? message.from).charAt(0).toUpperCase()}
        </div>
        <div className={styles.info}>
          <div className={styles.senderRow}>
            <span className={styles.senderName}>{message.fromName ?? message.from}</span>
            <span className={styles.senderEmail}>&lt;{message.from}&gt;</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.to}>to {message.to.join(', ')}</span>
            <time className={styles.time}>
              {format(new Date(message.receivedAt), 'MMM d, yyyy h:mm a')}
            </time>
          </div>
        </div>
      </div>

      {message.attachments && message.attachments.length > 0 && (
        <div className={styles.attachments}>
          <Paperclip size={16} />
          <span className={styles.attachmentLabel}>
            {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
          </span>
          {message.attachments.map((att) => (
            <a key={att.id} href={att.url} className={styles.attachment} download>
              <span className={styles.attachmentName}>{att.name}</span>
              <span className={styles.attachmentSize}>{att.size}</span>
            </a>
          ))}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.bodyContent} dangerouslySetInnerHTML={{ __html: message.body }} />
      </div>

      {threadMessages.length > 0 && (
        <div className={styles.thread}>
          <button className={styles.threadToggle} onClick={onToggleThread}>
            <ChevronUp size={16} />
            <span>
              {threadMessages.length} message{threadMessages.length > 1 ? 's' : ''} in thread
            </span>
            <ChevronDown size={16} />
          </button>
          {threadMessages.map((msg) => (
            <div key={msg.id} className={styles.threadMessage}>
              <div className={styles.threadMessageInfo}>
                <span className={styles.threadSender}>{msg.fromName ?? msg.from}</span>
                <time className={styles.threadTime}>
                  {formatDistanceToNow(new Date(msg.receivedAt), { addSuffix: true })}
                </time>
              </div>
              <div
                className={styles.threadMessageBody}
                dangerouslySetInnerHTML={{ __html: msg.body.substring(0, 300) }}
              />
            </div>
          ))}
        </div>
      )}

      <div className={styles.replyActions}>
        <Button onClick={onReply}>
          <Reply size={16} />
          Reply
        </Button>
      </div>
    </div>
  )
}
