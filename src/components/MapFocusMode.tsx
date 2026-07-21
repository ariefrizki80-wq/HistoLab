import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, X, Volume2, VolumeX, Play, Pause, 
  ExternalLink, Clock, Compass, Award, Activity, ChevronRight, 
  ChevronLeft, ArrowRight, BookOpen, Film, ListPlus, Check, Sparkles, MapPin as MapPinIcon, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoricalMap, MapPin } from '../types';
import { GeographicOpenStreetMap, MapBackground } from './HistoricalMapEngine';

interface MapFocusModeProps {
  mapItem: HistoricalMap;
  initialPinIndex?: number;
  onClose: () => void;
  onNextSlide?: () => void; // For "Lanjut ke Slide Berikutnya" in presentation mode
  isPresentationMode?: boolean;
}

// Helper to match custom Unsplash images to default pins for breathtaking visuals
const getPinImage = (label: string): string => {
  const lbl = label.toLowerCase();
  if (lbl.includes('amsterdam') || lbl.includes('lisbon')) {
    return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800';
  }
  if (lbl.includes('harapan') || lbl.includes('hope')) {
    return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=800';
  }
  if (lbl.includes('banten')) {
    return 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=800';
  }
  if (lbl.includes('banda') || lbl.includes('maluku')) {
    return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800';
  }
  if (lbl.includes('paris') || lbl.includes('bastille')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800';
  }
  if (lbl.includes('versailles')) {
    return 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800';
  }
  return 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=800';
};

// Helper to dynamically yield 3 interesting historical key facts based on pin description
const getPinFacts = (pin: MapPin): string[] => {
  if (pin.keyFacts && pin.keyFacts.length > 0) return pin.keyFacts;
  
  const lbl = pin.label.toLowerCase();
  if (lbl.includes('amsterdam') || lbl.includes('lisbon')) {
    return [
      'Pusat pemetaan kartografi maritim paling maju di Eropa abad ke-16.',
      'Menyimpan rahasia pelayaran timur ("Secret of the Indies") dari publik.',
      'Meluncurkan kapal pertama pencari kepulauan rempah-rempah Banten.'
    ];
  }
  if (lbl.includes('harapan')) {
    return [
      'Ditemukan pertama kali oleh penjelajah Portugis Bartolomeu Dias pada 1488.',
      'Arus laut dingin Benguela bertemu dengan arus hangat Agulhas menciptakan badai ekstrem.',
      'Tempat pemberhentian kru kapal untuk memulihkan penyakit sariawan maritim (scurvy).'
    ];
  }
  if (lbl.includes('banten')) {
    return [
      'Salah satu pelabuhan perdagangan internasional lada terbesar di Asia Tenggara.',
      'Memiliki menara mercusuar ikonik yang dirancang oleh arsitek Cina, Cilik-A-Gung.',
      'Tempat pendaratan pertama Cornelis de Houtman tahun 1596 yang membuka babak baru kolonialisme.'
    ];
  }
  if (lbl.includes('banda')) {
    return [
      'Satu-satunya penghasil pala (nutmeg) dunia sebelum ditanam di belahan bumi lain.',
      'Objek Perjanjian Breda 1667, di mana Belanda menukar Pulau Run dengan Manhattan, New York.',
      'Mengalami pembantaian besar-besaran oleh gubernur jenderal VOC Jan Pieterszoon Coen.'
    ];
  }
  
  // Dynamic generic fallback based on description length
  return [
    'Lokasi ini memegang posisi geografis strategis dalam lalu lintas komoditas perdagangan dunia.',
    'Catatan dokumenter tertulis menunjukkan signifikansi taktis area ini sejak ratusan tahun lalu.',
    'Peninggalan fisik arkeologis mengonfirmasi adanya asimilasi budaya lokal dan pendatang.'
  ];
};

