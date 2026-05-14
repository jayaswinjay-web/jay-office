import { Hash, MessageCircle } from 'lucide-react'
import styles from './ChannelList.module.css'

interface Channel {
  id: string
  name: string
  description: string | null
  memberCount: number
  unreadCount: number
}

interface ChannelListProps {
  channels: Channel[]
  activeChannelId: string | null
  onSelectChannel: (channelId: string) => void
}

export function ChannelList({ channels, activeChannelId, onSelectChannel }: ChannelListProps) {
  const channelChannels = channels.filter((ch) => ch.name.startsWith('#') || !ch.name.includes('@'))
  const directMessages = channels.filter((ch) => ch.name.includes('@'))

  return (
    <div className={styles.list}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Channels</h4>
        <div className={styles.items}>
          {channelChannels.map((channel) => (
            <button
              key={channel.id}
              className={`${styles.item} ${channel.id === activeChannelId ? styles.active : ''}`}
              onClick={() => onSelectChannel(channel.id)}
            >
              <span className={styles.channelIcon}>
                <Hash size={16} />
              </span>
              <span className={styles.itemName}>{channel.name}</span>
              {channel.unreadCount > 0 && (
                <span className={styles.badge}>{channel.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {directMessages.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Direct Messages</h4>
          <div className={styles.items}>
            {directMessages.map((dm) => (
              <button
                key={dm.id}
                className={`${styles.item} ${dm.id === activeChannelId ? styles.active : ''}`}
                onClick={() => onSelectChannel(dm.id)}
              >
                <span className={styles.dmIcon}>
                  <MessageCircle size={16} />
                </span>
                <span className={styles.itemName}>{dm.name.replace('@', '')}</span>
                {dm.unreadCount > 0 && <span className={styles.badge}>{dm.unreadCount}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
