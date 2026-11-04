import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/chess';
import { playWindowsNotify, playWindowsClick } from '../utils/audio';

interface InGameChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
}

const QUICK_EMOJIS = ['😀', '😎', '😮', '👏', '🔥', '👑', '🤝', '💀'];

export const InGameChat: React.FC<InGameChatProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onSendReaction,
}) => {
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const lastMsgCountRef = useRef(messages.length);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    if (messages.length > lastMsgCountRef.current) {
      const latest = messages[messages.length - 1];
      if (latest && latest.senderId !== currentUserId && !latest.isSystem) {
        playWindowsNotify();
      }
    }
    lastMsgCountRef.current = messages.length;
  }, [messages, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playWindowsClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 flex flex-col h-full shadow-[1px_1px_0px_rgba(0,0,0,0.3)]">
      {/* Title bar */}
      <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white font-bold text-xs px-2 py-0.5 flex items-center justify-between mb-1 select-none font-sans">
        <span>Instant Messenger / Room Chat</span>
        <span className="text-[10px] text-white/80 font-normal">Online</span>
      </div>

      {/* Sunken Chat Log Box */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2 space-y-1.5 text-xs text-black font-sans"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#808080] italic text-center text-[11px]">
            Lobby chat opened. Say hello to your opponent!
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center my-1 text-[11px] text-[#000080] font-semibold italic">
                  *** {msg.text} ***
                </div>
              );
            }

            const isMe = msg.senderId === currentUserId;
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={msg.id} className="leading-tight">
                <span className="text-[10px] text-[#606060] mr-1">[{timeStr}]</span>
                <span className={`font-bold mr-1 ${isMe ? 'text-[#0000aa]' : 'text-[#880000]'}`}>
                  {isMe ? 'You' : msg.senderName}:
                </span>
                <span className="text-black select-text">{msg.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Emoticon Bar */}
      <div className="flex items-center gap-1 py-1 px-1 bg-[#ece9d8] border-b border-[#808080] select-none">
        <span className="text-[10px] text-[#404040] font-bold mr-1">Emotes:</span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              playWindowsClick();
              onSendReaction(emoji);
            }}
            className="text-sm p-0.5 hover:bg-white active:scale-95 transition"
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="mt-1 flex items-center gap-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message and press Enter..."
          maxLength={200}
          className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-2 py-1 text-xs text-black font-sans focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3 py-1 bg-[#d4d0c8] hover:bg-[#ece9d8] disabled:opacity-50 text-black text-xs font-bold font-sans border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#ffffff] active:border-r-[#ffffff] cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
};
