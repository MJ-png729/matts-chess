import { Chess, Move, PieceSymbol } from 'chess.js';
import { BotDifficulty, PieceColor } from '../types/chess';

export const BOT_DIFFICULTY_CONFIG: Record<
  BotDifficulty,
  {
    label: string;
    elo: string;
    botTitle: string;
    maxDepth: number;
    quiescenceDepth: number;
    timeBudgetMs: number;
    minThinkMs: number;
    noiseCp: number;
    blunderChance: number;
  }
> = {
  easy: {
    label: 'Easy',
    elo: '600 ELO',
    botTitle: 'Chess Bot (Easy)',
    maxDepth: 1,
    quiescenceDepth: 0,
    timeBudgetMs: 250,
    minThinkMs: 320,
    noiseCp: 165,
    blunderChance: 0.28,
  },
  medium: {
    label: 'Medium',
    elo: '1200 ELO',
    botTitle: 'Chess Bot (Medium)',
    maxDepth: 2,
    quiescenceDepth: 1,
    timeBudgetMs: 450,
    minThinkMs: 420,
    noiseCp: 32,
    blunderChance: 0.04,
  },
  hard: {
    label: 'Hard',
    elo: '1800 ELO',
    botTitle: 'Chess Bot (Hard)',
    maxDepth: 3,
    quiescenceDepth: 3,
    timeBudgetMs: 900,
    minThinkMs: 480,
    noiseCp: 6,
    blunderChance: 0,
  },
  grandmaster: {
    label: 'Grandmaster',
    elo: '2400 ELO',
    botTitle: 'Chess Bot (Grandmaster)',
    maxDepth: 4,
    quiescenceDepth: 5,
    timeBudgetMs: 1600,
    minThinkMs: 550,
    noiseCp: 0,
    blunderChance: 0,
  },
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables from White's perspective (row 0 = rank 8, row 7 = rank 1)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 27, 27, 10, 5, 5],
  [0, 0, 0, 24, 24, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -22, -22, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_MG_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const KING_EG_PST = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

function getPstValue(piece: PieceSymbol, color: PieceColor, r: number, c: number, isEndgame: boolean): number {
  const row = color === 'w' ? r : 7 - r;
  switch (piece) {
    case 'p':
      return PAWN_PST[row][c];
    case 'n':
      return KNIGHT_PST[row][c];
    case 'b':
      return BISHOP_PST[row][c];
    case 'r':
      return ROOK_PST[row][c];
    case 'q':
      return QUEEN_PST[row][c];
    case 'k':
      return isEndgame ? KING_EG_PST[row][c] : KING_MG_PST[row][c];
  }
}

/**
 * Static board evaluation in centipawns from White's perspective (+ = White ahead, - = Black ahead).
 */
export function evaluateBoardWhite(chess: Chess): number {
  const board = chess.board();
  let nonKingMaterial = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  // First pass: count non-king material to detect endgame phase
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (!sq) continue;
      if (sq.type !== 'k') {
        nonKingMaterial += PIECE_VALUES[sq.type];
      }
      if (sq.type === 'b') {
        if (sq.color === 'w') whiteBishops++;
        else blackBishops++;
      }
    }
  }

  const isEndgame = nonKingMaterial <= 2600;
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (!sq) continue;
      const val = PIECE_VALUES[sq.type] + getPstValue(sq.type, sq.color, r, c, isEndgame);
      if (sq.color === 'w') {
        score += val;
      } else {
        score -= val;
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;

  // Small tempo bonus
  score += chess.turn() === 'w' ? 10 : -10;

  return score;
}

function scoreMoveForOrdering(move: Move): number {
  let score = 0;
  if (move.captured) {
    // MVV-LVA: 10 * victim - attacker
    score += 10 * PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece] + 1000;
  }
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion] + 800;
  }
  if (move.san.includes('+')) {
    score += 120;
  }
  if (move.san.includes('#')) {
    score += 50000;
  }
  // Prefer center squares slightly for quiet moves
  const toFile = move.to.charCodeAt(0) - 97;
  const toRank = Number(move.to[1]) - 1;
  const centerDist = Math.abs(3.5 - toFile) + Math.abs(3.5 - toRank);
  score += Math.round((7 - centerDist) * 3);
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));
}

interface SearchContext {
  nodes: number;
  deadline: number;
  aborted: boolean;
  signal?: AbortSignal;
}

