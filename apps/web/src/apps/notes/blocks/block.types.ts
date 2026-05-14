export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet'
  | 'number'
  | 'todo'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'code'
  | 'image'

export interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
  language?: string
  collapsed?: boolean
  children?: Block[]
}
