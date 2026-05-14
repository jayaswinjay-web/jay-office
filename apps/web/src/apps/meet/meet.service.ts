import { api } from '@/platform/api'

interface Meeting {
  id: string
  title: string
  hostId: string
  startedAt: Date
  endedAt: Date | null
  recording: boolean
  participants: Array<{ userId: string; name: string; joinedAt: Date }>
}

export async function createMeeting(title: string) {
  return api.post<{ meeting: Meeting }>('/meet', { title })
}

export async function joinMeeting(id: string) {
  return api.post<{ meeting: Meeting }>(`/meet/${id}/join`, {})
}

export async function leaveMeeting(id: string) {
  return api.post(`/meet/${id}/leave`, {})
}

export async function listMeetings() {
  return api.get<{ meetings: Meeting[] }>('/meet')
}