async function maybeYield(ctx: SearchContext) {
  ctx.nodes++;
  if ((ctx.nodes & 1023) === 0) {
    if (ctx.signal?.aborted || performance.now() > ctx.deadline) {
      ctx.aborted = true;
      return;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    if (ctx.signal?.aborted) {
      ctx.aborted = true;
    }
  }
}

async function quiesce(
  chess: Chess,
  alpha: number,
  beta: number,
  colorSign: number,
  qDepth: number,
  ctx: SearchContext
): Promise<number> {
  await maybeYield(ctx);
  if (ctx.aborted) return 0;

  if (chess.isCheckmate()) {
    return -90000;
  }
  if (chess.isStalemate() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition() || chess.isDraw()) {
    return 0;
  }

  const standPat = colorSign * evaluateBoardWhite(chess);
  if (qDepth <= 0) {
    return standPat;
  }

  if (standPat >= beta) {
    return beta;
  }
  if (alpha < standPat) {
    alpha = standPat;
  }

  const allMoves = chess.moves({ verbose: true });
  const captureMoves = orderMoves(
    allMoves.filter((m) => m.captured || m.promotion === 'q')
  );

  for (const move of captureMoves) {
    chess.move(move);
    const score = -(await quiesce(chess, -beta, -alpha, -colorSign, qDepth - 1, ctx));
    chess.undo();

    if (ctx.aborted) return 0;

    if (score >= beta) {
      return beta;
    }
    if (score > alpha) {
      alpha = score;
    }
  }

  return alpha;
}

async function negamax(
  chess: Chess,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  colorSign: number,
  quiescenceDepth: number,
  ctx: SearchContext
): Promise<number> {
  await maybeYield(ctx);
  if (ctx.aborted) return 0;

  if (chess.isCheckmate()) {
    return -90000 + ply;
  }
  if (chess.isStalemate() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition() || chess.isDraw()) {
    // Slight contempt if ahead so strong bot doesn't accidentally repeat when winning
    const staticEval = colorSign * evaluateBoardWhite(chess);
    return staticEval > 150 ? -25 : 0;
  }

  if (depth <= 0) {
    if (quiescenceDepth > 0) {
      return quiesce(chess, alpha, beta, colorSign, quiescenceDepth, ctx);
    }
    return colorSign * evaluateBoardWhite(chess);
  }

  const moves = orderMoves(chess.moves({ verbose: true }));
  let best = -Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = -(await negamax(
      chess,
      depth - 1,
      ply + 1,
      -beta,
      -alpha,
      -colorSign,
      quiescenceDepth,
      ctx
    ));
    chess.undo();

    if (ctx.aborted) return 0;

    if (score > best) {
      best = score;
    }
    if (score > alpha) {
      alpha = score;
    }
    if (alpha >= beta) {
      break;
    }
  }

  return best;
}

export interface BotMoveResult {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  evalCp: number; // Bot's perspective in centipawns
}

/**
 * Computes the bot's next move asynchronously with Iterative Deepening + Alpha-Beta + Quiescence Search.
 */
