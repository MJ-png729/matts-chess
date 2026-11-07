import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  muted?: boolean;
  color?: 'w' | 'b';
}

/**
 * Authentic Windows 98/2000 / MSN / Retro Fritz Chess pixel-styled SVG icons.
 * Crisp edges (shapeRendering="crispEdges" where applicable), retro palette,
 * no modern phone/OS emojis.
 */

// Systray speaker with soundwaves or red mute X
export const RetroSpeakerIcon: React.FC<IconProps> = ({ size = 16, className = '', muted = false }) => {
  if (muted) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block select-none ${className}`}
        shapeRendering="crispEdges"
      >
        {/* Speaker body (classic gray/yellowish metallic Windows cone) */}
        <path d="M2 5H5L9 2V14L5 11H2V5Z" fill="#ffff99" stroke="#000000" strokeWidth="1" />
        <rect x="2" y="6" width="3" height="4" fill="#cccc00" />
        {/* Red X for mute */}
        <path d="M11 5L15 9M15 5L11 9" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="square" shapeRendering="auto" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Speaker body */}
      <path d="M2 5H5L9 2V14L5 11H2V5Z" fill="#ffff99" stroke="#000000" strokeWidth="1" />
      <rect x="2" y="6" width="3" height="4" fill="#cccc00" />
      {/* Sound waves in classic Windows green/cyan */}
      <path d="M11 6C12 7 12 9 11 10" stroke="#006600" strokeWidth="1" strokeLinecap="square" shapeRendering="auto" />
      <path d="M13 4C15 6 15 10 13 12" stroke="#008800" strokeWidth="1" strokeLinecap="square" shapeRendering="auto" />
    </svg>
  );
};

// Clipboard with notepad sheet and gold clip
export const RetroClipboardIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Board backing */}
    <rect x="2" y="2" width="12" height="13" fill="#804000" stroke="#000000" strokeWidth="1" />
    {/* Paper sheet */}
    <rect x="4" y="4" width="8" height="10" fill="#ffffcc" stroke="#000000" strokeWidth="1" />
    {/* Blue text lines */}
    <line x1="6" y1="7" x2="10" y2="7" stroke="#336699" strokeWidth="1" />
    <line x1="6" y1="9" x2="10" y2="9" stroke="#336699" strokeWidth="1" />
    <line x1="6" y1="11" x2="9" y2="11" stroke="#336699" strokeWidth="1" />
    {/* Metal clip */}
    <rect x="5" y="1" width="6" height="3" fill="#c0c0c0" stroke="#000000" strokeWidth="1" />
    <rect x="7" y="2" width="2" height="1" fill="#404040" />
  </svg>
);

// Two-way flip arrows
export const RetroFlipIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Top arrow pointing right */}
    <path d="M3 4H10V2L14 5L10 8V6H3V4Z" fill="#0066cc" stroke="#000000" strokeWidth="1" />
    {/* Bottom arrow pointing left */}
    <path d="M13 12H6V14L2 11L6 8V10H13V12Z" fill="#00aa44" stroke="#000000" strokeWidth="1" />
  </svg>
);

// Refresh arrows (circular loop)
export const RetroRefreshIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <path
      d="M13 8A5 5 0 1 0 12.3 11.2"
      stroke="#000080"
      strokeWidth="2"
      strokeLinecap="square"
      fill="none"
    />
    <polygon points="13,3 15,8 10,7" fill="#000080" stroke="#000000" strokeWidth="0.5" />
  </svg>
);

// Windows 98/2000 Analog Clock
export const RetroClockIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    {/* Clock bezel */}
    <circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
    <circle cx="8" cy="8" r="6" fill="#f8f8f8" stroke="#808080" strokeWidth="0.5" />
    {/* Center pin */}
    <circle cx="8" cy="8" r="1" fill="#000000" />
    {/* Hour and minute hands */}
    <line x1="8" y1="8" x2="8" y2="4" stroke="#000000" strokeWidth="1.2" strokeLinecap="square" />
    <line x1="8" y1="8" x2="11" y2="8" stroke="#000000" strokeWidth="1" strokeLinecap="square" />
    {/* Red second tick */}
    <line x1="8" y1="8" x2="6" y2="10" stroke="#cc0000" strokeWidth="0.8" />
  </svg>
);

// Retro Lightning Bolt (Rematch quick action)
export const RetroLightningIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    <polygon
      points="9,1 3,9 8,9 7,15 13,7 8,7"
      fill="#ffcc00"
      stroke="#000000"
      strokeWidth="1"
    />
  </svg>
);

// Retro Logoff / Exit Door
export const RetroDoorIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Door frame */}
    <rect x="7" y="2" width="7" height="12" fill="#804000" stroke="#000000" strokeWidth="1" />
    {/* Inner panel */}
    <rect x="9" y="4" width="4" height="4" fill="#a0522d" />
    <rect x="9" y="9" width="4" height="4" fill="#a0522d" />
    {/* Doorknob */}
    <rect x="8" y="8" width="1" height="1" fill="#ffff00" stroke="#000000" strokeWidth="0.5" />
    {/* Green runner arrow pointing out */}
    <path d="M1 9H6V11L9 8L6 5V7H1V9Z" fill="#00aa00" stroke="#000000" strokeWidth="1" />
  </svg>
);

// Retro Draw Handshake
export const RetroHandshakeIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Left arm (blue cuff) */}
    <rect x="1" y="7" width="3" height="4" fill="#000080" stroke="#000000" strokeWidth="1" />
    {/* Right arm (dark gray cuff) */}
    <rect x="12" y="5" width="3" height="4" fill="#404040" stroke="#000000" strokeWidth="1" />
    {/* Clasped hands */}
    <path
      d="M4 8L7 6L9 7L10 6L12 7V9L9 11L7 10L6 11L4 9Z"
      fill="#ffcc99"
      stroke="#000000"
      strokeWidth="1"
    />
    <line x1="8" y1="7" x2="8" y2="10" stroke="#b08050" strokeWidth="1" />
  </svg>
);

// Retro Resign / Surrender Flag
export const RetroFlagIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Flagpole */}
    <rect x="2" y="1" width="2" height="14" fill="#808080" stroke="#000000" strokeWidth="1" />
    {/* Pole finial (golden ball) */}
    <rect x="2" y="0" width="2" height="1" fill="#ffcc00" />
    {/* White flag with subtle gray folds */}
    <path d="M4 2H13L11 6L14 10H4V2Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />
    <line x1="8" y1="3" x2="8" y2="9" stroke="#d0d0d0" strokeWidth="1" />
  </svg>
);

// Windows Yellow Triangle Warning
export const RetroWarningIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Yellow triangle */}
    <polygon points="8,1 15,14 1,14" fill="#ffcc00" stroke="#000000" strokeWidth="1" />
    {/* Exclamation point */}
    <line x1="8" y1="5" x2="8" y2="9" stroke="#000000" strokeWidth="1.5" strokeLinecap="square" />
    <rect x="7.25" y="11" width="1.5" height="1.5" fill="#000000" />
  </svg>
);

// Retro Notification Bell
export const RetroBellIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    {/* Bell body */}
    <path
      d="M8 2C6 2 5 4 5 7V10L3 12H13L11 10V7C11 4 10 2 8 2Z"
      fill="#ffcc00"
      stroke="#000000"
      strokeWidth="1"
    />
    {/* Top hook */}
    <circle cx="8" cy="2" r="1" fill="none" stroke="#000000" strokeWidth="1" />
    {/* Clapper */}
    <circle cx="8" cy="13" r="1.5" fill="#996600" stroke="#000000" strokeWidth="1" />
  </svg>
);

// Retro MSN Chat Emoticon Speech Bubble
export const RetroChatBubbleIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Main speech bubble (MSN yellow/cream) */}
    <rect x="1" y="2" width="12" height="9" fill="#ffffea" stroke="#000000" strokeWidth="1" />
    <polygon points="3,11 6,11 3,14" fill="#ffffea" stroke="#000000" strokeWidth="1" />
    <line x1="3" y1="11" x2="6" y2="11" stroke="#ffffea" strokeWidth="1" />
    {/* Tiny MSN smiley inside the bubble */}
    <circle cx="5" cy="6" r="0.75" fill="#000000" shapeRendering="auto" />
    <circle cx="9" cy="6" r="0.75" fill="#000000" shapeRendering="auto" />
    <path d="M5 8Q7 9.5 9 8" stroke="#000000" strokeWidth="0.8" fill="none" shapeRendering="auto" />
  </svg>
);

// Retro Chess Pawn (fits title bars, modal icons, or status badges)
export const RetroPawnIcon: React.FC<IconProps> = ({ size = 16, className = '', color = 'w' }) => {
  const isWhite = color === 'w';
  const fillPrimary = isWhite ? '#ffffff' : '#181818';
  const fillHatch = isWhite ? '#b0b0b0' : '#404040';
  const strokeColor = '#000000';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Base */}
      <rect x="3" y="13" width="10" height="2" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
      <rect x="4" y="11" width="8" height="2" fill={fillHatch} stroke={strokeColor} strokeWidth="1" />
      {/* Stem */}
      <polygon points="5,11 6,7 10,7 11,11" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
      {/* Neck ring */}
      <rect x="5" y="6" width="6" height="1" fill={fillHatch} stroke={strokeColor} strokeWidth="1" />
      {/* Head */}
      <rect x="6" y="2" width="4" height="4" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
      <rect x="7" y="1" width="2" height="1" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
    </svg>
  );
};

// Retro Chess Knight (matching style of RetroPawnIcon: pixel-crisp, white/hatch fill, black stroke)
export const RetroKnightIcon: React.FC<IconProps> = ({ size = 16, className = '', color = 'w' }) => {
  const isWhite = color === 'w';
  const fillPrimary = isWhite ? '#ffffff' : '#181818';
  const fillHatch = isWhite ? '#b0b0b0' : '#404040';
  const strokeColor = '#000000';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Base */}
      <rect x="2" y="13" width="12" height="2" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
      <rect x="3" y="11" width="10" height="2" fill={fillHatch} stroke={strokeColor} strokeWidth="1" />
      {/* Mane back shadow */}
      <rect x="3" y="4" width="3" height="7" fill={fillHatch} stroke={strokeColor} strokeWidth="1" />
      {/* Crest & ear */}
      <polygon points="5,1 7,1 8,3 5,3" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
      {/* Head & neck body */}
      <polygon points="5,3 10,3 12,5 12,8 9,8 9,11 5,11" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
      {/* Muzzle */}
      <rect x="10" y="5" width="4" height="3" fill={fillPrimary} stroke={strokeColor} strokeWidth="1" />
      <rect x="11" y="7" width="3" height="1" fill={strokeColor} />
      {/* Eye */}
      <rect x="8" y="4" width="1.5" height="1.5" fill={strokeColor} />
    </svg>
  );
};

// Retro New Game / Star sparkle icon
export const RetroNewGameIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Mini chessboard board grid in 3D */}
    <rect x="2" y="3" width="11" height="11" fill="#ffffea" stroke="#000000" strokeWidth="1" />
    <rect x="2" y="3" width="5.5" height="5.5" fill="#316ac5" />
    <rect x="7.5" y="8.5" width="5.5" height="5.5" fill="#316ac5" />
    {/* Retro golden star in top corner */}
    <polygon points="12,1 13,3 15,3 13.5,4.5 14,6.5 12,5 10,6.5 10.5,4.5 9,3 11,3" fill="#ffcc00" stroke="#000000" strokeWidth="0.5" shapeRendering="auto" />
  </svg>
);

// Retro Green Checkmark
export const RetroCheckIcon: React.FC<IconProps> = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    shapeRendering="crispEdges"
  >
    <polyline
      points="2,9 6,13 14,3"
      stroke="#008000"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="auto"
    />
  </svg>
);

// Custom 3D Isometric Create Lobby Icon matching ChessDice (viewBox 0 0 45 45)
export const ChessCreateLobbyIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))' }}
  >
    {/* Base 3D isometric checkered tile platform */}
    {/* Left Bevel */}
    <polygon points="6.5,23 22.5,31.5 22.5,37 6.5,28.5" fill="#6a3500" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
    {/* Right Bevel */}
    <polygon points="22.5,31.5 38.5,23 38.5,28.5 22.5,37" fill="#422000" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
    {/* Top Face checkered surface: 4 isometric tiles */}
    <polygon points="22.5,23 14.5,18.7 6.5,23 14.5,27.3" fill="#ffffff" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
    <polygon points="22.5,14.5 30.5,18.7 22.5,23 14.5,18.7" fill="#181818" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
    <polygon points="30.5,18.7 38.5,23 30.5,27.3 22.5,23" fill="#f5f5f5" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
    <polygon points="22.5,23 30.5,27.3 22.5,31.5 14.5,27.3" fill="#181818" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
    {/* Hatch lines matching ChessPiece & ChessDice */}
    <line x1="9" y1="23.5" x2="13" y2="26" stroke="#b0b0b0" strokeWidth="1" />
    <line x1="24" y1="16.5" x2="28" y2="19" stroke="#404040" strokeWidth="1" />
    {/* Dynamic Green & Gold Play chevron beacon standing on board */}
    <polygon points="17,10 32,18 17,26 20,18" fill="#00bb22" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
    <polygon points="18,12 28,18 18,24 20,18" fill="#55ff66" opacity="0.6" />
    {/* Golden finial star */}
    <circle cx="17" cy="8" r="2.5" fill="#ffcc00" stroke="#000000" strokeWidth="1.2" />
  </svg>
);

// Custom 3D Isometric Return/Exit to Lobby Doorway matching ChessDice (viewBox 0 0 45 45)
export const ChessReturnLobbyIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))' }}
  >
    {/* Isometric foyer floor */}
    <polygon points="9,27 22.5,34 36,27 22.5,20" fill="#f5f5f5" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
    <polygon points="22.5,27 29,30.5 22.5,34 16,30.5" fill="#181818" stroke="#000000" strokeWidth="1.2" />
    {/* 3D Windows Archway Portal */}
    <path d="M14 29V10L31 10V29" stroke="#000000" strokeWidth="3.6" strokeLinecap="square" strokeLinejoin="round" />
    <path d="M14 29V10L31 10V29" stroke="#d4d0c8" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="round" />
    {/* Open door panel swung inward */}
    <polygon points="14,29 21,26 21,12 14,10" fill="#8b4513" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="19.5" cy="19.5" r="1.2" fill="#ffcc00" stroke="#000000" strokeWidth="0.8" />
    {/* Emerald directional runner arrow pointing home into lobby */}
    <path d="M6 31H18V34L24 29.5L18 25V28H6V31Z" fill="#00bb22" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// Custom 3D Isometric Dual Rematch matching ChessDice (viewBox 0 0 45 45)
export const ChessRematchIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))' }}
  >
    {/* Top clockwise arrow: White piece motif (#ffffff with #b0b0b0 hatch, #000000 stroke) */}
    <path
      d="M11 20C11 13.5 16 8.5 22.5 8.5C27.5 8.5 32 11.5 33.8 16"
      stroke="#000000"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M11 20C11 13.5 16 8.5 22.5 8.5C27.5 8.5 32 11.5 33.8 16"
      stroke="#ffffff"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <polygon points="30,17 36.5,17.5 34.5,11" fill="#ffffff" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
    <line x1="17" y1="12" x2="22" y2="9.5" stroke="#b0b0b0" strokeWidth="1.2" />

    {/* Bottom counter-clockwise arrow: Black piece motif (#181818 with #404040 hatch, #000000 stroke) */}
    <path
      d="M34 25C34 31.5 29 36.5 22.5 36.5C17.5 36.5 13 33.5 11.2 29"
      stroke="#000000"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M34 25C34 31.5 29 36.5 22.5 36.5C17.5 36.5 13 33.5 11.2 29"
      stroke="#181818"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <polygon points="15,28 8.5,27.5 10.5,34" fill="#181818" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
    <line x1="28" y1="33" x2="23" y2="35.5" stroke="#404040" strokeWidth="1.2" />

    {/* Center 50/50 balance point */}
    <circle cx="22.5" cy="22.5" r="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1.4" />
    <path d="M22.5 19A3.5 3.5 0 0 1 22.5 26Z" fill="#181818" />
  </svg>
);

// Custom 3D Isometric Accept Rematch Lightning matching ChessDice (viewBox 0 0 45 45)
export const ChessAcceptRematchIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))' }}
  >
    <polygon
      points="24,4 10,22 22,22 19,41 35,19 23,19"
      fill="#ffcc00"
      stroke="#000000"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="22.5,7 13,20.5 22,20.5"
      fill="#ffffff"
      opacity="0.65"
    />
    <line x1="17" y1="29" x2="27" y2="19" stroke="#ff8800" strokeWidth="1.5" />
  </svg>
);

// Custom 3D Isometric Clipboard matching ChessDice & chess piece palette (viewBox 0 0 45 45)
export const ChessInviteClipboardIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))' }}
  >
    {/* Wooden backing board */}
    <polygon points="11,7 34,7 37,38 14,38" fill="#6a3500" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
    <polygon points="8,10 11,7 14,38 11,41" fill="#422000" stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />

    {/* Ivory paper sheet */}
    <polygon points="14,11 31,11 34,35 17,35" fill="#ffffff" stroke="#000000" strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="18" y1="18" x2="30" y2="18" stroke="#181818" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="18" y1="23" x2="28" y2="23" stroke="#b0b0b0" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="18" y1="28" x2="25" y2="28" stroke="#b0b0b0" strokeWidth="1.4" strokeLinecap="round" />

    {/* Chess pawn seal stamp */}
    <circle cx="27" cy="27" r="2.5" fill="#181818" />

    {/* Metallic golden clip */}
    <rect x="18" y="4" width="10" height="6" rx="1.5" fill="#ffcc00" stroke="#000000" strokeWidth="1.6" />
    <circle cx="23" cy="6.5" r="1.2" fill="#422000" />
  </svg>
);

// Custom 3D Isometric Board Flip matching ChessDice (viewBox 0 0 45 45)
export const ChessFlipBoardIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))' }}
  >
    {/* Tilted 3D dual-color chessboard tile */}
    {/* Left Face - White piece side */}
    <polygon
      points="8,21 22.5,14 22.5,31 8,27"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <line x1="11" y1="25" x2="19" y2="20" stroke="#b0b0b0" strokeWidth="1.4" />

    {/* Right Face - Black piece side */}
    <polygon
      points="22.5,14 37,21 37,27 22.5,31"
      fill="#181818"
      stroke="#000000"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <line x1="25" y1="20" x2="33" y2="25" stroke="#404040" strokeWidth="1.4" />

    {/* Top revolving orbit arrow */}
    <path
      d="M13 10C18 5 27 5 32 10"
      stroke="#000000"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    <path
      d="M13 10C18 5 27 5 32 10"
      stroke="#316ac5"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <polygon points="30,7 36,10 32,14" fill="#316ac5" stroke="#000000" strokeWidth="1" strokeLinejoin="round" />

    {/* Bottom revolving orbit arrow */}
    <path
      d="M32 35C27 40 18 40 13 35"
      stroke="#000000"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    <path
      d="M32 35C27 40 18 40 13 35"
      stroke="#00aa44"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <polygon points="15,38 9,35 13,31" fill="#00aa44" stroke="#000000" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

// Custom 3D Isometric Chess Bot Head matching ChessDice & chess piece palette (viewBox 0 0 45 45)
export const ChessBotIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.25))' }}
  >
    {/* Top Crown / Antenna Finial */}
    <line x1="22.5" y1="3" x2="22.5" y2="8.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <circle cx="22.5" cy="3.5" r="2.3" fill="#ffcc00" stroke="#000000" strokeWidth="1.4" />

    {/* Isometric Cube Head - Top Face (#ffffff) */}
    <polygon
      points="22.5,7.5 37.5,15 22.5,22.5 7.5,15"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Isometric Cube Head - Left Face (#f5f5f5 CRT screen bezel) */}
    <polygon
      points="7.5,15 22.5,22.5 22.5,39.5 7.5,32"
      fill="#f5f5f5"
      stroke="#000000"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Isometric Cube Head - Right Face (#181818 dark piece motif) */}
    <polygon
      points="22.5,22.5 37.5,15 37.5,32 22.5,39.5"
      fill="#181818"
      stroke="#000000"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />

    {/* Subtle chess piece hatch lines */}
    <line x1="26" y1="34" x2="34" y2="29" stroke="#404040" strokeWidth="1.2" />
    <line x1="28" y1="30" x2="35" y2="26" stroke="#404040" strokeWidth="1.2" />

    {/* Left Face Visor Screen (CRT dark green/blue with pixel eyes) */}
    <polygon
      points="10,18.5 20,23.5 20,31 10,26"
      fill="#0a246a"
      stroke="#000000"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Pixelated Bot Eyes */}
    <rect x="11.8" y="21.5" width="2.2" height="2.4" fill="#33ff33" />
    <rect x="16.2" y="23.7" width="2.2" height="2.4" fill="#33ff33" />

    {/* Speaker grille / mouth line on lower left face */}
    <line x1="11" y1="30.5" x2="19" y2="34.5" stroke="#000000" strokeWidth="1.6" strokeLinecap="round" />

    {/* Right side status LED */}
    <circle cx="30" cy="22" r="2" fill="#ffcc00" stroke="#000000" strokeWidth="1" />
  </svg>
);

