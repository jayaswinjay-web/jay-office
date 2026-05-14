import React, { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import styles from './ChatPanel.module.css'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  body: string
  timestamp: Date
}

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (body: string) => void
  onClose: () => void
}

export function ChatPanel({ messages, onSendMessage, onClose }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Meeting Chat</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className={styles.messageList}>
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <p>No messages yet</p>
            <p className={styles.emptySubtext}>Say hello to break the ice!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={styles.message}>
              <div className={styles.messageHeader}>
                <span className={styles.senderName}>{msg.userName}</span>
                <span className={styles.timestamp}>{formatTime(new Date(msg.timestamp))}</span>
              </div>
              <p className={styles.messageBody}>{msg.body}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.textarea}
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!inputValue.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