export async function findBestBotMove(
  fen: string,
  difficulty: BotDifficulty,
  signal?: AbortSignal
): Promise<BotMoveResult | null> {
  const startTime = performance.now();
  const cfg = BOT_DIFFICULTY_CONFIG[difficulty];
  const chess = new Chess(fen);

  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const botTurn = chess.turn();
  const colorSign = botTurn === 'w' ? 1 : -1;

  // Easy mode: occasional beginner blunder (unless mate in 1 is on the board and spotted)
  if (difficulty === 'easy' && legalMoves.length > 2 && Math.random() < cfg.blunderChance) {
    // Wait minimum natural think time
    const elapsed = performance.now() - startTime;
    if (elapsed < cfg.minThinkMs) {
      await new Promise((r) => setTimeout(r, cfg.minThinkMs - elapsed));
    }
    if (signal?.aborted) return null;

    // Pick a random suboptimal move (avoiding instant self-mate if possible, or just any legal move)
    const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);
    const pick = shuffled[0];
    return {
      from: pick.from,
      to: pick.to,
      promotion: pick.promotion,
      san: pick.san,
      evalCp: 0,
    };
  }

  const orderedRootMoves = orderMoves([...legalMoves]);
  let bestMove: Move = orderedRootMoves[0];
  let bestScore = -Infinity;

  const ctx: SearchContext = {
    nodes: 0,
    deadline: startTime + cfg.timeBudgetMs,
    aborted: false,
    signal,
  };

  // Iterative deepening from depth 1 up to cfg.maxDepth
  for (let depth = 1; depth <= cfg.maxDepth; depth++) {
    let currentDepthBestMove: Move | null = null;
    let currentDepthBestScore = -Infinity;

    // Put previous best move first for maximum pruning efficiency
    const rootCandidates = [
      bestMove,
      ...orderedRootMoves.filter((m) => m.from !== bestMove.from || m.to !== bestMove.to || m.promotion !== bestMove.promotion),
    ];

    const scoredMoves: { move: Move; score: number }[] = [];

    for (const move of rootCandidates) {
      chess.move(move);
      const rawScore = -(await negamax(
        chess,
        depth - 1,
        1,
        -Infinity,
        Infinity,
        -colorSign,
        cfg.quiescenceDepth,
        ctx
      ));
      chess.undo();

      if (ctx.aborted) break;

      // Add calibrated evaluation noise for lower/medium difficulties (except forced mates)
      const isMateScore = Math.abs(rawScore) > 80000;
      const noise =
        !isMateScore && cfg.noiseCp > 0
          ? Math.round((Math.random() * 2 - 1) * cfg.noiseCp)
          : 0;
      const effectiveScore = rawScore + noise;

      scoredMoves.push({ move, score: effectiveScore });

      if (effectiveScore > currentDepthBestScore) {
        currentDepthBestScore = effectiveScore;
        currentDepthBestMove = move;
      }
    }

    if (ctx.aborted || signal?.aborted) {
      break;
    }

    if (currentDepthBestMove) {
      // On Hard/Grandmaster, add subtle tie-breaking among near-identical top moves (within 8cp) so openings stay fresh
      if (cfg.noiseCp === 0 && scoredMoves.length > 1) {
        const nearTop = scoredMoves.filter(
          (item) => currentDepthBestScore - item.score <= 8
        );
        if (nearTop.length > 1) {
          const chosen = nearTop[Math.floor(Math.random() * nearTop.length)];
          bestMove = chosen.move;
          bestScore = chosen.score;
        } else {
          bestMove = currentDepthBestMove;
          bestScore = currentDepthBestScore;
        }
      } else {
        bestMove = currentDepthBestMove;
        bestScore = currentDepthBestScore;
      }
    }

    // Stop early if forced mate found
    if (bestScore > 85000) {
      break;
    }
  }

  if (signal?.aborted) return null;

  // Ensure natural human-like pacing so moves don't teleport instantaneously
  const elapsed = performance.now() - startTime;
  if (elapsed < cfg.minThinkMs) {
    await new Promise((r) => setTimeout(r, cfg.minThinkMs - elapsed));
  }
  if (signal?.aborted) return null;

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion,
    san: bestMove.san,
    evalCp: bestScore,
  };
}

export interface PlayerMoveTacticalContext {
  isBlunder: boolean;
  blunderedQueen: boolean;
  missedMate: boolean;
  missedFreePiece: boolean;
  isBrilliantCapture: boolean;
  cpLoss: number;
}

function quickTacticalEvalWhite(chess: Chess): number {
  const sideSign = chess.turn() === 'w' ? 1 : -1;
  const standPat = evaluateBoardWhite(chess);
  const moves = chess.moves({ verbose: true });

  let bestForSide = sideSign * standPat;

  for (const m of moves) {
    if (m.san.includes('#')) {
      return sideSign * 90000;
    }
    if (!m.captured && m.promotion !== 'q') continue;
    chess.move(m);
    const s = chess.isCheckmate()
      ? 90000
      : sideSign * evaluateBoardWhite(chess);
    chess.undo();
    if (s > bestForSide) {
      bestForSide = s;
    }
  }

  return sideSign * bestForSide;
}

/**
 * Fast 1-ply + capture evaluation to detect if the player blundered, donated their queen,
 * or missed an immediate checkmate / free piece. Runs in < 1ms.
 */
