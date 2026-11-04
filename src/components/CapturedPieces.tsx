import React from 'react';
import { ChessPiece } from './ChessPiece';

interface CapturedPiecesProps {
  fen: string;
  side: 'w' | 'b';
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const INITIAL_COUNTS: Record<string, number> = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ fen, side }) => {
  const pieceFen = fen.split(' ')[0] || '';

  const currentCounts: Record<'w' | 'b', Record<string, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  };

  for (const char of pieceFen) {
    const lower = char.toLowerCase();
    if (INITIAL_COUNTS[lower] !== undefined) {
      const color = char === char.toUpperCase() ? 'w' : 'b';
      currentCounts[color][lower] = (currentCounts[color][lower] || 0) + 1;
    }
  }

  const enemyColor = side === 'w' ? 'b' : 'w';
  const capturedList: { type: string; color: 'w' | 'b' }[] = [];

  (['q', 'r', 'b', 'n', 'p'] as const).forEach((pieceType) => {
    const capturedCount = Math.max(0, INITIAL_COUNTS[pieceType] - (currentCounts[enemyColor][pieceType] || 0));
    for (let i = 0; i < capturedCount; i++) {
      capturedList.push({ type: pieceType, color: enemyColor });
    }
  });

  let whiteMaterial = 0;
  let blackMaterial = 0;
  (['p', 'n', 'b', 'r', 'q'] as const).forEach((p) => {
    whiteMaterial += (currentCounts.w[p] || 0) * PIECE_VALUES[p];
    blackMaterial += (currentCounts.b[p] || 0) * PIECE_VALUES[p];
  });

  const diff = side === 'w' ? whiteMaterial - blackMaterial : blackMaterial - whiteMaterial;

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-h-6">
      <div className="flex items-center -space-x-1 overflow-hidden">
        {capturedList.map((item, idx) => (
          <div key={idx} className="w-4 h-4 flex-shrink-0">
            <ChessPiece type={item.type} color={item.color} />
          </div>
        ))}
      </div>
      {diff > 0 && (
        <span className="text-[10px] font-bold font-mono text-[#006600] bg-[#e0f0e0] border border-[#a0c0a0] px-1 py-0.2">
          +{diff}
        </span>
      )}
    </div>
  );
};
