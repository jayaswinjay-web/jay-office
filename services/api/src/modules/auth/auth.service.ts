import { db } from "../../lib/db"
import { redis } from "../../lib/redis"
import { users, sessions } from "@jay/schema"
import { eq, and } from "drizzle-orm"
import bcrypt from "bcrypt"
import speakeasy from "speakeasy"
import QRCode from "qrcode"
import crypto from "crypto"

export interface SessionData {
  id: string
  userId: string
  refreshToken: string
  deviceInfo: string | null
  ipAddress: string | null
  expiresAt: Date
  createdAt: Date
}

export interface UserData {
  id: string
  email: string
  name: string
  passwordHash: string | null
  emailVerified: boolean
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
}

export const authService = {
  async findUserByEmail(email: string): Promise<UserData | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
    }
  },

  async findUserById(id: string): Promise<UserData | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
    }
  },

  async register(email: string, hashedPassword: string, name: string): Promise<UserData> {
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
        name,
        emailVerified: false,
        twoFactorEnabled: false,
      })
      .returning()
    return {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      passwordHash: user!.passwordHash,
      emailVerified: user!.emailVerified,
      twoFactorEnabled: user!.twoFactorEnabled,
      twoFactorSecret: user!.twoFactorSecret,
    }
  },

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex")
    const key = `email_verify:${token}`
    await redis.setex(key, 86400, userId)
    return token
  },

  async verifyEmail(token: string): Promise<void> {
    const key = `email_verify:${token}`
    const userId = await redis.get(key)
    if (!userId) {
      throw new Error("Invalid or expired token")
    }

    await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId))
    await redis.del(key)
  },

  async generateMagicLinkToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex")
    const key = `magic_link:${token}`
    await redis.setex(key, 900, userId)
    return token
  },

  async login(user: UserData, jwtSign: (payload: Record<string, unknown>, options?: Record<string, unknown>) => string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwtSign(
      { id: user.id, email: user.email, name: user.name },
      { expiresIn: "15m" }
    )

    const refreshToken = crypto.randomBytes(32).toString("hex")
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: refreshTokenHash,
      expiresAt,
    })

    return { accessToken, refreshToken }
  },

  async refresh(oldRefreshToken: string, jwtSign: (payload: Record<string, unknown>, options?: Record<string, unknown>) => string): Promise<{ accessToken: string; refreshToken: string }> {
    const sessionsData = await db.select().from(sessions)
    let foundSession: SessionData | null = null
    for (const session of sessionsData) {
      const match = await bcrypt.compare(oldRefreshToken, session.refreshToken)
      if (match) {
        foundSession = {
          id: session.id,
          userId: session.userId,
          refreshToken: session.refreshToken,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
        }
        break
      }
    }

    if (!foundSession) {
      throw new Error("Invalid refresh token")
    }

    const user = await this.findUserById(foundSession.userId)
    if (!user) {
      throw new Error("User not found")
    }

    await db.delete(sessions).where(eq(sessions.id, foundSession.id))

    const newTokens = await this.login(user, jwtSign)
    return newTokens
  },

  async logout(refreshToken: string): Promise<void> {
    const sessionsData = await db.select().from(sessions)
    for (const session of sessionsData) {
      const match = await bcrypt.compare(refreshToken, session.refreshToken)
      if (match) {
        await db.delete(sessions).where(eq(sessions.id, session.id))
        break
      }
    }
  },

  async setup2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = speakeasy.generateSecret({
      name: `JAY Office (${userId})`,
      length: 20,
    })

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    await redis.setex(`2fa_setup:${userId}`, 300, secret.base32)

    return {
      secret: secret.base32,
      qrCodeUrl,
    }
  },

  async verify2FA(userId: string, token: string): Promise<void> {
    const secret = await redis.get(`2fa_setup:${userId}`)
    if (!secret) {
      throw new Error("2FA setup not found or expired")
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    })

    if (!verified) {
      throw new Error("Invalid 2FA token")
    }

    await db
      .update(users)
      .set({ twoFactorEnabled: true, twoFactorSecret: secret })
      .where(eq(users.id, userId))

    await redis.del(`2fa_setup:${userId}`)
  },

  async getSessions(userId: string): Promise<SessionData[]> {
    const results = await db.select().from(sessions).where(eq(sessions.userId, userId))
    return results.map((s) => ({
      id: s.id,
      userId: s.userId,
      refreshToken: s.refreshToken,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
    }))
  },

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
  },
}
