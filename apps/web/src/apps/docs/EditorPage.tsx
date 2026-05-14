import { useEffect, useRef, useState } from 'react'
import { Toolbar } from './editor/Toolbar'
import { Outline } from './editor/Outline'
import { createEditor } from './editor/createEditor'
import { getDoc } from './docs.service'
import type { EditorView } from 'prosemirror-view'
import '@/apps/docs/editor.css'
import styles from './EditorPage.module.css'

interface EditorPageProps {
  docId: string
}

export function EditorPage({ docId }: EditorPageProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [_doc, _setDoc] = useState<{ id: string; title: string; content: string | null } | null>(null)
  const [outline, setOutline] = useState<Array<{ level: number; text: string; pos: number }>>([])

  useEffect(() => {
    getDoc(docId)
      .then((res) => _setDoc(res.doc))
      .catch((err) => console.error('Failed to load doc:', err))
  }, [docId])

  useEffect(() => {
    if (!editorRef.current) return
    const view = createEditor(editorRef.current)
    viewRef.current = view

    const updateOutline = () => {
      const state = view.state
      const headings: Array<{ level: number; text: string; pos: number }> = []
      state.doc.forEach((node, pos) => {
        if (node.type.name === 'heading') {
          const text = node.textContent
          const level = node.attrs.level as number
          headings.push({ level, text, pos })
        }
      })
      setOutline(headings)
    }

    updateOutline()

    const originalDispatch = view.dispatch
    view.dispatch = (tr) => {
      originalDispatch(tr)
      updateOutline()
    }

    return () => {
      view.destroy()
    }
  }, [docId])

  const handleHeadingClick = (pos: number) => {
    if (viewRef.current && 'state' in viewRef.current) {
      const view = viewRef.current as { state: { tr: unknown }; dispatch: (tr: unknown) => void }
      const tr = view.state.tr
      view.dispatch(tr)
      const dom = editorRef.current?.querySelector(`[data-pos="${pos}"]`)
      dom?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <Outline items={outline} onItemClick={handleHeadingClick} />
      </aside>

      <div className={styles.editorContainer}>
        <div className={styles.toolbar}>
          <Toolbar editorView={viewRef} />
        </div>

        <main className={styles.main}>
          <div ref={editorRef} className="editor-container" />
        </main>
      </div>

      <aside className={styles.commentsPanel}>
        <div className={styles.commentsInner}>
          <h3 className={styles.commentsTitle}>Comments</h3>
          <p className={styles.commentsText}>Comments panel coming soon</p>
        </div>
      </aside>
    </div>
  )
}
