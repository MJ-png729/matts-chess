import React, { useState, useEffect } from 'react';
import { TimeControl, PublicLobbySummary, BotDifficulty, BotSettings } from '../types/chess';
import { BOT_DIFFICULTY_CONFIG } from '../utils/chessBotEngine';
import { ChessPiece } from './ChessPiece';
import { ChessDice } from './ChessDice';
import {
  RetroPawnIcon,
  RetroWarningIcon,
  RetroRefreshIcon,
  ChessCreateLobbyIcon,
  ChessBotIcon,
} from './RetroIcons';
import { playWindowsClick, playWindowsStop, playWindowsStartup } from '../utils/audio';

interface HomeLobbyProps {
  userName: string;
  onUpdateUserName: (name: string) => void;
  onCreateRoom: (params: {
    preferredColor: 'w' | 'b' | 'random';
    timeControl: TimeControl;
    isPublic: boolean;
  }) => void;
  onJoinRoom: (code: string) => void;
  onStartSoloPlay: () => void;
  onStartBotMatch: (settings: BotSettings) => void;
  initialCode?: string;
  isCreating?: boolean;
}

const TIME_CONTROLS: TimeControl[] = [
  { initialMinutes: 1, incrementSeconds: 0, name: '1m Bullet' },
  { initialMinutes: 3, incrementSeconds: 2, name: '3+2 Blitz' },
  { initialMinutes: 5, incrementSeconds: 3, name: '5+3 Blitz' },
  { initialMinutes: 10, incrementSeconds: 0, name: '10m Rapid' },
  { initialMinutes: 15, incrementSeconds: 10, name: '15+10 Classic' },
  { initialMinutes: 0, incrementSeconds: 0, name: 'Casual (No Clock)' },
];

const BOT_DIFFICULTIES: BotDifficulty[] = ['easy', 'medium', 'hard', 'grandmaster'];

