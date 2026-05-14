import TypeSense from 'typesense'

const client = new TypeSense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST ?? 'localhost',
      port: Number(process.env.TYPESENSE_PORT) || 8108,
      protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? '',
  connectionTimeoutSeconds: 5,
})

async function createCollections() {
  const collections = [
    {
      name: 'docs',
      fields: [
        { name: 'title', type: 'string' as const },
        { name: 'content', type: 'string' as const },
        { name: 'ownerId', type: 'string' as const },
        { name: 'createdAt', type: 'int64' as const },
      ],
    },
    {
      name: 'sheets',
      fields: [
        { name: 'title', type: 'string' as const },
        { name: 'ownerId', type: 'string' as const },
      ],
    },
    {
      name: 'slides',
      fields: [
        { name: 'title', type: 'string' as const },
        { name: 'ownerId', type: 'string' as const },
      ],
    },
    {
      name: 'notes',
      fields: [
        { name: 'title', type: 'string' as const },
        { name: 'content', type: 'string' as const },
        { name: 'ownerId', type: 'string' as const },
      ],
    },
    {
      name: 'tasks',
      fields: [
        { name: 'title', type: 'string' as const },
        { name: 'status', type: 'string' as const },
        { name: 'assigneeId', type: 'string' as const },
      ],
    },
    {
      name: 'files',
      fields: [
        { name: 'name', type: 'string' as const },
        { name: 'mimeType', type: 'string' as const },
        { name: 'ownerId', type: 'string' as const },
      ],
    },
  ]
  for (const c of collections) {
    try {
      await client.collections().create(c)
    } catch {
      /* exists */
    }
  }
}

export async function search(query: string, collections?: string[]) {
  const targets = collections ?? ['docs', 'sheets', 'slides', 'notes', 'tasks', 'files']
  const results: Array<{ collection: string; hits: unknown[] }> = []
  for (const col of targets) {
    const res = await client
      .collections(col)
      .documents()
      .search({ q: query, query_by: 'title,content,name' })
    results.push({ collection: col, hits: res.hits ?? [] })
  }
  return results
}

createCollections().then(() => console.log('JAY Search collections ready'))
