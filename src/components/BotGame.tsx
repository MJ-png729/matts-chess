import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import { ChessBoard } from './ChessBoard';
import { ChessClock } from './ChessClock';
import { CapturedPieces } from './CapturedPieces';
import { MoveHistory } from './MoveHistory';
import { InGameChat } from './InGameChat';
import { ChessPiece } from './ChessPiece';
import { SystemAlertToast, SystemAlert } from './SystemAlertToast';
import {
  ChessBotIcon,
  ChessReturnLobbyIcon,
  ChessFlipBoardIcon,
  ChessRematchIcon,
  RetroNewGameIcon,
  RetroSpeakerIcon,
  RetroHandshakeIcon,
  RetroFlagIcon,
  RetroWarningIcon,
  RetroClockIcon,
} from './RetroIcons';
import {
  BotDifficulty,
  BotSettings,
  ChatMessage,
  GameStatus,
  MoveRecord,
  PieceColor,
} from '../types/chess';
import {
  BOT_DIFFICULTY_CONFIG,
  findBestBotMove,
  analyzePlayerMoveContext,
  evaluateBoardWhite,
  shouldBotAcceptDraw,
} from '../utils/chessBotEngine';
import {
  BotChatEvent,
  getBotEventMessage,
  getBotChatReply,
} from '../utils/botDialogue';
import {
  isSoundEnabled,
  setSoundEnabled,
  playMoveSound,
  playCaptureSound,
  playWindowsDing,
  playGameEndSound,
  playWindowsClick,
  playWindowsChord,
  playWindowsStop,
  playWindowsStartup,
} from '../utils/audio';

interface BotGameProps {
  playerId: string;
  playerName: string;
  initialSettings: BotSettings;
  onBack: () => void;
}

function resolveColor(pref: 'w' | 'b' | 'random'): PieceColor {
  if (pref === 'w') return 'w';
  if (pref === 'b') return 'b';
  return Math.random() < 0.5 ? 'w' : 'b';
}

