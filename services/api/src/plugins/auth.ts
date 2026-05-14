import fp from "fastify-plugin"
import fastifyJwt from "@fastify/jwt"
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string
      email: string
      name: string
    }
  }

  interface FastifyInstance<RawServer, RawRequest, RawReply, Logger, TypeProvider> {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string
      email: string
      name: string
    }
    user: {
      id: string
      email: string
      name: string
    }
  }
}

export interface JwtPayload {
  id: string
  email: string
  name: string
}

export const authPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "jay_dev_jwt_secret_change_in_production",
    sign: {
      expiresIn: "15m",
    },
  })

  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authorization = request.headers.authorization
      if (!authorization) {
        return reply.status(401).send({ message: "Missing authorization header" })
      }

      await request.jwtVerify<JwtPayload>()
    } catch (_err) {
      return reply.status(401).send({ message: "Invalid or expired token" })
    }
  })
})
