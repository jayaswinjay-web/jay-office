import { useState, useRef, useEffect } from 'react'
import { Bell, AtSign, MessageSquare, Share2, UserPlus, CheckCheck } from 'lucide-react'
import { Button } from '@/design-system'
import { api } from './api'

export type NotificationType = 'mention' | 'comment' | 'share' | 'invite' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  mention: <AtSign size={16} />,
  comment: <MessageSquare size={16} />,
  share: <Share2 size={16} />,
  invite: <UserPlus size={16} />,
  system: <Bell size={16} />,
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get<{ notifications: Notification[]; unreadCount: number }>(
        '/notifications',
      )
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    try {
       await api.post(`/notifications/${id}/read`, {})
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      /* ignore */
    }
  }

  const markAllAsRead = async () => {
    try {
       await api.post('/notifications/read-all', {})
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      /* ignore */
    }
  }

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id)
    if (n.link) window.location.href = n.link
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setOpen(!open)
          if (!open) fetchNotifications()
        }}
        style={{ position: 'relative' }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              backgroundColor: 'var(--color-danger)',
              color: 'white',
              fontSize: 10,
              fontWeight: 'bold',
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 6,
            width: 360,
            maxHeight: 440,
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--color-border-default)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand)',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--color-border-default)',
                  backgroundColor: n.read ? 'transparent' : 'var(--color-bg-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <div style={{ marginTop: 2 }}>{typeIcons[n.type]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.read ? 'normal' : 'bold', fontSize: 13 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {!n.read && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-brand)',
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
