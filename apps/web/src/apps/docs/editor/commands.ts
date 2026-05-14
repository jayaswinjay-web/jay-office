import { toggleMark, wrapIn, setBlockType } from 'prosemirror-commands'
import { mySchema } from './createEditor'

export const toggleBold = toggleMark(mySchema.marks.strong!)
export const toggleItalic = toggleMark(mySchema.marks.em!)
export const toggleUnderline = toggleMark(mySchema.marks.underline!)

export function setHeading(level: number) {
  return setBlockType(mySchema.nodes.heading!, { level })
}

export function setParagraph() {
  return setBlockType(mySchema.nodes.paragraph!)
}

export function toggleBulletList() {
  return wrapIn(mySchema.nodes.bullet_list!)
}

export function toggleOrderedList() {
  return wrapIn(mySchema.nodes.ordered_list!)
}