export const BotGame: React.FC<BotGameProps> = ({
  playerId,
  playerName,
  initialSettings,
  onBack,
}) => {
  const [difficulty, setDifficulty] = useState<BotDifficulty>(initialSettings.difficulty);
  const [botMessages, setBotMessages] = useState<boolean>(initialSettings.botMessages);
  const [botTrashTalk, setBotTrashTalk] = useState<boolean>(initialSettings.botTrashTalk);

  const [playerColor, setPlayerColor] = useState<PieceColor>(() =>
    resolveColor(initialSettings.preferredColor)
  );
  const botColor: PieceColor = playerColor === 'w' ? 'b' : 'w';

  const [orientation, setOrientation] = useState<PieceColor>(playerColor);
  const [matchKey, setMatchKey] = useState<number>(1);

  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(() => chessRef.current.fen());
  const [pgn, setPgn] = useState<string>('');
  const [turn, setTurn] = useState<PieceColor>('w');
  const [history, setHistory] = useState<MoveRecord[]>([]);

  const initialClockMs = initialSettings.timeControl.initialMinutes * 60 * 1000;
  const isUnlimited = initialSettings.timeControl.initialMinutes <= 0;
  const [clocks, setClocks] = useState<{ w: number; b: number }>({
    w: initialClockMs,
    b: initialClockMs,
  });

  const [status, setStatus] = useState<GameStatus>('in_progress');
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);
  const [winReason, setWinReason] = useState<string | null>(null);

  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [systemAlert, setSystemAlert] = useState<SystemAlert | null>(null);

  const [showResignModal, setShowResignModal] = useState<boolean>(false);
  const [showOfferDrawModal, setShowOfferDrawModal] = useState<boolean>(false);
  const [drawResultModal, setDrawResultModal] = useState<{ accepted: boolean; message: string } | null>(null);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState<boolean>(false);

  const diffCfg = BOT_DIFFICULTY_CONFIG[difficulty];
  const botDisplayName = diffCfg.botTitle;
  const displayPlayerName = playerName.trim() || 'Guest';

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: `sys-start-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      text: `Bot Match started vs ${BOT_DIFFICULTY_CONFIG[initialSettings.difficulty].botTitle}. Good luck!`,
      timestamp: Date.now(),
      isSystem: true,
    },
  ]);

  // Refs for latest settings inside async callbacks
  const botMessagesRef = useRef(botMessages);
  const botTrashTalkRef = useRef(botTrashTalk);
  const difficultyRef = useRef(difficulty);
  const lastBotChatterAtRef = useRef<number>(0);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastEvalCpRef = useRef<number>(0);
  const lastPlayerBlunderRef = useRef<boolean>(false);

  useEffect(() => {
    botMessagesRef.current = botMessages;
  }, [botMessages]);

  useEffect(() => {
    botTrashTalkRef.current = botTrashTalk;
  }, [botTrashTalk]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  const appendBotChat = useCallback(
    (text: string | null, delayMs = 380) => {
      if (!text || !botMessagesRef.current) return;

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      setIsBotTyping(true);
      typingTimeoutRef.current = window.setTimeout(() => {
        setIsBotTyping(false);
        if (!botMessagesRef.current) return;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            senderId: 'chess-bot',
            senderName: BOT_DIFFICULTY_CONFIG[difficultyRef.current].botTitle,
            text,
            timestamp: Date.now(),
          },
        ]);
        lastBotChatterAtRef.current = Date.now();
      }, delayMs);
    },
    []
  );

  const triggerBotEvent = useCallback(
    (
      event: BotChatEvent,
      extra?: { san?: string; capturedPiece?: string; evalCp?: number; moveCount?: number },
      delayMs = 380
    ) => {
      if (!botMessagesRef.current) return;

      // Avoid spamming consecutive low-priority chatter within 1.4s
      const now = Date.now();
      const isHighPriority =
        event === 'game_start' ||
        event === 'bot_win' ||
        event === 'player_win' ||
        event === 'player_resign' ||
        event === 'draw_game' ||
        event === 'draw_accept' ||
        event === 'draw_decline' ||
        event === 'player_blunder' ||
        event === 'player_blunder_queen' ||
        event === 'player_missed_mate' ||
        event === 'player_missed_win' ||
        event === 'bot_capture_queen' ||
        event === 'bot_capture_major' ||
        event === 'player_capture_major' ||
        event === 'trash_talk_toggled_on';

      if (!isHighPriority && now - lastBotChatterAtRef.current < 1400) {
        return;
      }

      const line = getBotEventMessage(
        event,
        botMessagesRef.current,
        botTrashTalkRef.current,
        {
          difficulty: difficultyRef.current,
          playerName: displayPlayerName,
          evalCp: extra?.evalCp ?? lastEvalCpRef.current,
          ...extra,
        }
      );

      if (line) {
        appendBotChat(line, delayMs);
      }
    },
    [appendBotChat, displayPlayerName]
  );

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Opening greeting when match starts or rematches
  useEffect(() => {
    const t = window.setTimeout(() => {
      triggerBotEvent('game_start', { moveCount: 0 }, 350);
    }, 250);
    return () => window.clearTimeout(t);
  }, [matchKey, triggerBotEvent]);

  // Prompt before navigating away or refreshing during an active game
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'in_progress') {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your match is still in progress and leaving will cause you to forfeit.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  // Clock countdown interval
  useEffect(() => {
    if (isUnlimited || status !== 'in_progress') return;

    let lastTick = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastTick;
      lastTick = now;

      setClocks((prev) => {
        const activeTurn = chessRef.current.turn();
        const updated = Math.max(0, prev[activeTurn] - delta);
        if (updated <= 0 && prev[activeTurn] > 0) {
          const loserColor = activeTurn;
          const winColor: PieceColor = loserColor === 'w' ? 'b' : 'w';
          const loserLabel = loserColor === playerColor ? displayPlayerName : botDisplayName;
          const winnerLabel = winColor === playerColor ? displayPlayerName : botDisplayName;

          setStatus('timeout');
          setWinner(winColor);
          setWinReason(`Time out! ${loserLabel} ran out of time. ${winnerLabel} wins!`);
          setIsBotThinking(false);

          const didPlayerWin = winColor === playerColor;
          playGameEndSound(didPlayerWin);

          setSystemAlert({
            id: `timeout-${Date.now()}`,
            type: 'checkmate',
            title: 'System message',
            message: `Time expired! ${winnerLabel} wins!`,
          });

          triggerBotEvent(didPlayerWin ? 'player_win' : 'bot_win', {}, 300);
        }
        return {
          ...prev,
          [activeTurn]: updated,
        };
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isUnlimited, status, playerColor, displayPlayerName, botDisplayName, triggerBotEvent]);

  // Apply a move (for either human player or bot) and evaluate state
  const commitMove = useCallback(
    (from: string, to: string, promotion: string | undefined, isBotMove: boolean) => {
      const chess = chessRef.current;
      const fenBefore = chess.fen();
      const movingColor = chess.turn();

      const move = chess.move({
        from,
        to,
        promotion: promotion ? (promotion.toLowerCase() as any) : 'q',
      });

      if (!move) return false;

      const newFen = chess.fen();
      const newTurn = chess.turn();

      // Add increment to side that just moved
      if (!isUnlimited && initialSettings.timeControl.incrementSeconds > 0) {
        const incMs = initialSettings.timeControl.incrementSeconds * 1000;
        setClocks((prev) => ({
          ...prev,
          [movingColor]: prev[movingColor] + incMs,
        }));
      }

      if (isBotMove) {
        if (move.captured) {
          playCaptureSound();
        } else {
          playMoveSound();
        }
      }

      const record: MoveRecord = {
        from: move.from,
        to: move.to,
        san: move.san,
        piece: move.piece,
        captured: move.captured,
        promotion: move.promotion,
        fen: newFen,
        timestamp: Date.now(),
      };

      setFen(newFen);
      setPgn(chess.pgn());
      setTurn(newTurn);
      setHistory((prev) => [...prev, record]);

      const moveCount = chess.history().length;
      const whiteEval = evaluateBoardWhite(chess);
      const botEvalCp = botColor === 'w' ? whiteEval : -whiteEval;
      lastEvalCpRef.current = botEvalCp;

      // Check game over conditions
      if (chess.isCheckmate()) {
        const didPlayerWin = movingColor === playerColor;
        const winnerLabel = didPlayerWin ? displayPlayerName : botDisplayName;
        setStatus('checkmate');
        setWinner(movingColor);
        setWinReason(`Checkmate! ${winnerLabel} wins!`);
        setIsBotThinking(false);

        playGameEndSound(didPlayerWin);
        if (didPlayerWin) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }

        setSystemAlert({
          id: `checkmate-${Date.now()}`,
          type: 'checkmate',
          title: 'System message',
          message: `Checkmate! ${movingColor === 'w' ? 'White' : 'Black'} wins!`,
        });

        triggerBotEvent(didPlayerWin ? 'player_win' : 'bot_win', { san: move.san, moveCount, evalCp: botEvalCp }, 350);
        return true;
      }

      if (chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial() || chess.isDraw()) {
        const reason = chess.isStalemate()
          ? 'Stalemate - No legal moves left'
          : chess.isThreefoldRepetition()
          ? 'Draw by threefold repetition'
          : chess.isInsufficientMaterial()
          ? 'Draw by insufficient material'
          : 'Draw (50-move rule)';

        setStatus(chess.isStalemate() ? 'stalemate' : 'draw');
        setWinner('draw');
        setWinReason(reason);
        setIsBotThinking(false);
        playWindowsChord();

        setSystemAlert({
          id: `draw-${Date.now()}`,
          type: 'info',
          title: 'System message',
          message: reason,
        });

        triggerBotEvent('draw_game', { san: move.san, moveCount, evalCp: botEvalCp }, 350);
        return true;
      }

      // Check alert
      const inCheck = chess.inCheck();
      if (inCheck) {
        const inCheckColor = newTurn === 'w' ? 'White' : 'Black';
        playWindowsDing();
        setSystemAlert({
          id: `check-${Date.now()}`,
          type: 'check',
          title: 'System message',
          message: `${inCheckColor} king in check!`,
          autoDismissMs: 5000,
        });
      } else {
        setSystemAlert((prev) => (prev?.type === 'check' ? null : prev));
      }

      // Trigger contextual Bot Messenger reactions
      if (isBotMove) {
        if (move.captured === 'q') {
          triggerBotEvent(
            'bot_capture_queen',
            { san: move.san, capturedPiece: move.captured, moveCount, evalCp: botEvalCp },
            300
          );
        } else if (inCheck) {
          triggerBotEvent('bot_check', { san: move.san, moveCount, evalCp: botEvalCp }, 320);
        } else if (move.promotion) {
          triggerBotEvent('bot_promotion', { san: move.san, moveCount, evalCp: botEvalCp }, 320);
        } else if (move.captured === 'r') {
          triggerBotEvent(
            'bot_capture_major',
            { san: move.san, capturedPiece: move.captured, moveCount, evalCp: botEvalCp },
            320
          );
        } else if (move.captured) {
          triggerBotEvent(
            'bot_capture',
            { san: move.san, capturedPiece: move.captured, moveCount, evalCp: botEvalCp },
            350
          );
        } else {
          triggerBotEvent('bot_move_normal', { san: move.san, moveCount, evalCp: botEvalCp }, 400);
        }
      } else {
        // Human player moved: evaluate blunder, queen donation, missed mate, or captures
        const swing = analyzePlayerMoveContext(fenBefore, newFen, playerColor);
        lastPlayerBlunderRef.current = swing.isBlunder || swing.missedMate || swing.blunderedQueen;

        if (swing.missedMate) {
          triggerBotEvent('player_missed_mate', { san: move.san, moveCount, evalCp: botEvalCp }, 320);
        } else if (swing.blunderedQueen) {
          triggerBotEvent(
            'player_blunder_queen',
            { san: move.san, capturedPiece: 'q', moveCount, evalCp: botEvalCp },
            320
          );
        } else if (swing.missedFreePiece) {
          triggerBotEvent('player_missed_win', { san: move.san, moveCount, evalCp: botEvalCp }, 340);
        } else if (swing.isBlunder) {
          triggerBotEvent('player_blunder', { san: move.san, moveCount, evalCp: botEvalCp }, 350);
        } else if (inCheck) {
          triggerBotEvent('player_check', { san: move.san, moveCount, evalCp: botEvalCp }, 360);
        } else if (move.promotion) {
          triggerBotEvent('player_promotion', { san: move.san, moveCount, evalCp: botEvalCp }, 360);
        } else if (move.captured === 'q' || move.captured === 'r') {
          triggerBotEvent(
            'player_capture_major',
            { san: move.san, capturedPiece: move.captured, moveCount, evalCp: botEvalCp },
            360
          );
        } else if (move.captured) {
          triggerBotEvent(
            'player_capture',
            { san: move.san, capturedPiece: move.captured, moveCount, evalCp: botEvalCp },
            380
          );
        }
      }

      return true;
    },
    [
      isUnlimited,
      initialSettings.timeControl.incrementSeconds,
      playerColor,
      botColor,
      displayPlayerName,
      botDisplayName,
      triggerBotEvent,
    ]
  );

  // Trigger Bot move whenever it is the Bot's turn and game is in progress
  useEffect(() => {
    if (status !== 'in_progress' || turn !== botColor) {
      return;
    }

    const abortController = new AbortController();
    setIsBotThinking(true);

    findBestBotMove(chessRef.current.fen(), difficulty, abortController.signal)
      .then((result) => {
        if (abortController.signal.aborted || !result) {
          setIsBotThinking(false);
          return;
        }
        setIsBotThinking(false);
        commitMove(result.from, result.to, result.promotion, true);
      })
      .catch((err) => {
        if (!abortController.signal.aborted) {
          console.error('Bot move error:', err);
          setIsBotThinking(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [status, turn, botColor, difficulty, commitMove]);

  const handlePlayerMove = (from: string, to: string, promotion?: string) => {
    if (status !== 'in_progress' || turn !== playerColor || isBotThinking) return;
    commitMove(from, to, promotion, false);
  };

  const startFreshMatch = (swapSides: boolean) => {
    playWindowsStartup();
    const nextPlayerColor: PieceColor = swapSides
      ? playerColor === 'w'
        ? 'b'
        : 'w'
      : resolveColor(initialSettings.preferredColor);

    chessRef.current = new Chess();
    setPlayerColor(nextPlayerColor);
    setOrientation(nextPlayerColor);
    setFen(chessRef.current.fen());
    setPgn('');
    setTurn('w');
    setHistory([]);
    setClocks({ w: initialClockMs, b: initialClockMs });
    setStatus('in_progress');
    setWinner(null);
    setWinReason(null);
    setIsBotThinking(false);
    setIsBotTyping(false);
    setSystemAlert(null);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys-new-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: `New match started vs ${BOT_DIFFICULTY_CONFIG[difficulty].botTitle}!`,
        timestamp: Date.now(),
        isSystem: true,
      },
    ]);

    setMatchKey((k) => k + 1);
  };

  const handleRequestLeave = () => {
    playWindowsClick();
    if (status === 'in_progress') {
      setShowLeaveConfirmModal(true);
    } else {
      onBack();
    }
  };

  const handleConfirmLeave = () => {
    if (status === 'in_progress') {
      executeResign();
    }
    setShowLeaveConfirmModal(false);
    onBack();
  };

  const executeOfferDraw = () => {
    if (status !== 'in_progress') return;
    playWindowsClick();

    const accepted = shouldBotAcceptDraw(
      chessRef.current.fen(),
      botColor,
      difficulty,
      chessRef.current.history().length
    );

    if (accepted) {
      setStatus('draw');
      setWinner('draw');
      setWinReason('Draw agreed by mutual consent');
      setIsBotThinking(false);
      playWindowsChord();

      setDrawResultModal({
        accepted: true,
        message: `${botDisplayName} accepted your draw offer! The game ended in a draw.`,
      });

      triggerBotEvent('draw_accept', {}, 350);
    } else {
      playWindowsDing();

      setDrawResultModal({
        accepted: false,
        message: `${botDisplayName} evaluated the position and declined your draw offer. Continue playing!`,
      });

      triggerBotEvent('draw_decline', {}, 350);
    }
  };

  const executeResign = () => {
    if (status !== 'in_progress') return;
    playWindowsStop();
    setStatus('resigned');
    setWinner(botColor);
    setWinReason(`${displayPlayerName} resigned. ${botDisplayName} wins!`);
    setIsBotThinking(false);

    triggerBotEvent('player_resign', {}, 350);
  };

  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      senderId: playerId,
      senderName: displayPlayerName,
      text,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    if (!botMessages) return;

    setIsBotTyping(true);

    let replyText: string | null = null;

    const abortController = new AbortController();
    const timer = setTimeout(() => abortController.abort(), 10000);

    try {
      // 1. Try server-side dynamic Gemini AI endpoint for unscripted conversation
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: text,
          botTrashTalk,
          difficulty,
          playerName: displayPlayerName,
          fen: chessRef.current.fen(),
          evalCp: lastEvalCpRef.current,
          moveCount: chessRef.current.history().length,
          recentMessages: chatMessages.slice(-5),
        }),
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
          replyText = data.reply.trim();
        }
      }
    } catch (e) {
      clearTimeout(timer);
      console.warn('Dynamic bot chat fetch error, falling back to local engine:', e);
    }

    // 2. If Gemini is unavailable or failed, fallback to contextual dialogue generator
    if (!replyText) {
      replyText = getBotChatReply(text, botMessages, botTrashTalk, difficulty, {
        lastPlayerBlunder: lastPlayerBlunderRef.current,
        evalCp: lastEvalCpRef.current,
      });
    }

    if (replyText) {
      const typingMs = 420 + Math.min(550, replyText.length * 10);
      appendBotChat(replyText, typingMs);
    } else {
      setIsBotTyping(false);
    }
  };

  const handleSendReaction = (emoji: string) => {
    handleSendChatMessage(emoji);
  };

  const handleToggleSound = () => {
    playWindowsClick();
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  const handleToggleBotMessages = (checked: boolean) => {
    if (status === 'in_progress') return;
    playWindowsClick();
    setBotMessages(checked);
    botMessagesRef.current = checked;
    if (!checked) {
      setBotTrashTalk(false);
      botTrashTalkRef.current = false;
      setIsBotTyping(false);
    }
  };

  const handleToggleBotTrashTalk = (checked: boolean) => {
    if (status === 'in_progress') return;
    playWindowsClick();
    setBotTrashTalk(checked);
    botTrashTalkRef.current = checked;
    if (checked) {
      if (!botMessages) {
        setBotMessages(true);
        botMessagesRef.current = true;
      }
      // Immediate reaction if toggled on!
      window.setTimeout(() => {
        triggerBotEvent('trash_talk_toggled_on', {}, 320);
      }, 60);
    }
  };

  const isGameOver = status !== 'in_progress';
  const topColor: PieceColor = orientation === 'w' ? 'b' : 'w';
  const bottomColor: PieceColor = orientation;

  const isTopBot = topColor === botColor;
  const isBottomBot = bottomColor === botColor;

  const topClock = topColor === 'w' ? clocks.w : clocks.b;
  const bottomClock = bottomColor === 'w' ? clocks.w : clocks.b;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 select-none">
      {/* 2000s Windows Application Window */}
      <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-[3px_3px_0px_rgba(0,0,0,0.6)]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] via-[#104ba0] to-[#a6caf0] text-white font-bold text-xs sm:text-sm px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChessBotIcon size={17} />
            <span>
              Matt's Chess [Bot Match: {botDisplayName}] - {displayPlayerName} vs {diffCfg.label} Bot
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRequestLeave}
              title="Return to Lobby"
              className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>

        {/* Toolbar menu bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-0.5 border-b border-[#808080] text-xs font-sans bg-[#d4d0c8] text-black">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRequestLeave}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 flex items-center gap-1 cursor-pointer"
            >
              <ChessReturnLobbyIcon size={15} />
              <span><span className="underline">E</span>xit to Lobby</span>
            </button>
            <button
              onClick={() => {
                playWindowsClick();
                setOrientation((o) => (o === 'w' ? 'b' : 'w'));
              }}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 flex items-center gap-1 cursor-pointer"
            >
              <ChessFlipBoardIcon size={15} />
              <span><span className="underline">F</span>lip View</span>
            </button>
            <button
              onClick={() => startFreshMatch(false)}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 flex items-center gap-1 cursor-pointer"
            >
              <RetroNewGameIcon size={14} />
              <span><span className="underline">N</span>ew Match</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold">Skill:</span>
            <select
              value={difficulty}
              disabled={status === 'in_progress'}
              onChange={(e) => {
                if (status === 'in_progress') return;
                playWindowsClick();
                setDifficulty(e.target.value as BotDifficulty);
              }}
              className="bg-white disabled:bg-[#d4d0c8] disabled:text-[#606060] disabled:cursor-not-allowed border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-1.5 py-0.5 text-[11px] font-bold text-black focus:outline-hidden cursor-pointer"
              title={status === 'in_progress' ? 'Bot difficulty is locked during the match' : 'Change Bot Difficulty'}
            >
              <option value="easy">Easy (600)</option>
              <option value="medium">Medium (1200)</option>
              <option value="hard">Hard (1800)</option>
              <option value="grandmaster">Grandmaster (2400)</option>
            </select>
            <span className="text-[#808080]">|</span>
            <span className="inline-flex items-center gap-1">
              <RetroClockIcon size={12} />
              <span>{initialSettings.timeControl.name}</span>
            </span>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Left Column: Board & Player Info */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Top Opponent Info Bar */}
            <div className="w-full max-w-[540px] bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border border-[#808080] flex items-center justify-center">
                  {isTopBot ? (
                    <ChessBotIcon size={24} />
                  ) : (
                    <ChessPiece type="k" color={topColor} className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-black font-sans">
                      {isTopBot ? botDisplayName : displayPlayerName}
                    </span>
                    <span className="text-[10px] px-1 py-0 bg-[#d4d0c8] border border-[#808080] text-[#404040] font-mono">
                      {topColor === 'w' ? 'White' : 'Black'}
                    </span>
                    {isTopBot && (
                      <span className="text-[10px] px-1 py-0 bg-[#0a246a] text-white font-mono">
                        {diffCfg.elo}
                      </span>
                    )}
                  </div>
                  <CapturedPieces fen={fen} side={topColor} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status === 'in_progress' && turn === topColor && (
                  <span className="text-[10px] font-bold text-[#000080] bg-white border border-[#808080] px-1.5 py-0.5 animate-pulse">
                    {isTopBot ? 'Thinking...' : 'Your Turn'}
                  </span>
                )}
                <ChessClock
                  timeMs={topClock}
                  isActive={status === 'in_progress' && turn === topColor}
                  color={topColor}
                  isUnlimited={isUnlimited}
                />
              </div>
            </div>

            {/* Chess Board */}
            <ChessBoard
              fen={fen}
              orientation={orientation}
              turn={turn}
              canMove={status === 'in_progress' && turn === playerColor && !isBotThinking}
              lastMove={history.length > 0 ? history[history.length - 1] : null}
              onMove={handlePlayerMove}
            />

            {/* Bottom Player Info Bar */}
            <div className="w-full max-w-[540px] bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border border-[#808080] flex items-center justify-center">
                  {isBottomBot ? (
                    <ChessBotIcon size={24} />
                  ) : (
                    <ChessPiece type="k" color={bottomColor} className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-black font-sans">
                      {isBottomBot ? botDisplayName : displayPlayerName}
                    </span>
                    <span className="text-[10px] px-1 py-0 bg-[#d4d0c8] border border-[#808080] text-[#404040] font-mono">
                      {bottomColor === 'w' ? 'White' : 'Black'}
                    </span>
                  </div>
                  <CapturedPieces fen={fen} side={bottomColor} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status === 'in_progress' && turn === bottomColor && (
                  <span className="text-[10px] font-bold text-[#000080] bg-white border border-[#808080] px-1.5 py-0.5 animate-pulse">
                    {isBottomBot ? 'Thinking...' : 'Your Turn'}
                  </span>
                )}
                <ChessClock
                  timeMs={bottomClock}
                  isActive={status === 'in_progress' && turn === bottomColor}
                  color={bottomColor}
                  isUnlimited={isUnlimited}
                />
              </div>
            </div>

            {/* Game Over Windows Dialog */}
            {isGameOver && (
              <div className="w-full max-w-[540px] mt-2 bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-3 text-center shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-0.5 mb-2 flex items-center justify-between">
                  <span>Match Result - Matt's Chess</span>
                </div>
                <div className="font-bold text-sm text-black mb-1">
                  {winReason || 'Game Finished'}
                </div>
                <p className="text-xs text-[#505050] mb-3">
                  {winner === 'draw'
                    ? 'The match concluded in a draw.'
                    : `${winner === 'w' ? 'White' : 'Black'} has won the match!`}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => startFreshMatch(true)}
                    className="px-4 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.3)]"
                  >
                    <ChessRematchIcon size={16} />
                    <span>Request Rematch</span>
                  </button>
                  <button
                    onClick={() => {
                      playWindowsClick();
                      onBack();
                    }}
                    className="px-4 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.3)]"
                  >
                    <ChessReturnLobbyIcon size={16} />
                    <span>Return to Lobby</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Bot Controls & 2 Options Strip */}
            <div className="w-full max-w-[540px] mt-2 bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-2 flex flex-col gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      playWindowsClick();
                      setOrientation((o) => (o === 'w' ? 'b' : 'w'));
                    }}
                    className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChessFlipBoardIcon size={15} />
                    <span>Flip Board</span>
                  </button>

                  <button
                    onClick={handleToggleSound}
                    className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RetroSpeakerIcon muted={!soundOn} size={14} />
                    <span>Audio: {soundOn ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {!isGameOver && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        playWindowsClick();
                        setShowOfferDrawModal(true);
                      }}
                      className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RetroHandshakeIcon size={14} />
                      <span>Offer Draw</span>
                    </button>

                    <button
                      onClick={() => {
                        playWindowsChord();
                        setShowResignModal(true);
                      }}
                      className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-[#990000] font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RetroFlagIcon size={14} />
                      <span>Resign</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bot Options Bar (Locked during match) */}
              <div className="bg-[#ece9d8] border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-2.5 py-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#303030]">Bot Options:</span>
                  {status === 'in_progress' && (
                    <span className="text-[10px] text-[#606060] font-sans italic">
                      (locked during match)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label
                    title={status === 'in_progress' ? 'Bot settings cannot be changed during a match' : undefined}
                    className={`inline-flex items-center gap-1.5 font-bold text-[11px] ${
                      status === 'in_progress' ? 'cursor-not-allowed text-[#707070]' : 'cursor-pointer text-black'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={botMessages}
                      disabled={status === 'in_progress'}
                      onChange={(e) => handleToggleBotMessages(e.target.checked)}
                      className={status === 'in_progress' ? 'cursor-not-allowed' : 'cursor-pointer'}
                    />
                    <span>Bot Messages</span>
                  </label>

                  <label
                    title={status === 'in_progress' ? 'Bot settings cannot be changed during a match' : undefined}
                    className={`inline-flex items-center gap-1.5 font-bold text-[11px] ${
                      status === 'in_progress' ? 'cursor-not-allowed text-[#996060]' : 'cursor-pointer text-[#880000]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={botTrashTalk}
                      disabled={status === 'in_progress'}
                      onChange={(e) => handleToggleBotTrashTalk(e.target.checked)}
                      className={status === 'in_progress' ? 'cursor-not-allowed' : 'cursor-pointer'}
                    />
                    <span>Bot Trash Talk</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Move History + In-Game Messenger (when Bot Messages enabled) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <div className={botMessages ? 'h-[235px]' : 'h-[560px]'}>
              <MoveHistory history={history} pgn={pgn} fen={fen} />
            </div>

            {botMessages && (
              <div className="h-[385px]">
                <InGameChat
                  messages={chatMessages}
                  currentUserId={playerId}
                  onSendMessage={handleSendChatMessage}
                  onSendReaction={handleSendReaction}
                  typingIndicatorText={isBotTyping ? `${botDisplayName} is typing a message...` : null}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Windows Status Bar */}
        <div className="grid grid-cols-12 text-[11px] font-sans bg-[#d4d0c8] border-t border-[#808080] p-1 gap-1">
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Turn: {turn === 'w' ? 'White to move' : 'Black to move'}
          </div>
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            You: {playerColor === 'w' ? 'White' : 'Black'} | Bot: {diffCfg.label}
          </div>
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Chat: {botMessages ? (botTrashTalk ? 'Trash Talk ON' : 'Bot Messages ON') : 'Muted'}
          </div>
        </div>
      </div>

      {/* Classic Windows Resign Confirm Dialog */}
      {showResignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-sm w-full select-none">
            <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-3 select-none">
              <span>Confirm Resignation</span>
              <button
                onClick={() => setShowResignModal(false)}
                className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="px-3 py-2 flex items-start gap-3 mb-4">
              <div className="shrink-0 pt-0.5">
                <RetroWarningIcon size={28} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-black mb-1">
                  are you sure you want to resign?
                </h4>
                <p className="text-[11px] text-[#404040]">
                  This will concede the match to the chess bot immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-2 pb-2">
              <button
                onClick={() => {
                  playWindowsClick();
                  setShowResignModal(false);
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResignModal(false);
                  executeResign();
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-[#990000] text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
              >
                Yes, Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Draw Modal Dialog */}
      {showOfferDrawModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-sm w-full select-none">
            <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-3 select-none">
              <span>Offer Draw</span>
              <button
                onClick={() => setShowOfferDrawModal(false)}
                className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="px-3 py-2 flex items-start gap-3 mb-4">
              <div className="shrink-0 pt-0.5">
                <RetroHandshakeIcon size={28} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-black mb-1">
                  Offer a draw to {botDisplayName}?
                </h4>
                <p className="text-[11px] text-[#404040]">
                  The bot will analyze the current position and its winning chances before deciding.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-2 pb-2">
              <button
                onClick={() => {
                  playWindowsClick();
                  setShowOfferDrawModal(false);
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOfferDrawModal(false);
                  executeOfferDraw();
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-[#000080] text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
              >
                Yes, Offer Draw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draw Result Modal Popup Dialog */}
      {drawResultModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-sm w-full select-none">
            <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-3 select-none">
              <span>Draw Offer - {drawResultModal.accepted ? 'Accepted' : 'Declined'}</span>
              <button
                onClick={() => setDrawResultModal(null)}
                className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="px-3 py-2 flex items-start gap-3 mb-4">
              <div className="shrink-0 pt-0.5">
                <RetroHandshakeIcon size={28} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-black mb-1">
                  {drawResultModal.accepted ? 'Draw Offer Accepted' : 'Draw Offer Declined'}
                </h4>
                <p className="text-[11px] text-[#404040]">
                  {drawResultModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end px-2 pb-2">
              <button
                onClick={() => {
                  playWindowsClick();
                  setDrawResultModal(null);
                }}
                className="px-5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Leave Match Modal */}
      {showLeaveConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-sm w-full select-none">
            <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-3 select-none">
              <span>Confirm Leave</span>
              <button
                onClick={() => setShowLeaveConfirmModal(false)}
                className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="px-3 py-2 flex items-start gap-3 mb-4">
              <div className="shrink-0 pt-0.5">
                <RetroWarningIcon size={28} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-black mb-1">
                  Are you sure you want to leave the match?
                </h4>
                <p className="text-[11px] text-[#404040]">
                  Leaving will forfeit this match to the chess bot.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-2 pb-2">
              <button
                onClick={() => {
                  playWindowsClick();
                  setShowLeaveConfirmModal(false);
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
              >
                Stay in Match
              </button>
              <button
                onClick={() => {
                  playWindowsStop();
                  handleConfirmLeave();
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-[#990000] text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
              >
                Leave Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retro Windows System Alert Toast in bottom-right */}
      <SystemAlertToast alert={systemAlert} onDismiss={() => setSystemAlert(null)} />
    </div>
  );
};
