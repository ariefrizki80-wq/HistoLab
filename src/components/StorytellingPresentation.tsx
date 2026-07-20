import React from 'react';
import { 
  Presentation, Minimize2, ArrowLeft, ArrowRight, BookOpen, Sliders,
  ChevronDown, ChevronUp, Layers, Target, MapPin, Sparkles, CheckCircle2, Quote, Compass, Tv, Globe, Map as MapIcon, Info, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Material, StoryScene } from '../types';
import { MapBackground, GeographicOpenStreetMap } from './HistoricalMapEngine';

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
            
            {/* RENDER BY SCENE TYPE */}
            {currentScene.type === 'cover' && (
              <div className="w-full max-w-4xl text-center space-y-6 px-4">
                <span className="inline-block bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {activeMaterial.bab}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-sans text-white tracking-tight leading-none drop-shadow-lg">
                  {currentScene.title || activeMaterial.title}
                </h1>
                <p className="text-slate-400 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  {currentScene.narration || activeMaterial.subtitle}
                </p>
                
                {/* Absolute Media Items */}
                {currentScene.mediaItems?.map(item => (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      width: `${item.w}%`,
                      height: `${item.h}%`,
                      transform: `rotate(${item.rotate || 0}deg)`
                    }}
                    className="z-20 pointer-events-none"
                  >
                    {item.type === 'image' && (
                      <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
                        <img src={item.content} alt="Media" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    {item.type === 'quote' && (
                      <p style={{ color: item.textColor || '#f59e0b', fontSize: `${item.fontSize || 16}px` }} className="italic font-serif pl-4 border-l-2 border-amber-500/50">
                        {item.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {currentScene.type === 'narrative' && (
              <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center px-4">
                <div className="md:col-span-7 space-y-5">
                  <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">NARASI SEJARAH</span>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                    {currentScene.title}
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-serif">
                    {currentScene.narration}
                  </p>
                </div>
                
                <div className="md:col-span-5 relative">
                  {currentScene.mediaItems?.find(m => m.type === 'image') ? (
                    (() => {
                      const imgItem = currentScene.mediaItems.find(m => m.type === 'image')!;
                      return (
                        <div className="rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900 p-2 transform rotate-1">
                          <img src={imgItem.content} alt="Artifact" className="w-full aspect-[4/3] object-cover rounded-2xl" referrerPolicy="no-referrer" />
                          {imgItem.label && (
                            <p className="text-[10px] text-slate-400 font-bold text-center mt-2 uppercase tracking-wide">
                              {imgItem.label}
                            </p>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900/60 p-6 text-center space-y-4">
                      <Quote size={24} className="text-amber-500 mx-auto" />
                      <blockquote className="italic text-slate-300 text-xs md:text-sm font-serif">
                        {currentScene.mediaItems?.find(m => m.type === 'quote')?.content || '"Sejarah ditulis oleh para pemenang, namun kebenaran diungkap oleh penyelidikan yang jujur."'}
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentScene.type === 'timeline' && (
              <div className="w-full h-full flex flex-col justify-between px-2 md:px-4">
                {/* Header/Title */}
                <div className="text-center space-y-1 shrink-0">
                  <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Milestone Timeline Sejarah</span>
                  <h3 className="font-extrabold text-lg text-white">{currentScene.title}</h3>
                </div>

                {/* Focused Event Detailed Area */}
                {activeMaterial.timeline?.[activeTimelineIndex] && (
                  <div className="flex-1 my-4 flex items-center justify-center max-w-4xl mx-auto w-full overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
                      <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center space-y-3">
                        <span className="text-amber-400 font-mono font-black text-lg md:text-xl">{activeMaterial.timeline[activeTimelineIndex].year}</span>
                        <h4 className="font-bold text-sm md:text-base text-white tracking-tight uppercase">{activeMaterial.timeline[activeTimelineIndex].title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-serif">{activeMaterial.timeline[activeTimelineIndex].description}</p>
                      </div>
                      
                      <div className="md:col-span-7 bg-slate-900/45 border border-slate-800/60 rounded-2xl p-4 flex flex-col overflow-y-auto no-scrollbar">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Eksplorasi Detail Peristiwa:</span>
                        {activeMaterial.timeline[activeTimelineIndex].subMaterials && activeMaterial.timeline[activeTimelineIndex].subMaterials.length > 0 ? (
                          <div className="space-y-3">
                            {activeMaterial.timeline[activeTimelineIndex].subMaterials.map(sub => {
                              const isExpanded = activeSubMaterialId === sub.id;
                              return (
                                <div key={sub.id} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                                  <button
                                    onClick={() => setActiveSubMaterialId(isExpanded ? null : sub.id)}
                                    className="w-full p-3 text-left font-bold text-xs hover:bg-slate-900 flex items-center justify-between text-slate-200 transition-colors"
                                  >
                                    <span>{sub.title}</span>
                                    {isExpanded ? <ChevronUp size={14} className="text-amber-400" /> : <ChevronDown size={14} className="text-slate-500" />}
                                  </button>
                                  {isExpanded && (
                                    <div className="p-3 border-t border-slate-900 text-xs text-slate-300 font-serif leading-relaxed bg-slate-950/80">
                                      {sub.content}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
                            Tidak ada sub-materi tambahan untuk tahun ini. Gunakan editor untuk menambahkan detail!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Horizontal Timeline Track */}
                <div className="h-20 border-t border-slate-900/60 bg-slate-950/40 rounded-2xl p-3 flex items-center justify-between gap-4 shrink-0 overflow-x-auto no-scrollbar">
                  {activeMaterial.timeline?.map((evt, idx) => {
                    const isFocused = idx === activeTimelineIndex;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setActiveTimelineIndex(idx);
                          setActiveSubMaterialId(null);
                        }}
                        className={`px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer text-center shrink-0 min-w-[120px] ${
                          isFocused
                            ? 'bg-amber-500/10 border border-amber-500/40 shadow-lg scale-105'
                            : 'border border-slate-900 hover:bg-slate-900/40'
                        }`}
                      >
                        <span className={`block text-xs font-mono font-black ${isFocused ? 'text-amber-400' : 'text-slate-400'}`}>{evt.year}</span>
                        <span className={`block text-[10px] truncate ${isFocused ? 'text-white font-extrabold' : 'text-slate-500'}`}>{evt.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentScene.type === 'map' && (
              <div className="w-full h-full flex flex-col justify-between px-2 md:px-4">
                {/* Header/Title */}
                <div className="text-center space-y-1 shrink-0">
                  <span className="font-mono text-[10px] font-bold text-cyan-500 uppercase tracking-widest block">
                    Peta Ekspedisi Geografis (Online Map)
                  </span>
                  <h3 className="font-extrabold text-lg text-white">{currentScene.title}</h3>
                </div>

                {/* Interactive Map Visualizer */}
                <div className="flex-1 my-3 relative overflow-hidden rounded-2xl border border-slate-900 bg-[#070B13]">
                  {(() => {
                    const linkedMap = activeMaterial.maps?.find(m => m.id === currentScene.activeMapId);
                    const pins = (linkedMap?.pins || []).filter(p => !p.hidden);
                    const activePin = pins[mapWalkIndex] || null;

                    return (
                      <div className="w-full h-full relative">
                        <GeographicOpenStreetMap
                          pins={pins}
                          showRoute={linkedMap?.showRoute ?? true}
                          activePinId={activePin?.id || null}
                          onPinClick={(p) => {
                            const idx = pins.findIndex(x => x.id === p.id);
                            if (idx !== -1) setMapWalkIndex(idx);
                          }}
                        />

                        {/* Top overlay showing Active GPS Staging HUD */}
                        <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[9px] text-cyan-400 pointer-events-none shadow-xl z-20 flex items-center gap-1.5">
                          <Compass size={10} className="animate-spin-slow text-cyan-400" />
                          <span>GPS HUD • LOKASI AKTIF {pins.length > 0 ? mapWalkIndex + 1 : 0} DARI {pins.length}</span>
                        </div>

                        {/* Card overlay for Active GIS Point */}
                        {activePin && (
                          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-slate-855 p-4 rounded-2xl shadow-2xl z-30 flex items-start gap-3 text-left">
                            <div className="bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-xl text-cyan-400 font-mono font-black text-xs shrink-0">
                              STOP {mapWalkIndex + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                              <h5 className="font-extrabold text-sm text-white uppercase tracking-wider">{activePin.label}</h5>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">{activePin.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {currentScene.type === 'quiz' && (
              <div className="w-full max-w-3xl space-y-6 px-4">
                <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  KUIS TRIVIA SEJARAH
                </span>
                
                <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  {currentScene.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentScene.mediaItems?.find(m => m.type === 'text')?.content.split('\n').map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setQuizRevealed(true)}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                        quizRevealed && opt.startsWith('A.') // Assumes Option A is correct as default for sample
                          ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg scale-102 ring-1 ring-emerald-500/20'
                          : quizRevealed
                            ? 'bg-slate-900/40 border-slate-900/60 opacity-50'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-855'
                      }`}
                    >
                      <span className={`text-xs md:text-sm font-bold ${quizRevealed && opt.startsWith('A.') ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>

                {quizRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-left"
                  >
                    <Sparkles className="text-amber-400 shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-black text-amber-500 uppercase tracking-widest">Penjelasan Historis:</span>
                      <p className="text-xs text-slate-300 font-serif leading-relaxed">
                        {currentScene.mediaItems?.find(m => m.type === 'quote')?.content || 'Jawaban benar adalah pilihan teratas. Penyelidikan arsip sezaman mengonfirmasi hal tersebut secara faktual.'}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setQuizRevealed(true)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 mx-auto cursor-pointer transition-colors"
                  >
                    <CheckCircle2 size={14} /> Periksa Jawaban
                  </button>
                )}
              </div>
            )}

            {currentScene.type === 'reflection' && (
              <div className="w-full max-w-3xl text-center space-y-6 px-4">
                <span className="inline-block bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  REFLEKSI BELAJAR SEJARAH
                </span>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-serif">
                  {currentScene.title}
                </h2>
                
                <div className="p-6 bg-slate-900/65 border border-slate-850 rounded-2xl max-w-xl mx-auto space-y-4">
                  <Compass size={24} className="text-rose-400 mx-auto" />
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-serif italic">
                    {currentScene.narration || '"Bagaimana menurut Anda peristiwa ini memengaruhi struktur kehidupan bangsa kita saat ini? Diskusikan dengan teman sebangku Anda."'}
                  </p>
                </div>

                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  HistoLab • Refleksi Filosofis Kelas Sejarah
                </p>
              </div>
            )}

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
