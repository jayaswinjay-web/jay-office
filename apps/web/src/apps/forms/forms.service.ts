import { api } from '@/platform/api'

interface Form {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'closed'
  questions: Array<{
    id: string
    type: string
    title: string
    required: boolean
    options?: string[]
  }>
  responseCount: number
  createdAt: Date
}

export async function listForms() {
  return api.get<{ forms: Form[] }>('/forms')
}

export async function createForm(title: string) {
  return api.post<{ form: Form }>('/forms', { title })
}

export async function getForm(id: string) {
  return api.get<{ form: Form }>(`/forms/${id}`)
}

export async function updateForm(id: string, data: Partial<Omit<Form, 'id' | 'createdAt'>>) {
  return api.patch<{ form: Form }>(`/forms/${id}`, data)
}

export async function deleteForm(id: string) {
  return api.delete(`/forms/${id}`)
}

export async function submitForm(formId: string, answers: Record<string, string>) {
  return api.post(`/forms/${formId}/responses`, { answers })
}

export async function getResponses(formId: string) {
  return api.get<{
    responses: Array<{ id: string; answers: Record<string, string>; submittedAt: Date }>
  }>(`/forms/${formId}/responses`)
}
