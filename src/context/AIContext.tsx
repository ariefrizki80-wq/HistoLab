import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Material, ClassItem, StoryScene, HistoricalMap, ClassroomSessionState, ExplanationLevel, HighlightTarget } from '../types';
import { Asset, getAllAssets } from '../lib/assetLibrary';
import { getAIMemory, saveAIMemoryNote, updateConversationSummary } from '../lib/memoryManager';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  functionCalls?: any[];
}

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted' | 'reconnecting';

export interface AppContextPayload {
  activeView: string;
  activeMaterial?: Material | null;
  activeClass?: ClassItem | null;
  activeSlideIndex?: number;
  activeSlide?: StoryScene | null;
  activeMap?: HistoricalMap | null;
  isPresentationActive?: boolean;
}

interface AIContextType {
  // App Context awareness
  appContext: AppContextPayload;
  setAppContext: React.Dispatch<React.SetStateAction<AppContextPayload>>;
  
  // Classroom Session State
  classroomSession: ClassroomSessionState;
  startClassroomSession: (overrideOptions?: Partial<ClassroomSessionState>) => void;
  endClassroomSession: () => void;
  setExplanationLevel: (level: ExplanationLevel) => void;
  toggleTeacherMode: () => void;
  setHighlight: (target: HighlightTarget | null) => void;
  clearHighlight: () => void;
  setTeacherInsights: (insights: ClassroomSessionState['teacherInsights']) => void;

  // Chat State
  messages: ChatMessage[];
  isChatSending: boolean;
  sendMessage: (prompt: string) => Promise<string>;
  clearChatHistory: () => void;
  
  // Voice Overlay State
  isVoiceOverlayOpen: boolean;
  setIsVoiceOverlayOpen: (open: boolean) => void;
  orbState: OrbState;
  setOrbState: (state: OrbState) => void;
  micVolume: number;
  setMicVolume: (vol: number) => void;
  
  // AI Tools Executor callback
  registerToolHandler: (handler: (name: string, args: any) => void) => void;
  
  // Asset Library State Cache
  assets: Asset[];
  refreshAssets: () => Promise<void>;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [appContext, setAppContext] = useState<AppContextPayload>({
    activeView: 'dashboard',
  });

  const [classroomSession, setClassroomSession] = useState<ClassroomSessionState>({
    isActive: false,
    explanationLevel: 'normal',
    isTeacherMode: false,
    activeHighlight: null,
    teacherInsights: null,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Halo Bapak/Ibu Guru! Saya HistoLab AI Classroom Assistant. Siap mendampingi pembelajaran kelas hari ini.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [isChatSending, setIsChatSending] = useState<boolean>(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState<boolean>(false);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);

  const toolHandlerRef = React.useRef<((name: string, args: any) => void) | null>(null);

  const refreshAssets = async () => {
    const list = await getAllAssets();
    setAssets(list);
  };

  useEffect(() => {
    refreshAssets();
  }, []);

  const registerToolHandler = (handler: (name: string, args: any) => void) => {
    toolHandlerRef.current = handler;
  };

  // Classroom Session Controls
  const startClassroomSession = (overrideOptions?: Partial<ClassroomSessionState>) => {
    const now = new Date().toISOString();
    setClassroomSession((prev) => ({
      isActive: true,
      startTime: now,
      classId: appContext.activeClass?.id,
      className: appContext.activeClass?.name || 'Kelas Sejarah',
      subject: appContext.activeClass?.subject || 'Sejarah Indonesia',
      bab: appContext.activeMaterial?.bab,
      materialId: appContext.activeMaterial?.id,
      materialTitle: appContext.activeMaterial?.title,
      slideIndex: appContext.activeSlideIndex || 0,
      slideTitle: appContext.activeSlide?.title,
      explanationLevel: prev.explanationLevel || 'normal',
      isTeacherMode: prev.isTeacherMode || false,
      activeHighlight: null,
      teacherInsights: null,
      ...overrideOptions,
    }));

    // Reset session chat history for clean session memory
    setMessages([
      {
        id: `sess-start-${Date.now()}`,
        role: 'assistant',
        content: `Sesi AI Classroom Assistant Aktif. Topik: ${appContext.activeMaterial ? `BAB ${appContext.activeMaterial.bab}: ${appContext.activeMaterial.title}` : 'Sejarah Indonesia'}. Silakan buka pertanyaan atau diskusi kelas.`,
        timestamp: now,
      },
    ]);
  };

  const endClassroomSession = () => {
    setClassroomSession((prev) => ({
      ...prev,
      isActive: false,
      startTime: null,
      activeHighlight: null,
      teacherInsights: null,
    }));
    
    // Clear session memory
    setMessages([
      {
        id: `sess-end-${Date.now()}`,
        role: 'assistant',
        content: 'Sesi pembelajaran diakhiri. Memori sesi telah dibersihkan.',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const setExplanationLevel = (level: ExplanationLevel) => {
    setClassroomSession((prev) => ({ ...prev, explanationLevel: level }));
  };

  const toggleTeacherMode = () => {
    setClassroomSession((prev) => ({ ...prev, isTeacherMode: !prev.isTeacherMode }));
  };

  const setHighlight = (target: HighlightTarget | null) => {
    setClassroomSession((prev) => ({ ...prev, activeHighlight: target }));
  };

  const clearHighlight = () => {
    setClassroomSession((prev) => ({ ...prev, activeHighlight: null }));
  };

  const setTeacherInsights = (insights: ClassroomSessionState['teacherInsights']) => {
    setClassroomSession((prev) => ({ ...prev, teacherInsights: insights }));
  };


  const sendMessage = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) return '';

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatSending(true);
    setOrbState('thinking');

    try {
      const recentAssets = assets.slice(0, 5).map((a) => ({ id: a.id, name: a.name, category: a.category }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: messages.slice(-8),
          appContext: {
            ...appContext,
            assetsCount: assets.length,
            recentAssets,
          },
          userMemory: getAIMemory(),
        }),
      });

      const data = await response.json();
      const aiReplyText = data.text || 'Maaf, saya tidak dapat merespon saat ini.';
      const functionCalls = data.functionCalls;

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiReplyText,
        timestamp: new Date().toISOString(),
        functionCalls,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Execute function calls if returned
      if (functionCalls && Array.isArray(functionCalls) && toolHandlerRef.current) {
        for (const fc of functionCalls) {
          toolHandlerRef.current(fc.name, fc.args);
        }
      }

      // Save summary in memory
      updateConversationSummary({
        lastIntent: prompt.slice(0, 40),
        activeTopic: appContext.activeMaterial?.title || 'Sejarah Indonesia',
      });

      setIsChatSending(false);
      setOrbState('idle');
      return aiReplyText;
    } catch (err) {
      console.error('AI Send error', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Terjadi kendala jaringan saat menghubungi AI Gateway HistoLab. Harap pastikan server berjalan.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsChatSending(false);
      setOrbState('idle');
      return errorMsg.content;
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'Percakapan diresikkan. Silakan sampaikan pertanyaan atau instruksi baru.',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <AIContext.Provider
      value={{
        appContext,
        setAppContext,
        classroomSession,
        startClassroomSession,
        endClassroomSession,
        setExplanationLevel,
        toggleTeacherMode,
        setHighlight,
        clearHighlight,
        setTeacherInsights,
        messages,
        isChatSending,
        sendMessage,
        clearChatHistory,
        isVoiceOverlayOpen,
        setIsVoiceOverlayOpen,
        orbState,
        setOrbState,
        micVolume,
        setMicVolume,
        registerToolHandler,
        assets,
        refreshAssets,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return ctx;
}
