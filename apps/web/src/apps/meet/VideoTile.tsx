import { useRef, useEffect, useState } from 'react'
import { MicOff, Hand, User } from 'lucide-react'
import styles from './VideoTile.module.css'

interface Participant {
  userId: string
  name: string
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isSpeaking: boolean
  isHandRaised: boolean
  isScreenSharing: boolean
}

interface VideoTileProps {
  participant: Participant
  isLocal: boolean
  stream: MediaStream | null
  isLarge?: boolean
}

export function VideoTile({ participant, isLocal, stream, isLarge = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [avatarColor, setAvatarColor] = useState('#6366f1')

  useEffect(() => {
    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f43f5e',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#14b8a6',
      '#06b6d4',
      '#3b82f6',
    ]
    const hash = participant.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    setAvatarColor(colors[hash % colors.length]!)
  }, [participant.userId])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {
        // Autoplay blocked
      })
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream])

  return (
    <div
      className={`${styles.tile} ${isLarge ? styles.large : ''} ${participant.isSpeaking ? styles.speaking : ''}`}
    >
      <div className={styles.videoContainer}>
        {participant.isVideoEnabled && stream ? (
          <video ref={videoRef} autoPlay playsInline muted={isLocal} className={styles.video} />
        ) : (
          <div className={styles.avatar} style={{ backgroundColor: avatarColor }}>
            <User size={isLarge ? 64 : 32} />
            <span className={styles.avatarInitial}>{participant.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className={styles.overlay}>
        <div className={styles.participantInfo}>
          <span className={styles.name}>
            {participant.name}
            {isLocal && ' (You)'}
          </span>
          <div className={styles.indicators}>
            {!participant.isAudioEnabled && (
              <span className={styles.mutedBadge}>
                <MicOff size={12} />
              </span>
            )}
            {participant.isHandRaised && (
              <span className={styles.handBadge}>
                <Hand size={12} />
              </span>
            )}
          </div>
        </div>
      </div>

      {participant.isScreenSharing && <div className={styles.screenShareBadge}>Screen Sharing</div>}
    </div>
  )
}
