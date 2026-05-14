import { useState, useRef, useCallback } from 'react'
import { VideoTile } from './VideoTile'
import { MeetingControls } from './MeetingControls'
import { ChatPanel } from './ChatPanel'
import { Whiteboard } from './Whiteboard'
import { MeetingSetup } from './MeetingSetup'
import { createMeeting, joinMeeting, leaveMeeting } from './meet.service'
import { Users, Clock, Wifi, WifiOff } from 'lucide-react'
import styles from './MeetPage.module.css'

interface Participant {
  userId: string
  name: string
  stream: MediaStream | null
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isSpeaking: boolean
  isHandRaised: boolean
  isScreenSharing: boolean
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  body: string
  timestamp: Date
}

type ViewMode = 'grid' | 'spotlight'
type PanelMode = 'none' | 'chat' | 'whiteboard'

interface MeetPageProps {
  meetingId?: string
  isNewMeeting: boolean
  onBack: () => void
}

export function MeetPage({ meetingId, isNewMeeting, onBack }: MeetPageProps) {
  const [isJoined, setIsJoined] = useState(false)
  const [currentMeetingId, setCurrentMeetingId] = useState(meetingId ?? '')
  const [meetingTitle, setMeetingTitle] = useState('Untitled Meeting')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [panelMode, setPanelMode] = useState<PanelMode>('none')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [duration, setDuration] = useState(0)
  const [activeSpeakerId] = useState<string | null>(null)
  const [connectionQuality] = useState<number>(5)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleJoin = useCallback(
    async (stream: MediaStream, title?: string) => {
      setLocalStream(stream)
      if (title) setMeetingTitle(title)

      if (isNewMeeting) {
        try {
          const response = await createMeeting(title ?? 'New Meeting')
          setCurrentMeetingId(response.meeting.id)
        } catch (error) {
          console.error('Failed to create meeting:', error)
        }
      } else if (currentMeetingId) {
        try {
          await joinMeeting(currentMeetingId)
        } catch (error) {
          console.error('Failed to join meeting:', error)
        }
      }

      setIsJoined(true)
      setDuration(0)

      const selfParticipant: Participant = {
        userId: 'self',
        name: 'You',
        stream,
        isVideoEnabled: stream.getVideoTracks()[0]?.enabled ?? false,
        isAudioEnabled: stream.getAudioTracks()[0]?.enabled ?? false,
        isSpeaking: false,
        isHandRaised: false,
        isScreenSharing: false,
      }

      setParticipants([selfParticipant])

      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    },
    [isNewMeeting, currentMeetingId],
  )

  const handleLeave = useCallback(async () => {
    if (currentMeetingId) {
      try {
        await leaveMeeting(currentMeetingId)
      } catch (error) {
        console.error('Failed to leave meeting:', error)
      }
    }

    localStream?.getTracks().forEach((track) => track.stop())
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    peerConnectionsRef.current.forEach((pc) => pc.close())

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }

    onBack()
  }, [currentMeetingId, localStream, onBack])

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!localStream.getAudioTracks()[0]?.enabled)
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === 'self'
            ? { ...p, isAudioEnabled: localStream.getAudioTracks()[0]?.enabled ?? true }
            : p,
        ),
      )
    }
  }, [localStream])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!localStream.getVideoTracks()[0]?.enabled)
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === 'self'
            ? { ...p, isVideoEnabled: localStream.getVideoTracks()[0]?.enabled ?? true }
            : p,
        ),
      )
    }
  }, [localStream])

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        screenStreamRef.current = screenStream
        setIsScreenSharing(true)

        screenStream.getVideoTracks()[0]?.addEventListener('ended', () => {
          stopScreenShare()
        })

        setParticipants((prev) =>
          prev.map((p) => (p.userId === 'self' ? { ...p, isScreenSharing: true } : p)),
        )
      } catch (error) {
        console.error('Screen share cancelled or failed:', error)
      }
    } else {
      stopScreenShare()
    }
  }, [isScreenSharing])

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    screenStreamRef.current = null
    setIsScreenSharing(false)
    setParticipants((prev) =>
      prev.map((p) => (p.userId === 'self' ? { ...p, isScreenSharing: false } : p)),
    )
  }

  const toggleHandRaise = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === 'self' ? { ...p, isHandRaised: !p.isHandRaised } : p)),
    )
    setIsHandRaised((prev) => !prev)
  }, [])

  const toggleChat = useCallback(() => {
    setPanelMode((prev) => (prev === 'chat' ? 'none' : 'chat'))
  }, [])

  const toggleWhiteboard = useCallback(() => {
    setPanelMode((prev) => (prev === 'whiteboard' ? 'none' : 'whiteboard'))
  }, [])

  const handleReaction = useCallback((emoji: string) => {
    const reactionId = `reaction-${Date.now()}-${emoji}`
    setChatMessages((prev) => [
      ...prev,
      {
        id: reactionId,
        userId: 'self',
        userName: 'You',
        body: `Reacted with ${emoji}`,
        timestamp: new Date(),
      },
    ])
  }, [])

  const handleSendMessage = useCallback((body: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'self',
      userName: 'You',
      body,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, newMessage])
  }, [])

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const spotlightParticipant = activeSpeakerId
    ? (participants.find((p) => p.userId === activeSpeakerId) ?? participants[0])
    : participants[0]

  const gridParticipants =
    viewMode === 'spotlight' && spotlightParticipant
      ? participants.filter((p) => p.userId !== spotlightParticipant.userId)
      : participants

  if (!isJoined) {
    return (
      <MeetingSetup
        onJoin={handleJoin}
        onBack={onBack}
        meetingCode={isNewMeeting ? undefined : currentMeetingId}
      />
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.meetingInfoBar}>
        <div className={styles.meetingInfoLeft}>
          <span className={styles.meetingTitle}>{meetingTitle}</span>
          <span className={styles.meetingDivider}>|</span>
          <span className={styles.duration}>
            <Clock size={14} />
            {formatDuration(duration)}
          </span>
        </div>
        <div className={styles.meetingInfoRight}>
          <span className={styles.participantCount}>
            <Users size={14} />
            {participants.length} participants
          </span>
          <span className={styles.connectionQuality}>
            {connectionQuality >= 4 ? (
              <Wifi size={14} className={styles.qualityGood} />
            ) : (
              <WifiOff size={14} className={styles.qualityBad} />
            )}
          </span>
        </div>
      </div>

      <div className={styles.mainArea}>
        <div className={styles.videoArea}>
          {viewMode === 'spotlight' && spotlightParticipant ? (
            <>
              <div className={styles.spotlight}>
                <VideoTile
                  participant={spotlightParticipant}
                  isLocal={spotlightParticipant.userId === 'self'}
                  stream={
                    spotlightParticipant.userId === 'self'
                      ? localStream
                      : spotlightParticipant.stream
                  }
                  isLarge
                />
              </div>
              <div className={styles.filmstrip}>
                {gridParticipants.map((participant) => (
                  <VideoTile
                    key={participant.userId}
                    participant={participant}
                    isLocal={participant.userId === 'self'}
                    stream={participant.userId === 'self' ? localStream : participant.stream}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.grid}>
              {participants.map((participant) => (
                <VideoTile
                  key={participant.userId}
                  participant={participant}
                  isLocal={participant.userId === 'self'}
                  stream={participant.userId === 'self' ? localStream : participant.stream}
                />
              ))}
            </div>
          )}
        </div>

        {panelMode === 'chat' && (
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClose={() => setPanelMode('none')}
          />
        )}

        {panelMode === 'whiteboard' && (
          <Whiteboard onClose={() => setPanelMode('none')} participants={participants} />
        )}
      </div>

      <MeetingControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={toggleChat}
        onToggleWhiteboard={toggleWhiteboard}
        onToggleHandRaise={toggleHandRaise}
        onReaction={handleReaction}
        onLeave={handleLeave}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  )
}
