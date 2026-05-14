import { api } from "./api"

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; name: string }
}

interface RegisterResponse {
  message: string
  userId: string
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", { email, password })
}

export async function register(email: string, password: string, name: string): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("/auth/register", { email, password, name })
}

export async function refreshToken(token: string): Promise<TokenResponse> {
  return api.post<TokenResponse>("/auth/refresh", { refreshToken: token })
}

export async function logout(token: string): Promise<void> {
  return api.post("/auth/logout", { refreshToken: token })
}

export async function sendMagicLink(email: string): Promise<{ message: string }> {
  return api.post<{ message: string }>("/auth/magic-link", { email })
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return api.post<{ message: string }>("/auth/verify-email", { token })
}

export async function setup2FA(): Promise<{ secret: string; qrCodeUrl: string }> {
  return api.post<{ secret: string; qrCodeUrl: string }>("/auth/2fa/setup", {})
}

export async function verify2FA(token: string): Promise<{ message: string }> {
  return api.post<{ message: string }>("/auth/2fa/verify", { token })
}

export interface Session {
  id: string
  device_info: string | null
  ip_address: string | null
  created_at: string
  expires_at: string
}

export async function getSessions(): Promise<Session[]> {
  return api.get<Session[]>("/auth/sessions")
}

export async function revokeSession(sessionId: string): Promise<void> {
  return api.delete(`/auth/sessions/${sessionId}`)
}
