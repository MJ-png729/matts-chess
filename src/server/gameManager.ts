import { Chess } from 'chess.js';
import { RoomState, TimeControl, Player, PieceColor, MoveRecord, ChatMessage, PublicLobbySummary } from '../types/chess.js';

function generateRoomCode(): string {
  // 6 uppercase characters, omitting confusing 0, O, 1, I
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class GameManager {
  private rooms = new Map<string, {
    state: RoomState;
    chess: Chess;
    interval?: NodeJS.Timeout;
  }>();

  public onStateChange?: (code: string) => void;

  constructor() {
    // Periodic cleanup of abandoned/empty rooms older than 1 hour
    setInterval(() => {
      const now = Date.now();
      for (const [code, item] of this.rooms.entries()) {
        const hasPlayers = (item.state.whitePlayer?.isConnected || item.state.blackPlayer?.isConnected || item.state.spectators.some(s => s.isConnected));
        if (!hasPlayers && (now - item.state.createdAt > 3600000)) {
          if (item.interval) clearInterval(item.interval);
          this.rooms.delete(code);
        }
      }
    }, 60000);
  }

  public removeWaitingRoom(code: string, hostId: string): boolean {
    const formatted = code.toUpperCase().trim();
    const room = this.rooms.get(formatted);
    if (room && room.state.status === 'waiting' && room.state.hostId === hostId) {
      if (room.interval) clearInterval(room.interval);
      this.rooms.delete(formatted);
      return true;
    }
    return false;
  }

  public createRoom(params: {
    hostId: string;
    hostName: string;
    preferredColor?: 'w' | 'b' | 'random';
    timeControl: TimeControl;
    isPublic?: boolean;
  }): string {
    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    const chess = new Chess();

    let assignedColor: PieceColor = 'w';
    if (params.preferredColor === 'b') {
      assignedColor = 'b';
    } else if (params.preferredColor === 'random') {
      assignedColor = Math.random() < 0.5 ? 'w' : 'b';
    }

    const hostPlayer: Player = {
      id: params.hostId,
      name: params.hostName || 'Guest',
      color: assignedColor,
      isConnected: true,
    };

    const initialMs = params.timeControl.initialMinutes * 60 * 1000;

    const state: RoomState = {
      code,
      createdAt: Date.now(),
      hostId: params.hostId,
      isPublic: params.isPublic ?? true,
      timeControl: params.timeControl,
      whitePlayer: assignedColor === 'w' ? hostPlayer : null,
      blackPlayer: assignedColor === 'b' ? hostPlayer : null,
      spectators: [],
      fen: chess.fen(),
      pgn: '',
      turn: 'w',
      status: 'waiting',
      winner: null,
      clocks: {
        w: initialMs,
        b: initialMs,
      },
      lastMoveTimestamp: null,
      history: [],
      drawOffer: null,
      rematchRequestedBy: null,
      chatMessages: [
        {
          id: 'sys-1',
          senderId: 'system',
          senderName: 'System',
          text: `Room ${code} created. Share the code to invite your opponent!`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
      halfMoves: 0,
    };

    this.rooms.set(code, { state, chess });
    return code;
  }

  public getRoom(code: string) {
    return this.rooms.get(code.toUpperCase().trim());
  }

  public listPublicRooms(): PublicLobbySummary[] {
    const list: PublicLobbySummary[] = [];
    for (const [code, item] of this.rooms.entries()) {
      if (item.state.isPublic && item.state.status === 'waiting') {
        const playersCount = (item.state.whitePlayer ? 1 : 0) + (item.state.blackPlayer ? 1 : 0);
        const host = item.state.whitePlayer || item.state.blackPlayer;
        list.push({
          code,
          hostName: host?.name || 'Guest',
          timeControl: item.state.timeControl,
          playersCount,
          status: item.state.status,
          createdAt: item.state.createdAt,
        });
      }
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  public joinRoom(
    code: string,
    player: { id: string; name: string; preferredColor?: 'w' | 'b' | 'random' }
  ): { role: 'white' | 'black' | 'spectator'; state: RoomState } | null {
    const room = this.getRoom(code);
    if (!room) return null;

    const { state } = room;

    // Check if player is already white or black (reconnecting)
    if (state.whitePlayer && state.whitePlayer.id === player.id) {
      state.whitePlayer.isConnected = true;
      state.whitePlayer.name = player.name || state.whitePlayer.name;
      return { role: 'white', state };
    }
    if (state.blackPlayer && state.blackPlayer.id === player.id) {
      state.blackPlayer.isConnected = true;
      state.blackPlayer.name = player.name || state.blackPlayer.name;
      return { role: 'black', state };
    }

    // Check if player is reconnecting spectator
    const existingSpec = state.spectators.find(s => s.id === player.id);
    if (existingSpec) {
      existingSpec.isConnected = true;
      existingSpec.name = player.name || existingSpec.name;
      return { role: 'spectator', state };
    }

    // New participant: assign white or black if available
    let role: 'white' | 'black' | 'spectator' = 'spectator';

    if (!state.whitePlayer && !state.blackPlayer) {
      // First player
      const color: PieceColor = player.preferredColor === 'b' ? 'b' : 'w';
      const newP: Player = { id: player.id, name: player.name, color, isConnected: true };
      if (color === 'w') {
        state.whitePlayer = newP;
        role = 'white';
      } else {
        state.blackPlayer = newP;
        role = 'black';
      }
    } else if (!state.whitePlayer) {
      const newP: Player = { id: player.id, name: player.name, color: 'w', isConnected: true };
      state.whitePlayer = newP;
      role = 'white';
    } else if (!state.blackPlayer) {
      const newP: Player = { id: player.id, name: player.name, color: 'b', isConnected: true };
      state.blackPlayer = newP;
      role = 'black';
    } else {
      // Both seats filled -> Spectator
      const newSpec: Player = { id: player.id, name: player.name, color: null, isConnected: true };
      state.spectators.push(newSpec);
      role = 'spectator';
    }

    // If both players are now present and status was 'waiting', start the game!
    if (state.whitePlayer && state.blackPlayer && state.status === 'waiting') {
      state.status = 'in_progress';
      state.lastMoveTimestamp = Date.now();
      state.chatMessages.push({
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: `Game started! ${state.whitePlayer.name} (White) vs ${state.blackPlayer.name} (Black). Good luck!`,
        timestamp: Date.now(),
        isSystem: true,
      });
      this.startClockTimer(room.state.code);
    }

    return { role, state };
  }

  public handleDisconnect(code: string, playerId: string): boolean {
    const room = this.getRoom(code);
    if (!room) return false;

    let didResign = false;

    // If a game was in progress and a player disconnected, leaving the match causes them to resign
    if (room.state.status === 'in_progress') {
      if (room.state.whitePlayer?.id === playerId) {
        room.state.whitePlayer.isConnected = false;
        room.state.status = 'resigned';
        room.state.winner = 'b';
        room.state.winReason = `${room.state.whitePlayer.name} disconnected/left. ${room.state.blackPlayer?.name || 'Black'} wins!`;
        this.stopClockTimer(code);
        didResign = true;
      } else if (room.state.blackPlayer?.id === playerId) {
        room.state.blackPlayer.isConnected = false;
        room.state.status = 'resigned';
        room.state.winner = 'w';
        room.state.winReason = `${room.state.blackPlayer.name} disconnected/left. ${room.state.whitePlayer?.name || 'White'} wins!`;
        this.stopClockTimer(code);
        didResign = true;
      }
    } else {
      if (room.state.whitePlayer?.id === playerId) {
        room.state.whitePlayer.isConnected = false;
      } else if (room.state.blackPlayer?.id === playerId) {
        room.state.blackPlayer.isConnected = false;
      } else {
        const spec = room.state.spectators.find(s => s.id === playerId);
        if (spec) spec.isConnected = false;
      }
    }

    if (this.onStateChange) {
      this.onStateChange(code);
    }
    return didResign;
  }

  public makeMove(
    code: string,
    playerId: string,
    from: string,
    to: string,
    promotion?: string
  ): { success: boolean; moveRecord?: MoveRecord; error?: string } {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Room not found' };

    const { state, chess } = room;

    if (state.status !== 'in_progress') {
      return { success: false, error: 'Game is not in progress' };
    }

    // Verify player is on turn
    const isWhiteTurn = chess.turn() === 'w';
    const activePlayer = isWhiteTurn ? state.whitePlayer : state.blackPlayer;

    if (!activePlayer || activePlayer.id !== playerId) {
      return { success: false, error: "Not your turn or you are not a player" };
    }

    // Update clocks before move
    this.updateClockForCurrentTurn(state);

    // Try executing move in chess.js
    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion ? (promotion.toLowerCase() as any) : 'q',
      });

      if (!move) {
        return { success: false, error: 'Illegal move' };
      }

      // Add time increment if applicable
      const incMs = state.timeControl.incrementSeconds * 1000;
      if (isWhiteTurn) {
        state.clocks.w += incMs;
      } else {
        state.clocks.b += incMs;
      }

      state.lastMoveTimestamp = Date.now();
      state.fen = chess.fen();
      state.pgn = chess.pgn();
      state.turn = chess.turn();
      state.halfMoves = chess.history().length;

      const record: MoveRecord = {
        from: move.from,
        to: move.to,
        san: move.san,
        piece: move.piece,
        captured: move.captured,
        promotion: move.promotion,
        fen: state.fen,
        timestamp: Date.now(),
      };

      state.history.push(record);
      state.drawOffer = null; // Clear any pending draw offer on move

      // Check game end conditions
      if (chess.isCheckmate()) {
        state.status = 'checkmate';
        state.winner = isWhiteTurn ? 'w' : 'b';
        state.winReason = `Checkmate! ${isWhiteTurn ? state.whitePlayer?.name : state.blackPlayer?.name} wins!`;
        this.stopClockTimer(code);
      } else if (chess.isStalemate()) {
        state.status = 'stalemate';
        state.winner = 'draw';
        state.winReason = 'Stalemate - No legal moves left';
        this.stopClockTimer(code);
      } else if (chess.isThreefoldRepetition()) {
        state.status = 'draw';
        state.winner = 'draw';
        state.winReason = 'Draw by threefold repetition';
        this.stopClockTimer(code);
      } else if (chess.isInsufficientMaterial()) {
        state.status = 'draw';
        state.winner = 'draw';
        state.winReason = 'Draw by insufficient material';
        this.stopClockTimer(code);
      } else if (chess.isDraw()) {
        state.status = 'draw';
        state.winner = 'draw';
        state.winReason = 'Draw (50-move rule)';
        this.stopClockTimer(code);
      }

      return { success: true, moveRecord: record };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Move rejected' };
    }
  }

  public resign(code: string, playerId: string): boolean {
    const room = this.getRoom(code);
    if (!room || room.state.status !== 'in_progress') return false;

    const { state } = room;
    if (state.whitePlayer?.id === playerId) {
      state.status = 'resigned';
      state.winner = 'b';
      state.winReason = `${state.whitePlayer.name} resigned. ${state.blackPlayer?.name || 'Black'} wins!`;
      this.stopClockTimer(code);
      return true;
    } else if (state.blackPlayer?.id === playerId) {
      state.status = 'resigned';
      state.winner = 'w';
      state.winReason = `${state.blackPlayer.name} resigned. ${state.whitePlayer?.name || 'White'} wins!`;
      this.stopClockTimer(code);
      return true;
    }
    return false;
  }

  public offerDraw(code: string, playerId: string): PieceColor | null {
    const room = this.getRoom(code);
    if (!room || room.state.status !== 'in_progress') return null;

    const { state } = room;
    if (state.whitePlayer?.id === playerId) {
      state.drawOffer = 'w';
      return 'w';
    } else if (state.blackPlayer?.id === playerId) {
      state.drawOffer = 'b';
      return 'b';
    }
    return null;
  }

  public respondDraw(code: string, playerId: string, accept: boolean): boolean {
    const room = this.getRoom(code);
    if (!room || room.state.status !== 'in_progress' || !room.state.drawOffer) return false;

    const { state } = room;
    const isWhite = state.whitePlayer?.id === playerId;
    const isBlack = state.blackPlayer?.id === playerId;

    if ((state.drawOffer === 'w' && isBlack) || (state.drawOffer === 'b' && isWhite)) {
      if (accept) {
        state.status = 'draw';
        state.winner = 'draw';
        state.winReason = 'Draw agreed by mutual consent';
        state.drawOffer = null;
        this.stopClockTimer(code);
        return true;
      } else {
        state.drawOffer = null;
        return true;
      }
    }
    return false;
  }

  public requestRematch(code: string, playerId: string): { accepted: boolean; requestedBy?: string } {
    const room = this.getRoom(code);
    if (!room) return { accepted: false };

    const { state } = room;
    const isPlayer = state.whitePlayer?.id === playerId || state.blackPlayer?.id === playerId;
    if (!isPlayer) return { accepted: false };

    if (!state.rematchRequestedBy) {
      state.rematchRequestedBy = playerId;
      const requester = state.whitePlayer?.id === playerId ? state.whitePlayer.name : state.blackPlayer?.name;
      return { accepted: false, requestedBy: requester };
    } else if (state.rematchRequestedBy !== playerId) {
      // Both agreed to rematch! Swap colors and reset
      this.resetGameForRematch(code);
      return { accepted: true };
    }

    return { accepted: false };
  }

  private resetGameForRematch(code: string) {
    const room = this.getRoom(code);
    if (!room) return;

    const { state } = room;
    room.chess = new Chess();

    // Swap sides
    const oldWhite = state.whitePlayer;
    const oldBlack = state.blackPlayer;

    if (oldWhite) oldWhite.color = 'b';
    if (oldBlack) oldBlack.color = 'w';

    state.whitePlayer = oldBlack;
    state.blackPlayer = oldWhite;

    const initialMs = state.timeControl.initialMinutes * 60 * 1000;
    state.clocks = { w: initialMs, b: initialMs };
    state.fen = room.chess.fen();
    state.pgn = '';
    state.turn = 'w';
    state.status = 'in_progress';
    state.winner = null;
    state.winReason = undefined;
    state.lastMoveTimestamp = Date.now();
    state.history = [];
    state.drawOffer = null;
    state.rematchRequestedBy = null;
    state.halfMoves = 0;

    state.chatMessages.push({
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      text: 'Rematch started! Colors have been swapped.',
      timestamp: Date.now(),
      isSystem: true,
    });

    this.startClockTimer(code);
  }

  public addChatMessage(code: string, senderId: string, senderName: string, text: string): ChatMessage | null {
    const room = this.getRoom(code);
    if (!room) return null;

    const cleanText = text.trim().slice(0, 300);
    if (!cleanText) return null;

    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName,
      text: cleanText,
      timestamp: Date.now(),
    };

    room.state.chatMessages.push(msg);
    if (room.state.chatMessages.length > 100) {
      room.state.chatMessages.shift();
    }
    return msg;
  }

  private updateClockForCurrentTurn(state: RoomState) {
    if (state.status !== 'in_progress' || !state.lastMoveTimestamp) return;

    // If initialMinutes is 0, game has unlimited time
    if (state.timeControl.initialMinutes <= 0) return;

    const now = Date.now();
    const elapsed = now - state.lastMoveTimestamp;
    state.lastMoveTimestamp = now;

    if (state.turn === 'w') {
      state.clocks.w = Math.max(0, state.clocks.w - elapsed);
    } else {
      state.clocks.b = Math.max(0, state.clocks.b - elapsed);
    }
  }

  private startClockTimer(code: string) {
    const room = this.getRoom(code);
    if (!room) return;

    if (room.interval) clearInterval(room.interval);

    if (room.state.timeControl.initialMinutes <= 0) {
      return; // Unlimited time
    }

    room.interval = setInterval(() => {
      const current = this.getRoom(code);
      if (!current || current.state.status !== 'in_progress') {
        if (current?.interval) clearInterval(current.interval);
        return;
      }

      this.updateClockForCurrentTurn(current.state);

      // Check timeout
      if (current.state.clocks.w <= 0) {
        current.state.status = 'timeout';
        current.state.winner = 'b';
        current.state.winReason = `White ran out of time! ${current.state.blackPlayer?.name || 'Black'} wins!`;
        this.stopClockTimer(code);
        if (this.onStateChange) {
          this.onStateChange(code);
        }
      } else if (current.state.clocks.b <= 0) {
        current.state.status = 'timeout';
        current.state.winner = 'w';
        current.state.winReason = `Black ran out of time! ${current.state.whitePlayer?.name || 'White'} wins!`;
        this.stopClockTimer(code);
        if (this.onStateChange) {
          this.onStateChange(code);
        }
      }
    }, 200);
  }

  private stopClockTimer(code: string) {
    const room = this.getRoom(code);
    if (room && room.interval) {
      clearInterval(room.interval);
      room.interval = undefined;
    }
  }
}

export const gameManager = new GameManager();
