import { api } from '@/platform/api'

export interface SignatureField {
  id: string
  type: 'signature' | 'date' | 'initials' | 'text'
  page: number
  x: number
  y: number
  width: number
  height: number
  value?: string
}

export interface SignatureRequest {
  id: string
  documentId: string
  signerEmail: string
  signerName: string
  status: 'pending' | 'signed' | 'declined'
  fields: SignatureField[]
  sentAt: Date
  signedAt: Date | null
}

export async function listSignRequests() {
  return api.get<{ requests: SignatureRequest[] }>('/sign/requests')
}

export async function createSignRequest(data: {
  documentId: string
  documentName?: string
  signers: Array<{ email: string; name: string }>
}) {
  return api.post<{ request: SignatureRequest }>('/sign/requests', data)
}

export async function getSignRequest(id: string) {
  return api.get<{ request: SignatureRequest }>(`/sign/requests/${id}`)
}

export async function signDocument(
  requestId: string,
  fields: Array<{ id: string; value: string }>,
) {
  return api.post(`/sign/requests/${requestId}/sign`, { fields })
}

export async function declineDocument(requestId: string, reason?: string) {
  return api.post(`/sign/requests/${requestId}/decline`, { reason })
}
