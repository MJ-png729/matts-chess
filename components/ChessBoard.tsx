import React, { useState, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { PieceColor } from '../types/chess';
import { playMoveSound, playCaptureSound, playWindowsDing } from '../utils/audio';

interface ChessBoardProps {
  fen: string;
  orientation: PieceColor;
  turn: PieceColor;
  canMove: boolean;
  lastMove?: { from: string; to: string } | null;
  onMove: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Authentic board palette matching uploaded 2000s Fritz / Windows chess image
const LIGHT_SQUARE_COLOR = '#fed59f';
const DARK_SQUARE_COLOR = '#d48a47';

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation,
  turn,
  canMove,
  lastMove,
  onMove,
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const isInCheck = chess.inCheck();
  const kingSquareInCheck = useMemo(() => {
    if (!isInCheck) return null;
    const currentTurn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          return `${FILES[c]}${8 - r}` as Square;
        }
      }
    }
    return null;
  }, [chess, isInCheck]);

  const legalMovesFromSelected = useMemo(() => {
    if (!selectedSquare || !canMove || disabled) return [];
    try {
      return chess.moves({ square: selectedSquare, verbose: true });
    } catch {
      return [];
    }
  }, [chess, selectedSquare, canMove, disabled]);

  const legalTargetsMap = useMemo(() => {
    const map = new Map<string, { isCapture: boolean }>();
    for (const move of legalMovesFromSelected) {
      map.set(move.to, {
        isCapture: !!move.captured || move.flags.includes('e'),
      });
    }
    return map;
  }, [legalMovesFromSelected]);

  const displayRanks = orientation === 'w' ? RANKS : [...RANKS].reverse();
  const displayFiles = orientation === 'w' ? FILES : [...FILES].reverse();

  const handleSquareClick = (square: Square) => {
    if (disabled || !canMove) return;

    const pieceOnSquare = chess.get(square);

    if (selectedSquare) {
      if (legalTargetsMap.has(square)) {
        const movingPiece = chess.get(selectedSquare);
        const isPawn = movingPiece?.type === 'p';
        const isPromoting =
          isPawn &&
          ((movingPiece.color === 'w' && square.endsWith('8')) ||
            (movingPiece.color === 'b' && square.endsWith('1')));

        if (isPromoting) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeMove(selectedSquare, square);
        return;
      }

      if (pieceOnSquare && pieceOnSquare.color === orientation && pieceOnSquare.color === turn) {
        setSelectedSquare(square);
        return;
      }

      setSelectedSquare(null);
      return;
    }

    if (pieceOnSquare && pieceOnSquare.color === orientation && pieceOnSquare.color === turn) {
      setSelectedSquare(square);
    }
  };

  const executeMove = (from: Square, to: Square, promotion?: string) => {
    const isCapture = legalTargetsMap.get(to)?.isCapture;
    onMove(from, to, promotion);

    if (isCapture) {
      playCaptureSound();
    } else {
      playMoveSound();
    }

    setSelectedSquare(null);
    setPendingPromotion(null);
  };

  const handlePromotionSelect = (pieceType: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    executeMove(pendingPromotion.from, pendingPromotion.to, pieceType);
  };

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (disabled || !canMove) {
      e.preventDefault();
      return;
    }
    const piece = chess.get(square);
    if (!piece || piece.color !== orientation || piece.color !== turn) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', square);
    setSelectedSquare(square);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toSquare: Square) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain') as Square;
    if (!fromSquare || fromSquare === toSquare) return;

    const moves = chess.moves({ square: fromSquare, verbose: true });
    const targetMove = moves.find((m) => m.to === toSquare);

    if (targetMove) {
      const movingPiece = chess.get(fromSquare);
      const isPromoting =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && toSquare.endsWith('8')) ||
          (movingPiece.color === 'b' && toSquare.endsWith('1')));

      if (isPromoting) {
        setPendingPromotion({ from: fromSquare, to: toSquare });
      } else {
        executeMove(fromSquare, toSquare);
      }
    }
  };

  return (
    <div className="relative select-none aspect-square w-full max-w-[540px] mx-auto p-1.5 bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
      {/* Wooden / Sunken board border */}
      <div className="w-full h-full border-2 border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff] bg-[#804000] p-1">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full border border-black overflow-hidden">
          {displayRanks.map((rank, rankIdx) =>
            displayFiles.map((file, fileIdx) => {
              const square = `${file}${rank}` as Square;
              const piece = chess.get(square);
              const isLight = (fileIdx + rankIdx) % 2 === 0;

              const isSelected = selectedSquare === square;
              const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
              const isTarget = legalTargetsMap.has(square);
              const isCaptureTarget = isTarget && legalTargetsMap.get(square)?.isCapture;
              const isKingInCheckSquare = kingSquareInCheck === square;

              const showRank = fileIdx === 0;
              const showFile = rankIdx === 7;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, square)}
                  style={{
                    backgroundColor: isSelected
                      ? '#ffff66'
                      : isLastMoveSquare
                      ? '#f5eb7d'
                      : isLight
                      ? LIGHT_SQUARE_COLOR
                      : DARK_SQUARE_COLOR,
                  }}
                  className={`relative flex items-center justify-center transition-none cursor-pointer ${
                    isSelected ? 'ring-2 ring-inset ring-black' : ''
                  } ${
                    isKingInCheckSquare ? 'ring-4 ring-inset ring-red-600 bg-red-400/80 animate-pulse' : ''
                  }`}
                >
                  {/* Coordinate rank label */}
                  {showRank && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-bold font-mono pointer-events-none ${
                        isLight ? 'text-[#8c521f]' : 'text-[#fed59f]'
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* Coordinate file label */}
                  {showFile && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-bold font-mono pointer-events-none ${
                        isLight ? 'text-[#8c521f]' : 'text-[#fed59f]'
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Piece */}
                  {piece && (
                    <div
                      draggable={canMove && piece.color === orientation && piece.color === turn && !disabled}
                      onDragStart={(e) => handleDragStart(e, square)}
                      className="w-[90%] h-[90%] flex items-center justify-center z-10 select-none"
                    >
                      <ChessPiece type={piece.type} color={piece.color} />
                    </div>
                  )}

                  {/* Move Hint - Normal move target dot */}
                  {isTarget && !isCaptureTarget && !piece && (
                    <div className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-black/40 pointer-events-none z-20" />
                  )}

                  {/* Move Hint - Capture target ring */}
                  {isTarget && (isCaptureTarget || piece) && (
                    <div className="absolute inset-1 rounded-full border-3 border-black/40 pointer-events-none z-20" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pawn Promotion Modal (Windows 2000 style dialog) */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1.5 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-xs w-full">
            {/* Dialog title bar */}
            <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-2 select-none">
              <span>Promote Pawn</span>
              <button
                onClick={() => setPendingPromotion(null)}
                className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] leading-none flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <p className="text-[11px] font-sans text-black mb-2 px-1 text-center">
              Choose a piece for pawn promotion:
            </p>

            <div className="grid grid-cols-4 gap-2 mb-3 px-1">
              {(['q', 'r', 'b', 'n'] as const).map((pieceType) => (
                <button
                  key={pieceType}
                  onClick={() => handlePromotionSelect(pieceType)}
                  className="aspect-square bg-[#ece9d8] hover:bg-white active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] p-1.5 border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center"
                >
                  <ChessPiece type={pieceType} color={orientation} className="w-9 h-9" />
                </button>
              ))}
            </div>

            <div className="flex justify-end px-1 pb-1">
              <button
                onClick={() => setPendingPromotion(null)}
                className="px-3 py-1 bg-[#d4d0c8] hover:bg-[#e4e0d8] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] text-xs font-sans text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
