import React, { useState } from 'react';
import { 
  Presentation, Minimize2, ArrowUp, ArrowDown, Copy, Trash, Type, FileText, Image, Quote, Sparkles, Tv, BookOpen, Clock, Map, Compass, Sliders, Globe, Navigation, ChevronRight, MapPin, Info, Eye, EyeOff
} from 'lucide-react';
import { Material, StoryScene } from '../types';
import { MapBackground } from './HistoricalMapEngine';

interface StorytellingDesignerProps {
  activeMaterial: Material;
  localScenes: StoryScene[];
  setLocalScenes: (scenes: StoryScene[]) => void;
  selectedSceneId: string | null;
  setSelectedSceneId: (id: string | null) => void;
  selectedMediaItemId: string | null;
  setSelectedMediaItemId: (id: string | null) => void;
  isEditingTextInline: boolean;
  setIsEditingTextInline: (editing: boolean) => void;
  inlineEditText: string;
  setInlineEditText: (text: string) => void;
  onUpdateMaterial: (id: string, updates: Partial<Material>) => void;
  setMode: (mode: 'view' | 'edit' | 'create' | 'presentation' | 'story_editor') => void;
  handleAddScene: (type: StoryScene['type']) => void;
  handleDeleteScene: (id: string) => void;
  handleDuplicateScene: (id: string) => void;
  handleReorderScene: (id: string, direction: 'up' | 'down') => void;
  handleAddMediaItem: (type: 'title' | 'text' | 'quote' | 'image') => void;
  handleUpdateMediaItem: (itemId: string, updates: Partial<any>) => void;
  handleDeleteMediaItem: (itemId: string) => void;
  handleUpdateSceneMeta: (updates: Partial<StoryScene>) => void;
  setActiveSceneIndex: (idx: number) => void;
  setMapWalkIndex: (idx: number) => void;
  setQuizRevealed: (revealed: boolean) => void;
}

