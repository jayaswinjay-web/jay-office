import { useState, useEffect, useRef } from 'react'
import { Mic, Speaker, Camera, ArrowLeft, Video, MicOff } from 'lucide-react'
import styles from './MeetingSetup.module.css'

interface MeetingSetupProps {
  onJoin: (stream: MediaStream, title?: string) => void
  onBack: () => void
  meetingCode?: string
}

export function MeetingSetup({ onJoin, onBack, meetingCode }: MeetingSetupProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [audioInputId, setAudioInputId] = useState('')
  const [audioOutputId, setAudioOutputId] = useState('')
  const [videoInputId, setVideoInputId] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [meetingTitle, setMeetingTitle] = useState('Team Meeting')
  const [guestCode, setGuestCode] = useState(meetingCode ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    initializeDevices()
    return () => {
      localStream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  const initializeDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
      setLocalStream(stream)

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = allDevices.filter((d) => d.kind === 'audioinput')
      const audioOutputs = allDevices.filter((d) => d.kind === 'audiooutput')
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput')

      setDevices(allDevices)
      setAudioInputId(audioInputs[0]?.deviceId ?? '')
      setAudioOutputId(audioOutputs[0]?.deviceId ?? '')
      setVideoInputId(videoInputs[0]?.deviceId ?? '')
    } catch {
      // Media access denied
    }
  }

  const switchCamera = async (deviceId: string) => {
    setVideoInputId(deviceId)
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.kind === 'video') track.stop()
      })
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: audioInputId ? { exact: audioInputId } : undefined },
        video: { deviceId: deviceId ? { exact: deviceId } : undefined },
      })

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (track.kind === 'audio') newStream.addTrack(track)
        })
      }

      setLocalStream(newStream)
    } catch {
      // Failed to switch camera
    }
  }

  const switchMicrophone = async (deviceId: string) => {
    setAudioInputId(deviceId)
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.kind === 'audio') track.stop()
      })
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined },
        video: { deviceId: videoInputId ? { exact: videoInputId } : undefined },
      })

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (track.kind === 'video') newStream.addTrack(track)
        })
      }

      setLocalStream(newStream)
    } catch {
      // Failed to switch microphone
    }
  }

  const handleJoin = () => {
    if (localStream) {
      setIsLoading(true)
      onJoin(localStream, meetingTitle)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
      }
    }
  }

  const audioInputs = devices.filter((d) => d.kind === 'audioinput')
  const audioOutputs = devices.filter((d) => d.kind === 'audiooutput')
  const videoInputs = devices.filter((d) => d.kind === 'videoinput')

  const videoTrack = localStream?.getVideoTracks()[0]
  const audioTrack = localStream?.getAudioTracks()[0]

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2 className={styles.title}>Ready to join?</h2>
        </div>

        <div className={styles.preview}>
          <div className={styles.videoPreview}>
            <video ref={videoRef} autoPlay playsInline muted className={styles.video} />
            {!videoTrack?.enabled && (
              <div className={styles.videoOffOverlay}>
                <Camera size={48} />
                <span>Camera Off</span>
              </div>
            )}
          </div>

          <div className={styles.previewControls}>
            <button
              className={`${styles.previewBtn} ${audioTrack?.enabled ? '' : styles.previewBtnOff}`}
              onClick={toggleAudio}
            >
              {audioTrack?.enabled ? <Mic size={20} /> : <MicOff size={20} />}
              <span>{audioTrack?.enabled ? 'Microphone On' : 'Microphone Off'}</span>
            </button>
            <button
              className={`${styles.previewBtn} ${videoTrack?.enabled ? '' : styles.previewBtnOff}`}
              onClick={toggleVideo}
            >
              <Video size={20} />
              <span>{videoTrack?.enabled ? 'Camera On' : 'Camera Off'}</span>
            </button>
          </div>
        </div>

        <div className={styles.devices}>
          <div className={styles.deviceGroup}>
            <label className={styles.label}>
              <Mic size={16} />
              Microphone
            </label>
            <select
              className={styles.select}
              value={audioInputId}
              onChange={(e) => switchMicrophone(e.target.value)}
            >
              {audioInputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.deviceGroup}>
            <label className={styles.label}>
              <Speaker size={16} />
              Speaker
            </label>
            <select
              className={styles.select}
              value={audioOutputId}
              onChange={(e) => setAudioOutputId(e.target.value)}
            >
              {audioOutputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.deviceGroup}>
            <label className={styles.label}>
              <Camera size={16} />
              Camera
            </label>
            <select
              className={styles.select}
              value={videoInputId}
              onChange={(e) => switchCamera(e.target.value)}
            >
              {videoInputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.meetingInfo}>
          <div className={styles.field}>
            <label className={styles.label}>Meeting Name</label>
            <input
              type="text"
              className={styles.input}
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Enter meeting name"
            />
          </div>

          {!meetingCode && (
            <div className={styles.field}>
              <label className={styles.label}>Meeting Code (for guests)</label>
              <input
                type="text"
                className={styles.input}
                value={guestCode}
                onChange={(e) => setGuestCode(e.target.value)}
                placeholder="Enter meeting code to join"
              />
            </div>
          )}
        </div>

        <button className={styles.joinBtn} onClick={handleJoin} disabled={isLoading}>
          {isLoading ? 'Joining...' : 'Join Now'}
        </button>
      </div>
    </div>
  )
}