export const HomeLobby: React.FC<HomeLobbyProps> = ({
  userName,
  onUpdateUserName,
  onCreateRoom,
  onJoinRoom,
  onStartSoloPlay,
  onStartBotMatch,
  initialCode = '',
  isCreating = false,
}) => {
  const [joinCode, setJoinCode] = useState(initialCode);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(TIME_CONTROLS[3]);
  const [preferredColor, setPreferredColor] = useState<'w' | 'b' | 'random'>('random');
  const [isPublic, setIsPublic] = useState(true);
  const [publicRooms, setPublicRooms] = useState<PublicLobbySummary[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chess Bot Configuration State
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [botColor, setBotColor] = useState<'w' | 'b' | 'random'>('random');
  const [botTimeControl, setBotTimeControl] = useState<TimeControl>(TIME_CONTROLS[5]);
  const [botMessages, setBotMessages] = useState<boolean>(true);
  const [botTrashTalk, setBotTrashTalk] = useState<boolean>(false);

  const fetchPublicRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setPublicRooms(data.rooms || []);
      }
    } catch (e) {
      // Quietly ignore transient dev server refresh hiccups
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchPublicRooms();
    const interval = setInterval(fetchPublicRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      playWindowsStop();
      setErrorMsg('Error: Please enter a 6-character room code.');
      return;
    }
    setErrorMsg(null);
    playWindowsClick();
    onJoinRoom(code);
  };

  const handleCreateClick = () => {
    playWindowsStartup();
    onCreateRoom({
      timeControl: selectedTimeControl,
      preferredColor,
      isPublic,
    });
  };

  const handleStartBotClick = () => {
    playWindowsStartup();
    onStartBotMatch({
      difficulty: botDifficulty,
      preferredColor: botColor,
      timeControl: botTimeControl,
      botMessages,
      botTrashTalk,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Windows 2000 Main Application Window */}
      <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-[3px_3px_0px_rgba(0,0,0,0.6)] select-none">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] via-[#104ba0] to-[#a6caf0] text-white font-bold text-xs sm:text-sm px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RetroPawnIcon size={16} color="w" />
            <span className="tracking-wide font-sans">Matt's Chess 2000 - Network Multiplayer Edition</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] leading-none flex items-center justify-center">
              _
            </button>
            <button className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] leading-none flex items-center justify-center">
              □
            </button>
            <button className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] leading-none flex items-center justify-center">
              ×
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center gap-3 px-2 py-0.5 border-b border-[#808080] text-xs text-black font-sans bg-[#d4d0c8]">
          <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">F</span>ile
          </span>
          <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">G</span>ame
          </span>
          <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">L</span>obby
          </span>
          <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">O</span>ptions
          </span>
          <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">H</span>elp
          </span>
        </div>

        {/* User Nickname Banner */}
        <div className="p-2 border-b border-[#808080] bg-[#ece9d8] flex items-center justify-between text-xs text-black">
          <div className="flex items-center gap-2">
            <span className="font-bold">Player Name:</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => onUpdateUserName(e.target.value)}
              maxLength={20}
              placeholder="Guest"
              className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-2 py-0.5 text-xs text-black font-bold focus:outline-hidden w-40"
            />
          </div>
          <span className="text-[11px] text-[#505050] hidden sm:inline">
            Direct IP / Lobby Code Protocol
          </span>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="m-2 p-2 bg-[#ffffe0] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] text-xs text-[#990000] font-bold flex items-center gap-2">
            <RetroWarningIcon size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-3 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* 1. Host Game Group Box */}
            <div className="border border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-3 relative bg-[#ece9d8] flex flex-col justify-between">
              <span className="absolute -top-2.5 left-3 bg-[#ece9d8] px-1 text-xs font-bold text-black font-sans">
                Host a Match
              </span>

              <div>
                {/* Time Control */}
                <div className="mb-3 mt-1">
                  <label className="block text-[11px] font-bold text-[#303030] mb-1">
                    Time Control Setting:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TIME_CONTROLS.map((tc) => {
                      const isSelected = selectedTimeControl.name === tc.name;
                      return (
                        <button
                          key={tc.name}
                          type="button"
                          onClick={() => {
                            playWindowsClick();
                            setSelectedTimeControl(tc);
                          }}
                          className={`px-2 py-1 text-left text-xs font-sans font-bold border-2 ${
                            isSelected
                              ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                              : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                          }`}
                        >
                          {tc.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Play As */}
                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-[#303030] mb-1">
                    Play as Side:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        playWindowsClick();
                        setPreferredColor('w');
                      }}
                      className={`p-1.5 text-xs font-bold font-sans border-2 flex items-center justify-center gap-1.5 ${
                        preferredColor === 'w'
                          ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                          : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                      }`}
                    >
                      <div className="w-4 h-4">
                        <ChessPiece type="k" color="w" />
                      </div>
                      <span>White</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playWindowsClick();
                        setPreferredColor('random');
                      }}
                      className={`p-1.5 text-xs font-bold font-sans border-2 flex items-center justify-center gap-1.5 ${
                        preferredColor === 'random'
                          ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                          : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <ChessDice className="w-full h-full" />
                      </div>
                      <span>Random</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playWindowsClick();
                        setPreferredColor('b');
                      }}
                      className={`p-1.5 text-xs font-bold font-sans border-2 flex items-center justify-center gap-1.5 ${
                        preferredColor === 'b'
                          ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                          : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                      }`}
                    >
                      <div className="w-4 h-4">
                        <ChessPiece type="k" color="b" />
                      </div>
                      <span>Black</span>
                    </button>
                  </div>
                </div>

                {/* Public toggle checkbox */}
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publicCheck"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label htmlFor="publicCheck" className="text-xs text-black cursor-pointer font-sans">
                    Publish lobby to public games directory
                  </label>
                </div>
              </div>

              {/* Create Lobby Button */}
              <button
                type="button"
                disabled={isCreating}
                onClick={handleCreateClick}
                className="w-full py-2 bg-[#d4d0c8] hover:bg-white text-black font-bold font-sans text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  'Generating Room...'
                ) : (
                  <>
                    <ChessCreateLobbyIcon size={20} />
                    <span>Create Match Lobby</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Play vs. Chess Bot Group Box */}
            <div className="border border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-3 relative bg-[#ece9d8] flex flex-col justify-between">
              <span className="absolute -top-2.5 left-3 bg-[#ece9d8] px-1 text-xs font-bold text-black font-sans">
                Play vs. Chess Bot
              </span>

              <div>
                {/* Difficulty 2x2 Selector */}
                <div className="mb-2.5 mt-1">
                  <label className="block text-[11px] font-bold text-[#303030] mb-1">
                    Bot Difficulty:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BOT_DIFFICULTIES.map((diff) => {
                      const cfg = BOT_DIFFICULTY_CONFIG[diff];
                      const isSelected = botDifficulty === diff;
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => {
                            playWindowsClick();
                            setBotDifficulty(diff);
                          }}
                          title={`${cfg.botTitle} (${cfg.elo} ELO)`}
                          className={`px-2 py-1 text-left text-xs font-sans font-bold border-2 flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                              : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                          }`}
                        >
                          <span>{cfg.label}</span>
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected ? 'text-[#a6caf0]' : 'text-[#505050]'
                            }`}
                          >
                            {cfg.elo}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Play As Side + Clock Compact Row */}
                <div className="mb-2.5">
                  <label className="block text-[11px] font-bold text-[#303030] mb-1">
                    Play as Side:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        playWindowsClick();
                        setBotColor('w');
                      }}
                      className={`p-1 text-xs font-bold font-sans border-2 flex items-center justify-center gap-1 ${
                        botColor === 'w'
                          ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                          : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                      }`}
                    >
                      <div className="w-4 h-4">
                        <ChessPiece type="k" color="w" />
                      </div>
                      <span>White</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playWindowsClick();
                        setBotColor('random');
                      }}
                      className={`p-1 text-xs font-bold font-sans border-2 flex items-center justify-center gap-1 ${
                        botColor === 'random'
                          ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                          : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <ChessDice className="w-full h-full" />
                      </div>
                      <span>Random</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playWindowsClick();
                        setBotColor('b');
                      }}
                      className={`p-1 text-xs font-bold font-sans border-2 flex items-center justify-center gap-1 ${
                        botColor === 'b'
                          ? 'bg-[#0a246a] text-white border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]'
                          : 'bg-[#d4d0c8] text-black border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] hover:bg-white'
                      }`}
                    >
                      <div className="w-4 h-4">
                        <ChessPiece type="k" color="b" />
                      </div>
                      <span>Black</span>
                    </button>
                  </div>
                </div>

                {/* Compact Time Control Select */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <label htmlFor="botClockSelect" className="text-[11px] font-bold text-[#303030]">
                    Bot Clock:
                  </label>
                  <select
                    id="botClockSelect"
                    value={botTimeControl.name}
                    onChange={(e) => {
                      playWindowsClick();
                      const found = TIME_CONTROLS.find((tc) => tc.name === e.target.value);
                      if (found) setBotTimeControl(found);
                    }}
                    className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-1.5 py-0.5 text-xs text-black font-bold font-sans focus:outline-hidden"
                  >
                    {TIME_CONTROLS.map((tc) => (
                      <option key={tc.name} value={tc.name}>
                        {tc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sunken Option Box: Bot Messages & Bot Trash Talk */}
                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2 mb-3 space-y-1.5">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={botMessages}
                      onChange={(e) => {
                        playWindowsClick();
                        const checked = e.target.checked;
                        setBotMessages(checked);
                        if (!checked) {
                          setBotTrashTalk(false);
                        }
                      }}
                      className="mt-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-black leading-tight font-sans">
                      Bot Messages
                      <span className="block text-[10px] font-normal text-[#505050]">
                        bot messages you in the in-game messenger
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={botTrashTalk}
                      onChange={(e) => {
                        playWindowsClick();
                        const checked = e.target.checked;
                        setBotTrashTalk(checked);
                        if (checked && !botMessages) {
                          setBotMessages(true);
                        }
                      }}
                      className="mt-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#800000] leading-tight font-sans">
                      Bot Trash Talk
                      <span className="block text-[10px] font-normal text-[#505050]">
                        bot trash talks during play
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Play vs Bot Launch Button */}
              <button
                type="button"
                onClick={handleStartBotClick}
                className="w-full py-2 bg-[#d4d0c8] hover:bg-white text-black font-bold font-sans text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2"
              >
                <ChessBotIcon size={20} />
                <span>Play vs. Chess Bot</span>
              </button>
            </div>

            {/* 3. Join Game Group Box */}
            <div className="border border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-3 relative bg-[#ece9d8] flex flex-col justify-between">
              <span className="absolute -top-2.5 left-3 bg-[#ece9d8] px-1 text-xs font-bold text-black font-sans">
                Join with Lobby Code
              </span>

              <div>
                <form onSubmit={handleJoinSubmit} className="mb-4 mt-1">
                  <label className="block text-[11px] font-bold text-[#303030] mb-1">
                    Enter 6-Character Room Code:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. 7X8K2M"
                      maxLength={8}
                      className="flex-1 min-w-0 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-2.5 py-1.5 text-sm font-mono font-bold tracking-widest text-[#000080] focus:outline-hidden uppercase"
                    />
                    <button
                      type="submit"
                      disabled={!joinCode.trim()}
                      className="px-3 py-1.5 bg-[#d4d0c8] hover:bg-white disabled:opacity-50 text-black font-bold font-sans text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer shrink-0"
                    >
                      Connect
                    </button>
                  </div>
                  <p className="text-[11px] text-[#505050] mt-1.5 font-sans">
                    Ask your friend for their 6-character code or open an invite link.
                  </p>
                </form>

                {/* Local practice box */}
                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2.5 mb-2">
                  <div className="font-bold text-xs text-black mb-0.5">Local Offline Mode</div>
                  <p className="text-[11px] text-[#505050] mb-2">
                    Pass & play on the same computer or test board moves.
                  </p>
                  <button
                    onClick={() => {
                      playWindowsClick();
                      onStartSoloPlay();
                    }}
                    className="px-3 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] text-black font-bold font-sans text-xs border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
                  >
                    Start Local Practice
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-[#505050] text-center font-sans">
                Tip: Open two tabs in your browser to test playing against yourself!
              </div>
            </div>
          </div>

          {/* Public Games Directory Table */}
          <div className="border border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-3 relative bg-[#ece9d8]">
            <span className="absolute -top-2.5 left-3 bg-[#ece9d8] px-1 text-xs font-bold text-black font-sans">
              Public Match Browser ({publicRooms.length} Active)
            </span>

            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  playWindowsClick();
                  fetchPublicRooms();
                }}
                disabled={isLoadingRooms}
                className="px-3 py-0.5 bg-[#d4d0c8] hover:bg-white text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
              >
                {isLoadingRooms ? (
                  'Refreshing...'
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <RetroRefreshIcon size={12} />
                    <span>Refresh List</span>
                  </span>
                )}
              </button>
            </div>

            {/* Sunken Table */}
            <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] overflow-x-auto text-xs font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#d4d0c8] border-b border-[#808080] select-none text-[11px] font-bold">
                    <th className="p-1.5 border-r border-[#808080]">Room Code</th>
                    <th className="p-1.5 border-r border-[#808080]">Host Name</th>
                    <th className="p-1.5 border-r border-[#808080]">Time Control</th>
                    <th className="p-1.5 border-r border-[#808080]">Players</th>
                    <th className="p-1.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {publicRooms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#808080] italic">
                        No active public lobbies waiting. Create one above to host a match!
                      </td>
                    </tr>
                  ) : (
                    publicRooms.map((room, idx) => (
                      <tr
                        key={room.code}
                        className={`border-b border-[#e0e0e0] ${
                          idx % 2 === 1 ? 'bg-[#f8f8f8]' : 'bg-white'
                        } hover:bg-[#e0e8f8]`}
                      >
                        <td className="p-1.5 font-mono font-bold text-[#000080]">
                          {room.code}
                        </td>
                        <td className="p-1.5 font-bold text-black">{room.hostName}</td>
                        <td className="p-1.5 text-[#404040]">{room.timeControl.name}</td>
                        <td className="p-1.5 text-[#404040]">{room.playersCount}/2</td>
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => {
                              playWindowsClick();
                              onJoinRoom(room.code);
                            }}
                            className="px-3 py-0.5 bg-[#d4d0c8] hover:bg-white text-black text-xs font-bold border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
                          >
                            Join
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Windows 2000 Status Bar at bottom */}
        <div className="grid grid-cols-12 text-[11px] font-sans bg-[#d4d0c8] border-t border-[#808080] p-1 gap-1">
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Status: Ready
          </div>
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Protocol: WebSocket 2000
          </div>
          <div className="col-span-4 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8] truncate text-black font-medium">
            Matt's Chess Engine v1.03
          </div>
        </div>
      </div>
    </div>
  );
};
