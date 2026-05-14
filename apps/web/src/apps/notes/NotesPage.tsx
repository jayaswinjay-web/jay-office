import { useState, useEffect } from 'react'
import { Sidebar, Input, Button } from '@/design-system'
import { Plus, Search } from 'lucide-react'
import { PageTree } from './PageTree'
import { NotesEditor } from './NotesEditor'
import { listNotes, createNote, updateNote, deleteNote, getNote, type Note } from './notes.service'
import styles from './NotesPage.module.css'

export function NotesPage() {
  const [pages, setPages] = useState<Note[]>([])
  const [activePage, setActivePage] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    setLoading(true)
    try {
      const res = await listNotes()
      setPages(res.notes)
      if (res.notes.length > 0 && !activePage) {
        openPage(res.notes[0]!)
      }
    } catch (err) {
      console.error('Failed to load notes:', err)
    } finally {
      setLoading(false)
    }
  }

  async function openPage(note: Note) {
    try {
      const res = await getNote(note.id)
      setActivePage(res.note)
    } catch (err) {
      console.error('Failed to open note:', err)
    }
  }

  async function handleCreate(parentId?: string) {
    try {
      const res = await createNote('Untitled', parentId)
      setPages((prev) => [...prev, res.note])
      if (!activePage) openPage(res.note)
    } catch (err) {
      console.error('Failed to create note:', err)
    }
  }

  async function handleRename(id: string, newTitle: string) {
    try {
      await updateNote(id, { title: newTitle })
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)))
    } catch (err) {
      console.error('Failed to rename note:', err)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNote(id)
      setPages((prev) => prev.filter((p) => p.id !== id))
      if (activePage?.id === id) {
        setActivePage(null)
      }
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const filteredPages = searchQuery
    ? pages.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : pages

  return (
    <div className={styles.container}>
      <Sidebar className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarControls}>
            <h2 className={styles.sidebarTitle}>Notes</h2>
            <Button size="sm" variant="ghost" onClick={() => handleCreate()}>
              <Plus size={16} />
            </Button>
          </div>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        {loading ? (
          <div className={styles.sidebarLoading}>Loading...</div>
        ) : (
          <PageTree
            pages={filteredPages}
            activePageId={activePage?.id}
            onSelect={(id) => {
              const note = pages.find((p) => p.id === id)
              if (note) openPage(note)
            }}
            onCreatePage={handleCreate}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        )}
      </Sidebar>

      <main className={styles.main}>
        {activePage ? (
          <div className={styles.editorWrapper}>
            <Input
              value={activePage.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRename(activePage.id, e.target.value)}
              className={styles.titleInput}
            />
            <NotesEditor
              initialBlocks={activePage.content ? JSON.parse(activePage.content) : undefined}
              onChange={(blocks) => {
                const content = JSON.stringify(blocks)
                updateNote(activePage!.id, { content })
              }}
            />
          </div>
        ) : (
          <div className={styles.emptyState}>
            {loading ? 'Loading...' : 'Select or create a page to start writing'}
          </div>
        )}
      </main>
    </div>
  )
}
