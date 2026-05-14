import { useState } from 'react'
import { Mail, UserPlus, Copy, Check, X } from 'lucide-react'
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '@/design-system'
import styles from './ShareDialog.module.css'

interface ShareDialogProps {
  fileId: string
  onClose: () => void
}

interface ShareRecipient {
  email: string
  role: 'viewer' | 'editor'
}

export function ShareDialog({ fileId, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer')
  const [recipients, setRecipients] = useState<ShareRecipient[]>([])
  const [linkCopied, setLinkCopied] = useState(false)
  const [shareLink] = useState(`https://jay.app/s/${fileId}`)

  const addRecipient = () => {
    if (!email || recipients.some((r: ShareRecipient) => r.email === email)) return
    setRecipients((prev: ShareRecipient[]) => [...prev, { email, role }])
    setEmail('')
  }

  const removeRecipient = (emailToRemove: string) => {
    setRecipients((prev: ShareRecipient[]) =>
      prev.filter((r: ShareRecipient) => r.email !== emailToRemove),
    )
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={styles.container}>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>

        <div className={styles.shareSection}>
          <div className={styles.inputRow}>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <Input
                placeholder="Enter email address..."
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && addRecipient()}
                className={styles.emailInput}
              />
            </div>
            <Select value={role} onValueChange={(v: string) => setRole(v as 'viewer' | 'editor')}>
              <SelectTrigger className={styles.roleSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addRecipient} disabled={!email}>
              <UserPlus size={16} />
            </Button>
          </div>

          {recipients.length > 0 && (
            <div className={styles.recipientList}>
              <p className={styles.recipientLabel}>Shared with</p>
              {recipients.map((recipient: ShareRecipient) => (
                <div key={recipient.email} className={styles.recipientItem}>
                  <div className={styles.recipientInfo}>
                    <Mail className={styles.recipientIcon} />
                    <span className={styles.recipientEmail}>{recipient.email}</span>
                    <Badge variant={recipient.role === 'editor' ? 'default' : 'secondary'}>
                      {recipient.role}
                    </Badge>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeRecipient(recipient.email)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.linkSection}>
          <p className={styles.linkLabel}>Share via link</p>
          <div className={styles.linkRow}>
            <input value={shareLink} readOnly className={styles.linkInput} />
            <Button variant="outline" onClick={copyLink}>
              {linkCopied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
