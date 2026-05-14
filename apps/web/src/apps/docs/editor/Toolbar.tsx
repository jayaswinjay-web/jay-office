import { useCallback } from 'react'
import { Button } from '@/design-system'
import { mySchema } from './createEditor'
import { toggleMark, wrapIn, setBlockType } from 'prosemirror-commands'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  editorView: React.MutableRefObject<EditorView | null>
}

export function Toolbar({ editorView }: ToolbarProps) {
  const exec = useCallback(
    (cmd: (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined) => boolean) => {
      const view = editorView.current
      if (view && cmd(view.state, view.dispatch)) {
        view.dispatch(view.state.tr)
      }
    },
    [editorView],
  )

  const toggleBold = () => exec(toggleMark(mySchema.marks.strong!))
  const toggleItalic = () => exec(toggleMark(mySchema.marks.em!))
  const toggleUnderline = () => exec(toggleMark(mySchema.marks.underline!))
  const toggleStrike = () => exec(toggleMark(mySchema.marks.strikethrough!))

  const setHeading = (level: number) => exec(setBlockType(mySchema.nodes.heading!, { level }))
  const setParagraph = () => exec(setBlockType(mySchema.nodes.paragraph!))

  const toggleBulletList = () => exec(wrapIn(mySchema.nodes.bullet_list!))
  const toggleOrderedList = () => exec(wrapIn(mySchema.nodes.ordered_list!))

  return (
    <div className={styles.toolbar}>
      <Button size="sm" variant="secondary" onClick={toggleBold} title="Bold">
        <strong>B</strong>
      </Button>
      <Button size="sm" variant="secondary" onClick={toggleItalic} title="Italic">
        <em>I</em>
      </Button>
      <Button size="sm" variant="secondary" onClick={toggleUnderline} title="Underline">
        <u>U</u>
      </Button>
      <Button size="sm" variant="secondary" onClick={toggleStrike} title="Strikethrough">
        <s>S</s>
      </Button>

      <div className={styles.separator} />

       <select
         onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
           const val = e.target.value
           if (val === 'p') setParagraph()
           else if (val.startsWith('h')) setHeading(parseInt(val[1]!))
         }}
         className={styles.headingSelect}
         defaultValue=""
       >
        <option value="" disabled>
          Heading
        </option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="p">Paragraph</option>
      </select>

      <div className={styles.separator} />

       <Button
         size="sm"
         variant="secondary"
         onClick={() =>
           exec((state: EditorState, dispatch: ((tr: Transaction) => void) | undefined) => {
             return toggleMark(state.schema.marks.em!)(state, dispatch)
           })
         }
         title="Align Left"
       >
         Left
       </Button>
      <Button size="sm" variant="secondary" title="Align Center">
        Center
      </Button>
      <Button size="sm" variant="secondary" title="Align Right">
        Right
      </Button>
      <Button size="sm" variant="secondary" title="Justify">
        Justify
      </Button>

      <div className={styles.separator} />

      <Button size="sm" variant="secondary" onClick={toggleBulletList} title="Bullet List">
        • List
      </Button>
      <Button size="sm" variant="secondary" onClick={toggleOrderedList} title="Ordered List">
        1. List
      </Button>

      <div className={styles.separator} />

      <Button size="sm" variant="secondary" title="Insert Link">
        Link
      </Button>
      <Button size="sm" variant="secondary" title="Insert Image">
        Image
      </Button>
      <Button size="sm" variant="secondary" title="Insert Table">
        Table
      </Button>
      <Button size="sm" variant="secondary" title="Horizontal Rule">
        —
      </Button>
    </div>
  )
}
