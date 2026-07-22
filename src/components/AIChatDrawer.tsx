import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Mic, RefreshCw, Trash2, Monitor, Folder, CheckCircle, GraduationCap, Play, Square, Eye, Sliders } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { ExplanationLevel } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAssetPicker?: () => void;
}

export default function AIChatDrawer({ isOpen, onClose, onOpenAssetPicker }: AIChatDrawerProps) {
  const {
    appContext,
    messages,
    isChatSending,
    sendMessage,
    clearChatHistory,
    setIsVoiceOverlayOpen,
    assets,
    classroomSession,
    startClassroomSession,
    endClassroomSession,
    setExplanationLevel,
    toggleTeacherMode,
  } = useAI();

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isChatSending) return;
    const text = inputPrompt;
    setInputPrompt('');
    await sendMessage(text);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[9990] w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col font-sans animate-fade-in">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">AI Classroom Assistant</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Asisten Pembelajaran Sejarah Interaktif</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onClose();
              setIsVoiceOverlayOpen(true);
            }}
            title="Buka Fullscreen Voice Mode"
            className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Mic size={16} />
          </button>
          <button
            onClick={clearChatHistory}
            title="Bersihkan Percakapan"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Classroom Session Control Strip */}
      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {classroomSession.isActive ? (
            <button
              onClick={endClassroomSession}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[11px] font-medium flex items-center gap-1"
            >
              <Square size={10} fill="currentColor" /> Sesi Kelas Aktif
            </button>
          ) : (
            <button
              onClick={() => startClassroomSession()}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-semibold flex items-center gap-1 hover:bg-amber-400"
            >
              <Play size={10} fill="currentColor" /> Mulai Sesi Kelas
            </button>
          )}

          <button
            onClick={toggleTeacherMode}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 ${
              classroomSession.isTeacherMode
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Eye size={12} /> Mode Guru
          </button>
        </div>

        {/* Level Penjelasan Selector */}
        <div className="flex items-center gap-1 text-[11px]">
          <Sliders size={11} className="text-slate-400" />
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
            {(['singkat', 'normal', 'mendalam'] as ExplanationLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExplanationLevel(lvl)}
                className={`px-1.5 py-0.5 rounded text-[10px] capitalize font-medium ${
                  classroomSession.explanationLevel === lvl
                    ? 'bg-amber-500 text-white dark:text-slate-950 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* App Context Awareness Indicator Badge */}
      <div className="px-4 py-2 bg-amber-50/80 dark:bg-slate-800/80 border-b border-amber-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-1.5 truncate">
          <Monitor size={13} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="font-semibold">Konteks Aktif:</span>
          <span className="truncate">
            {appContext.activeMaterial
              ? `BAB ${appContext.activeMaterial.bab}`
              : appContext.activeClass
              ? appContext.activeClass.name
              : appContext.activeView}
          </span>
          {appContext.activeSlide && (
            <span className="px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-slate-700 text-[10px] font-mono">
              Slide {appContext.activeSlideIndex! + 1}
            </span>
          )}
        </div>

        {onOpenAssetPicker && (
          <button
            onClick={onOpenAssetPicker}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:underline flex-shrink-0"
          >
            <Folder size={12} /> Assets ({assets.length})
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          return (
            <div key={msg.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isAi
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                    : 'bg-amber-500 text-white rounded-tr-xs shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.functionCalls && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                    <CheckCircle size={12} /> Aksi AI Eksekusi Terdeteksi
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isChatSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw size={14} className="animate-spin text-amber-500" />
            <span>Gemini sedang berpikir & menganalisis konteks...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {[
          'Ganti background slide',
          'Tambahkan gambar dari Asset Library',
          'Rekomendasikan kuis',
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(p)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-amber-500">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Tanyakan atau perintahkan AI..."
            className="flex-1 px-3 py-1.5 bg-transparent border-none text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsVoiceOverlayOpen(true);
            }}
            title="Buka Voice Mode"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Mic size={16} />
          </button>
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isChatSending}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
