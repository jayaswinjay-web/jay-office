import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import bcrypt from "bcrypt"
import { users, workspaces, workspaceMembers, folders, notes, tasks, documents, sheets, slides } from "@jay/schema"

async function seed() {
  const client = postgres("postgresql://jay:jay_dev_password@localhost:5432/jay_office")
  const db = drizzle(client)

  console.log("🌱 Seeding JAY Office database...")

  // Hash passwords
  const demoPassword = await bcrypt.hash("demo1234", 10)
  const adminPassword = await bcrypt.hash("admin1234", 10)

  // Create demo user
  const [demoUser] = await db
    .insert(users)
    .values({
      email: "demo@jayoffice.dev",
      passwordHash: demoPassword,
      name: "Demo User",
      emailVerified: true,
      twoFactorEnabled: false,
    })
    .returning()

  console.log(`✅ Created user: ${demoUser!.email}`)

  // Create admin user
  const [adminUser] = await db
    .insert(users)
    .values({
      email: "admin@jayoffice.dev",
      passwordHash: adminPassword,
      name: "Admin User",
      emailVerified: true,
      twoFactorEnabled: false,
    })
    .returning()

  console.log(`✅ Created user: ${adminUser!.email}`)

  // Create workspace
  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: "Demo Workspace",
      slug: "demo-workspace",
      plan: "free",
    })
    .returning()

  console.log(`✅ Created workspace: ${workspace!.name}`)

  // Add members
  await db.insert(workspaceMembers).values({
    workspaceId: workspace!.id,
    userId: demoUser!.id,
    role: "owner",
  })

  await db.insert(workspaceMembers).values({
    workspaceId: workspace!.id,
    userId: adminUser!.id,
    role: "member",
  })

  console.log(`✅ Added workspace members`)

  // Create demo folders
  const [rootFolder] = await db
    .insert(folders)
    .values({
      name: "My Files",
      workspaceId: workspace!.id,
      ownerId: demoUser!.id,
    })
    .returning()

  await db.insert(folders).values({
    name: "Documents",
    workspaceId: workspace!.id,
    ownerId: demoUser!.id,
    parentId: rootFolder!.id,
  })

  await db.insert(folders).values({
    name: "Images",
    workspaceId: workspace!.id,
    ownerId: demoUser!.id,
    parentId: rootFolder!.id,
  })

  console.log(`✅ Created demo folders`)

  // Create demo note
  await db.insert(notes).values({
    title: "Welcome to JAY Notes",
    workspaceId: workspace!.id,
    ownerId: demoUser!.id,
    content: JSON.stringify([
      { id: "1", type: "heading1", content: "Getting Started" },
      { id: "2", type: "paragraph", content: "Welcome to JAY Office! This is your first note." },
      { id: "3", type: "heading2", content: "Features" },
      { id: "4", type: "bullet", content: "Drive - File storage and management" },
      { id: "5", type: "bullet", content: "Docs - Rich text editing" },
      { id: "6", type: "bullet", content: "Sheets - Spreadsheets with formulas" },
      { id: "7", type: "bullet", content: "Slides - Presentations" },
      { id: "8", type: "bullet", content: "Mail - Email client" },
      { id: "9", type: "bullet", content: "Calendar - Event scheduling" },
      { id: "10", type: "bullet", content: "Meet - Video conferencing" },
      { id: "11", type: "bullet", content: "Tasks - Project management" },
      { id: "12", type: "bullet", content: "Forms - Survey builder" },
      { id: "13", type: "bullet", content: "Sign - Document signing" },
      { id: "14", type: "bullet", content: "Chat - Team messaging" },
    ]),
  })

  console.log(`✅ Created demo note`)

  // Create demo document
  await db.insert(documents).values({
    title: "Welcome to JAY Docs",
    workspaceId: workspace!.id,
    ownerId: demoUser!.id,
    content: "<h1>Getting Started</h1><p>Welcome to JAY Docs! Start typing here.</p>",
  })

  console.log(`✅ Created demo document`)

  // Create demo sheet
  await db.insert(sheets).values({
    title: "Budget Tracker",
    workspaceId: workspace!.id,
    ownerId: demoUser!.id,
  })

  console.log(`✅ Created demo sheet`)

  // Create demo presentation
  await db.insert(slides).values({
    title: "Product Launch",
    workspaceId: workspace!.id,
    ownerId: demoUser!.id,
  })

  console.log(`✅ Created demo presentation`)

  // Create demo tasks
  await db.insert(tasks).values([
    {
      title: "Explore JAY Office",
      description: "Try out all 12 apps in the suite",
      workspaceId: workspace!.id,
      creatorId: demoUser!.id,
      status: "todo",
      priority: "P1",
    },
    {
      title: "Create your first document",
      description: "Open Docs and write something",
      workspaceId: workspace!.id,
      creatorId: demoUser!.id,
      status: "todo",
      priority: "P2",
    },
    {
      title: "Build a spreadsheet",
      description: "Try formulas in Sheets",
      workspaceId: workspace!.id,
      creatorId: demoUser!.id,
      status: "in-progress",
      priority: "P3",
    },
    {
      title: "Schedule a meeting",
      description: "Create an event in Calendar",
      workspaceId: workspace!.id,
      creatorId: demoUser!.id,
      status: "todo",
      priority: "P2",
    },
    {
      title: "Build a spreadsheet",
      description: "Try formulas in Sheets",
      workspaceId: workspace!.id,
      creatorId: demoUser!.id,
      status: "in-progress",
      priority: "p3",
    },
    {
      title: "Schedule a meeting",
      description: "Create an event in Calendar",
      workspaceId: workspace!.id,
      creatorId: demoUser!.id,
      status: "todo",
      priority: "p2",
    },
  ])

  console.log(`✅ Created demo tasks`)

  console.log("\n🎉 Seeding complete!")
  console.log("\n📝 Demo Credentials:")
  console.log("   User:     demo@jayoffice.dev / demo1234")
  console.log("   Admin:    admin@jayoffice.dev / admin1234")

  await client.end()
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