export function StorytellingDesigner({
  activeMaterial,
  localScenes,
  setLocalScenes,
  selectedSceneId,
  setSelectedSceneId,
  selectedMediaItemId,
  setSelectedMediaItemId,
  isEditingTextInline,
  setIsEditingTextInline,
  inlineEditText,
  setInlineEditText,
  onUpdateMaterial,
  setMode,
  handleAddScene,
  handleDeleteScene,
  handleDuplicateScene,
  handleReorderScene,
  handleAddMediaItem,
  handleUpdateMediaItem,
  handleDeleteMediaItem,
  handleUpdateSceneMeta,
  setActiveSceneIndex,
  setMapWalkIndex,
  setQuizRevealed
}: StorytellingDesignerProps) {
  

  const activeScene = localScenes.find(s => s.id === selectedSceneId) || localScenes[0] || {
    id: 'default',
    type: 'cover',
    title: activeMaterial.title,
    narration: activeMaterial.content,
    backgroundType: 'dark_slate',
    backgroundValue: ''
  };

  const selectedMediaItem = activeScene?.mediaItems?.find(m => m.id === selectedMediaItemId) || null;

  return (
    <div id="story-designer-root" className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col justify-between font-sans overflow-hidden select-none">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg text-amber-400">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-widest block">HISTOLAB STORYTELLING DESIGNER</span>
            <h1 className="font-bold text-xs text-white uppercase tracking-wide truncate max-w-xs md:max-w-md">
              Materi: {activeMaterial.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSceneIndex(0);
              setMapWalkIndex(0);
              setQuizRevealed(false);
              setMode('presentation');
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Presentation size={13} /> Putar Presentasi
          </button>
          <button
            onClick={() => setMode('view')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            Kembali ke Bank Materi
          </button>
        </div>
      </header>

      {/* 2. THREE-PANEL CORE SYSTEM */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* A. LEFT PANEL: SLIDE LIST / STORYBOARD MAP */}
        <div className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full shrink-0">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">Alur Cerita ({localScenes.length})</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {localScenes.map((scene, idx) => {
              const isSelected = scene.id === selectedSceneId;
              return (
                <div
                  key={scene.id}
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                    setSelectedMediaItemId(null);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg'
                      : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-md text-[10px] font-bold font-mono flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`font-bold text-xs truncate ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                        {scene.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReorderScene(scene.id, 'up'); }}
                        disabled={idx === 0}
                        className="p-0.5 hover:bg-slate-800 rounded disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp size={11} className="text-slate-400 hover:text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReorderScene(scene.id, 'down'); }}
                        disabled={idx === localScenes.length - 1}
                        className="p-0.5 hover:bg-slate-800 rounded disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown size={11} className="text-slate-400 hover:text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicateScene(scene.id); }}
                        className="p-0.5 hover:bg-slate-800 rounded cursor-pointer"
                        title="Duplikat"
                      >
                        <Copy size={11} className="text-slate-400 hover:text-white" />
                      </button>
                      {localScenes.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteScene(scene.id); }}
                          className="p-0.5 hover:bg-red-955/65 rounded cursor-pointer"
                          title="Hapus"
                        >
                          <Trash size={11} className="text-red-400 hover:text-red-300" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                    <span>Tipe: {scene.type}</span>
                    <span className="text-slate-600 lowercase truncate max-w-[80px]">{scene.backgroundType}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide creators */}
          <div className="p-3 bg-slate-950/60 border-t border-slate-800 space-y-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-left">Tambah Scene Baru:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-extrabold">
              <button
                onClick={() => handleAddScene('cover')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-855 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1"
              >
                <Tv size={9} className="text-amber-400" /> Cover
              </button>
              <button
                onClick={() => handleAddScene('narrative')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-855 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1"
              >
                <BookOpen size={9} className="text-indigo-400" /> Narasi
              </button>
              <button
                onClick={() => handleAddScene('timeline')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-855 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1"
              >
                <Clock size={9} className="text-emerald-400" /> Timeline
              </button>
              <button
                onClick={() => handleAddScene('map')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-855 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1"
              >
                <Map size={9} className="text-cyan-400" /> Peta
              </button>
              <button
                onClick={() => handleAddScene('quiz')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-855 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1"
              >
                <Sparkles size={9} className="text-purple-400" /> Kuis
              </button>
              <button
                onClick={() => handleAddScene('reflection')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-855 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1"
              >
                <Compass size={9} className="text-rose-400" /> Refleksi
              </button>
            </div>
          </div>
        </div>

        {/* B. MIDDLE AREA: INTERACTIVE VISUAL PREVIEW CANVAS */}
        <div className="flex-1 bg-slate-950 p-4 md:p-8 flex flex-col justify-center items-center overflow-hidden min-w-0">
          <div className="text-center mb-4 text-[10px] font-mono text-slate-500">
            Double-click pada teks/kutipan untuk edit langsung • Drag handles di properties untuk reposisi
          </div>

          <div className="relative w-full max-w-6xl xl:max-w-[1400px] aspect-video bg-[#0B0F19] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden shrink-0 transition-all">
            {/* Scene backgrounds */}
            {activeScene.backgroundType === 'dark_slate' && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
              </div>
            )}
            {activeScene.backgroundType === 'parchment' && (
              <div className="absolute inset-0 bg-[#FDFBF7] text-slate-900 border border-[#EFEBE4]">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400')`, backgroundSize: 'cover' }}></div>
              </div>
            )}
            {activeScene.backgroundType === 'gradient' && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950 text-slate-100"></div>
            )}
            {activeScene.backgroundType === 'color' && (
              <div className="absolute inset-0 text-slate-100" style={{ backgroundColor: activeScene.backgroundValue || '#0F172A' }}></div>
            )}

            {/* Special placeholders for automatic structures (Timeline and Map nodes) */}
            {activeScene.type === 'timeline' && (
              <div className="absolute inset-4 flex flex-col justify-between z-10 pointer-events-none text-left">
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl max-w-sm">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Interactive Timeline Node</span>
                  <h4 className="text-xs font-bold text-white uppercase">Slide ini menampilkan Linimasa Materi secara otomatis</h4>
                </div>
                <div className="w-full h-1/2 flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/60 font-mono text-[10px]">
                  {activeMaterial.timeline && activeMaterial.timeline.length > 0 ? (
                    <span>✓ {activeMaterial.timeline.length} Milestones Garis Waktu Terhubung</span>
                  ) : (
                    <span>Belum ada Garis Waktu di materi ini</span>
                  )}
                </div>
              </div>
            )}

            {activeScene.type === 'map' && (
              <div className="absolute inset-4 z-10 text-left">
                <div className="relative w-full h-full rounded-2xl border border-slate-800 bg-[#0A0F1D] overflow-hidden flex flex-col justify-between p-4">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06b6d4_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
                  
                  {/* Decorative digital HUD backdrop */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500/10 animate-spin-slow">
                    <Compass size={180} />
                  </div>

                  <div className="z-10 flex items-center justify-between">
                    <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">GIS Live Staging Map</span>
                      <h4 className="text-xs font-bold text-white uppercase">{activeScene.title || "Rute Perjalanan Geografis"}</h4>
                    </div>
                  </div>

                  {/* List of dropped geographic pins */}
                  <div className="z-10 flex-1 my-4 flex items-center justify-center overflow-y-auto max-h-[140px] no-scrollbar">
                    {(() => {
                      const linkedMap = activeMaterial.maps?.find(m => m.id === activeScene.activeMapId);
                      if (!linkedMap) {
                        return (
                          <div className="text-center space-y-2">
                            <MapPin className="text-cyan-400 mx-auto opacity-50" size={24} />
                            <p className="text-slate-400 text-xs">Belum ada peta yang dihubungkan.</p>
                            <p className="text-[9px] text-slate-500">Pilih peta dari panel sebelah kanan.</p>
                          </div>
                        );
                      }

                      if (!linkedMap.pins || linkedMap.pins.length === 0) {
                        return (
                          <div className="text-center space-y-2">
                            <MapPin className="text-cyan-400 mx-auto" size={24} />
                            <p className="text-slate-400 text-xs">Peta {linkedMap.name} belum memiliki pin rute.</p>
                            <p className="text-[9px] text-slate-500">Silakan tambahkan pin dari menu Bank Materi.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg">
                          {linkedMap.pins.map((pin, pIdx) => (
                            <React.Fragment key={pin.id}>
                              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                                <span className="w-4 h-4 rounded bg-cyan-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shrink-0">
                                  {pIdx + 1}
                                </span>
                                <div>
                                  <h5 className="text-[10px] font-bold text-white truncate max-w-[90px]">{pin.label}</h5>
                                  <p className="text-[7px] font-mono text-slate-500">{pin.lat?.toFixed(3) || 0}, {pin.lng?.toFixed(3) || 0}</p>
                                </div>
                              </div>
                              {pIdx < linkedMap.pins.length - 1 && (
                                <ChevronRight className="text-cyan-500 animate-pulse" size={14} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="z-10 bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center gap-2 max-w-sm">
                    <Info size={12} className="text-cyan-400 shrink-0" />
                    <p className="text-[8px] text-slate-300 leading-normal">
                      Peta rute perjalanan di atas akan dirender secara interaktif menggunakan data dari Bank Materi di slide presentasi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customizable Media/Aesthetic Elements */}
            {activeScene.mediaItems?.map((item) => {
              const isSelected = item.id === selectedMediaItemId;
              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMediaItemId(item.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setSelectedMediaItemId(item.id);
                    setIsEditingTextInline(true);
                    setInlineEditText(item.content);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.w}%`,
                    height: `${item.h}%`,
                    transform: `rotate(${item.rotate || 0}deg)`,
                  }}
                  className={`group cursor-move p-2 flex flex-col justify-center rounded-xl transition-all ${
                    isSelected 
                      ? 'ring-2 ring-amber-500 border border-amber-400 bg-amber-500/10 z-30' 
                      : 'hover:ring-1 hover:ring-slate-700 hover:bg-slate-850/10 z-20'
                  }`}
                >
                  {isEditingTextInline && isSelected ? (
                    <textarea
                      value={inlineEditText}
                      onChange={(e) => setInlineEditText(e.target.value)}
                      onBlur={() => {
                        handleUpdateMediaItem(item.id, { content: inlineEditText });
                        setIsEditingTextInline(false);
                      }}
                      className="w-full h-full p-1 bg-slate-900 text-white border border-amber-500 rounded outline-none resize-none text-[11px] font-medium leading-relaxed font-serif"
                      autoFocus
                    />
                  ) : (
                    <div className="w-full h-full overflow-hidden flex flex-col justify-center relative">
                      {item.type === 'title' && (
                        <h3 
                          style={{ fontSize: `${item.fontSize || 20}px`, color: item.textColor || '#ffffff' }}
                          className="font-bold tracking-tight text-center w-full"
                        >
                          {item.content}
                        </h3>
                      )}
                      {item.type === 'text' && (
                        <p 
                          style={{ fontSize: `${item.fontSize || 12}px`, color: item.textColor || '#CBD5E1' }}
                          className="leading-relaxed whitespace-pre-wrap text-center w-full font-serif"
                        >
                          {item.content}
                        </p>
                      )}
                      {item.type === 'quote' && (
                        <blockquote 
                          style={{ fontSize: `${item.fontSize || 14}px`, color: item.textColor || '#F59E0B' }}
                          className="italic border-l-2 border-amber-500/50 pl-2.5 font-serif py-0.5 text-center w-full"
                        >
                          {item.content}
                        </blockquote>
                      )}
                      {item.type === 'image' && (
                        <div className="w-full h-full relative border border-slate-800 rounded-lg overflow-hidden bg-slate-950 flex flex-col justify-between">
                          <img src={item.content} alt={item.label || "Visual"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {item.label && (
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/95 text-white font-bold text-[8px] p-0.5 text-center truncate border-t border-slate-800">
                              {item.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resize tooltips/deletion handles */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex items-center gap-1 z-40 bg-slate-900 px-1 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMediaItem(item.id);
                        }}
                        className="p-0.5 hover:bg-red-950 rounded cursor-pointer"
                        title="Hapus Elemen"
                      >
                        <Trash size={10} className="text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* C. RIGHT PANEL: DETAILED PROPERTIES INSPECTOR */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 space-y-5 overflow-y-auto no-scrollbar shrink-0 text-left flex flex-col">
          
          {!selectedMediaItem ? (
            <div className="space-y-3.5 flex-1 pb-4">
              <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-slate-800 pb-2">Slide Settings</span>
              
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Judul Slide:</label>
                <input
                  type="text"
                  value={activeScene.title}
                  onChange={(e) => handleUpdateSceneMeta({ title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Catatan Narasi Guru:</label>
                <textarea
                  value={activeScene.narration || ''}
                  onChange={(e) => handleUpdateSceneMeta({ narration: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-serif text-slate-300 outline-none focus:border-amber-500/50 resize-none"
                  placeholder="Ketik poin narasi guru untuk memandu bercerita di kelas..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Tipe Background:</label>
                  <select
                    value={activeScene.backgroundType}
                    onChange={(e) => handleUpdateSceneMeta({ backgroundType: e.target.value as any })}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-amber-500/50"
                  >
                    <option value="dark_slate">Dark Slate</option>
                    <option value="parchment">Parchment</option>
                    <option value="gradient">Gradient</option>
                    <option value="color">Warna Solid</option>
                  </select>
                </div>

                {activeScene.backgroundType === 'color' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Warna Background:</label>
                    <input
                      type="color"
                      value={activeScene.backgroundValue || '#0F172A'}
                      onChange={(e) => handleUpdateSceneMeta({ backgroundValue: e.target.value })}
                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-0.5"
                    />
                  </div>
                )}
              </div>

              {/* If slide type is MAP: link to an existing HistoricalMap */}
              {activeScene.type === 'map' && (
                <div className="space-y-3.5 pt-2 border-t border-slate-800/60 mt-2">
                  <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Peta Terhubung:</span>
                    </div>
                    
                    <select
                      value={activeScene.activeMapId || ''}
                      onChange={(e) => handleUpdateSceneMeta({ activeMapId: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                    >
                      <option value="">-- Pilih Peta dari Bank Materi --</option>
                      {activeMaterial.maps?.map(mapItem => (
                        <option key={mapItem.id} value={mapItem.id}>
                          {mapItem.name} ({mapItem.pins?.length || 0} Pin)
                        </option>
                      ))}
                    </select>

                    <div className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                      Peta dan pin (titik rute) dibuat dari Bank Materi. Sistem ini memastikan sinkronisasi data (Single Source of Truth) antara dashboard dan presentasi.
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3.5 border-t border-slate-800 pt-4 mt-auto">
                <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block text-left">Tambah Elemen Baru</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <button
                    onClick={() => handleAddMediaItem('title')}
                    className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-850 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Type size={12} className="text-indigo-400" /> Judul
                  </button>
                  <button
                    onClick={() => handleAddMediaItem('text')}
                    className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-850 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={12} className="text-emerald-400" /> Paragraf
                  </button>
                  <button
                    onClick={() => handleAddMediaItem('quote')}
                    className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-850 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Quote size={12} className="text-amber-400" /> Kutipan
                  </button>
                  <button
                    onClick={() => handleAddMediaItem('image')}
                    className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-850 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Image size={12} className="text-cyan-400" /> Gambar
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4 flex-1">
              <div className="flex flex-col gap-2 border-b border-slate-800 pb-3">
                <button 
                  onClick={() => setSelectedMediaItemId(null)}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer w-fit"
                >
                  <Navigation size={10} className="-rotate-90" /> Kembali ke Slide
                </button>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">Properties Elemen</span>
                  <button
                    onClick={() => handleDeleteMediaItem(selectedMediaItem.id)}
                    className="px-2 py-1 bg-red-955/40 border border-red-900/30 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-900/20 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                  {selectedMediaItem.type === 'image' ? 'URL Gambar:' : 'Konten / Teks:'}
                </label>
                <textarea
                  value={selectedMediaItem.content}
                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500/50 resize-none font-serif text-left"
                />
              </div>

              {selectedMediaItem.type === 'image' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Keterangan Gambar / Caption:</label>
                  <input
                    type="text"
                    value={selectedMediaItem.label || ''}
                    onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { label: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500/50"
                    placeholder="Masukkan caption gambar kuno..."
                  />
                </div>
              )}

              {/* Sizing/Positioning coordinate sliders */}
              <div className="space-y-3.5 bg-slate-950/40 p-3 rounded-xl border border-slate-855">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Koordinat Layar (%)</span>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Posisi X:</span>
                    <span className="font-bold text-amber-500">{selectedMediaItem.x}%</span>
                  </div>
                  <input
                    type="range" min="0" max="90" value={selectedMediaItem.x}
                    onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { x: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Posisi Y:</span>
                    <span className="font-bold text-amber-500">{selectedMediaItem.y}%</span>
                  </div>
                  <input
                    type="range" min="0" max="90" value={selectedMediaItem.y}
                    onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { y: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Lebar Elemen:</span>
                    <span className="font-bold text-amber-500">{selectedMediaItem.w}%</span>
                  </div>
                  <input
                    type="range" min="10" max="100" value={selectedMediaItem.w}
                    onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { w: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Tinggi Elemen:</span>
                    <span className="font-bold text-amber-500">{selectedMediaItem.h}%</span>
                  </div>
                  <input
                    type="range" min="5" max="100" value={selectedMediaItem.h}
                    onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { h: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1"
                  />
                </div>
              </div>

              {/* Additional styling properties */}
              <div className="grid grid-cols-2 gap-3">
                {selectedMediaItem.type !== 'image' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Ukuran Font:</label>
                    <input
                      type="number" min="10" max="48" value={selectedMediaItem.fontSize || 14}
                      onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                    />
                  </div>
                )}

                {selectedMediaItem.type !== 'image' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Warna Teks:</label>
                    <input
                      type="color" value={selectedMediaItem.textColor || '#ffffff'}
                      onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { textColor: e.target.value })}
                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                    />
                  </div>
                )}

                <div className="space-y-1.5 col-span-2">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Kemiringan Rotasi:</span>
                    <span className="font-bold text-amber-500">{selectedMediaItem.rotate || 0}°</span>
                  </div>
                  <input
                    type="range" min="-45" max="45" value={selectedMediaItem.rotate || 0}
                    onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { rotate: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
