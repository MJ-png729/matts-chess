import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { gameManager } from './src/server/gameManager.js';
import { ClientMessage, ServerMessage } from './src/types/chess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Static file serving for pre-rendered chess pieces and assets
app.use('/pieces', express.static(path.resolve(__dirname, 'public/pieces')));
app.use('/assets', express.static(path.resolve(__dirname, 'public/assets')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Track client sockets: Map<WebSocket, { roomCode?: string; playerId?: string; playerName?: string }>()
const clientMeta = new Map<WebSocket, { roomCode?: string; playerId?: string; playerName?: string }>();

// Broadcast full room state with each player's personalized role
function broadcastRoomState(roomCode: string) {
  const code = roomCode.toUpperCase().trim();
  const room = gameManager.getRoom(code);
  if (!room) return;

  for (const [ws, meta] of clientMeta.entries()) {
    if (meta.roomCode === code && ws.readyState === WebSocket.OPEN) {
      const myId = meta.playerId;
      const role: 'white' | 'black' | 'spectator' =
        room.state.whitePlayer?.id === myId
          ? 'white'
          : room.state.blackPlayer?.id === myId
          ? 'black'
          : 'spectator';

      ws.send(JSON.stringify({
        type: 'room_state',
        state: room.state,
        yourRole: role,
      } as ServerMessage));
    }
  }
}

// Broadcast general events (e.g. chat, reactions, draw offers)
function broadcastToRoom(roomCode: string, message: ServerMessage, excludeWs?: WebSocket) {
  const code = roomCode.toUpperCase().trim();
  const payload = JSON.stringify(message);
  for (const [ws, meta] of clientMeta.entries()) {
    if (meta.roomCode === code && ws.readyState === WebSocket.OPEN && ws !== excludeWs) {
      ws.send(payload);
    }
  }
}

// Hook gameManager state changes (e.g. clock timeouts or disconnects) into WebSocket broadcasts
gameManager.onStateChange = (roomCode: string) => {
  broadcastRoomState(roomCode);
  const room = gameManager.getRoom(roomCode);
  if (room && room.state.status !== 'in_progress' && room.state.status !== 'waiting') {
    broadcastToRoom(roomCode, {
      type: 'game_over',
      winner: room.state.winner,
      reason: room.state.winReason || 'Game over',
    });
  }
};

// REST Endpoints
app.post('/api/rooms', (req, res) => {
  try {
    const { hostId, hostName, preferredColor, timeControl, isPublic } = req.body;
    if (!hostId || !timeControl) {
      return res.status(400).json({ error: 'Missing required room fields' });
    }

    const roomCode = gameManager.createRoom({
      hostId,
      hostName: hostName || 'Host',
      preferredColor: preferredColor || 'random',
      timeControl,
      isPublic: isPublic !== false,
    });

    const room = gameManager.getRoom(roomCode);
    res.json({ roomCode, state: room?.state });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create room' });
  }
});

app.delete('/api/rooms/:code', (req, res) => {
  try {
    const { hostId } = req.body || {};
    const success = gameManager.removeWaitingRoom(req.params.code, hostId);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete room' });
  }
});

app.get('/api/rooms', (_req, res) => {
  try {
    const list = gameManager.listPublicRooms();
    res.json({ rooms: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list rooms' });
  }
});

app.get('/api/rooms/:code', (req, res) => {
  const room = gameManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ state: room.state });
});

// WebSocket Connection Management
wss.on('connection', (ws: WebSocket) => {
  clientMeta.set(ws, {});

  ws.on('message', (raw: string) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString());

      if (msg.type === 'ping') {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
        return;
      }

      if (msg.type === 'join') {
        const { roomCode, playerId, playerName, preferredColor } = msg;
        const code = roomCode.toUpperCase().trim();
        const result = gameManager.joinRoom(code, {
          id: playerId,
          name: playerName,
          preferredColor,
        });

        if (!result) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found or cannot join' } as ServerMessage));
          return;
        }

        // Save socket metadata
        clientMeta.set(ws, { roomCode: code, playerId, playerName });

        // Broadcast updated room state to ALL sockets in the room with their personalized roles
        broadcastRoomState(code);
        return;
      }

      const meta = clientMeta.get(ws);
      if (!meta || !meta.roomCode || !meta.playerId) {
        return;
      }

      const code = meta.roomCode;
      const playerId = meta.playerId;

      if (msg.type === 'move') {
        const res = gameManager.makeMove(code, playerId, msg.from, msg.to, msg.promotion);
        const room = gameManager.getRoom(code);
        if (res.success && room) {
          broadcastRoomState(code);

          if (room.state.status !== 'in_progress') {
            broadcastToRoom(code, {
              type: 'game_over',
              winner: room.state.winner,
              reason: room.state.winReason || 'Game over',
            });
          }
        } else {
          ws.send(JSON.stringify({ type: 'error', message: res.error || 'Invalid move' } as ServerMessage));
        }
      } else if (msg.type === 'chat') {
        const chatMsg = gameManager.addChatMessage(code, playerId, meta.playerName || 'Player', msg.text);
        if (chatMsg) {
          broadcastToRoom(code, {
            type: 'chat_broadcast',
            message: chatMsg,
          });
        }
      } else if (msg.type === 'reaction') {
        broadcastToRoom(code, {
          type: 'reaction_broadcast',
          emoji: msg.emoji,
          senderName: meta.playerName || 'Player',
        });
      } else if (msg.type === 'resign') {
        const ok = gameManager.resign(code, playerId);
        const room = gameManager.getRoom(code);
        if (ok && room) {
          broadcastRoomState(code);
          broadcastToRoom(code, {
            type: 'game_over',
            winner: room.state.winner,
            reason: room.state.winReason || 'Resigned',
          });
        }
      } else if (msg.type === 'offer_draw') {
        const byColor = gameManager.offerDraw(code, playerId);
        if (byColor) {
          broadcastToRoom(code, {
            type: 'draw_offered',
            byColor,
          });
          broadcastRoomState(code);
        }
      } else if (msg.type === 'respond_draw') {
        const ok = gameManager.respondDraw(code, playerId, msg.accept);
        const room = gameManager.getRoom(code);
        if (ok && room) {
          broadcastRoomState(code);
          if (msg.accept) {
            broadcastToRoom(code, {
              type: 'game_over',
              winner: 'draw',
              reason: room.state.winReason || 'Draw agreed',
            });
          } else {
            broadcastToRoom(code, {
              type: 'draw_declined',
            });
          }
        }
      } else if (msg.type === 'request_rematch') {
        const result = gameManager.requestRematch(code, playerId);
        const room = gameManager.getRoom(code);
        if (room) {
          broadcastRoomState(code);
          if (!result.accepted && result.requestedBy) {
            broadcastToRoom(code, {
              type: 'rematch_offered',
              byName: result.requestedBy,
            }, ws);
          }
        }
      }
    } catch (e: any) {
      console.error('WebSocket message error:', e);
    }
  });

  ws.on('close', () => {
    const meta = clientMeta.get(ws);
    if (meta && meta.roomCode && meta.playerId) {
      gameManager.handleDisconnect(meta.roomCode, meta.playerId);
      const room = gameManager.getRoom(meta.roomCode);
      if (room) {
        broadcastRoomState(meta.roomCode);
      }
    }
    clientMeta.delete(ws);
  });
});

// Setup Vite or Static File Serving
async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Matt's Chess server running on http://0.0.0.0:${port}`);
  });
}

start();
