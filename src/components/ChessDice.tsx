import React from 'react';

interface ChessDiceProps {
  className?: string;
}

/**
 * Custom vector dice styled identically to the retro chess pieces:
 * Uses authentic #ffffff and #181818 fills, crisp #000000 line strokes,
 * and dual White/Black chess piece motif (black dots on white faces,
 * white dots on black face) to signify the 50/50 random selection.
 */
export const ChessDice: React.FC<ChessDiceProps> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 45 45"
      className={`${className} pointer-events-none select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: 'scale(1.08)',
        filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))',
      }}
    >
      {/* Top Face - White with black pips */}
      <polygon
        points="22.5,5.5 38.5,14 22.5,22.5 6.5,14"
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Left Face - White (subtle ivory) with black pips & white-piece hatch */}
      <polygon
        points="6.5,14 22.5,22.5 22.5,39.5 6.5,31"
        fill="#f5f5f5"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Right Face - Black piece theme (#181818) with white pips & dark hatch */}
      <polygon
        points="22.5,22.5 38.5,14 38.5,31 22.5,39.5"
        fill="#181818"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Subtle chess piece hatch lines matching ChessPiece.tsx */}
      <line x1="10" y1="28" x2="16" y2="35" stroke="#b0b0b0" strokeWidth="1" />
      <line x1="29" y1="36" x2="35" y2="29" stroke="#404040" strokeWidth="1" />

      {/* Top Face Pips (3 black dots isometric) */}
      <ellipse cx="22.5" cy="14" rx="2.2" ry="1.3" fill="#000000" />
      <ellipse cx="14.5" cy="9.8" rx="2.2" ry="1.3" fill="#000000" />
      <ellipse cx="30.5" cy="18.2" rx="2.2" ry="1.3" fill="#000000" />

      {/* Left Face Pips (2 black dots isometric) */}
      <ellipse cx="13" cy="21.5" rx="1.4" ry="2.2" fill="#000000" />
      <ellipse cx="16.5" cy="32" rx="1.4" ry="2.2" fill="#000000" />

      {/* Right Face Pips (5 white dots on black face) */}
      <ellipse cx="27.5" cy="22" rx="1.4" ry="2.2" fill="#ffffff" />
      <ellipse cx="34" cy="18.5" rx="1.4" ry="2.2" fill="#ffffff" />
      <ellipse cx="30.5" cy="27" rx="1.4" ry="2.2" fill="#ffffff" />
      <ellipse cx="27.5" cy="35.5" rx="1.4" ry="2.2" fill="#ffffff" />
      <ellipse cx="34" cy="32" rx="1.4" ry="2.2" fill="#ffffff" />
    </svg>
  );
};