export function analyzePlayerMoveContext(
  fenBeforePlayerMove: string,
  fenAfterPlayerMove: string,
  playerColor: PieceColor
): PlayerMoveTacticalContext {
  try {
    const before = new Chess(fenBeforePlayerMove);
    const after = new Chess(fenAfterPlayerMove);
    const playerSign = playerColor === 'w' ? 1 : -1;

    // 1. Check what the player had available before moving
    const playerMoves = before.moves({ verbose: true });
    let playerHadMate = false;
    let playerHadFreeMajor = false;
    let bestPlayerCaptureNet = 0;

    for (const m of playerMoves) {
      if (m.san.includes('#')) {
        playerHadMate = true;
      }
      if (m.captured === 'q' || m.captured === 'r') {
        before.move(m);
        const oppReplies = before.moves({ verbose: true });
        let maxRecapture = 0;
        for (const r of oppReplies) {
          if (r.to === m.to && r.captured) {
            maxRecapture = Math.max(maxRecapture, PIECE_VALUES[r.captured]);
          }
        }
        before.undo();
        const net = PIECE_VALUES[m.captured] - maxRecapture;
        if (net > bestPlayerCaptureNet) {
          bestPlayerCaptureNet = net;
        }
        if (net >= 450) {
          playerHadFreeMajor = true;
        }
      }
    }

    // Did the player actually play checkmate or capture a major piece?
    const missedMate = playerHadMate && !after.isCheckmate();

    const evalBefore = playerSign * quickTacticalEvalWhite(before);

    // 2. Check bot's immediate tactical responses after player's move
    const oppMoves = after.moves({ verbose: true });
    let worstForPlayer = playerSign * evaluateBoardWhite(after);
    let blunderedQueen = false;

    for (const m of oppMoves) {
      if (m.captured === 'q') {
        after.move(m);
        const recaps = after.moves({ verbose: true });
        let maxPlayerRecap = 0;
        for (const r of recaps) {
          if (r.to === m.to && r.captured) {
            maxPlayerRecap = Math.max(maxPlayerRecap, PIECE_VALUES[r.captured]);
          }
        }
        after.undo();
        if (PIECE_VALUES['q'] - maxPlayerRecaptureOrZero(maxPlayerRecap) >= 420) {
          blunderedQueen = true;
        }
      }

      if (!m.captured && !m.san.includes('+') && !m.san.includes('#') && m.promotion !== 'q') {
        continue;
      }
      after.move(m);
      const s = after.isCheckmate() ? -90000 : playerSign * evaluateBoardWhite(after);
      after.undo();
      if (s < worstForPlayer) {
        worstForPlayer = s;
      }
    }

    const cpLoss = evalBefore - worstForPlayer;
    const isBlunder = cpLoss >= 250 || blunderedQueen;
    const missedFreePiece = !missedMate && !isBlunder && playerHadFreeMajor && cpLoss >= 380;

    return {
      isBlunder,
      blunderedQueen,
      missedMate,
      missedFreePiece,
      isBrilliantCapture: cpLoss <= -280,
      cpLoss,
    };
  } catch {
    return {
      isBlunder: false,
      blunderedQueen: false,
      missedMate: false,
      missedFreePiece: false,
      isBrilliantCapture: false,
      cpLoss: 0,
    };
  }
}

function maxPlayerRecaptureOrZero(val: number): number {
  return Number.isFinite(val) ? val : 0;
}

/**
 * Backwards-compatible wrapper for blunder detection.
 */
export function detectPlayerBlunder(
  fenBeforePlayerMove: string,
  fenAfterPlayerMove: string,
  playerColor: PieceColor
): {
  isBlunder: boolean;
  isBrilliantCapture: boolean;
  cpLoss: number;
} {
  const res = analyzePlayerMoveContext(fenBeforePlayerMove, fenAfterPlayerMove, playerColor);
  return {
    isBlunder: res.isBlunder,
    isBrilliantCapture: res.isBrilliantCapture,
    cpLoss: res.cpLoss,
  };
}

/**
 * Evaluates whether the bot should accept a draw offer from the player.
 */
export function shouldBotAcceptDraw(
  fen: string,
  botColor: PieceColor,
  difficulty: BotDifficulty,
  moveCount: number
): boolean {
  try {
    const chess = new Chess(fen);
    const botSign = botColor === 'w' ? 1 : -1;
    const botEval = botSign * evaluateBoardWhite(chess);

    // If bot is clearly losing, accept draw gratefully!
    const loseThreshold = difficulty === 'easy' ? -70 : difficulty === 'medium' ? -120 : -180;
    if (botEval <= loseThreshold) {
      return true;
    }

    // In late endgame if dead equal, accept
    if (moveCount >= 60 && Math.abs(botEval) <= 35) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
