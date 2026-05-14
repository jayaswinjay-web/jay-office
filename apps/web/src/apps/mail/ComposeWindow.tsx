import { useState } from 'react'
import { Button } from '@/design-system'
import { X, Send, Paperclip, Minimize2, Maximize2, Trash2 } from 'lucide-react'
import styles from './ComposeWindow.module.css'

interface ComposeWindowProps {
  onClose: () => void
  onSend: (data: ComposeData) => void
  replyTo?: {
    to: string
    subject: string
  }
}

interface ComposeData {
  to: string
  subject: string
  body: string
  cc?: string
  bcc?: string
}

export function ComposeWindow({ onClose, onSend, replyTo }: ComposeWindowProps) {
  const [to, setTo] = useState(replyTo?.to ?? '')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState(replyTo?.subject ?? '')
  const [body, setBody] = useState('')
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([])

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) return
    setSending(true)
    try {
      await onSend({ to, subject, body, cc: cc || undefined, bcc: bcc || undefined })
    } finally {
      setSending(false)
    }
  }

  const handleDiscard = () => {
    if (body.trim() || to.trim() || subject.trim()) {
      if (!window.confirm('Discard this draft?')) return
    }
    onClose()
  }

  const handleAttach = () => {
    setAttachments((prev) => [
      ...prev,
      { name: `attachment-${prev.length + 1}.pdf`, size: '2.4 MB' },
    ])
  }

  if (isMinimized) {
    return (
      <div className={styles.minimized}>
        <div className={styles.minimizedHeader}>
          <span className={styles.minimizedTitle}>{subject || 'New Message'}</span>
          <div className={styles.minimizedActions}>
            <button
              className={styles.iconButton}
              onClick={() => setIsMinimized(false)}
              title="Expand"
            >
              <Maximize2 size={16} />
            </button>
            <button className={styles.iconButton} onClick={handleDiscard} title="Discard">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.window}>
        <div className={styles.windowHeader}>
          <span className={styles.windowTitle}>New Message</span>
          <div className={styles.windowActions}>
            <button
              className={styles.iconButton}
              onClick={() => setIsMinimized(true)}
              title="Minimize"
            >
              <Minimize2 size={16} />
            </button>
            <button className={styles.iconButton} onClick={handleDiscard} title="Discard">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.windowBody}>
          <div className={styles.field}>
            <label htmlFor="compose-to" className={styles.fieldLabel}>
              To
            </label>
            <input
              id="compose-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={styles.fieldInput}
              placeholder="Recipients"
            />
            <button className={styles.ccToggle} onClick={() => setShowCcBcc(!showCcBcc)}>
              {showCcBcc ? 'Hide' : 'Cc/Bcc'}
            </button>
          </div>

          {showCcBcc && (
            <>
              <div className={styles.field}>
                <label htmlFor="compose-cc" className={styles.fieldLabel}>
                  Cc
                </label>
                <input
                  id="compose-cc"
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className={styles.fieldInput}
                  placeholder="Cc recipients"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="compose-bcc" className={styles.fieldLabel}>
                  Bcc
                </label>
                <input
                  id="compose-bcc"
                  type="email"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                   className={styles.fieldInput}
                   placeholder="Bcc recipients"
                 />
               </div>
             </>
           )}

          <div className={styles.field}>
            <label htmlFor="compose-subject" className={styles.fieldLabel}>
              Subject
            </label>
            <input
              id="compose-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.fieldInput}
              placeholder="Subject"
            />
          </div>

          <div className={styles.bodyField}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={styles.bodyTextarea}
              placeholder="Write your message..."
            />
          </div>

          {attachments.length > 0 && (
            <div className={styles.attachmentList}>
              {attachments.map((att, i) => (
                <div key={i} className={styles.attachmentItem}>
                  <Paperclip size={12} />
                  <span className={styles.attachmentName}>{att.name}</span>
                  <span className={styles.attachmentSize}>{att.size}</span>
                  <button
                    className={styles.attachmentRemove}
                    onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.windowFooter}>
          <Button onClick={handleSend} disabled={sending || !to.trim() || !subject.trim()}>
            <Send size={16} />
            {sending ? 'Sending...' : 'Send'}
          </Button>
          <Button variant="ghost" size="small" onClick={handleAttach}>
            <Paperclip size={16} />
          </Button>
          <Button variant="ghost" size="small" onClick={handleDiscard}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
