import React, { useState } from 'react';

interface ChessPieceProps {
  type: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  color: 'w' | 'b';
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const [imgError, setImgError] = useState(false);

  const pieceKey = `${color}_${type.toLowerCase()}`;
  const spriteSrc = `/pieces/${pieceKey}.png`;

  if (!imgError) {
    return (
      <img
        src={spriteSrc}
        alt={`${color === 'w' ? 'White' : 'Black'} ${type}`}
        onError={() => setImgError(true)}
        className={`${className} pointer-events-none select-none`}
        style={{
          imageRendering: 'pixelated',
          transform: 'scale(1.08)',
          filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.2))',
        }}
        draggable={false}
      />
    );
  }

  // Authentic 2000s Fritz / Chessbase Vector Fallback
  const isWhite = color === 'w';
  const mainFill = isWhite ? '#ffffff' : '#181818';
  const strokeColor = '#000000';
  const hatchStroke = isWhite ? '#b0b0b0' : '#404040';

  switch (type.toLowerCase()) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22.5" cy="14" r="5.5" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M19 19.5h7v2.5h-7z" fill={mainFill} stroke={strokeColor} strokeWidth="1.5" />
          <path
            d="M17 22c0 4-3 7-5 14h21c-2-7-5-10-5-14H17z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path d="M10 36h25v4H10z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M19 25h7M18 29h9M17 33h11" stroke={hatchStroke} strokeWidth="1" />
        </svg>
      );

    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11 12h5v4h4v-4h5v4h4v-4h5v8H11v-8z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path d="M13 20l2 14h15l2-14H13z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M10 34h25v5H10z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M15 24h15M14 28h17M14 31h17" stroke={hatchStroke} strokeWidth="1" />
        </svg>
      );

    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 9c-3 0-6 2-7 6-1 4-1 6-3 8-1 1-2 2-2 4 1 2 4 1 6 0 1-1 3-3 4-3 1 2 3 4 5 5 2 1 5 1 7-1 2-2 3-5 3-8 0-4-3-8-6-9-2-1-4-1-7-1z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path
            d="M12 25c1 5 3 9 7 11h14c1-3 0-7-2-11"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path d="M11 36h23v4H11z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <circle cx="17" cy="17" r="1.5" fill={isWhite ? '#000' : '#fff'} />
          <path d="M25 14l-3 4M27 18l-3 4M28 23l-4 4" stroke={hatchStroke} strokeWidth="1.2" />
        </svg>
      );

    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22.5" cy="9" r="2.2" fill={mainFill} stroke={strokeColor} strokeWidth="1.5" />
          <path
            d="M15 15c0-4 3.5-5 7.5-5s7.5 1 7.5 5c0 5-3 8-4.5 10 2 2 3.5 5 3.5 8H16c0-3 1.5-6 3.5-8-1.5-2-4.5-5-4.5-10z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path d="M12 36h21v4H12z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M21 13l3 4M24 13l-3 4" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );

    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="14" r="1.5" fill={mainFill} stroke={strokeColor} strokeWidth="1.2" />
          <circle cx="16" cy="11" r="1.5" fill={mainFill} stroke={strokeColor} strokeWidth="1.2" />
          <circle cx="22.5" cy="10" r="1.5" fill={mainFill} stroke={strokeColor} strokeWidth="1.2" />
          <circle cx="29" cy="11" r="1.5" fill={mainFill} stroke={strokeColor} strokeWidth="1.2" />
          <circle cx="35" cy="14" r="1.5" fill={mainFill} stroke={strokeColor} strokeWidth="1.2" />
          <path
            d="M10 16l3 13h19l3-13-6 5-6.5-9-6.5 9-6-5z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path d="M12 29h21v4H12z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M10 35h25v4H10z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M17 24h11M16 27h13" stroke={hatchStroke} strokeWidth="1" />
        </svg>
      );

    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Maltese cross on top */}
          <path d="M22.5 5v5M19.5 7.5h6" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="square" />
          <path
            d="M14 17c0-4 4-6 8.5-6s8.5 2 8.5 6c0 6-3 9-4 11 2 2 3 4 3 7H15c0-3 1-5 3-7-1-2-4-5-4-11z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path d="M12 33h21v3H12z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M10 36h25v4H10z" fill={mainFill} stroke={strokeColor} strokeWidth="1.8" />
          <path d="M18 22h9M17 26h11M16 29h13" stroke={hatchStroke} strokeWidth="1" />
        </svg>
      );

    default:
      return null;
  }
};
