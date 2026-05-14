import { Server } from "socket.io"

const io = new Server({
  cors: {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  },
})

const PORT = Number(process.env.REALTIME_PORT) || 4001

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

io.listen(PORT)
console.log(`JAY Realtime server listening on port ${PORT}`)
