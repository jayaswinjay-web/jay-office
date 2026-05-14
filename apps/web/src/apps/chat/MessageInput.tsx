import React, { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Code, Link, Smile, Paperclip, Send, X } from 'lucide-react'
import styles from './MessageInput.module.css'

interface MessageInputProps {
  onSend: (body: string) => void
  channelName: string
}

interface MentionSuggestion {
  id: string
  name: string
}

const SLASH_COMMANDS = [
  { command: '/remind', description: 'Set a reminder' },
  { command: '/giphy', description: 'Add a GIF' },
]

const EMOJI_SUGGESTIONS = [
  '👍',
  '❤️',
  '😂',
  '🎉',
  '🔥',
  '👀',
  '🚀',
  '💯',
  '✅',
  '⭐',
  '🙌',
  '💪',
  '😄',
  '😎',
  '🤔',
  '👏',
]

const MENTION_SUGGESTIONS: MentionSuggestion[] = [
  { id: 'u1', name: 'Alice Chen' },
  { id: 'u2', name: 'Bob Smith' },
  { id: 'u3', name: 'Carol Williams' },
  { id: 'u4', name: 'David Brown' },
  { id: 'u5', name: 'Eva Martinez' },
  { id: 'u6', name: 'Frank Johnson' },
]

export function MessageInput({ onSend, channelName }: MessageInputProps) {
  const [value, setValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const [commandFilter, setCommandFilter] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [value])

  useEffect(() => {
    if (value.startsWith('/')) {
      setShowCommands(true)
      setCommandFilter(value.slice(1))
      setShowMentions(false)
    } else if (value.includes('@')) {
      const lastAtIndex = value.lastIndexOf('@')
      const afterAt = value.slice(lastAtIndex + 1)
      const hasSpace = afterAt.includes(' ')
      if (!hasSpace) {
        setShowMentions(true)
        setMentionFilter(afterAt)
        setShowCommands(false)
      }
    } else {
      setShowMentions(false)
      setShowCommands(false)
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSend = () => {
    if (value.trim()) {
      onSend(value.trim())
      setValue('')
      setShowEmojiPicker(false)
      setShowMentions(false)
      setShowCommands(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Tab') {
      if (showMentions && filteredMentions.length > 0) {
        e.preventDefault()
        insertMention(filteredMentions[0]!)
      } else if (showCommands && filteredCommands.length > 0) {
        e.preventDefault()
        setValue(filteredCommands[0]!.command + ' ')
        setShowCommands(false)
      }
    }
  }

  const insertMention = (mention: MentionSuggestion) => {
    const lastAtIndex = value.lastIndexOf('@')
    const beforeMention = value.slice(0, lastAtIndex)
    setValue(`${beforeMention}@${mention.name} `)
    setShowMentions(false)
    textareaRef.current?.focus()
  }

  const insertEmoji = (emoji: string) => {
    setValue((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  const insertFormatting = (type: 'bold' | 'italic' | 'code' | 'link') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)

    let insertion = ''
    let cursorOffset = 0

    switch (type) {
      case 'bold':
        insertion = `**${selected || 'bold text'}**`
        cursorOffset = selected ? insertion.length : 2
        break
      case 'italic':
        insertion = `*${selected || 'italic text'}*`
        cursorOffset = selected ? insertion.length : 1
        break
      case 'code':
        insertion = `\`${selected || 'code'}\``
        cursorOffset = selected ? insertion.length : 1
        break
      case 'link':
        insertion = `[${selected || 'text'}](url)`
        cursorOffset = selected ? insertion.length : 2
        break
    }

    const newValue = value.slice(0, start) + insertion + value.slice(end)
    setValue(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset)
    }, 0)
  }

  const handleFileAttach = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = () => {
      const files = input.files
      if (files && files.length > 0) {
        const fileNames = Array.from(files)
          .map((f) => f.name)
          .join(', ')
        setValue((prev) => prev + `\n📎 Attached: ${fileNames}`)
      }
    }
    input.click()
  }

  const filteredMentions = MENTION_SUGGESTIONS.filter((m) =>
    m.name.toLowerCase().includes(mentionFilter.toLowerCase()),
  )

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.command.includes(commandFilter.toLowerCase()),
  )

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button className={styles.formatBtn} onClick={() => insertFormatting('bold')} title="Bold">
          <Bold size={16} />
        </button>
        <button
          className={styles.formatBtn}
          onClick={() => insertFormatting('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button className={styles.formatBtn} onClick={() => insertFormatting('code')} title="Code">
          <Code size={16} />
        </button>
        <button className={styles.formatBtn} onClick={() => insertFormatting('link')} title="Link">
          <Link size={16} />
        </button>
      </div>

      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={`Message #${channelName}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {showMentions && filteredMentions.length > 0 && (
          <div className={styles.mentionDropdown}>
            {filteredMentions.map((mention) => (
              <button
                key={mention.id}
                className={styles.mentionItem}
                onClick={() => insertMention(mention)}
              >
                {mention.name}
              </button>
            ))}
          </div>
        )}

        {showCommands && filteredCommands.length > 0 && (
          <div className={styles.commandDropdown}>
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.command}
                className={styles.commandItem}
                onClick={() => {
                  setValue(cmd.command + ' ')
                  setShowCommands(false)
                }}
              >
                <span className={styles.commandName}>{cmd.command}</span>
                <span className={styles.commandDesc}>{cmd.description}</span>
              </button>
            ))}
          </div>
        )}

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className={styles.emojiPicker}>
            <div className={styles.emojiHeader}>
              <span>Emoji</span>
              <button className={styles.emojiClose} onClick={() => setShowEmojiPicker(false)}>
                <X size={14} />
              </button>
            </div>
            <div className={styles.emojiGrid}>
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button key={emoji} className={styles.emojiBtn} onClick={() => insertEmoji(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleFileAttach} title="Attach file">
            <Paperclip size={18} />
          </button>
          <div className={styles.emojiContainer}>
            <button
              className={styles.actionBtn}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Emoji"
            >
              <Smile size={18} />
            </button>
          </div>
          <button
            className={`${styles.sendBtn} ${!value.trim() ? styles.sendDisabled : ''}`}
            onClick={handleSend}
            disabled={!value.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
