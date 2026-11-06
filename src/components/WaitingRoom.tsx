import React, { useState } from 'react';
import { RoomState } from '../types/chess';
import { ChessPiece } from './ChessPiece';
import { RetroCheckIcon } from './RetroIcons';
import { playWindowsClick, playWindowsNotify } from '../utils/audio';

interface WaitingRoomProps {
  state: RoomState;
  userRole: 'white' | 'black' | 'spectator';
  playerId: string;
  onLeave: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ state, userRole, playerId, onLeave }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${state.code}`
    : `/?room=${state.code}`;

  const handleCancelAndLeave = async () => {
    playWindowsClick();
    try {
      await fetch(`/api/rooms/${state.code}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: playerId }),
      });
    } catch (e) {
      // Ignore network errors on cancel
    }
    onLeave();
  };

  const copyCode = async () => {
    try {
      playWindowsClick();
      await navigator.clipboard.writeText(state.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = async () => {
    try {
      playWindowsNotify();
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const openSecondTab = () => {
    playWindowsClick();
    window.open(inviteUrl, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Windows 2000 Window Frame */}
      <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-3 select-none">
          <div className="flex items-center gap-1.5">
            <span>Matt's Chess - Waiting for Opponent [Lobby {state.code}]</span>
          </div>
          <button
            onClick={handleCancelAndLeave}
            className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="p-4 text-center">
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ece9d8] border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] text-xs font-bold text-[#000080] mb-4">
            <span className="inline-block w-2.5 h-2.5 bg-green-500 border border-black animate-ping" />
            <span>Hosting Lobby... Listening for connection</span>
          </div>

          <h2 className="text-base font-bold text-black mb-1">
            Give this Room Code to your friend:
          </h2>
          <p className="text-xs text-[#505050] mb-4">
            As soon as they enter the code or click the invite link, the match starts instantly!
          </p>

          {/* Sunken Code Display */}
          <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-4 mb-4">
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-[#000080]">
              {state.code}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={copyCode}
                className="px-4 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5"
              >
                {copiedCode ? (
                  <>
                    <RetroCheckIcon size={12} />
                    <span>Copied Code!</span>
                  </>
                ) : (
                  'Copy Code'
                )}
              </button>
              <button
                onClick={copyLink}
                className="px-4 py-1.5 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] inline-flex items-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <RetroCheckIcon size={12} />
                    <span>Copied Link!</span>
                  </>
                ) : (
                  'Copy Invite Link'
                )}
              </button>
            </div>
          </div>

          {/* Match Settings Table */}
          <div className="grid grid-cols-2 gap-2 text-left mb-4 text-xs">
            <div className="bg-[#ece9d8] border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2">
              <div className="text-[10px] text-[#606060] font-bold">Time Control</div>
              <div className="font-bold text-black">{state.timeControl.name}</div>
            </div>
            <div className="bg-[#ece9d8] border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2 flex items-center gap-2">
              <div className="w-6 h-6">
                <ChessPiece type="k" color={userRole === 'black' ? 'b' : 'w'} />
              </div>
              <div>
                <div className="text-[10px] text-[#606060] font-bold">Your Side</div>
                <div className="font-bold text-black">
                  {userRole === 'white' ? 'White (Move 1st)' : userRole === 'black' ? 'Black' : 'Spectator'}
                </div>
              </div>
            </div>
          </div>

          {/* Test Local Option */}
          <div className="bg-[#ece9d8] border border-[#808080] p-2 flex items-center justify-between mb-4">
            <div className="text-left text-xs">
              <div className="font-bold text-black">Testing locally on this computer?</div>
              <div className="text-[11px] text-[#505050]">Open opponent view in a 2nd browser tab</div>
            </div>
            <button
              onClick={openSecondTab}
              className="px-3 py-1 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
            >
              Open Tab
            </button>
          </div>

          <div className="flex justify-start">
            <button
              onClick={handleCancelAndLeave}
              className="px-4 py-1 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
            >
              ← Cancel & Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
