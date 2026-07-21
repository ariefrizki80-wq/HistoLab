import React from 'react';
import { 
  Presentation, Minimize2, ArrowLeft, ArrowRight, BookOpen, Sliders,
  ChevronDown, ChevronUp, Layers, Target, MapPin, Sparkles, CheckCircle2, Quote, Compass, Tv, Globe, Map as MapIcon, Info, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Material, StoryScene } from '../types';
import { MapBackground, GeographicOpenStreetMap } from './HistoricalMapEngine';
import { SlideRenderer } from './SlideRenderer';

interface StorytellingPresentationProps {
  activeMaterial: Material;
  localScenes: StoryScene[];
  activeSceneIndex: number;
  setActiveSceneIndex: (idx: number) => void;
  mapWalkIndex: number;
  setMapWalkIndex: (idx: number) => void;
  activeTimelineIndex: number;
  setActiveTimelineIndex: (idx: number) => void;
  activeSubMaterialId: string | null;
  setActiveSubMaterialId: (id: string | null) => void;
  quizRevealed: boolean;
  setQuizRevealed: (revealed: boolean) => void;
  setMode: (mode: 'view' | 'edit' | 'create' | 'presentation' | 'story_editor') => void;
}

export function StorytellingPresentation({
  activeMaterial,
  localScenes,
  activeSceneIndex,
  setActiveSceneIndex,
  mapWalkIndex,
  setMapWalkIndex,
  activeTimelineIndex,
  setActiveTimelineIndex,
  activeSubMaterialId,
  setActiveSubMaterialId,
  quizRevealed,
  setQuizRevealed,
  setMode
}: StorytellingPresentationProps) {
  const currentScene = localScenes[activeSceneIndex] || {
    id: 'default',
    type: 'cover',
    title: activeMaterial.title,
    narration: activeMaterial.content,
    backgroundType: 'dark_slate',
    backgroundValue: ''
  };

  const handleNext = () => {
    // If map scene has walking steps, step map pin
    if (currentScene.type === 'map') {
      const maxSteps = activeMaterial.maps?.find(m => m.id === currentScene.activeMapId)?.pins?.length || 0;
      if (mapWalkIndex < maxSteps - 1) {
        setMapWalkIndex(mapWalkIndex + 1);
        return;
      }
    }

    // If timeline scene, step through years
    if (currentScene.type === 'timeline') {
      if (activeTimelineIndex < (activeMaterial.timeline?.length || 1) - 1) {
        setActiveTimelineIndex(activeTimelineIndex + 1);
        setActiveSubMaterialId(null);
        return;
      }
    }

    // Move to next scene
    if (activeSceneIndex < localScenes.length - 1) {
      setActiveSceneIndex(activeSceneIndex + 1);
      setMapWalkIndex(0);
      setActiveTimelineIndex(0);
      setQuizRevealed(false);
    }
  };

  const handlePrev = () => {
    // If map scene, go back in pins
    if (currentScene.type === 'map' && mapWalkIndex > 0) {
      setMapWalkIndex(mapWalkIndex - 1);
      return;
    }

    // If timeline scene, step back in years
    if (currentScene.type === 'timeline' && activeTimelineIndex > 0) {
      setActiveTimelineIndex(activeTimelineIndex - 1);
      setActiveSubMaterialId(null);
      return;
    }

    // Move to previous scene
    if (activeSceneIndex > 0) {
      setActiveSceneIndex(activeSceneIndex - 1);
      setQuizRevealed(false);
      const prevScene = localScenes[activeSceneIndex - 1];
      if (prevScene?.type === 'map') {
        const maxSteps = activeMaterial.maps?.find(m => m.id === prevScene.activeMapId)?.pins?.length || 0;
        setMapWalkIndex(Math.max(0, maxSteps - 1));
      } else if (prevScene?.type === 'timeline') {
        setActiveTimelineIndex(Math.max(0, (activeMaterial.timeline?.length || 1) - 1));
      } else {
        setMapWalkIndex(0);
        setActiveTimelineIndex(0);
      }
    }
  };

  return (
    <div id="presentation-engine-root" className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col justify-between p-4 md:p-8 font-sans overflow-hidden select-none">
      
      {/* BACKGROUND TEXTURE BASED ON SCENE */}
      {currentScene.backgroundType === 'dark_slate' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 transition-all duration-700">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
        </div>
      )}
      {currentScene.backgroundType === 'parchment' && (
        <div className="absolute inset-0 bg-[#FDFBF7] text-slate-900 transition-all duration-700">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400')`, backgroundSize: 'cover' }}></div>
        </div>
      )}
      {currentScene.backgroundType === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950 text-slate-100 transition-all duration-700"></div>
      )}
      {currentScene.backgroundType === 'color' && (
        <div className="absolute inset-0 text-slate-100 transition-all duration-700" style={{ backgroundColor: currentScene.backgroundValue || '#0F172A' }}></div>
      )}

      {/* 1. PRESENTATION HEADER BAR */}
      <header id="pres-header" className="relative z-10 flex items-center justify-between border-b border-slate-850 pb-3 md:pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
            <Presentation className="text-amber-400" size={18} />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-widest block">HISTOLAB PRESENTATION STAGE</span>
            <h2 className="font-bold text-xs md:text-sm text-slate-100 uppercase tracking-wide truncate max-w-[150px] md:max-w-md">
              {activeMaterial.bab}: {activeMaterial.title}
            </h2>
          </div>
        </div>

        {/* Quick jump slide navigator */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 border border-slate-850 p-1 rounded-xl">
          {localScenes.map((scene, idx) => {
            const isSelected = idx === activeSceneIndex;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveSceneIndex(idx);
                  setMapWalkIndex(0);
                  setActiveTimelineIndex(0);
                  setQuizRevealed(false);
                }}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md scale-105'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title={scene.title}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('story_editor')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Sliders size={13} /> Desainer Alur
          </button>
          <button
            onClick={() => setMode('view')}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-300 text-[11px] font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Minimize2 size={13} /> Keluar
          </button>
        </div>
      </header>

      {/* 2. MAIN STORY SCREEN WORKSPACE */}
      <main className="relative flex-1 my-4 md:my-6 flex flex-col justify-center items-center z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full h-full flex items-center justify-center"
          >
            
            
            <SlideRenderer
              scene={currentScene}
              material={activeMaterial}
              maps={activeMaterial.maps}
              timelineEvents={activeMaterial.timeline}
              mode="presentation"
              activeTimelineIndex={activeTimelineIndex}
              activeMapWalkIndex={mapWalkIndex}
              quizRevealed={quizRevealed}
              activeSubMaterialId={activeSubMaterialId}
              setActiveTimelineIndex={setActiveTimelineIndex}
              setMapWalkIndex={setMapWalkIndex}
              setQuizRevealed={setQuizRevealed}
              setActiveSubMaterialId={setActiveSubMaterialId}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. CONTROL FOOTER BAR */}
      <footer id="pres-footer" className="relative z-10 flex items-center justify-between border-t border-slate-850 pt-3 md:pt-4 shrink-0">
        <div className="text-slate-500 text-[10px] font-mono text-left">
          Gunakan <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">Esc</kbd> untuk keluar • <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">Space</kbd> / <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">→</kbd> untuk melanjutkan
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={activeSceneIndex === 0 && mapWalkIndex === 0 && activeTimelineIndex === 0}
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Sebelumnya"
          >
            <ArrowLeft size={16} />
          </button>

          <span className="font-mono text-xs text-slate-300 font-extrabold bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-850">
            {activeSceneIndex + 1} / {localScenes.length}
          </span>

          <button
            onClick={handleNext}
            disabled={activeSceneIndex === localScenes.length - 1 && 
                      (currentScene.type !== 'map' || mapWalkIndex === (activeMaterial.maps?.find(m => m.id === currentScene.activeMapId)?.pins?.length || 1) - 1) &&
                      (currentScene.type !== 'timeline' || activeTimelineIndex === (activeMaterial.timeline?.length || 1) - 1)}
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Berikutnya"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>

    </div>
  );
}
