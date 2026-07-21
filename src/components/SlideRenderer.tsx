import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, ChevronUp, ChevronDown, Compass, Sparkles, MapPin as MapPinIcon, Quote, Play } from 'lucide-react';
import { StoryScene, StoryMediaItem, Material, HistoricalMap, MapPin } from '../types';
import { GeographicOpenStreetMap } from './HistoricalMapEngine';

interface SlideRendererProps {
  scene: StoryScene;
  material?: Material; // Can be activePres or activeMaterial
  maps?: HistoricalMap[];
  timelineEvents?: any[];
  mode: 'editor' | 'presentation';

  // State
  activeTimelineIndex?: number;
  activeMapWalkIndex?: number;
  quizRevealed?: boolean;
  activeSubMaterialId?: string | null;

  // Setters for interactive elements in presentation mode
  setActiveTimelineIndex?: (idx: number) => void;
  setMapWalkIndex?: (idx: number) => void;
  setQuizRevealed?: (revealed: boolean) => void;
  setActiveSubMaterialId?: (id: string | null) => void;
  
  onOpenMapFocus?: () => void;
  
  children?: React.ReactNode;
}

export function SlideRenderer({
  scene,
  material,
  maps,
  timelineEvents,
  mode,
  activeTimelineIndex = 0,
  activeMapWalkIndex = 0,
  quizRevealed = false,
  activeSubMaterialId = null,
  setActiveTimelineIndex,
  setMapWalkIndex,
  setQuizRevealed,
  setActiveSubMaterialId,
  onOpenMapFocus,
  children
}: SlideRendererProps) {
  
  const renderMediaItems = (items?: StoryMediaItem[]) => {
    if (!items) return null;
    return items.map(item => {
      const DynamicIcon = item.type === 'icon' && item.content ? (LucideIcons as any)[item.content] : null;

      const itemStyle = {
        position: 'absolute' as const,
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${item.w}%`,
        height: `${item.h}%`,
        transform: `rotate(${item.rotate || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
        opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
        border: item.border || 'none',
        borderRadius: item.borderRadius ? `${item.borderRadius}px` : '0px',
        boxShadow: item.shadow || 'none',
        backgroundColor: item.backgroundColor || 'transparent',
        zIndex: item.zIndex || 20,
      };

      const textStyle = {
        fontSize: `${item.fontSize || 16}px`,
        color: item.textColor || '#ffffff',
        fontFamily: item.fontFamily || 'inherit',
        fontWeight: item.fontWeight || 'normal',
        fontStyle: item.fontStyle || 'normal',
        textDecoration: item.textDecoration || 'none',
        lineHeight: item.lineHeight || 1.5,
        letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : 'normal',
        textAlign: item.textAlign || ('left' as any),
        textTransform: item.textTransform || ('none' as any),
      };

      const filterStyle = {
        filter: `brightness(${item.brightness !== undefined ? item.brightness : 100}%) blur(${item.blur || 0}px) grayscale(${item.grayscale || 0}%) sepia(${item.sepia || 0}%)`
      };

      return (
        <div
          key={item.id}
          style={itemStyle}
          className="pointer-events-none flex flex-col justify-center overflow-hidden"
        >
          <div className="w-full h-full overflow-hidden flex flex-col relative" style={{ justifyContent: item.type === 'shape' ? 'center' : 'flex-start' }}>
            {(item.type === 'title' || item.type === 'text') && (
              <div style={textStyle} className="w-full h-full p-2 whitespace-pre-wrap">
                {item.content}
              </div>
            )}
            {item.type === 'quote' && (
              <blockquote 
                style={{ ...textStyle, borderLeft: '4px solid #F59E0B' }}
                className="pl-4 py-1 italic w-full h-full"
              >
                {item.content}
              </blockquote>
            )}
            {item.type === 'image' && (
              <div className="w-full h-full relative" style={filterStyle}>
                <img src={item.content} alt={item.label || "Visual"} className="w-full h-full object-cover" style={{ borderRadius: item.borderRadius ? `${item.borderRadius}px` : '0px' }} referrerPolicy="no-referrer" />
                {item.label && (
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/95 text-white font-bold text-[10px] p-1.5 text-center truncate backdrop-blur-md">
                    {item.label}
                  </span>
                )}
              </div>
            )}
            {item.type === 'shape' && (
              <div 
                className="w-full h-full" 
                style={{
                  ...filterStyle,
                  backgroundColor: item.backgroundColor || '#ffffff',
                  borderRadius: item.shapeType === 'circle' ? '50%' : item.shapeType === 'rounded' ? '12px' : item.borderRadius ? `${item.borderRadius}px` : '0px',
                  border: item.border,
                }}
              >
                {item.shapeType === 'line' && (
                  <div className="w-full h-full bg-transparent flex flex-col justify-center">
                    <div style={{ backgroundColor: item.backgroundColor || '#ffffff', height: '2px', width: '100%' }}></div>
                  </div>
                )}
              </div>
            )}
            {item.type === 'icon' && DynamicIcon && (
              <div className="w-full h-full flex items-center justify-center" style={{ ...textStyle, ...filterStyle }}>
                <DynamicIcon style={{ width: '100%', height: '100%' }} />
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      {/* Background layer */}
      {scene.backgroundType === 'dark_slate' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 transition-all duration-700">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
        </div>
      )}
      {scene.backgroundType === 'parchment' && (
        <div className="absolute inset-0 bg-[#FDFBF7] text-slate-900 transition-all duration-700">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400')`, backgroundSize: 'cover' }}></div>
        </div>
      )}
      {scene.backgroundType === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950 text-slate-100 transition-all duration-700"></div>
      )}
      {scene.backgroundType === 'color' && (
        <div className="absolute inset-0 text-slate-100 transition-all duration-700" style={{ backgroundColor: scene.backgroundValue || '#0F172A' }}></div>
      )}
      {(scene.backgroundType === 'image' || scene.backgroundType === 'pattern' || scene.backgroundType === 'texture') && scene.backgroundValue && (
        <div 
          className="absolute inset-0 transition-all duration-700"
          style={{
            backgroundImage: `url(${scene.backgroundValue})`,
            backgroundSize: scene.backgroundSettings?.fillMode === 'contain' ? 'contain' : scene.backgroundSettings?.fillMode === 'repeat' ? 'auto' : scene.backgroundSettings?.fillMode === 'center' ? 'auto' : 'cover',
            backgroundRepeat: scene.backgroundSettings?.fillMode === 'repeat' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            opacity: scene.backgroundSettings?.opacity !== undefined ? scene.backgroundSettings.opacity / 100 : 1,
            filter: `blur(${scene.backgroundSettings?.blur || 0}px)`,
          }}
        />
      )}

      {/* Main Content Renderers based on scene type */}
      {scene.type === 'cover' && (
        <div className="w-full max-w-4xl text-center space-y-6 px-4 z-10 pointer-events-none relative h-full flex flex-col justify-center items-center">
          <span className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            PRESENTATION COVER
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {scene.title || 'Judul Kosong'}
          </h1>
          <p className="text-slate-300 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {scene.narration || 'Subjudul belum diatur'}
          </p>
        </div>
      )}

      {scene.type === 'narrative' && (
        <div className="w-full h-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center px-4 z-10 pointer-events-none relative">
          <div className="md:col-span-7 space-y-5">
            <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">NARASI SEJARAH</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
              {scene.title}
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-serif drop-shadow-md">
              {scene.narration}
            </p>
          </div>
          <div className="md:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900/60 p-6 text-center space-y-4 backdrop-blur-sm">
              <Quote size={24} className="text-amber-500 mx-auto" />
              <blockquote className="italic text-slate-300 text-xs md:text-sm font-serif">
                Tambahkan kutipan melalui panel elemen (Media Items) untuk memunculkan teks di sini...
              </blockquote>
            </div>
          </div>
        </div>
      )}

      {scene.type === 'timeline' && (
        <div className="w-full h-full flex flex-col justify-between px-2 md:px-4 py-6 z-10">
          <div className="text-center space-y-1 shrink-0">
            <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block drop-shadow-lg">Milestone Timeline Sejarah</span>
            <h3 className="font-extrabold text-lg text-white drop-shadow-lg">{scene.title}</h3>
          </div>

          {timelineEvents?.[activeTimelineIndex] ? (
            <div className="flex-1 my-4 flex items-center justify-center max-w-4xl mx-auto w-full overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
                <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center space-y-3 backdrop-blur-md">
                  <span className="text-amber-400 font-mono font-black text-lg md:text-xl">{timelineEvents[activeTimelineIndex].year}</span>
                  <h4 className="font-bold text-sm md:text-base text-white tracking-tight uppercase">{timelineEvents[activeTimelineIndex].title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">{timelineEvents[activeTimelineIndex].description}</p>
                </div>
                
                <div className="md:col-span-7 bg-slate-900/45 border border-slate-800/60 rounded-2xl p-4 flex flex-col overflow-y-auto no-scrollbar pointer-events-auto backdrop-blur-md">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Eksplorasi Detail Peristiwa:</span>
                  {timelineEvents[activeTimelineIndex].subMaterials && timelineEvents[activeTimelineIndex].subMaterials.length > 0 ? (
                    <div className="space-y-3">
                      {timelineEvents[activeTimelineIndex].subMaterials.map((sub: any) => {
                        const isExpanded = activeSubMaterialId === sub.id;
                        return (
                          <div key={sub.id} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                            <button
                              onClick={() => setActiveSubMaterialId?.(isExpanded ? null : sub.id)}
                              className="w-full p-3 text-left font-bold text-xs hover:bg-slate-900 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
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
                      Tidak ada sub-materi tambahan untuk tahun ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Belum ada event timeline.
            </div>
          )}

          <div className="h-20 border-t border-slate-900/60 bg-slate-950/40 rounded-2xl p-3 flex items-center justify-between gap-4 shrink-0 overflow-x-auto no-scrollbar pointer-events-auto backdrop-blur-md">
            {timelineEvents?.map((evt: any, idx: number) => {
              const isFocused = idx === activeTimelineIndex;
              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    setActiveTimelineIndex?.(idx);
                    setActiveSubMaterialId?.(null);
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

      {scene.type === 'map' && (
        <div className="w-full h-full flex flex-col justify-between px-2 md:px-4 py-6 z-10 pointer-events-auto">
          <div className="text-center space-y-1 shrink-0">
            <span className="font-mono text-[10px] font-bold text-cyan-500 uppercase tracking-widest block drop-shadow-lg">
              Peta Ekspedisi Geografis
            </span>
            <h3 className="font-extrabold text-lg text-white drop-shadow-lg">{scene.title}</h3>
          </div>

          <div className="flex-1 my-3 relative overflow-hidden rounded-2xl border border-slate-900 bg-[#070B13] shadow-2xl">
            {(() => {
              const linkedMap = maps?.find(m => m.id === scene.activeMapId);
              const pins = (linkedMap?.pins || []).filter((p: any) => !p.hidden);
              const activePin = pins[activeMapWalkIndex] || null;

              if (mode === 'editor' && !linkedMap) {
                return (
                  <div className="w-full h-full flex items-center justify-center flex-col space-y-2">
                    <MapPinIcon className="text-cyan-400 mx-auto opacity-50" size={28} />
                    <p className="text-slate-400 text-xs">Belum ada peta yang dihubungkan.</p>
                  </div>
                );
              }

              if (mode === 'editor' && linkedMap && pins.length === 0) {
                 return (
                  <div className="w-full h-full flex items-center justify-center flex-col space-y-2">
                    <MapPinIcon className="text-cyan-400 mx-auto opacity-50" size={28} />
                    <p className="text-slate-400 text-xs">Peta "{linkedMap.name}" belum memiliki koordinat rute.</p>
                  </div>
                );
              }

              return (
                <div className="w-full h-full relative">
                  <GeographicOpenStreetMap
                    pins={pins}
                    showRoute={linkedMap?.showRoute ?? true}
                    activePinId={activePin?.id || null}
                    onPinClick={(p) => {
                      const idx = pins.findIndex((x: any) => x.id === p.id);
                      if (idx !== -1) setMapWalkIndex?.(idx);
                    }}
                  />

                  {mode === 'editor' && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40 pointer-events-none">
                       <button
                          type="button"
                          onClick={() => {
                            if (onOpenMapFocus) onOpenMapFocus();
                          }}
                          className="px-5 py-2.5 pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/30 group"
                        >
                          <Compass size={14} className="animate-spin-slow text-amber-400 group-hover:scale-110 transition-transform" />
                          Buka Peta Mode Penuh
                        </button>
                     </div>
                  )}

                  <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[9px] text-cyan-400 pointer-events-none shadow-xl z-20 flex items-center gap-1.5">
                    <Compass size={10} className="animate-spin-slow text-cyan-400" />
                    <span>GPS HUD • LOKASI AKTIF {pins.length > 0 ? activeMapWalkIndex + 1 : 0} DARI {pins.length}</span>
                  </div>

                  {activePin && (
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-slate-855 p-4 rounded-2xl shadow-2xl z-30 flex items-start gap-3 text-left">
                      <div className="bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-xl text-cyan-400 font-mono font-black text-xs shrink-0">
                        STOP {activeMapWalkIndex + 1}
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

      {scene.type === 'quiz' && (
        <div className="w-full h-full flex items-center justify-center z-10 pointer-events-none relative px-4">
          <div className="w-full max-w-3xl space-y-6">
            <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full drop-shadow-md">
              KUIS TRIVIA SEJARAH
            </span>
            
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {scene.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pointer-events-auto">
              {scene.mediaItems?.find(m => m.type === 'text')?.content.split('\n').map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => setQuizRevealed?.(true)}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                    quizRevealed && opt.startsWith('A.') 
                      ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg scale-102 ring-1 ring-emerald-500/20'
                      : quizRevealed
                        ? 'bg-slate-900/40 border-slate-900/60 opacity-50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-855 backdrop-blur-md'
                  }`}
                >
                  <span className={`text-xs md:text-sm font-bold ${quizRevealed && opt.startsWith('A.') ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {opt}
                  </span>
                </button>
              ))}
              {!scene.mediaItems?.find(m => m.type === 'text') && (
                <div className="text-slate-500 text-xs italic pointer-events-none">
                   Tambahkan elemen Text untuk opsi kuis (pisahkan dengan enter). Opsi pertama (A.) akan dianggap benar.
                </div>
              )}
            </div>

            {quizRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-left backdrop-blur-md"
              >
                <Sparkles className="text-amber-400 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-black text-amber-500 uppercase tracking-widest">Penjelasan Historis:</span>
                  <p className="text-xs text-slate-300 font-serif leading-relaxed">
                    {scene.narration}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {scene.type === 'reflection' && (
        <div className="w-full h-full flex flex-col items-center justify-center z-10 text-center space-y-6 max-w-2xl px-6 pointer-events-none relative">
          <Compass size={48} className="text-rose-400 mb-4 mx-auto" />
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg">
            {scene.title}
          </h2>
          <p className="text-slate-300 font-serif text-sm md:text-base leading-relaxed drop-shadow-md">
            {scene.narration}
          </p>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent my-6"></div>
        </div>
      )}

      {/* Render absolute media items */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="w-full h-full relative pointer-events-auto">
           {children ? children : renderMediaItems(scene.mediaItems)}
        </div>
      </div>

    </div>
  );
}
