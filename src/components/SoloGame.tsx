import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { CapturedPieces } from './CapturedPieces';
import { MoveHistory } from './MoveHistory';
import { ChessPiece } from './ChessPiece';
import { SystemAlertToast, SystemAlert } from './SystemAlertToast';
import { RetroPawnIcon, RetroFlipIcon, RetroNewGameIcon, RetroSpeakerIcon, ChessFlipBoardIcon } from './RetroIcons';
import { MoveRecord, PieceColor } from '../types/chess';
import {
  isSoundEnabled,
  setSoundEnabled,
  playWindowsDing,
  playWindowsTada,
  playWindowsChord,
  playWindowsClick,
} from '../utils/audio';
import confetti from 'canvas-confetti';

interface SoloGameProps {
  onBack: () => void;
}

export const SoloGame: React.FC<SoloGameProps> = ({ onBack }) => {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [pgn, setPgn] = useState('');
  const [turn, setTurn] = useState<PieceColor>('w');
  const [orientation, setOrientation] = useState<PieceColor>('w');
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [systemAlert, setSystemAlert] = useState<SystemAlert | null>(null);

  const handleMove = (from: string, to: string, promotion?: string) => {
    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion ? (promotion.toLowerCase() as any) : 'q',
      });

      if (!move) return;

      const newFen = chess.fen();
      const newTurn = chess.turn();

      setFen(newFen);
      setPgn(chess.pgn());
      setTurn(newTurn);

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

      setHistory((prev) => [...prev, record]);

      if (chess.isCheckmate()) {
        const winner = newTurn === 'w' ? 'Black' : 'White';
        setGameOverMessage(`Checkmate! ${winner} wins!`);
        setSystemAlert({
          id: `checkmate-${Date.now()}`,
          type: 'checkmate',
          title: 'System message',
          message: `Checkmate! ${winner} wins!`,
        });
        playWindowsTada();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else if (chess.isDraw()) {
        setGameOverMessage('Game drawn!');
        setSystemAlert({
          id: `draw-${Date.now()}`,
          type: 'info',
          title: 'System message',
          message: 'Game drawn!',
        });
        playWindowsChord();
      } else if (chess.inCheck()) {
        const inCheckColor = newTurn === 'w' ? 'White' : 'Black';
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
  };

  const handleReset = () => {
    playWindowsClick();
    chess.reset();
    setFen(chess.fen());
    setPgn('');
    setTurn('w');
    setHistory([]);
    setGameOverMessage(null);
    setSystemAlert(null);
  };

  const toggleSound = () => {
    playWindowsClick();
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 select-none">
      {/* 2000s Windows Window */}
      <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-[3px_3px_0px_rgba(0,0,0,0.6)]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] via-[#104ba0] to-[#a6caf0] text-white font-bold text-xs sm:text-sm px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RetroPawnIcon size={16} color="w" />
            <span>Matt's Chess [Local Offline Pass & Play]</span>
          </div>
          <button
            onClick={() => {
              playWindowsClick();
              onBack();
            }}
            className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center leading-none"
          >
            ×
          </button>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center justify-between px-2 py-0.5 border-b border-[#808080] text-xs font-sans bg-[#d4d0c8] text-black">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playWindowsClick();
                onBack();
              }}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5"
            >
              ← <span className="underline">M</span>enu
            </button>
            <button
              onClick={() => {
                playWindowsClick();
                setOrientation(orientation === 'w' ? 'b' : 'w');
              }}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 inline-flex items-center gap-1 cursor-pointer"
            >
              <ChessFlipBoardIcon size={15} />
              <span><span className="underline">F</span>lip Board</span>
            </button>
            <button
              onClick={handleReset}
              className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 inline-flex items-center gap-1"
            >
              <RetroNewGameIcon size={13} />
              <span><span className="underline">N</span>ew Game</span>
            </button>
          </div>

          <button
            onClick={toggleSound}
            className="text-[11px] font-bold px-1.5 py-0.5 hover:bg-white border border-[#808080] inline-flex items-center gap-1"
          >
            <RetroSpeakerIcon muted={!soundOn} size={13} />
            <span>Sound: {soundOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Top Player Info */}
            <div className="w-full max-w-[540px] bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white border border-[#808080] flex items-center justify-center">
                  <ChessPiece type="k" color={orientation === 'w' ? 'b' : 'w'} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-black font-sans">
                    {orientation === 'w' ? 'Black Player' : 'White Player'}
                  </div>
                  <CapturedPieces fen={fen} side={orientation === 'w' ? 'b' : 'w'} />
                </div>
              </div>
              {turn === (orientation === 'w' ? 'b' : 'w') && (
                <span className="text-[11px] font-bold text-[#000080] bg-white border border-[#808080] px-2 py-0.5">
                  Thinking...
                </span>
              )}
            </div>

            {/* Chess Board */}
            <ChessBoard
              fen={fen}
              orientation={orientation}
              turn={turn}
              canMove={!gameOverMessage}
              lastMove={history.length > 0 ? history[history.length - 1] : null}
              onMove={handleMove}
            />

            {/* Bottom Player Info */}
            <div className="w-full max-w-[540px] bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white border border-[#808080] flex items-center justify-center">
                  <ChessPiece type="k" color={orientation} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-black font-sans">
                    {orientation === 'w' ? 'White Player' : 'Black Player'}
                  </div>
                  <CapturedPieces fen={fen} side={orientation} />
                </div>
              </div>
              {turn === orientation && (
                <span className="text-[11px] font-bold text-[#000080] bg-white border border-[#808080] px-2 py-0.5">
                  Your Turn
                </span>
              )}
            </div>

            {/* Game Over Box */}
            {gameOverMessage && (
              <div className="w-full max-w-[540px] mt-2 bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-3 text-center shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                <div className="font-bold text-sm text-black mb-1">{gameOverMessage}</div>
                <button
                  onClick={handleReset}
                  className="mt-1 px-4 py-1 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
                >
                  New Match
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 h-[520px]">
            <MoveHistory history={history} pgn={pgn} fen={fen} />
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-12 text-[11px] font-sans bg-[#d4d0c8] border-t border-[#808080] p-1 gap-1">
          <div className="col-span-6 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Turn: {turn === 'w' ? 'White' : 'Black'}
          </div>
          <div className="col-span-6 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Pass & Play Mode Active
          </div>
        </div>
      </div>

      {/* Retro Windows System Alert Toast in bottom-right */}
      <SystemAlertToast alert={systemAlert} onDismiss={() => setSystemAlert(null)} />
    </div>
  );
};
