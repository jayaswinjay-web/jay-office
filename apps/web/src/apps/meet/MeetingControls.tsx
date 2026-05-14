import { useState } from 'react'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Hand,
  Smile,
  PhoneOff,
  Grid,
  LayoutList,
  Square,
  PanelLeft,
  PenTool,
} from 'lucide-react'
import styles from './MeetingControls.module.css'

type ViewMode = 'grid' | 'spotlight'

interface MeetingControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  isHandRaised: boolean
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
  onToggleChat: () => void
  onToggleWhiteboard: () => void
  onToggleHandRaise: () => void
  onReaction: (emoji: string) => void
  onLeave: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const REACTIONS = [
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '👋', label: 'Wave' },
]

export function MeetingControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleWhiteboard,
  onToggleHandRaise,
  onReaction,
  onLeave,
  viewMode,
  onViewModeChange,
}: MeetingControlsProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [showScreenShareOptions, setShowScreenShareOptions] = useState(false)
  const [reactionAnim, setReactionAnim] = useState<string | null>(null)

  const handleReaction = (emoji: string) => {
    setReactionAnim(emoji)
    onReaction(emoji)
    setTimeout(() => setReactionAnim(null), 2000)
  }

  return (
    <div className={styles.controlsBar}>
      {reactionAnim && (
        <span className={styles.reactionFloat} key={reactionAnim + Date.now()}>
          {reactionAnim}
        </span>
      )}

      <div className={styles.controlsLeft}>
        <div className={styles.controlGroup}>
          <button
            className={`${styles.controlBtn} ${isMuted ? styles.danger : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            <span className={styles.tooltip}>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button
            className={`${styles.controlBtn} ${isVideoOff ? styles.danger : ''}`}
            onClick={onToggleVideo}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            <span className={styles.tooltip}>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.dropdownContainer}>
            <button
              className={`${styles.controlBtn} ${isScreenSharing ? styles.active : ''}`}
              onClick={() => setShowScreenShareOptions(!showScreenShareOptions)}
              title="Share Screen"
            >
              <Monitor size={20} />
              <span className={styles.tooltip}>Share Screen</span>
            </button>
            {showScreenShareOptions && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    onToggleScreenShare()
                    setShowScreenShareOptions(false)
                  }}
                >
                  <Monitor size={16} />
                  Full Screen
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    onToggleScreenShare()
                    setShowScreenShareOptions(false)
                  }}
                >
                  <Square size={16} />
                  Window
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    onToggleScreenShare()
                    setShowScreenShareOptions(false)
                  }}
                >
                  <PanelLeft size={16} />
                  Tab
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <button className={styles.controlBtn} onClick={onToggleChat} title="Toggle Chat">
            <MessageSquare size={20} />
            <span className={styles.tooltip}>Chat</span>
          </button>
          <button
            className={styles.controlBtn}
            onClick={onToggleWhiteboard}
            title="Toggle Whiteboard"
          >
            <PenTool size={20} />
            <span className={styles.tooltip}>Whiteboard</span>
          </button>
          <button
            className={`${styles.controlBtn} ${isHandRaised ? styles.active : ''}`}
            onClick={onToggleHandRaise}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <Hand size={20} />
            <span className={styles.tooltip}>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
          </button>
        </div>
      </div>

      <div className={styles.controlsCenter}>
        <button
          className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
          onClick={() => onViewModeChange('grid')}
          title="Grid View"
        >
          <Grid size={18} />
        </button>
        <button
          className={`${styles.viewBtn} ${viewMode === 'spotlight' ? styles.viewActive : ''}`}
          onClick={() => onViewModeChange('spotlight')}
          title="Spotlight View"
        >
          <LayoutList size={18} />
        </button>
      </div>

      <div className={styles.controlsRight}>
        <div className={styles.dropdownContainer}>
          <button
            className={styles.controlBtn}
            onClick={() => setShowReactions(!showReactions)}
            title="Reactions"
          >
            <Smile size={20} />
            <span className={styles.tooltip}>Reactions</span>
          </button>
          {showReactions && (
            <div className={styles.reactionsDropdown}>
              {REACTIONS.map((r) => (
                <button
                  key={r.emoji}
                  className={styles.reactionBtn}
                  onClick={() => handleReaction(r.emoji)}
                  title={r.label}
                >
                  <span className={styles.reactionEmoji}>{r.emoji}</span>
                  <span className={styles.reactionLabel}>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className={styles.leaveBtn} onClick={onLeave} title="Leave">
          <PhoneOff size={20} />
          <span>Leave</span>
        </button>
      </div>
    </div>
  )
}
