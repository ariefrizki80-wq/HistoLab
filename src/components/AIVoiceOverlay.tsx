import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, X, MessageSquare, Volume2, Sparkles, Monitor, Radio, AlertCircle, RefreshCw } from 'lucide-react';
import DynamicOrb from './DynamicOrb';
import { useAI } from '../context/AIContext';
import { useGeminiLive } from '../hooks/useGeminiLive';

interface AIVoiceOverlayProps {
  onSwitchToChat: () => void;
}

export default function AIVoiceOverlay({ onSwitchToChat }: AIVoiceOverlayProps) {
  const {
    appContext,
    isVoiceOverlayOpen,
    setIsVoiceOverlayOpen,
    registerToolHandler,
  } = useAI();

  const toolHandlerRef = useRef<((name: string, args: any) => void) | null>(null);

  useEffect(() => {
    registerToolHandler((name: string, args: any) => {
      if (toolHandlerRef.current) {
        toolHandlerRef.current(name, args);
      }
    });
  }, [registerToolHandler]);

  const handleToolCallFromLive = React.useCallback((name: string, args: any) => {
    if (toolHandlerRef.current) {
      toolHandlerRef.current(name, args);
    }
  }, []);

  const {
    orbState,
    micVolume,
    userTranscript,
    aiTranscript,
    isConnected,
    errorMessage,
    isMicActive,
    toggleMicrophone,
    sendTextPrompt,
    interrupt,
  } = useGeminiLive({
    isOpen: isVoiceOverlayOpen,
    appContext,
    onToolCall: handleToolCallFromLive,
  });

  if (!isVoiceOverlayOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950 text-slate-100 flex flex-col justify-between p-6 overflow-hidden animate-fade-in font-sans">
      {/* Background Ambient Constellation */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-slate-900 to-slate-950 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-100 flex items-center gap-2">
              HistoLab Voice Mode
              <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Radio size={10} className="animate-pulse text-emerald-400" />
                Gemini Live API
              </span>
            </h2>
            <p className="text-xs text-slate-400">Percakapan Lisan Real-Time Rentang Latensi Rendah</p>
          </div>
        </div>

        {/* Active Context Badge */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <Monitor size={14} className="text-amber-400" />
          <span className="text-slate-400">Konteks:</span>
          <span className="font-medium text-slate-200">
            {appContext.activeMaterial
              ? `BAB ${appContext.activeMaterial.bab}: ${appContext.activeMaterial.title}`
              : appContext.activeClass
              ? appContext.activeClass.name
              : 'Dashboard HistoLab'}
          </span>
          {appContext.activeSlide && (
            <span className="px-2 py-0.5 bg-slate-800 rounded text-amber-300 font-mono">
              Slide {(appContext.activeSlideIndex || 0) + 1}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              interrupt();
              onSwitchToChat();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <MessageSquare size={16} /> Mode Chat
          </button>
          <button
            onClick={() => {
              interrupt();
              setIsVoiceOverlayOpen(false);
            }}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Center Stage with Dynamic Orb */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-8 text-center max-w-2xl mx-auto space-y-6">
        {errorMessage ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 max-w-md">
            <AlertCircle size={24} className="text-rose-400 shrink-0" />
            <div className="text-left">
              <p className="font-semibold">Sesi Gemini Live Error</p>
              <p className="text-xs text-rose-200/80">{errorMessage}</p>
            </div>
          </div>
        ) : null}

        <DynamicOrb
          state={orbState}
          volume={micVolume}
          size={240}
          onClick={() => {
            if (orbState === 'speaking') {
              interrupt();
            }
          }}
        />

        {/* Live Speech & Response Card */}
        <div className="w-full space-y-3">
          {userTranscript && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-200 text-sm animate-fade-in shadow-xl">
              <span className="text-xs uppercase tracking-wider text-amber-400/80 font-bold block mb-1">
                Suara Pengguna:
              </span>
              "{userTranscript}"
            </div>
          )}

          {aiTranscript && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200 text-sm leading-relaxed max-h-40 overflow-y-auto backdrop-blur-md">
              <span className="text-xs uppercase tracking-wider text-emerald-400/80 font-bold block mb-1 flex items-center justify-center gap-1.5">
                <Volume2 size={14} /> Gemini Live Streaming Response:
              </span>
              {aiTranscript}
            </div>
          )}

          {!userTranscript && !aiTranscript && (
            <div className="text-xs text-slate-400 animate-pulse">
              {isConnected ? 'Sesi Gemini Live Aktif — Silakan berbicara langsung dengan Asisten HistoLab...' : 'Membuka Koneksi Gemini Live Gateway...'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto w-full pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            'Tambahkan gambar ke slide ini',
            'Buat kuis pemahaman siswa',
            'Buka modul Jalur Rempah',
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => sendTextPrompt(promptText)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-amber-300 whitespace-nowrap transition-colors"
            >
              "{promptText}"
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {orbState === 'speaking' && (
            <button
              onClick={interrupt}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={14} /> Menyela AI
            </button>
          )}

          <button
            onClick={toggleMicrophone}
            className={`p-3 rounded-full font-semibold shadow-lg flex items-center justify-center transition-all duration-300 ${
              isMicActive
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
            title={isMicActive ? "Matikan Mikrofon" : "Nyalakan Mikrofon"}
          >
            {isMicActive ? (
              <Mic size={22} className={micVolume > 15 ? 'animate-bounce text-slate-900' : 'opacity-80'} />
            ) : (
              <MicOff size={22} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
