import React, { useState, useEffect } from 'react';
import { HomeLobby } from './components/HomeLobby';
import { MultiplayerGame } from './components/MultiplayerGame';
import { SoloGame } from './components/SoloGame';
import { TimeControl } from './types/chess';
import {
  isSoundEnabled,
  setSoundEnabled,
  playWindowsClick,
  playWindowsStop,
  playWindowsNotify,
} from './utils/audio';
import { RetroSpeakerIcon, RetroPawnIcon } from './components/RetroIcons';

function getOrCreatePlayerId(): string {
  // Use sessionStorage so multiple tabs on the same computer have distinct player IDs
  let id = sessionStorage.getItem('matts_chess_player_id');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem('matts_chess_player_id', id);
  }
  return id;
}

function getSavedPlayerName(): string {
  const saved = sessionStorage.getItem('matts_chess_player_name');
  if (saved) return saved;
  const localSaved = localStorage.getItem('matts_chess_player_name');
  if (localSaved) {
    sessionStorage.setItem('matts_chess_player_name', localSaved);
    return localSaved;
  }
  const defaultName = 'Guest';
  sessionStorage.setItem('matts_chess_player_name', defaultName);
  return defaultName;
}

export default function App() {
  const [playerId] = useState<string>(() => getOrCreatePlayerId());
  const [playerName, setPlayerName] = useState<string>(() => getSavedPlayerName());
  const [currentView, setCurrentView] = useState<'lobby' | 'multiplayer' | 'solo'>('lobby');
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');
  const [preferredColor, setPreferredColor] = useState<'w' | 'b' | 'random'>('random');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [systemTime, setSystemTime] = useState('');

  // Clock in system tray
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Direct URL parameter check (?room=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      const code = roomParam.trim().toUpperCase();
      setCurrentRoomCode(code);
      setCurrentView('multiplayer');
    }
  }, []);

  const handleUpdateUserName = (newName: string) => {
    setPlayerName(newName);
    if (newName.trim()) {
      localStorage.setItem('matts_chess_player_name', newName.trim());
      sessionStorage.setItem('matts_chess_player_name', newName.trim());
    }
  };

  const handleCreateRoom = async (params: {
    preferredColor: 'w' | 'b' | 'random';
    timeControl: TimeControl;
    isPublic: boolean;
  }) => {
    setIsCreatingRoom(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: playerId,
          hostName: playerName.trim() || 'Guest',
          preferredColor: params.preferredColor,
          timeControl: params.timeControl,
          isPublic: params.isPublic,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create room');
      }

      const data = await res.json();
      setCurrentRoomCode(data.roomCode);
      setPreferredColor(params.preferredColor);
      setCurrentView('multiplayer');

      const url = new URL(window.location.href);
      url.searchParams.set('room', data.roomCode);
      window.history.pushState({}, '', url.toString());
    } catch (e: any) {
      console.error(e);
      playWindowsStop();
      alert(e.message || 'Could not create room');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (!formatted) return;

    setCurrentRoomCode(formatted);
    setPreferredColor('random');
    setCurrentView('multiplayer');

    const url = new URL(window.location.href);
    url.searchParams.set('room', formatted);
    window.history.pushState({}, '', url.toString());
  };

  const handleLeaveMatch = () => {
    playWindowsClick();
    setCurrentView('lobby');
    setCurrentRoomCode('');

    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());
  };

  const toggleSound = () => {
    playWindowsClick();
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  return (
    <div
      onClick={() => {
        if (showStartMenu) setShowStartMenu(false);
      }}
      className="min-h-screen bg-[#008080] flex flex-col justify-between font-sans text-black relative select-none pb-9"
    >
      {/* Desktop Background / Main App Content */}
      <main className="flex-1 flex flex-col justify-center py-2">
        {currentView === 'lobby' && (
          <HomeLobby
            userName={playerName}
            onUpdateUserName={handleUpdateUserName}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartSoloPlay={() => {
              playWindowsClick();
              setCurrentView('solo');
            }}
            isCreating={isCreatingRoom}
          />
        )}

        {currentView === 'multiplayer' && (
          <MultiplayerGame
            roomCode={currentRoomCode}
            playerId={playerId}
            playerName={playerName.trim() || 'Guest'}
            preferredColor={preferredColor}
            onLeave={handleLeaveMatch}
          />
        )}

        {currentView === 'solo' && (
          <SoloGame onBack={() => setCurrentView('lobby')} />
        )}
      </main>

      {/* Classic Windows 2000 Start Menu Popup */}
      {showStartMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-8 left-0 z-50 bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-[3px_3px_0px_rgba(0,0,0,0.5)] flex select-none"
        >
          {/* Vertical banner */}
          <div className="bg-gradient-to-t from-[#000080] to-[#104ba0] text-white font-bold text-sm tracking-widest px-2 py-6 flex items-end">
            <span
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              className="text-white text-xs font-black tracking-widest uppercase"
            >
              Matt's Chess 2000
            </span>
          </div>

          {/* Menu items */}
          <div className="p-1 w-52 flex flex-col text-xs font-sans">
            <button
              onClick={() => {
                setShowStartMenu(false);
                handleLeaveMatch();
              }}
              className="px-3 py-2 text-left hover:bg-[#0a246a] hover:text-white flex items-center cursor-pointer font-bold"
            >
              Lobby & Home
            </button>
            <button
              onClick={() => {
                setShowStartMenu(false);
                setCurrentView('solo');
              }}
              className="px-3 py-2 text-left hover:bg-[#0a246a] hover:text-white flex items-center cursor-pointer"
            >
              Pass & Play (Local)
            </button>
            <div className="h-[1px] bg-[#808080] my-1 border-b border-white" />
            <a
              href="/matts-chess.zip"
              download="matts-chess.zip"
              onClick={() => {
                setShowStartMenu(false);
                playWindowsNotify();
              }}
              className="px-3 py-1.5 text-left hover:bg-[#0a246a] hover:text-white flex items-center cursor-pointer no-underline text-blue-900 font-semibold text-xs"
            >
              Download Full Project Zip...
            </a>
            <a
              href="/updates-only.zip"
              download="updates-only.zip"
              onClick={() => {
                setShowStartMenu(false);
                playWindowsNotify();
              }}
              className="px-3 py-1.5 text-left hover:bg-[#0a246a] hover:text-white flex items-center cursor-pointer no-underline text-emerald-800 font-semibold text-xs"
            >
              Download Changed Files Only (for GitHub Web)...
            </a>
            <button
              onClick={() => {
                setShowStartMenu(false);
                setShowAboutModal(true);
              }}
              className="px-3 py-2 text-left hover:bg-[#0a246a] hover:text-white flex items-center cursor-pointer"
            >
              About Matt's Chess...
            </button>
          </div>
        </div>
      )}

      {/* Windows 2000 Taskbar */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-[#d4d0c8] border-t-2 border-[#ffffff] flex items-center justify-between px-1 z-40 shadow-[0_-1px_0px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-1.5 h-full py-0.5">
          {/* Menu Button (previously Start) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playWindowsClick();
              setShowStartMenu(!showStartMenu);
            }}
            className={`h-full px-3 font-sans font-black text-xs flex items-center border-2 ${
              showStartMenu
                ? 'border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8]'
                : 'border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] bg-[#d4d0c8] hover:bg-[#e4e0d8]'
            } active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer`}
          >
            <span className="tracking-wide">Menu</span>
          </button>

          {/* Running window button */}
          <div className="h-full px-3 bg-[#ece9d8] border-2 border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff] flex items-center gap-1.5 text-xs font-bold text-black max-w-[200px] truncate shadow-inner">
            <span className="truncate">
              {currentView === 'multiplayer'
                ? `Matt's Chess [Room: ${currentRoomCode}]`
                : currentView === 'solo'
                ? "Matt's Chess [Solo]"
                : "Matt's Chess [Lobby]"}
            </span>
          </div>
        </div>

        {/* System Tray */}
        <div className="h-full py-0.5 flex items-center">
          <div className="h-full px-2 bg-[#d4d0c8] border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] flex items-center gap-2.5 text-[11px] font-mono text-black">
            {/* Mute toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Click to Mute' : 'Click to Unmute'}
              className="hover:scale-110 active:scale-95 transition cursor-pointer flex items-center justify-center"
            >
              <RetroSpeakerIcon muted={!soundOn} size={15} />
            </button>

            {/* System Clock */}
            <span className="font-bold tracking-tight">{systemTime || '12:00 PM'}</span>
          </div>
        </div>
      </footer>



      {/* About Matt's Chess Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] max-w-sm w-full select-none">
            <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-1 flex items-center justify-between mb-2">
              <span>About Matt's Chess</span>
              <button
                onClick={() => {
                  playWindowsClick();
                  setShowAboutModal(false);
                }}
                className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center">
                  <RetroPawnIcon size={32} color="w" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Matt's Chess</h3>
                  <p className="text-[11px] text-[#505050]">Version 1.02 (Build 2004)</p>
                </div>
              </div>

              <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2 text-xs text-black mb-3 space-y-1">
                <p>hi im matt and i made chess website with google</p>
                <p className="text-[10px] text-[#606060] pt-1">
                  Licensed to: {playerName.trim() || 'Guest'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    playWindowsClick();
                    setShowAboutModal(false);
                  }}
                  className="px-5 py-1 bg-[#d4d0c8] hover:bg-white text-black font-bold text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