export default function MapFocusMode({
  mapItem,
  initialPinIndex = -1,
  onClose,
  onNextSlide,
  isPresentationMode = false
}: MapFocusModeProps) {
  const pins = mapItem.pins || [];
  const [activePinIndex, setActivePinIndex] = useState<number>(initialPinIndex);
  const activePin = activePinIndex >= 0 && activePinIndex < pins.length ? pins[activePinIndex] : null;
  const useGeographicMap = true; // Force-enabled for real-time GIS OpenStreetMap

  // Zoom and pan state for static map
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Media states in popup
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isShowingVideo, setIsShowingVideo] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis API for audio narration feature
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Sync state if initial pin changes
  useEffect(() => {
    if (initialPinIndex >= 0 && initialPinIndex < pins.length) {
      setActivePinIndex(initialPinIndex);
    }
  }, [initialPinIndex, pins.length]);

  // Handle flyTo or focus translation when active pin changes
  useEffect(() => {
    if (activePin) {
      if (!useGeographicMap) {
        focusOnCoordinate(activePin.x, activePin.y, 1.8);
      }
      
      // Stop speech synthesis from previous pin
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsPlayingAudio(false);
      }
      setIsShowingVideo(false);
    }
  }, [activePinIndex]);

  // Audio Tour (Text to Speech) Narrator
  const handleToggleAudio = () => {
    if (!synthRef.current || !activePin) return;

    if (isPlayingAudio) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    } else {
      const text = `${activePin.label}. ${activePin.description || 'Lokasi bersejarah berharga.'}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Indonesian voice
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };
      
      utteranceRef.current = utterance;
      setIsPlayingAudio(true);
      synthRef.current.speak(utterance);
    }
  };

  // Zoom / Pan helpers for static maps
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.4, 4));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.4, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePinIndex(-1);
    setIsShowingVideo(false);
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    }
  };

  const focusOnCoordinate = (pctX: number, pctY: number, scale = 2) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setZoom(scale);
    
    const pixelX = (pctX / 100) * rect.width;
    const pixelY = (pctY / 100) * rect.height;
    
    const panX = (rect.width / 2) - (pixelX * scale);
    const panY = (rect.height / 2) - (pixelY * scale);
    
    setPan({ x: panX, y: panY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (useGeographicMap || zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Navigations between pins
  const handleNextPin = () => {
    if (activePinIndex < pins.length - 1) {
      setActivePinIndex(prev => prev + 1);
    } else {
      // Loop or stop
      showToast("Anda telah mencapai ujung rute.");
    }
  };

  const handlePrevPin = () => {
    if (activePinIndex > 0) {
      setActivePinIndex(prev => prev - 1);
    }
  };

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const theme = mapItem.mapStyle || 'vintage';
  const themeStyles = {
    vintage: {
      bg: 'bg-[#12100E]',
      hudBg: 'bg-amber-950/90 border-amber-800/40 text-[#E6C9A8]',
      cardBg: 'bg-[#FCFAF2] border-amber-900/10 text-[#362713] shadow-2xl',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      accentText: 'text-amber-700 font-serif',
      iconText: 'text-amber-600',
      buttonPrimary: 'bg-amber-800 hover:bg-amber-700 text-white shadow-md',
      buttonSec: 'bg-amber-50 hover:bg-amber-100/60 text-amber-900 border-amber-200/60',
      lineColor: '#C8A261'
    },
    tactical: {
      bg: 'bg-[#030712]',
      hudBg: 'bg-slate-950/90 border-cyan-800/40 text-cyan-400',
      cardBg: 'bg-slate-900/95 border-cyan-500/20 text-slate-100 shadow-cyan-500/5',
      badge: 'bg-cyan-950 text-cyan-400 border-cyan-800/40',
      accentText: 'text-cyan-400 font-mono',
      iconText: 'text-cyan-400',
      buttonPrimary: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold',
      buttonSec: 'bg-slate-850 hover:bg-slate-800 text-cyan-200 border-cyan-900/40',
      lineColor: '#06B6D4'
    },
    maritime: {
      bg: 'bg-[#0A141D]',
      hudBg: 'bg-[#0E202E]/95 border-emerald-800/30 text-[#E2C391]',
      cardBg: 'bg-[#122435]/95 border-[#E2C391]/20 text-yellow-50 shadow-2xl',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-900',
      accentText: 'text-yellow-500 font-serif',
      iconText: 'text-[#E2C391]',
      buttonPrimary: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold',
      buttonSec: 'bg-[#0B1824] hover:bg-[#122435] text-[#E2C391] border-[#E2C391]/20',
      lineColor: '#E2C391'
    }
  }[theme];

  return (
    <div className={`fixed inset-0 z-[150] ${themeStyles.bg} overflow-hidden select-none flex flex-col font-sans`}>
      
      {/* 1. MAP FOCUS HEAD-UP DISPLAY OVERLAYS (Floating Widgets) */}
      
      {/* Floating Header Panel (Apple/Google Maps Minimalist style) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Side: Map Info & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`px-4 py-2 rounded-2xl ${themeStyles.hudBg} border backdrop-blur-md shadow-xl flex items-center gap-2.5 text-xs font-bold`}>
            <Compass size={16} className="animate-spin-slow text-amber-500" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider opacity-60 font-mono">MAP FOCUS MODE</span>
              <span className="block font-serif font-extrabold text-sm">{mapItem.name} <span className="text-amber-500 text-[11px]">({mapItem.era})</span></span>
            </div>
          </div>

          {!useGeographicMap && (
            <div className={`p-1 rounded-xl ${themeStyles.hudBg} border backdrop-blur-md shadow-xl flex gap-1 items-center pointer-events-auto`}>
              <button 
                onClick={handleZoomOut} 
                disabled={zoom <= 1}
                className="p-1.5 hover:bg-white/5 rounded-lg disabled:opacity-30 cursor-pointer text-xs"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="font-mono text-[10px] px-1 font-bold">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={handleZoomIn} 
                disabled={zoom >= 4}
                className="p-1.5 hover:bg-white/5 rounded-lg disabled:opacity-30 cursor-pointer text-xs"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              {zoom > 1 && (
                <button 
                  onClick={handleResetView}
                  className="p-1.5 hover:bg-white/5 rounded-lg cursor-pointer text-xs text-amber-500"
                  title="Reset Viewport"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Exit & Presentation Navigation */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Slide Builder Quick Notification Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className="px-3.5 py-2 bg-slate-900 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-xl shadow-2xl shrink-0"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          {isPresentationMode && onNextSlide && (
            <button
              onClick={onNextSlide}
              className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer border border-indigo-500/20 group animate-pulse hover:animate-none"
            >
              Lanjut ke Slide Berikutnya <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-3 bg-red-950/80 hover:bg-red-900/90 text-red-100 rounded-2xl border border-red-500/20 backdrop-blur-md shadow-xl cursor-pointer transition-all flex items-center justify-center"
            title="Keluar Map Focus"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Floating GPS HUD Coordinates in bottom left corner */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden md:flex flex-col gap-1 text-[9px] font-mono text-white/50 bg-slate-950/40 p-2 rounded-lg border border-white/5">
        <div>COORDINATES: {activePin ? `${activePin.lat?.toFixed(4) || 'X%'}, ${activePin.lng?.toFixed(4) || 'Y%'}` : 'CENTERED'}</div>
        <div>STORY-MAP GLYPH: ONLINE_MAP_ACTIVE // V3</div>
      </div>

      {/* 2. MAP MAIN AREA */}
      <div
        ref={containerRef}
        onMouseDown={useGeographicMap ? undefined : handleMouseDown}
        onMouseMove={useGeographicMap ? undefined : handleMouseMove}
        onMouseUp={useGeographicMap ? undefined : handleMouseUp}
        onMouseLeave={useGeographicMap ? undefined : handleMouseUp}
        className={`flex-1 w-full h-full relative overflow-hidden ${useGeographicMap ? '' : (isDragging ? 'cursor-grabbing' : 'cursor-grab')}`}
      >
        {useGeographicMap ? (
          <GeographicOpenStreetMap
            pins={pins}
            showRoute={mapItem.showRoute}
            activePinId={activePin?.id}
            onPinClick={(pin) => {
              const idx = pins.findIndex(x => x.id === pin.id);
              if (idx !== -1) setActivePinIndex(idx);
            }}
            editorMode="pan"
          />
        ) : (
          <div
            ref={mapRef}
            className="absolute inset-0 w-full h-full origin-center select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.1, 0.8, 0.25, 1)'
            }}
          >
            <MapBackground style={theme} imageUrl={mapItem.imageUrl} />

            {/* Connecting Route */}
            {mapItem.showRoute && pins.length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d={pins.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke={themeStyles.lineColor}
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
              </svg>
            )}

            {/* Pins on Custom Map */}
            {pins.map((pin, idx) => {
              const isSelected = activePinIndex === idx;
              return (
                <div
                  key={pin.id}
                  className="absolute z-20 cursor-pointer"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePinIndex(idx);
                  }}
                >
                  <motion.div whileHover={{ scale: 1.2 }} className="relative flex items-center justify-center">
                    {isSelected && (
                      <span className="absolute inline-flex h-10 w-10 rounded-full bg-amber-500 opacity-45 animate-ping"></span>
                    )}
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold font-mono shadow-2xl transition-all text-xs ${
                      isSelected 
                        ? 'bg-amber-400 text-slate-950 border-white scale-115 ring-4 ring-amber-500/20' 
                        : (theme === 'vintage' ? 'bg-amber-800 text-white border-white' : 'bg-indigo-600 text-white border-slate-900')
                    }`}>
                      {idx + 1}
                    </div>
                    
                    {/* Small Floating label above pin */}
                    <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 text-white font-medium text-[9px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                      {pin.label}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. POPUP SIDE-DRAWER / CARD (Google Earth style, lightweight and elegant) */}
        <AnimatePresence>
          {activePin && (
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className={`absolute top-20 right-4 bottom-4 w-full max-w-sm md:max-w-[420px] rounded-3xl border z-30 flex flex-col pointer-events-auto overflow-hidden ${themeStyles.cardBg}`}
            >
              
              {/* Media Header (Simulated or Real Image) */}
              <div className="h-44 relative bg-slate-950 overflow-hidden shrink-0">
                <img 
                  src={getPinImage(activePin.label)} 
                  alt={activePin.label} 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                {/* Pin Index Badge */}
                <div className="absolute top-4 left-4 bg-amber-500/95 border border-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg font-mono">
                  TITIK {activePinIndex + 1} / {pins.length}
                </div>

                <button 
                  onClick={() => setActivePinIndex(-1)}
                  className="absolute top-4 right-4 p-1.5 bg-slate-950/60 hover:bg-slate-900 text-white hover:text-red-400 rounded-full cursor-pointer border border-white/10"
                >
                  <X size={14} />
                </button>

                {/* Subtitle / Era Info */}
                <div className="absolute bottom-4 left-5 right-5 text-left text-white text-xs drop-shadow-md flex items-center gap-1.5 font-mono">
                  <Clock size={11} className="text-amber-400" />
                  <span>{activePin.timelinePeriod || mapItem.era || 'Zaman Sejarah'}</span>
                </div>
              </div>

              {/* Popup Scrollable Body Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar text-left">
                
                {/* Title & Speech narration bar */}
                <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-3">
                  <div>
                    <h3 className="font-serif font-black text-lg md:text-xl tracking-tight leading-tight uppercase">
                      {activePin.label}
                    </h3>
                  </div>
                  
                  {/* TTS Voice Narration Tour button */}
                  <button
                    onClick={handleToggleAudio}
                    className={`p-2.5 rounded-full transition-all cursor-pointer border shrink-0 flex items-center justify-center ${
                      isPlayingAudio 
                        ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    }`}
                    title={isPlayingAudio ? "Hentikan Narasi Suara" : "Dengarkan Narasi Suara"}
                  >
                    {isPlayingAudio ? <Volume2 size={15} /> : <Volume2 size={15} className="opacity-60" />}
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 block font-mono">Analisis Konteks Sejarah:</span>
                  <p className="text-xs md:text-sm leading-relaxed font-serif font-medium opacity-90 whitespace-pre-wrap">
                    {activePin.description || 'Lokasi geografis ini merupakan saksi kunci pergerakan peradaban kuno yang mengubah kontur perdagangan global.'}
                  </p>
                </div>

                {/* Interactive Facts List */}
                <div className="space-y-2 bg-slate-500/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 block font-mono flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" /> Fakta Penting & Karakteristik:
                  </span>
                  
                  <ul className="space-y-2 text-xs text-left">
                    {getPinFacts(activePin).map((fact, fIdx) => (
                      <li key={fIdx} className="flex gap-2 items-start leading-relaxed font-medium">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                          {fIdx + 1}
                        </span>
                        <span className="opacity-95">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Simulated Historical Video Player */}
                {isShowingVideo ? (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 block font-mono">Dokumenter Arsip Video:</span>
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between p-3">
                      {/* Video graphic animation */}
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06b6d4_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-1 z-10">
                          <Film size={28} className="text-cyan-400 mx-auto animate-pulse" />
                          <span className="text-[10px] font-mono text-cyan-400 block uppercase tracking-widest font-black">MEMUTAR DOKUMENTER SEJARAH</span>
                          <span className="text-[9px] text-slate-400 block font-serif italic">"Ekspedisi Penemuan Benua Baru"</span>
                        </div>
                      </div>

                      {/* Video Player controls HUD at bottom */}
                      <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-1.5 flex items-center justify-between text-[10px] font-mono mt-auto z-10">
                        <button className="p-1 hover:bg-slate-800 text-white rounded"><Pause size={12} /></button>
                        <div className="flex-1 mx-2 bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                          <div className="bg-cyan-500 absolute left-0 top-0 bottom-0 w-1/3"></div>
                        </div>
                        <span className="text-[8px] text-slate-400">01:45 / 05:20</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsShowingVideo(false)}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] rounded-xl font-bold transition-all"
                    >
                      Tutup Video
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsShowingVideo(true)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 text-[11px] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Film size={13} /> Tonton Video Dokumenter Sejarah
                  </button>
                )}

              </div>

              {/* Popup Action Footer Controls */}
              <div className="p-4 border-t border-slate-100 bg-slate-500/5 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevPin}
                  disabled={activePinIndex <= 0}
                  className={`px-3 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-1 text-[11px] font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 ${themeStyles.buttonSec}`}
                >
                  <ChevronLeft size={14} /> Pos Sblmnya
                </button>

                <button
                  type="button"
                  onClick={() => setActivePinIndex(-1)}
                  className="px-4.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold cursor-pointer hover:bg-slate-50"
                >
                  Tutup Info
                </button>

                <button
                  type="button"
                  onClick={handleNextPin}
                  disabled={activePinIndex >= pins.length - 1}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1 text-[11px] font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${themeStyles.buttonPrimary}`}
                >
                  Pos Berikutnya <ChevronRight size={14} />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. DEFAULT HUD IF NO ACTIVE PIN (Help overlay telling user to select pins) */}
        {!activePin && pins.length > 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-sm px-4">
            <div className="bg-slate-950/90 border border-white/10 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-center text-xs text-white/80 flex items-center gap-2.5 pointer-events-auto">
              <Compass size={16} className="text-amber-400 shrink-0 animate-pulse" />
              <div className="text-left flex-1 min-w-0">
                <span className="font-extrabold block text-amber-300">Siap Menjelajah Peta?</span>
                <span className="text-[10px] opacity-75 block truncate">Tekan pin nomor atau tombol rute di bawah untuk memulai narasi geosejarah.</span>
              </div>
              <button
                onClick={() => setActivePinIndex(0)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] shrink-0 transition-all cursor-pointer"
              >
                Mulai Rute
              </button>
            </div>
          </div>
        )}

        {/* 5. FLOATING BOTTOM HUD CONTROLS WALKBAR (Dynamic route navigation) */}
        {pins.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-xl z-20 pointer-events-none">
            <div className={`p-2 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center justify-between gap-4 pointer-events-auto ${themeStyles.hudBg}`}>
              <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                {pins.map((pin, idx) => {
                  const isActive = activePinIndex === idx;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => setActivePinIndex(idx)}
                      className={`h-7 px-3 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-amber-500 text-slate-950 font-extrabold scale-105' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {idx + 1}. {pin.label}
                    </button>
                  );
                })}
              </div>

              {activePinIndex >= 0 && (
                <button
                  onClick={handleResetView}
                  className="p-1 hover:bg-white/5 text-slate-300 rounded-lg shrink-0 cursor-pointer"
                  title="Reset viewport & zoom"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
