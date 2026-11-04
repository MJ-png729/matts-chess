import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { ChessClock } from './ChessClock';
import { CapturedPieces } from './CapturedPieces';
import { MoveHistory } from './MoveHistory';
import { InGameChat } from './InGameChat';
import { GameControls } from './GameControls';
import { ShareModal } from './ShareModal';
import { WaitingRoom } from './WaitingRoom';
import { ChessPiece } from './ChessPiece';
import { SystemAlertToast, SystemAlert } from './SystemAlertToast';
import {
  RetroPawnIcon,
  RetroClipboardIcon,
  RetroFlipIcon,
  RetroClockIcon,
  RetroLightningIcon,
  RetroRefreshIcon,
  RetroDoorIcon,
  ChessReturnLobbyIcon,
  ChessRematchIcon,
  ChessAcceptRematchIcon,
  ChessInviteClipboardIcon,
  ChessFlipBoardIcon,
} from './RetroIcons';
import { RoomState, ClientMessage, ServerMessage, PieceColor } from '../types/chess';
import {
  playWindowsDing,
  playGameEndSound,
  playMoveSound,
  playCaptureSound,
  playWindowsClick,
  playWindowsStartup,
} from '../utils/audio';

interface MultiplayerGameProps {
  roomCode: string;
  playerId: string;
  playerName: string;
  preferredColor?: 'w' | 'b' | 'random';
  onLeave: () => void;
}


