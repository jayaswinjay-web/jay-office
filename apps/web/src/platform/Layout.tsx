import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar } from '@/design-system'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from './AuthStore'
import {
  FolderOpen, FileText, Table, Presentation, StickyNote,
  Kanban, Mail, Video, CalendarDays, ListChecks, FileSignature,
  MessageSquare, Menu, Search, LogOut,
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: '/drive', label: 'Drive', icon: FolderOpen },
  { path: '/docs', label: 'Docs', icon: FileText },
  { path: '/sheets', label: 'Sheets', icon: Table },
  { path: '/slides', label: 'Slides', icon: Presentation },
  { path: '/notes', label: 'Notes', icon: StickyNote },
  { path: '/tasks', label: 'Tasks', icon: Kanban },
  { path: '/mail', label: 'Mail', icon: Mail },
  { path: '/meet', label: 'Meet', icon: Video },
  { path: '/cal', label: 'Cal', icon: CalendarDays },
  { path: '/forms', label: 'Forms', icon: ListChecks },
  { path: '/sign', label: 'Sign', icon: FileSignature },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
]

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        width: sidebarCollapsed ? 52 : 240,
        minWidth: sidebarCollapsed ? 52 : 240,
        transition: 'width 200ms ease',
        borderRight: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-surface)',
      }}>
        <div style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: sidebarCollapsed ? 0 : '0 12px 0 16px',
          borderBottom: '1px solid var(--color-border-default)',
          flexShrink: 0,
        }}>
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>
              JAY Workspace
            </span>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', background: 'transparent', color: 'var(--color-text-muted)',
              borderRadius: 6, cursor: 'pointer',
            }}
          >
            <Menu size={16} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '6px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  gap: 10, width: '100%', padding: sidebarCollapsed ? '8px' : '8px 10px',
                  border: 'none', borderRadius: 6,
                  background: isActive ? 'var(--color-bg-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                  cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 500 : 400,
                  whiteSpace: 'nowrap',
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '6px', borderTop: '1px solid var(--color-border-default)' }}>
          {!sidebarCollapsed && (
            <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {user?.email}
            </div>
          )}
          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: 8, width: '100%', padding: '8px 10px',
              border: 'none', borderRadius: 6, background: 'transparent',
              color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13,
            }}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          height: 44, borderBottom: '1px solid var(--color-border-default)',
          background: 'var(--color-bg-surface)',
          display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0,
        }}>
          <WorkspaceSwitcher />
          <div style={{ flex: 1 }} />
          <button style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'transparent', color: 'var(--color-text-muted)',
            borderRadius: 6, cursor: 'pointer',
          }}>
            <Search size={16} />
          </button>
          <NotificationBell />
          <Avatar size="md" name={user?.name} />
        </div>
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
