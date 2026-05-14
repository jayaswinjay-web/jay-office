import { api } from '@/platform/api'

export type ViewMode = 'month' | 'week' | 'day'

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  location: string | null
  color: string
  isAllDay: boolean
}

export interface EventsResponse {
  events: CalendarEvent[]
}

export interface EventResponse {
  event: CalendarEvent
}

export async function listEvents(params: {
  startDate: string
  endDate: string
}): Promise<EventsResponse> {
  const qs = new URLSearchParams(params).toString()
  return api.get<EventsResponse>(`/cal/events?${qs}`)
}

export async function getEvent(id: string): Promise<EventResponse> {
  return api.get<EventResponse>(`/cal/events/${id}`)
}

export async function createEvent(data: Omit<CalendarEvent, 'id'>): Promise<EventResponse> {
  return api.post<EventResponse>('/cal/events', data)
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<CalendarEvent, 'id'>>,
): Promise<EventResponse> {
  return api.patch<EventResponse>(`/cal/events/${id}`, data)
}

export async function deleteEvent(id: string): Promise<void> {
  return api.delete<void>(`/cal/events/${id}`)
}
