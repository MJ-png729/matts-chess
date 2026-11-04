import React, { useEffect, useRef, useState } from 'react';
import { MoveRecord } from '../types/chess';
import { playWindowsClick } from '../utils/audio';

interface MoveHistoryProps {
  history: MoveRecord[];
  pgn: string;
  fen: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history, pgn, fen }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedType, setCopiedType] = useState<'pgn' | 'fen' | null>(null);

  const movePairs: { num: number; white: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const copyToClipboard = async (text: string, type: 'pgn' | 'fen') => {
    try {
      playWindowsClick();
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 1800);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 flex flex-col h-full shadow-[1px_1px_0px_rgba(0,0,0,0.3)]">
      {/* Title bar of box */}
      <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-0.5 flex items-center justify-between mb-1 select-none">
        <span className="font-sans">Notation / Move List</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => copyToClipboard(pgn || history.map((m) => m.san).join(' '), 'pgn')}
            className="px-1.5 py-0.2 bg-[#d4d0c8] text-black text-[10px] font-sans border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
          >
            {copiedType === 'pgn' ? 'Copied!' : 'Copy PGN'}
          </button>
          <button
            onClick={() => copyToClipboard(fen, 'fen')}
            className="px-1.5 py-0.2 bg-[#d4d0c8] text-black text-[10px] font-sans border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff]"
          >
            {copiedType === 'fen' ? 'Copied!' : 'Copy FEN'}
          </button>
        </div>
      </div>

      {/* Table Header with 3D buttons */}
      <div className="grid grid-cols-12 text-[11px] font-sans font-bold bg-[#d4d0c8] border-b border-[#808080] select-none">
        <div className="col-span-3 px-1.5 py-0.5 border-r border-[#808080] border-t border-l border-white bg-[#ece9d8]">
          Turn
        </div>
        <div className="col-span-4 px-1.5 py-0.5 border-r border-[#808080] border-t border-l border-white bg-[#ece9d8]">
          White
        </div>
        <div className="col-span-5 px-1.5 py-0.5 border-t border-l border-white bg-[#ece9d8]">
          Black
        </div>
      </div>

      {/* Sunken Moves Content Box */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1 font-mono text-xs select-text text-black"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#808080] italic text-center text-[11px]">
            No moves played yet.
          </div>
        ) : (
          movePairs.map((pair, index) => (
            <div
              key={pair.num}
              className={`grid grid-cols-12 py-0.5 px-1 items-center ${
                index % 2 === 1 ? 'bg-[#f4f4f4]' : 'bg-white'
              } hover:bg-[#0a246a] hover:text-white group`}
            >
              <span className="col-span-3 text-[#505050] group-hover:text-[#a6caf0] font-sans font-semibold">
                {pair.num}.
              </span>
              <span className="col-span-4 font-bold">{pair.white.san}</span>
              <span className="col-span-5 text-[#303030] group-hover:text-white font-medium">
                {pair.black?.san || ''}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Sunken status text */}
      <div className="mt-1 px-1 text-[10px] text-[#404040] font-sans flex items-center justify-between border border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] bg-[#ece9d8]">
        <span>Total plies: {history.length}</span>
        <span>Standard SAN Notation</span>
      </div>
    </div>
  );
};
