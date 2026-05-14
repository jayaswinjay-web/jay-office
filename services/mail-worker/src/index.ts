import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://:jay_redis_password@localhost:6379'

interface RedisConnectionOptions {
  maxRetriesPerRequest: null | number
  enableReadyCheck: boolean
  lazyConnect: boolean
}

const connectionOptions: RedisConnectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
}

const redisConnection = new IORedis(REDIS_URL, connectionOptions)

interface ImapCredentials {
  host: string
  port: number
  user: string
  password: string
  tls: boolean
}

interface MailJobData {
  userId: string
  credentials: ImapCredentials
  folder: string
}

interface ParsedMessage {
  id: string
  from: { name: string; address: string }
  to: { name: string; address: string }[]
  subject: string
  date: Date
  bodyText: string
  bodyHtml: string
  attachments: Array<{ filename: string; contentType: string; size: number }>
  flags: string[]
}

interface Database {
  storeMessage(userId: string, message: ParsedMessage): Promise<void>
}

class MailDatabase implements Database {
  async storeMessage(userId: string, message: ParsedMessage): Promise<void> {
    console.log(`Storing message ${message.id} for user ${userId}`)
    // TODO: Implement actual database storage (Prisma/MongoDB)
    // Example: await prisma.emailMessage.create({ data: { userId, ...message } })
  }
}

function createImapConnection(credentials: ImapCredentials) {
  const Imap = require('imap') as unknown as new (opts: Record<string, unknown>) => any
  return new Imap({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    tls: credentials.tls,
    tlsOptions: { rejectUnauthorized: false },
  })
}

async function fetchMessages(imap: any, folder: string, since: Date): Promise<ParsedMessage[]> {
  return new Promise((resolve, reject) => {
    const messages: ParsedMessage[] = []

    imap.once('ready', () => {
      imap.openBox(folder, false, (err: Error | null) => {
        if (err) {
          reject(err)
          return
        }

        const searchCriteria: [string, [string, string]?] = ['ALL']
        if (since) {
          searchCriteria.push(['SINCE', since.toISOString()])
        }

        imap.search(searchCriteria, (searchErr: Error | null, results: number[]) => {
          if (searchErr) {
            reject(searchErr)
            return
          }

          if (results.length === 0) {
            imap.end()
            resolve(messages)
            return
          }

          const fetch = imap.fetch(results, {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            struct: true,
          })

          fetch.on('message', (msg: any, seqno: number) => {
            const parsed: Partial<ParsedMessage> = { id: String(seqno), flags: [], attachments: [] }

            msg.on('body', (stream: NodeJS.ReadableStream, info: { which: string }) => {
              let buffer = ''
              stream.on('data', (chunk: Buffer) => {
                buffer += chunk.toString('utf8')
              })
              stream.once('end', () => {
                if (info.which === 'TEXT') {
                  parsed.bodyText = buffer
                }
              })
            })

            msg.once('attributes', (attrs: { date: Date; flags: string[] }) => {
              parsed.date = attrs.date
              parsed.flags = attrs.flags ?? []
            })

            msg.once('end', () => {
              messages.push(parsed as ParsedMessage)
            })
          })

          fetch.once('error', (fetchErr: Error) => {
            reject(fetchErr)
          })

          fetch.once('end', () => {
            imap.end()
            resolve(messages)
          })
        })
      })
    })

    imap.once('error', (err: Error) => {
      reject(err)
    })

    imap.connect()
  })
}

export const mailQueue: Queue<MailJobData> = new Queue<MailJobData>('mail', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

const worker = new Worker<MailJobData>(
  'mail',
  async (job: Job<MailJobData>) => {
    const { userId, credentials, folder } = job.data
    console.log(`Processing mail job ${job.id} for user ${userId}`)

    const db = new MailDatabase()
    let imap: any = null

    try {
      imap = createImapConnection(credentials)
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const messages = await fetchMessages(imap, folder ?? 'INBOX', since)

      for (const message of messages) {
        await db.storeMessage(userId, message)
      }

      console.log(`Job ${job.id}: Synced ${messages.length} messages`)
      return { synced: messages.length }
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error)
      throw error
    } finally {
      if (imap && imap.state !== 'disconnected') {
        imap.end()
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000,
    },
  },
)

worker.on('completed', (job: Job<MailJobData> | undefined) => {
  if (job) {
    console.log(`Job ${job.id} completed successfully`)
  }
})

worker.on('failed', (job: Job<MailJobData> | undefined, err: Error) => {
  if (job) {
    console.error(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message)
  }
})

worker.on('error', (err: Error) => {
  console.error('Worker error:', err)
})

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...')
  await worker.close()
  await redisConnection.quit()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...')
  await worker.close()
  await redisConnection.quit()
  process.exit(0)
})

console.log('JAY Mail Worker service started - listening for mail sync jobs')
