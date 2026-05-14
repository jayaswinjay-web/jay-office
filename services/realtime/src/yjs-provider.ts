import { Server } from 'socket.io'

export function initYjsServer(io: Server) {
  io.on('connection', (socket) => {
    socket.on('yjs-sync', (docName: string) => {
      console.log(`Yjs sync: ${docName}`)
    })
    socket.on('yjs-update', (docName: string, _update: Uint8Array) => {
      console.log(`Yjs update: ${docName}`)
    })
  })
}
