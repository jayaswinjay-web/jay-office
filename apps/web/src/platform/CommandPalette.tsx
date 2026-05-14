import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  FileText,
  Table,
  Presentation,
  StickyNote,
  Kanban,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import { Modal, Input } from '@/design-system'
import { globalSearch, type SearchResult } from './search.service'

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  type: string
  url: string
  snippet?: string
  action: () => void
}

const filters = ['All', 'Docs', 'Sheets', 'Slides', 'Notes', 'Tasks', 'Files']

const typeIcons: Record<string, React.ReactNode> = {
  docs: <FileText size={16} />,
  sheets: <Table size={16} />,
  slides: <Presentation size={16} />,
  notes: <StickyNote size={16} />,
  tasks: <Kanban size={16} />,
  files: <FolderOpen size={16} />,
}

const recentItems: CommandItem[] = [
  {
    id: 'rec-1',
    label: 'Q1 Report',
    icon: <FileText size={16} />,
    type: 'docs',
    url: '/docs/q1-report',
    action: () => {},
  },
  {
    id: 'rec-2',
    label: 'Budget Sheet',
    icon: <Table size={16} />,
    type: 'sheets',
    url: '/sheets/budget',
    action: () => {},
  },
  {
    id: 'rec-3',
    label: 'Project Slides',
    icon: <Presentation size={16} />,
    type: 'slides',
    url: '/slides/project',
    action: () => {},
  },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, activeFilter])

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        return
      }
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      try {
        const res = await globalSearch(q, {
          app: activeFilter === 'All' ? undefined : activeFilter.toLowerCase(),
        })
        if (!controller.signal.aborted) {
          setResults(res.results)
        }
      } catch {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    [activeFilter],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) doSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getDisplayItems()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter' && items[selectedIndex]) {
      items[selectedIndex].action()
      setOpen(false)
    }
  }

  const getDisplayItems = (): CommandItem[] => {
    if (query.trim()) {
      return results.map((r) => ({
        id: r.id,
        label: r.title,
        icon: typeIcons[r.type] ?? <FileText size={16} />,
        type: r.type,
        url: r.url,
        snippet: r.snippet,
        action: () => {
          window.location.href = r.url
        },
      }))
    }
    if (activeFilter === 'All') return recentItems
    return recentItems.filter((item) => item.type.toLowerCase() === activeFilter.toLowerCase())
  }

  const items = getDisplayItems()

  const groupedItems: Record<string, CommandItem[]> = {}
  if (query.trim()) {
    for (const item of items) {
      const group = item.type.charAt(0).toUpperCase() + item.type.slice(1)
      if (!groupedItems[group]) groupedItems[group] = []
      groupedItems[group].push(item)
    }
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div style={{ width: 560, maxHeight: 480 }}>
        <div style={{ padding: 12, borderBottom: '1px solid var(--color-border-default)' }}>
          <Input
            ref={inputRef}
            placeholder="Type a command or search..."
            value={query}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            style={{ width: '100%' }}
          />
        </div>
        <div
          style={{
            padding: '8px 12px',
            display: 'flex',
            gap: 4,
            borderBottom: '1px solid var(--color-border-default)',
          }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: 4,
                backgroundColor: activeFilter === f ? 'var(--color-brand)' : 'var(--color-bg-subtle)',
                color: activeFilter === f ? 'white' : 'var(--color-text-primary)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 320 }}>
          {query.trim() && loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Searching...
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              {query.trim() ? 'No results found' : 'Recent items'}
            </div>
          ) : query.trim() ? (
            Object.entries(groupedItems).map(([group, groupItems]) => (
              <div key={group}>
                <div
                  style={{
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {group}
                </div>
                 {groupItems.map((item, _index) => {
                  const globalIndex = items.indexOf(item)
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        item.action()
                        setOpen(false)
                      }}
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor:
                          globalIndex === selectedIndex ? 'var(--color-bg-subtle)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {item.icon}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{item.label}</div>
                        {item.snippet && (
                          <div
                            style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}
                          >
                            {item.snippet}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  item.action()
                  setOpen(false)
                }}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: index === selectedIndex ? 'var(--color-bg-subtle)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
