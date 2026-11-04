export type PieceColor = 'w' | 'b';

export interface Player {
  id: string;
  name: string;
  color: PieceColor | null; // null if spectator
  isConnected: boolean;
}

export type GameStatus =
  | 'waiting'
  | 'in_progress'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'resigned'
  | 'timeout'
  | 'abandoned';

export interface TimeControl {
  initialMinutes: number;
  incrementSeconds: number;
  name: string;
}

export interface MoveRecord {
  from: string;
  to: string;
  san: string;
  piece: string;
  captured?: string;
  promotion?: string;
  fen: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface RoomState {
  code: string;
  createdAt: number;
  hostId: string;
  isPublic: boolean;
  timeControl: TimeControl;
  whitePlayer: Player | null;
  blackPlayer: Player | null;
  spectators: Player[];
  fen: string;
  pgn: string;
  turn: PieceColor;
  status: GameStatus;
  winner: PieceColor | 'draw' | null;
  winReason?: string;
  clocks: {
    w: number; // milliseconds remaining
    b: number; // milliseconds remaining
  };
  lastMoveTimestamp: number | null;
  history: MoveRecord[];
  drawOffer: PieceColor | null;
  rematchRequestedBy: string | null;
  chatMessages: ChatMessage[];
  halfMoves: number;
}

export interface PublicLobbySummary {
  code: string;
  hostName: string;
  timeControl: TimeControl;
  playersCount: number;
  status: GameStatus;
  createdAt: number;
}

// Client to Server WebSocket message payloads
export type ClientMessage =
  | { type: 'join'; roomCode: string; playerId: string; playerName: string; preferredColor?: 'w' | 'b' | 'random' }
  | { type: 'move'; roomCode: string; playerId: string; from: string; to: string; promotion?: string }
  | { type: 'resign'; roomCode: string; playerId: string }
  | { type: 'offer_draw'; roomCode: string; playerId: string }
  | { type: 'respond_draw'; roomCode: string; playerId: string; accept: boolean }
  | { type: 'request_rematch'; roomCode: string; playerId: string }
  | { type: 'chat'; roomCode: string; playerId: string; text: string }
  | { type: 'reaction'; roomCode: string; playerId: string; emoji: string }
  | { type: 'ping' };

// Server to Client WebSocket message payloads
export type ServerMessage =
  | { type: 'room_state'; state: RoomState; yourRole: 'white' | 'black' | 'spectator' }
  | { type: 'error'; message: string }
  | { type: 'move_broadcast'; move: MoveRecord; fen: string; turn: PieceColor; clocks: { w: number; b: number } }
  | { type: 'chat_broadcast'; message: ChatMessage }
  | { type: 'reaction_broadcast'; emoji: string; senderName: string }
  | { type: 'game_over'; winner: PieceColor | 'draw' | null; reason: string }
  | { type: 'draw_offered'; byColor: PieceColor }
  | { type: 'draw_declined' }
  | { type: 'rematch_offered'; byName: string }
  | { type: 'pong' };
