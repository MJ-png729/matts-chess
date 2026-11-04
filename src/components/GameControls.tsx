import React, { useState } from 'react';
import { GameStatus, PieceColor } from '../types/chess';
import { isSoundEnabled, setSoundEnabled, playWindowsClick, playWindowsChord, playWindowsStop } from '../utils/audio';

interface GameControlsProps {
  status: GameStatus;
  turn: PieceColor;
  userRole: 'white' | 'black' | 'spectator';
  drawOffer: PieceColor | null;
  rematchRequestedBy: string | null;
  currentUserId: string;
  onResign: () => void;
  onOfferDraw: () => void;
  onRespondDraw: (accept: boolean) => void;
  onFlipBoard: () => void;
  onRequestRematch: () => void;
  onLeaveRoom: () => void;
  onShareRoom: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  status,
  userRole,
  drawOffer,
  rematchRequestedBy,
  currentUserId,
  onResign,
  onOfferDraw,
  onRespondDraw,
  onFlipBoard,
  onRequestRematch,
  onLeaveRoom,
  onShareRoom,
}) => {
  const [showResignModal, setShowResignModal] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const isPlayer = userRole === 'white' || userRole === 'black';
  const playerColor: PieceColor | null = userRole === 'white' ? 'w' : userRole === 'black' ? 'b' : null;
  const isGameActive = status === 'in_progress';
  const isGameOver = status !== 'waiting' && status !== 'in_progress';

  const opponentOfferedDraw = isPlayer && drawOffer !== null && drawOffer !== playerColor;
  const userOfferedDraw = isPlayer && drawOffer !== null && drawOffer === playerColor;

  const handleToggleSound = () => {
    playWindowsClick();
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  return (
    <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-2 flex flex-wrap items-center justify-between gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
      {/* Draw Offer Notification */}
      {opponentOfferedDraw && isGameActive && (
        <div className="w-full bg-[#ffffe0] border-2 border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff] p-2 flex items-center justify-between text-xs text-black">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#000080]">🔔 Opponent offered a Draw!</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playWindowsClick();
                onRespondDraw(true);
              }}
              className="px-2.5 py-0.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
            >
              Accept
            </button>
            <button
              onClick={() => {
                playWindowsClick();
                onRespondDraw(false);
              }}
              className="px-2.5 py-0.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Control Action Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => {
            playWindowsClick();
            onFlipBoard();
          }}
          className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
        >
          🔄 Flip Board
        </button>

        <button
          onClick={handleToggleSound}
          className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
        >
          {soundOn ? '🔊 Audio: ON' : '🔇 Audio: OFF'}
        </button>

        <button
          onClick={() => {
            playWindowsClick();
            onShareRoom();
          }}
          className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
        >
          📋 Invite Link
        </button>
      </div>

      {/* Active gameplay actions */}
      {isPlayer && isGameActive && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playWindowsClick();
              onOfferDraw();
            }}
            disabled={userOfferedDraw}
            className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] disabled:opacity-50 text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
          >
            {userOfferedDraw ? 'Draw Sent' : '🤝 Offer Draw'}
          </button>

          <button
            onClick={() => {
              playWindowsChord();
              setShowResignModal(true);
            }}
            className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-[#990000] font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
          >
            🏳️ Resign
          </button>
        </div>
      )}

      {/* Post game actions */}
      {isGameOver && (
        <div className="flex items-center gap-1.5">
          {isPlayer && (
            <button
              onClick={() => {
                playWindowsClick();
                onRequestRematch();
              }}
              className="px-3 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
            >
              {rematchRequestedBy && rematchRequestedBy !== currentUserId
                ? '⚡ Accept Rematch'
                : rematchRequestedBy === currentUserId
                ? 'Rematch Requested...'
                : '🔁 Play Rematch'}
            </button>
          )}

          <button
            onClick={() => {
              playWindowsClick();
              onLeaveRoom();
            }}
            className="px-3 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-sans text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
          >
            🚪 Return to Lobby
          </button>
        </div>
      )}

      {/* Classic Windows Resign Confirm Dialog */}
      {showResignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-sm w-full">
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
              <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center font-bold text-lg text-black shrink-0">
                !
              </div>
              <div>
                <h4 className="font-bold text-xs text-black mb-1">
                  Are you sure you want to resign the game?
                </h4>
                <p className="text-[11px] text-[#404040]">
                  This will concede the match to your opponent immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-2 pb-2">
              <button
                onClick={() => {
                  playWindowsClick();
                  setShowResignModal(false);
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  playWindowsStop();
                  setShowResignModal(false);
                  onResign();
                }}
                className="px-4 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-[#990000] text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
              >
                Yes, Resign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
