import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/chess';
import { playWindowsNotify, playWindowsClick } from '../utils/audio';
import {
  MsnIcon,
  MSN_EMOTICONS,
  FormattedChatMessage,
  InsertEmoticonDialog,
  MsnGradientsDefs,
} from './MsnEmoticons';
import { RetroChatBubbleIcon } from './RetroIcons';

interface InGameChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  typingIndicatorText?: string | null;
}

const BAR_EMOTICONS = [
  'smile',
  'big_grin',
  'laugh',
  'wink',
  'tongueout',
  'cool',
  'clown',
  'cry',
  'skull',
  'surprise',
];

export const InGameChat: React.FC<InGameChatProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onSendReaction,
  typingIndicatorText = null,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleInsertEmoticon = (shortcut: string) => {
    playWindowsClick();
    setInputText((prev) => (prev ? `${prev} ${shortcut}` : shortcut));
    inputRef.current?.focus();
  };

  const handleQuickSendEmoticon = (shortcut: string) => {
    playWindowsClick();
    onSendMessage(shortcut);
  };

  return (
    <div className="bg-[#d4d0c8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-1 flex flex-col h-full shadow-[1px_1px_0px_rgba(0,0,0,0.3)] relative">
      <MsnGradientsDefs />

      {/* MSN Messenger Title bar */}
      <div className="bg-gradient-to-r from-[#0a246a] via-[#154694] to-[#a6caf0] text-white font-bold text-xs px-2 py-0.5 flex items-center justify-between mb-1 select-none font-sans">
        <div className="flex items-center gap-1.5">
          <RetroChatBubbleIcon size={13} />
          <span>Instant Messenger</span>
        </div>
        <span className="text-[10px] text-white/90 font-normal">Active Session</span>
      </div>

      {/* Sunken Chat Log Box */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2 space-y-1.5 text-xs text-black font-sans"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#808080] italic text-center text-[11px]">
            Lobby conversation opened. Say hello to your opponent!
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
              <div key={msg.id} className="leading-normal break-words">
                <span className="text-[10px] text-[#606060] mr-1">[{timeStr}]</span>
                <span className={`font-bold mr-1.5 ${isMe ? 'text-[#0000aa]' : 'text-[#880000]'}`}>
                  {isMe ? 'You' : msg.senderName}:
                </span>
                <span className="text-black select-text text-xs">
                  <FormattedChatMessage text={msg.text} />
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* MSN Messenger Typing Indicator */}
      {typingIndicatorText && (
        <div className="px-2 py-0.5 bg-[#f4f2ea] border-x border-[#808080] text-[10px] text-[#505050] italic flex items-center gap-1.5 select-none">
          <span className="inline-block w-1.5 h-1.5 bg-[#008000] animate-ping" />
          <span>{typingIndicatorText}</span>
        </div>
      )}

      {/* MSN Emoticon Bar */}
      <div className="flex items-center justify-between py-1 px-1 bg-[#ece9d8] border-b border-[#808080] select-none text-xs">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {BAR_EMOTICONS.map((id) => {
            const emo = MSN_EMOTICONS.find((e) => e.id === id);
            if (!emo) return null;
            return (
              <button
                key={emo.id}
                type="button"
                onClick={() => handleInsertEmoticon(emo.shortcut)}
                onDoubleClick={() => handleQuickSendEmoticon(emo.shortcut)}
                className="p-1 hover:bg-white active:bg-[#d0c8b8] border border-transparent hover:border-[#808080] cursor-pointer flex items-center justify-center rounded-xs transition-colors"
                title={`${emo.shortcut} (${emo.label}) - Click to insert, Double click to send`}
              >
                <MsnIcon id={emo.id} size={17} />
              </button>
            );
          })}
        </div>

        {/* Emoticon Menu Trigger Button matching MSN Messenger */}
        <button
          type="button"
          onClick={() => {
            playWindowsClick();
            setShowEmoticonPicker(!showEmoticonPicker);
          }}
          className={`px-1.5 py-0.5 text-[11px] font-sans font-bold flex items-center gap-1 border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] cursor-pointer ${
            showEmoticonPicker ? 'bg-[#ece9d8] border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff]' : 'bg-[#d4d0c8] hover:bg-white'
          }`}
          title="Open MSN Emoticon Picker"
        >
          <MsnIcon id="smile" size={14} />
          <span>Emoticons ▾</span>
        </button>
      </div>

      {/* Pop-up MSN "Insert emoticon" dialog */}
      <InsertEmoticonDialog
        isOpen={showEmoticonPicker}
        onClose={() => setShowEmoticonPicker(false)}
        onSelect={(shortcut) => handleInsertEmoticon(shortcut)}
      />

      {/* Input row */}
      <form onSubmit={handleSubmit} className="mt-1 flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message or emoticons (: , :-D, B-) )..."
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
