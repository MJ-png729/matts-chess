import React, { useState } from 'react';
import { playWindowsClick, playWindowsNotify } from '../utils/audio';

interface ShareModalProps {
  roomCode: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ roomCode, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : `/?room=${roomCode}`;

  const copyCode = async () => {
    try {
      playWindowsClick();
      await navigator.clipboard.writeText(roomCode);
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
      <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-md w-full select-none">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span>Invite Friend - Matt's Chess</span>
          </div>
          <button
            onClick={() => {
              playWindowsClick();
              onClose();
            }}
            className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-3">
          <p className="text-xs text-black mb-3">
            Send this 6-character code or the direct game link to your friend to begin playing:
          </p>

          {/* Code Box */}
          <div className="bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-3 text-center mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#505050] mb-1">
              Match Lobby Code
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-black tracking-widest text-[#000080] bg-white px-3 py-0.5 border border-[#808080]">
                {roomCode}
              </span>
              <button
                onClick={copyCode}
                className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
              >
                {copiedCode ? '✓ Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Direct Link */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-black mb-1">Direct Game Link:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-2 py-1 text-xs font-mono text-black select-all"
              />
              <button
                onClick={copyLink}
                className="px-3 py-1 bg-[#d4d0c8] hover:bg-white text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] shrink-0"
              >
                {copiedLink ? '✓ Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Test Option */}
          <div className="bg-[#ece9d8] border border-[#808080] p-2 flex items-center justify-between mb-4">
            <span className="text-[11px] text-[#202020]">
              Want to test two players on this PC?
            </span>
            <button
              onClick={openSecondTab}
              className="px-2 py-0.5 bg-[#d4d0c8] hover:bg-white text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
            >
              Open 2nd Tab
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                playWindowsClick();
                onClose();
              }}
              className="px-5 py-1 bg-[#d4d0c8] hover:bg-white text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
