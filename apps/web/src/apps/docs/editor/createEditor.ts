import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema } from 'prosemirror-model'
import { schema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { keymap } from 'prosemirror-keymap'
import { history } from 'prosemirror-history'
import { baseKeymap } from 'prosemirror-commands'

const nodes = addListNodes(schema.spec.nodes, 'paragraph block*', 'block')
const mySchema: Schema = new Schema({ nodes, marks: schema.spec.marks })

export function createEditor(container: HTMLElement) {
  const state = EditorState.create({
    schema: mySchema,
    plugins: [history(), keymap(baseKeymap)],
  })
  return new EditorView(container, { state })
}

export { mySchema }
