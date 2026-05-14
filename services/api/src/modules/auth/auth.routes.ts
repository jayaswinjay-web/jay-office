import { FastifyInstance } from "fastify"
import bcrypt from "bcrypt"
import { authService } from "./auth.service"

interface RegisterBody {
  email: string
  password: string
  name: string
}

interface LoginBody {
  email: string
  password: string
}

interface RefreshBody {
  refreshToken: string
}

interface VerifyEmailBody {
  token: string
}

interface MagicLinkBody {
  email: string
}

interface TwoFactorVerifyBody {
  token: string
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterBody }>("/register", async (request, reply) => {
    const { email, password, name } = request.body

    const existingUser = await authService.findUserByEmail(email)
    if (existingUser) {
      return reply.status(409).send({ message: "Email already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await authService.register(email, hashedPassword, name)

    const verificationToken = await authService.generateEmailVerificationToken(user.id)

    fastify.log.info(`Verification token for ${email}: ${verificationToken}`)

    return reply.status(201).send({
      message: "Registration successful. Please check your email to verify your account.",
      userId: user.id,
    })
  })

  fastify.post<{ Body: LoginBody }>("/login", async (request, reply) => {
    const { email, password } = request.body

    const user = await authService.findUserByEmail(email)
    if (!user || !user.passwordHash) {
      return reply.status(401).send({ message: "Invalid email or password" })
    }

    if (!user.emailVerified) {
      return reply.status(401).send({ message: "Please verify your email before logging in" })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return reply.status(401).send({ message: "Invalid email or password" })
    }

    if (user.twoFactorEnabled) {
      return reply.status(401).send({ message: "2FA required" })
    }

    const tokens = await authService.login(user, (payload, options) => fastify.jwt.sign(payload as { id: string; email: string; name: string }, options))

    return reply.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  })

  fastify.post<{ Body: RefreshBody }>("/refresh", async (request, reply) => {
    const { refreshToken } = request.body

    try {
      const tokens = await authService.refresh(refreshToken, (payload, options) => fastify.jwt.sign(payload as { id: string; email: string; name: string }, options))
      return reply.send(tokens)
    } catch (_err) {
      return reply.status(401).send({ message: "Invalid refresh token" })
    }
  })

  fastify.post<{ Body: RefreshBody }>("/logout", async (request, reply) => {
    const { refreshToken } = request.body
    await authService.logout(refreshToken)
    return reply.status(204).send()
  })

  fastify.post<{ Body: MagicLinkBody }>("/magic-link", async (request, reply) => {
    const { email } = request.body

    const user = await authService.findUserByEmail(email)
    if (!user) {
      return reply.status(200).send({ message: "If the email exists, a magic link has been sent" })
    }

    const magicToken = await authService.generateMagicLinkToken(user.id)

    fastify.log.info(`Magic link token for ${email}: ${magicToken}`)

    return reply.send({ message: "If the email exists, a magic link has been sent" })
  })

  fastify.post<{ Body: VerifyEmailBody }>("/verify-email", async (request, reply) => {
    const { token } = request.body

    try {
      await authService.verifyEmail(token)
      return reply.send({ message: "Email verified successfully" })
    } catch (_err) {
      return reply.status(400).send({ message: "Invalid or expired verification token" })
    }
  })

  fastify.post("/2fa/setup", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const setup = await authService.setup2FA(request.user.id)
    return reply.send(setup)
  })

  fastify.post<{ Body: TwoFactorVerifyBody }>("/2fa/verify", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { token } = request.body

    try {
      await authService.verify2FA(request.user.id, token)
      return reply.send({ message: "2FA enabled successfully" })
    } catch (_err) {
      return reply.status(400).send({ message: "Invalid 2FA token" })
    }
  })

  fastify.get("/sessions", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userSessions = await authService.getSessions(request.user.id)
    return reply.send(userSessions)
  })

  fastify.delete("/sessions/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await authService.revokeSession(request.user.id, id)
    return reply.status(204).send()
  })
}
