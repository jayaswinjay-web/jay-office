import { api } from '@/platform/api'

export type CanvasElementType =
  | 'text'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'image'
  | 'table'
  | 'chart'
  | 'icon'

export interface CanvasElement {
  id: string
  type: CanvasElementType
  properties: Record<string, unknown>
}

export interface SlideItem {
  id: string
  title: string
  elements: CanvasElement[]
  notes: string
  thumbnail: string
  transition: string
  transitionDuration: number
}

export interface SlideResponse {
  slide: SlideItem
}

export interface SlidesResponse {
  slides: SlideItem[]
}

export async function listSlides(): Promise<SlidesResponse> {
  return api.get<SlidesResponse>('/slides')
}

export async function getSlide(id: string): Promise<SlideResponse> {
  return api.get<SlideResponse>(`/slides/${id}`)
}

export async function createSlide(title: string): Promise<SlideResponse> {
  return api.post<SlideResponse>('/slides', { title })
}

export async function updateSlide(id: string, updates: Partial<SlideItem>): Promise<SlideResponse> {
  return api.patch<SlideResponse>(`/slides/${id}`, updates)
}

export async function deleteSlide(id: string): Promise<void> {
  return api.delete<void>(`/slides/${id}`)
}

export async function duplicateSlide(id: string): Promise<SlideResponse> {
  return api.post<SlideResponse>(`/slides/${id}/duplicate`, {})
}