export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomCode,
  playerId,
  playerName,
  preferredColor = 'random',
  onLeave,
}) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [userRole, setUserRole] = useState<'white' | 'black' | 'spectator'>('spectator');
  const [boardOrientation, setBoardOrientation] = useState<PieceColor>('w');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'moves' | 'chat'>('moves');
  const [showShareModal, setShowShareModal] = useState(false);
  const [localClocks, setLocalClocks] = useState<{ w: number; b: number }>({ w: 0, b: 0 });
  const [systemAlert, setSystemAlert] = useState<SystemAlert | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevMoveCountRef = useRef<number>(0);
  const hasTriggeredGameOverRef = useRef<boolean>(false);

  const sendMessage = useCallback((msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    let unmounted = false;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmounted) return;
      setIsConnected(true);
      playWindowsStartup();

      sendMessage({
        type: 'join',
        roomCode,
        playerId,
        playerName,
        preferredColor,
      });

      pingIntervalRef.current = setInterval(() => {
        sendMessage({ type: 'ping' });
      }, 10000);
    };

    ws.onmessage = (event) => {
      if (unmounted) return;
      try {
        const data: ServerMessage = JSON.parse(event.data);

        if (data.type === 'pong') return;

        if (data.type === 'room_state') {
          setRoomState(data.state);
          setLocalClocks({ ...data.state.clocks });

          let calculatedRole: 'white' | 'black' | 'spectator' = 'spectator';
          if (data.state.whitePlayer?.id === playerId) {
            calculatedRole = 'white';
          } else if (data.state.blackPlayer?.id === playerId) {
            calculatedRole = 'black';
          } else if (data.yourRole) {
            calculatedRole = data.yourRole;
          }

          setUserRole(calculatedRole);
          if (calculatedRole === 'black') {
            setBoardOrientation('b');
          } else if (calculatedRole === 'white') {
            setBoardOrientation('w');
          }

          if (data.state.history.length > prevMoveCountRef.current) {
            const lastMove = data.state.history[data.state.history.length - 1];
            if (lastMove.captured) {
              playCaptureSound();
            } else {
              playMoveSound();
            }
          }
          prevMoveCountRef.current = data.state.history.length;

          if (
            (data.state.status === 'checkmate' ||
              data.state.status === 'timeout' ||
              data.state.status === 'resigned' ||
              data.state.status === 'draw' ||
              data.state.status === 'stalemate') &&
            !hasTriggeredGameOverRef.current
          ) {
            hasTriggeredGameOverRef.current = true;
            const won =
              (data.state.winner === 'w' && userRole === 'white') ||
              (data.state.winner === 'b' && userRole === 'black');
            playGameEndSound(won);
            if (won) {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }

            if (data.state.status === 'checkmate') {
              const winnerName = data.state.winner === 'w' ? 'White' : 'Black';
              setSystemAlert({
                id: `checkmate-${Date.now()}`,
                type: 'checkmate',
                title: 'System message',
                message: `Checkmate! ${winnerName} wins!`,
              });
            } else if (data.state.status === 'resigned') {
              const winnerName = data.state.winner === 'w' ? 'White' : 'Black';
              setSystemAlert({
                id: `resigned-${Date.now()}`,
                type: 'info',
                title: 'System message',
                message: `Opponent resigned! ${winnerName} wins!`,
              });
            } else if (data.state.status === 'timeout') {
              const winnerName = data.state.winner === 'w' ? 'White' : 'Black';
              setSystemAlert({
                id: `timeout-${Date.now()}`,
                type: 'info',
                title: 'System message',
                message: `Time out! ${winnerName} wins!`,
              });
            } else if (data.state.status === 'draw' || data.state.status === 'stalemate') {
              setSystemAlert({
                id: `draw-${Date.now()}`,
                type: 'info',
                title: 'System message',
                message: data.state.status === 'stalemate' ? 'Stalemate! Game drawn.' : 'Game drawn!',
              });
            }
          } else if (data.state.status === 'in_progress') {
            hasTriggeredGameOverRef.current = false;
            // Check for king in check
            try {
              const currentChess = new Chess(data.state.fen);
              if (currentChess.inCheck()) {
                const inCheckColor = currentChess.turn() === 'w' ? 'White' : 'Black';
                setSystemAlert({
                  id: `check-${Date.now()}`,
                  type: 'check',
                  title: 'System message',
                  message: `${inCheckColor} king in check!`,
                  autoDismissMs: 5000,
                });
                playWindowsDing();
              } else {
                setSystemAlert((prev) => (prev?.type === 'check' ? null : prev));
              }
            } catch (e) {
              console.error(e);
            }
          }
        } else if (data.type === 'chat_broadcast') {
          setRoomState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              chatMessages: [...prev.chatMessages, data.message],
            };
          });
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    };

    ws.onclose = () => {
      if (unmounted) return;
      setIsConnected(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };

    return () => {
      unmounted = true;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomCode, playerId, playerName, preferredColor, sendMessage, userRole]);

  useEffect(() => {
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);

    if (
      !roomState ||
      roomState.status !== 'in_progress' ||
      roomState.timeControl.initialMinutes <= 0
    ) {
      return;
    }

    clockIntervalRef.current = setInterval(() => {
      setLocalClocks((prev) => {
        if (!roomState || roomState.status !== 'in_progress') return prev;
        if (roomState.turn === 'w') {
          return { ...prev, w: Math.max(0, prev.w - 100) };
        } else {
          return { ...prev, b: Math.max(0, prev.b - 100) };
        }
      });
    }, 100);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [roomState?.status, roomState?.turn, roomState?.timeControl.initialMinutes]);

  const handleMove = (from: string, to: string, promotion?: string) => {
    sendMessage({
      type: 'move',
      roomCode,
      playerId,
      from,
      to,
      promotion,
    });
  };

  const handleResign = () => {
    sendMessage({ type: 'resign', roomCode, playerId });
  };

  const handleOfferDraw = () => {
    sendMessage({ type: 'offer_draw', roomCode, playerId });
  };

  const handleRespondDraw = (accept: boolean) => {
    sendMessage({ type: 'respond_draw', roomCode, playerId, accept });
  };

  const handleRequestRematch = () => {
    sendMessage({ type: 'request_rematch', roomCode, playerId });
  };

  const handleSendMessage = (text: string) => {
    sendMessage({ type: 'chat', roomCode, playerId, text });
  };

  const handleSendReaction = (emoji: string) => {
    handleSendMessage(emoji);
  };

  const handleFlipBoard = () => {
    setBoardOrientation((prev) => (prev === 'w' ? 'b' : 'w'));
  };

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
          <div className="font-bold text-sm text-black mb-1">
            Connecting to Lobby {roomCode}...
          </div>
          <div className="text-xs text-[#505050]">Handshaking with host...</div>
        </div>
      </div>
    );
  }

  if (roomState.status === 'waiting') {
    return <WaitingRoom state={roomState} userRole={userRole} onLeave={onLeave} />;
  }

  const isMyTurn =
    (roomState.turn === 'w' && userRole === 'white') ||
    (roomState.turn === 'b' && userRole === 'black');

  const topColor: PieceColor = boardOrientation === 'w' ? 'b' : 'w';
  const bottomColor: PieceColor = boardOrientation;

  const topPlayer = topColor === 'w' ? roomState.whitePlayer : roomState.blackPlayer;
  const bottomPlayer = bottomColor === 'w' ? roomState.whitePlayer : roomState.blackPlayer;

  const topClock = topColor === 'w' ? localClocks.w : localClocks.b;
  const bottomClock = bottomColor === 'w' ? localClocks.w : localClocks.b;

  const isGameOver = roomState.status !== 'in_progress';

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 select-none">
      {/* 2000s Windows Application Window */}
      <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-[3px_3px_0px_rgba(0,0,0,0.6)]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] via-[#104ba0] to-[#a6caf0] text-white font-bold text-xs sm:text-sm px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RetroPawnIcon size={16} color="w" />
            <span>
              Matt's Chess [Room: {roomState.code}] - {topPlayer?.name || 'White'} vs{' '}
              {bottomPlayer?.name || 'Black'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                playWindowsClick();
                onLeave();
              }}
              title="Close / Leave Room"
              className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Toolbar menu bar */}
        <div className="flex items-center justify-between px-2 py-0.5 border-b border-[#808080] text-xs font-sans bg-[#d4d0c8] text-black">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playWindowsClick();
                onLeave();
              }}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 flex items-center gap-1 cursor-pointer"
            >
              <ChessReturnLobbyIcon size={16} />
              <span><span className="underline">E</span>xit Room</span>
            </button>
            <button
              onClick={() => {
                playWindowsClick();
                setShowShareModal(true);
              }}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 flex items-center gap-1 cursor-pointer"
            >
              <ChessInviteClipboardIcon size={16} />
              <span><span className="underline">I</span>nvite Friend</span>
            </button>
            <button
              onClick={() => {
                playWindowsClick();
                handleFlipBoard();
              }}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 flex items-center gap-1 cursor-pointer"
            >
              <ChessFlipBoardIcon size={16} />
              <span><span className="underline">F</span>lip View</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold">Mode:</span>
            <span className="inline-flex items-center gap-1">
              <RetroClockIcon size={12} />
              <span>{roomState.timeControl.name}</span>
            </span>
            <span className="text-[#808080]">|</span>
            <span className={isConnected ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
              ● {isConnected ? 'Online' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Left Column: Board & Player Info */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Top Player Sunken Info Bar */}
            <div className="w-full max-w-[540px] bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white border border-[#808080] flex items-center justify-center">
                  <ChessPiece type="k" color={topColor} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-black font-sans">
                      {topPlayer?.name || 'Opponent'}
                    </span>
                    <span className="text-[10px] text-[#505050] font-sans">
                      ({topColor === 'w' ? 'White' : 'Black'})
                    </span>
                  </div>
                  <CapturedPieces fen={roomState.fen} side={topColor} />
                </div>
              </div>

              <ChessClock
                timeMs={topClock}
                isActive={roomState.status === 'in_progress' && roomState.turn === topColor}
                color={topColor}
                isUnlimited={roomState.timeControl.initialMinutes <= 0}
              />
            </div>

            {/* Chess Board */}
            <div className="relative w-full max-w-[540px]">
              <ChessBoard
                fen={roomState.fen}
                orientation={boardOrientation}
                turn={roomState.turn}
                canMove={
                  roomState.status === 'in_progress' &&
                  ((roomState.turn === 'w' && userRole === 'white') ||
                    (roomState.turn === 'b' && userRole === 'black'))
                }
                lastMove={
                  roomState.history.length > 0
                    ? roomState.history[roomState.history.length - 1]
                    : null
                }
                onMove={handleMove}
                disabled={roomState.status !== 'in_progress'}
              />
            </div>

            {/* Bottom Player Sunken Info Bar */}
            <div className="w-full max-w-[540px] bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white border border-[#808080] flex items-center justify-center">
                  <ChessPiece type="k" color={bottomColor} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-black font-sans">
                      {bottomPlayer?.name || 'You'}
                    </span>
                    <span className="text-[10px] bg-[#000080] text-white px-1 py-0.2 font-bold font-sans">
                      YOU
                    </span>
                    <span className="text-[10px] text-[#505050] font-sans">
                      ({bottomColor === 'w' ? 'White' : 'Black'})
                    </span>
                  </div>
                  <CapturedPieces fen={roomState.fen} side={bottomColor} />
                </div>
              </div>

              <ChessClock
                timeMs={bottomClock}
                isActive={roomState.status === 'in_progress' && roomState.turn === bottomColor}
                color={bottomColor}
                isUnlimited={roomState.timeControl.initialMinutes <= 0}
              />
            </div>

            {/* Game Over Windows Dialog */}
            {isGameOver && (
              <div className="w-full max-w-[540px] mt-2 bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-3 text-center shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-0.5 mb-2 flex items-center justify-between">
                  <span>Match Result - Matt's Chess</span>
                </div>
                <div className="font-bold text-sm text-black mb-1">
                  {roomState.winReason || 'Game Finished'}
                </div>
                <p className="text-xs text-[#505050] mb-3">
                  {roomState.winner === 'draw'
                    ? 'The match concluded in a draw.'
                    : `${roomState.winner === 'w' ? 'White' : 'Black'} has won the match!`}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      playWindowsClick();
                      handleRequestRematch();
                    }}
                    className="px-4 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.3)]"
                  >
                    {roomState.rematchRequestedBy && roomState.rematchRequestedBy !== playerId ? (
                      <>
                        <ChessAcceptRematchIcon size={16} />
                        <span>Accept Rematch</span>
                      </>
                    ) : roomState.rematchRequestedBy === playerId ? (
                      <span>Rematch Sent...</span>
                    ) : (
                      <>
                        <ChessRematchIcon size={16} />
                        <span>Request Rematch</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      playWindowsClick();
                      onLeave();
                    }}
                    className="px-4 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.3)]"
                  >
                    <ChessReturnLobbyIcon size={16} />
                    <span>Return to Lobby</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            {!isGameOver && (
              <div className="w-full max-w-[540px] mt-2">
                <GameControls
                  status={roomState.status}
                  turn={roomState.turn}
                  userRole={userRole}
                  drawOffer={roomState.drawOffer}
                  rematchRequestedBy={roomState.rematchRequestedBy}
                  currentUserId={playerId}
                  onResign={handleResign}
                  onOfferDraw={handleOfferDraw}
                  onRespondDraw={handleRespondDraw}
                  onFlipBoard={handleFlipBoard}
                  onRequestRematch={handleRequestRematch}
                  onLeaveRoom={onLeave}
                  onShareRoom={() => setShowShareModal(true)}
                />
              </div>
            )}
          </div>

          {/* Right Column: Tabbed Notation & Chat */}
          <div className="lg:col-span-4 h-[560px] flex flex-col">
            {/* 3D Tabs */}
            <div className="flex items-end gap-1 px-1 border-b-2 border-[#808080] mb-1">
              <button
                onClick={() => {
                  playWindowsClick();
                  setActiveTab('moves');
                }}
                className={`px-3 py-1 text-xs font-bold font-sans border-2 border-b-0 ${
                  activeTab === 'moves'
                    ? 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-r-[#404040] -mb-[2px] pb-1.5'
                    : 'bg-[#ece9d8] text-[#505050] border-t-[#ffffff] border-l-[#ffffff] border-r-[#404040] hover:bg-white'
                }`}
              >
                Moves ({roomState.history.length})
              </button>
              <button
                onClick={() => {
                  playWindowsClick();
                  setActiveTab('chat');
                }}
                className={`px-3 py-1 text-xs font-bold font-sans border-2 border-b-0 ${
                  activeTab === 'chat'
                    ? 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-r-[#404040] -mb-[2px] pb-1.5'
                    : 'bg-[#ece9d8] text-[#505050] border-t-[#ffffff] border-l-[#ffffff] border-r-[#404040] hover:bg-white'
                }`}
              >
                Messenger Chat
                {roomState.chatMessages.length > 1 && (
                  <span className="ml-1 text-[10px] text-[#000080] font-bold">
                    ({roomState.chatMessages.length})
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {activeTab === 'moves' ? (
                <MoveHistory
                  history={roomState.history}
                  pgn={roomState.pgn}
                  fen={roomState.fen}
                />
              ) : (
                <InGameChat
                  messages={roomState.chatMessages}
                  currentUserId={playerId}
                  onSendMessage={handleSendMessage}
                  onSendReaction={handleSendReaction}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Windows Status Bar */}
        <div className="grid grid-cols-12 text-[11px] font-sans bg-[#d4d0c8] border-t border-[#808080] p-1 gap-1">
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Turn: {roomState.turn === 'w' ? 'White to move' : 'Black to move'}
          </div>
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Your Role: {userRole === 'white' ? 'White' : userRole === 'black' ? 'Black' : 'Spectating'}
          </div>
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Lobby: {roomState.code}
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal roomCode={roomState.code} onClose={() => setShowShareModal(false)} />
      )}

      {/* Retro Windows System Alert Toast in bottom-right */}
      <SystemAlertToast alert={systemAlert} onDismiss={() => setSystemAlert(null)} />
    </div>
  );
};
