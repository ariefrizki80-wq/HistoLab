import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  MessageSquare,
  Volume2,
  Sparkles,
  Monitor,
  Radio,
  AlertCircle,
  RefreshCw,
  Play,
  Square,
  Sliders,
  Eye,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  MapPin,
  Layers,
  Clock
} from 'lucide-react';
import DynamicOrb from './DynamicOrb';
import { useAI } from '../context/AIContext';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { ExplanationLevel } from '../types';

interface AIVoiceOverlayProps {
  onSwitchToChat: () => void;
}

export default function AIVoiceOverlay({ onSwitchToChat }: AIVoiceOverlayProps) {
  const {
    appContext,
    isVoiceOverlayOpen,
    setIsVoiceOverlayOpen,
    registerToolHandler,
    classroomSession,
    startClassroomSession,
    endClassroomSession,
    setExplanationLevel,
    toggleTeacherMode,
    setHighlight,
  } = useAI();

  const toolHandlerRef = useRef<((name: string, args: any) => void) | null>(null);

  useEffect(() => {
    registerToolHandler((name: string, args: any) => {
      if (name === 'highlight_content') {
        setHighlight(args);
      }
      if (toolHandlerRef.current) {
        toolHandlerRef.current(name, args);
      }
    });
  }, [registerToolHandler, setHighlight]);

  const handleToolCallFromLive = React.useCallback(
    (name: string, args: any) => {
      if (name === 'highlight_content') {
        setHighlight(args);
      }
      if (toolHandlerRef.current) {
        toolHandlerRef.current(name, args);
      }
    },
    [setHighlight]
  );

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
    classroomSession,
    onToolCall: handleToolCallFromLive,
  });

  if (!isVoiceOverlayOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto font-sans backdrop-blur-xl">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/30 via-slate-900 to-slate-950 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-100 flex items-center gap-2">
              AI Classroom Assistant
              <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Radio size={10} className="animate-pulse text-emerald-400" />
                Live Mode
              </span>
            </h2>
            <p className="text-xs text-slate-400">Pendamping Pembelajaran Lisan Interaktif di Kelas</p>
          </div>
        </div>

        {/* Classroom Session Controls */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5">
          {classroomSession.isActive ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Sesi Kelas Aktif
            </div>
          ) : (
            <button
              onClick={() => startClassroomSession()}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play size={14} fill="currentColor" /> Mulai Sesi Kelas
            </button>
          )}

          {classroomSession.isActive && (
            <button
              onClick={endClassroomSession}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Square size={12} fill="currentColor" /> Akhiri Sesi
            </button>
          )}
        </div>

        {/* Right Navigation & Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              interrupt();
              onSwitchToChat();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare size={16} /> Mode Chat
          </button>
          <button
            onClick={() => {
              interrupt();
              setIsVoiceOverlayOpen(false);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Settings Bar: Level Penjelasan & Mode Guru */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 my-3 text-xs">
        {/* Active Context Label */}
        <div className="flex items-center gap-2 text-slate-300 max-w-md truncate">
          <Monitor size={14} className="text-amber-400 shrink-0" />
          <span className="text-slate-400 shrink-0">Topik Materi:</span>
          <span className="font-semibold text-amber-200 truncate">
            {appContext.activeMaterial
              ? `BAB ${appContext.activeMaterial.bab}: ${appContext.activeMaterial.title}`
              : appContext.activeClass
              ? appContext.activeClass.name
              : 'Sejarah Indonesia Umum'}
          </span>
          {appContext.activeSlide && (
            <span className="px-2 py-0.5 bg-slate-800 rounded text-amber-300 font-mono text-[11px] shrink-0">
              Slide {(appContext.activeSlideIndex || 0) + 1}
            </span>
          )}
        </div>

        {/* Level Penjelasan Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1">
            <Sliders size={12} /> Tingkat Penjelasan:
          </span>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            {(['singkat', 'normal', 'mendalam'] as ExplanationLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExplanationLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                  classroomSession.explanationLevel === lvl
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Guru Toggle */}
        <button
          onClick={toggleTeacherMode}
          className={`px-3 py-1.5 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all ${
            classroomSession.isTeacherMode
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Eye size={14} className={classroomSession.isTeacherMode ? 'text-purple-400' : ''} />
          Mode Guru: {classroomSession.isTeacherMode ? 'AKTIF' : 'NON-AKTIF'}
        </button>
      </div>

      {/* Main Center Stage with Dynamic Orb and Cards */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 my-4">
        {/* Left Side: Dynamic Orb & Voice Interaction */}
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-6 max-w-xl mx-auto">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 w-full">
              <AlertCircle size={20} className="text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold">Koneksi Live Error</p>
                <p className="text-[11px] text-rose-200/80">{errorMessage}</p>
              </div>
            </div>
          )}

          <DynamicOrb
            state={orbState}
            volume={micVolume}
            size={220}
            onClick={() => {
              if (orbState === 'speaking') {
                interrupt();
              }
            }}
          />

          {/* Active Visual Highlight Banner if emitted */}
          {classroomSession.activeHighlight && (
            <div className="w-full p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3 animate-fade-in shadow-lg">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                {classroomSession.activeHighlight.type === 'map' ? (
                  <MapPin size={18} />
                ) : classroomSession.activeHighlight.type === 'timeline' ? (
                  <Clock size={18} />
                ) : (
                  <Layers size={18} />
                )}
              </div>
              <div>
                <div className="font-bold text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  Visual Highlight Layar ({classroomSession.activeHighlight.type})
                </div>
                <div className="text-slate-100 font-medium">{classroomSession.activeHighlight.description}</div>
              </div>
            </div>
          )}

          {/* Live Speech Transcripts */}
          <div className="w-full space-y-3">
            {userTranscript && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-200 text-xs shadow-xl animate-fade-in">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1">
                  Suara Pengguna/Siswa:
                </span>
                "{userTranscript}"
              </div>
            )}

            {aiTranscript && (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-slate-200 text-xs leading-relaxed max-h-36 overflow-y-auto backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1 flex items-center gap-1">
                  <Volume2 size={12} /> Respons Lisan AI Classroom Assistant:
                </span>
                {aiTranscript}
              </div>
            )}

            {!userTranscript && !aiTranscript && (
              <div className="text-xs text-slate-400 text-center animate-pulse">
                {isConnected
                  ? 'Sesi AI Classroom Assistant Siaga. Ucapkan pertanyaan atau instruksi...'
                  : 'Menghubungkan ke Gateway HistoLab AI...'}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Panel Mode Guru (When Active) */}
        {classroomSession.isTeacherMode && (
          <div className="w-full lg:w-80 p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-4 text-xs text-slate-200 animate-fade-in shadow-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-500/20 text-purple-300 font-semibold text-sm">
              <Lightbulb size={18} className="text-purple-400" /> Panel Mode Guru (Khusus Guru)
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1 mb-1">
                  <HelpCircle size={12} /> Ide Pertanyaan HOTS Pemantik:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                  <li>"Mengapa faktor geografis sangat menentukan pusat perlawanan?"</li>
                  <li>"Bagaimana dampak jangka panjang peristiwa ini pada masa modern?"</li>
                </ul>
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mb-1">
                  <AlertCircle size={12} /> Miskonsepsi Umum Siswa:
                </span>
                <p className="text-[11px] text-slate-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                  Siswa sering mengira perlawanan bersifat nasional, padahal saat itu masih bersifat kedaerahan.
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 mb-1">
                  <CheckCircle2 size={12} /> Poin Kunci Penekanan:
                </span>
                <p className="text-[11px] text-slate-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                  Fokuskan pada perubahan strategi diplomasi setelah berdirinya Budi Utomo 1908.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto w-full pt-3 border-t border-slate-800/80">
        {/* Quick Classroom Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            'Jelaskan latar belakang peristiwa ini',
            'Sebutkan 3 fakta kunci penting',
            'Apa relevansinya dengan masa kini?',
            'Ulangi dengan bahasa sederhana',
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => sendTextPrompt(promptText)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-amber-300 whitespace-nowrap transition-colors"
            >
              "{promptText}"
            </button>
          ))}
        </div>

        {/* Mic Control & Interrupt Button */}
        <div className="flex items-center gap-3">
          {orbState === 'speaking' && (
            <button
              onClick={interrupt}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={14} className="animate-spin" /> Menyela AI
            </button>
          )}

          <button
            onClick={toggleMicrophone}
            className={`p-3.5 rounded-full font-semibold shadow-lg flex items-center justify-center transition-all duration-300 ${
              isMicActive
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-4 ring-amber-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
            title={isMicActive ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
          >
            {isMicActive ? (
              <Mic size={22} className={micVolume > 15 ? 'animate-bounce text-slate-950' : 'opacity-90'} />
            ) : (
              <MicOff size={22} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
