import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Move, MapPin, Trash, Plus, Check, X,
  Play, Pause, SkipForward, SkipBack, MousePointer, Info, RotateCcw, HelpCircle, Compass, Globe, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoricalMap, MapPin as PinType } from '../types';

// ==========================================
// 1. PROCEDURAL BACKGROUND GENERATOR COMPONENT
// ==========================================
interface MapBackgroundProps {
  style: 'vintage' | 'tactical' | 'maritime';
  imageUrl?: string;
}

export function MapBackground({ style, imageUrl }: MapBackgroundProps) {
  // High-fidelity, professional, authentic historical map fallback images
  const fallbacks = {
    vintage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600',
    maritime: 'https://images.unsplash.com/photo-1581922814484-0b48460b7010?auto=format&fit=crop&q=80&w=1600',
    tactical: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600'
  };

  const activeImageUrl = imageUrl || fallbacks[style] || fallbacks.vintage;

  return (
    <div className="absolute inset-0 overflow-hidden select-none w-full h-full bg-slate-950">
      {/* Base Map Backdrop Image */}
      <img 
        src={activeImageUrl} 
        alt="Base Map Backdrop" 
        className="w-full h-full object-cover opacity-[0.82] transition-opacity duration-500"
        referrerPolicy="no-referrer"
      />

      {/* 2. Procedural overlays according to selected theme */}
      {style === 'vintage' && (
        <div className="absolute inset-0 bg-[#F5EAD2]/35 bg-blend-multiply pointer-events-none">
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
               style={{ backgroundImage: `url('https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400')`, backgroundSize: 'cover' }}></div>
          
          {/* Latitude & Longitude Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="vintage-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#8C6C3F" strokeWidth="0.5" strokeDasharray="2 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#vintage-grid)" />
            {/* Grid labels */}
            <text x="10" y="20" fill="#8c6c3f" fontSize="8" fontFamily="serif" opacity="0.6">10° N</text>
            <text x="10" y="100" fill="#8c6c3f" fontSize="8" fontFamily="serif" opacity="0.6">5° N</text>
            <text x="10" y="180" fill="#8c6c3f" fontSize="8" fontFamily="serif" opacity="0.6">0° Equator</text>
            <text x="120" y="15" fill="#8c6c3f" fontSize="8" fontFamily="serif" opacity="0.6">95° E</text>
            <text x="200" y="15" fill="#8c6c3f" fontSize="8" fontFamily="serif" opacity="0.6">100° E</text>
          </svg>
          
          {/* Elegant Compass Rose */}
          <div className="absolute bottom-6 right-6 w-24 h-24 opacity-30 pointer-events-none select-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin-slow text-[#8C6C3F]">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
              <path d="M50 5 L53 40 L50 47 L47 40 Z" fill="currentColor" />
              <path d="M50 95 L53 60 L50 53 L47 60 Z" fill="currentColor" opacity="0.7" />
              <path d="M95 50 L60 53 L53 50 L60 47 Z" fill="currentColor" />
              <path d="M5 50 L40 53 L47 50 L40 47 Z" fill="currentColor" opacity="0.7" />
              <text x="47" y="15" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="serif">N</text>
              <text x="48" y="92" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="serif">S</text>
            </svg>
          </div>
        </div>
      )}

      {style === 'tactical' && (
        <div className="absolute inset-0 bg-[#0A0F1D]/40 pointer-events-none">
          {/* Cyber Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tactical-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#06B6D4" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="1" fill="#06B6D4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tactical-grid)" />
            {/* Concentric radar lines */}
            <circle cx="50%" cy="50%" r="150" fill="none" stroke="#06B6D4" strokeWidth="0.5" strokeDasharray="5 5" />
            <circle cx="50%" cy="50%" r="300" fill="none" stroke="#06B6D4" strokeWidth="0.25" strokeDasharray="3 10" />
            
            {/* HUD Indicators */}
            <text x="3%" y="95%" fill="#06B6D4" fontSize="8" fontFamily="monospace" opacity="0.7">GRID REGION: INDO-PACIFIC</text>
            <text x="97%" y="95%" fill="#06B6D4" fontSize="8" fontFamily="monospace" textAnchor="end" opacity="0.7">SYSTEMS SECURE // GPS FEED ACTIVE</text>
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,15,29,0.75)_95%)] pointer-events-none"></div>
        </div>
      )}

      {style === 'maritime' && (
        <div className="absolute inset-0 bg-[#122A3A]/40 pointer-events-none">
          {/* Rhumb Lines & Nautical Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="nautical-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#E1B16A" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nautical-grid)" />
            
            {/* Sailing Navigation Rhumb Lines crossing from center */}
            <g stroke="#E1B16A" strokeWidth="0.25" opacity="0.4">
              <line x1="50%" y1="50%" x2="0" y2="0" />
              <line x1="50%" y1="50%" x2="100%" y2="0" />
              <line x1="50%" y1="50%" x2="0" y2="100%" />
              <line x1="50%" y1="50%" x2="100%" y2="100%" />
              <line x1="50%" y1="50%" x2="50%" y2="0" />
              <line x1="50%" y1="50%" x2="50%" y2="100%" />
              <line x1="50%" y1="50%" x2="0" y2="50%" />
              <line x1="50%" y1="50%" x2="100%" y2="50%" />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}

// Helper hook to dynamically load Leaflet GIS scripts without causing package dependency warnings in React 19
function useLeafletLoaded() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).L) {
      setLoaded(true);
      return;
    }

    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      const handleLoad = () => setLoaded(true);
      existingScript.addEventListener('load', handleLoad);
      return () => {
        existingScript.removeEventListener('load', handleLoad);
      };
    }

    // Inject Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.id = 'leaflet-css';
    document.head.appendChild(link);

    // Inject Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.id = 'leaflet-js';
    script.async = true;
    script.onload = () => {
      setLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  return loaded;
}

// Leaflet OpenStreetMap component
interface GeographicOpenStreetMapProps {
  pins: PinType[];
  showRoute?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onPinClick?: (pin: PinType) => void;
  editorMode?: 'pan' | 'add-pin';
  activePinId?: string | null;
}

export function GeographicOpenStreetMap({
  pins,
  showRoute = true,
  onMapClick,
  onPinClick,
  editorMode = 'pan',
  activePinId
}: GeographicOpenStreetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const isLoaded = useLeafletLoaded();

  // Initialize Map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Destroy previous instance
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
    }

    // Default center around Indonesia archipelago
    const map = L.map(mapContainerRef.current).setView([-2.5489, 118.0149], 5);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersGroupRef.current = L.featureGroup().addTo(map);

    routeLineRef.current = L.polyline([], {
      color: '#4F46E5',
      weight: 3.5,
      dashArray: '5, 8'
    }).addTo(map);

    map.on('click', (e: any) => {
      if (editorMode === 'add-pin' && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isLoaded, editorMode]);

  // Synchronize Markers and Lines
  useEffect(() => {
    if (!isLoaded || !leafletMapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    const routeLine = routeLineRef.current;

    if (!markersGroup || !routeLine) return;

    markersGroup.clearLayers();
    const latlngs: [number, number][] = [];

    pins.forEach((pin, idx) => {
      let lat = pin.lat;
      let lng = pin.lng;

      // Safe fallback approximation mapping percentage to Lat/Lng
      if (lat === undefined || lng === undefined) {
        lng = 95 + (pin.x / 100) * 46;
        lat = 6 - (pin.y / 100) * 17;
      }

      latlngs.push([lat, lng]);

      const isSelected = activePinId === pin.id;

      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full border border-white flex items-center justify-center font-bold font-mono shadow-md text-[10px] transition-all ${
            isSelected 
              ? 'bg-amber-400 text-slate-900 scale-125 ring-4 ring-amber-500/30' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }">
            ${idx + 1}
          </div>
          <div class="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 text-white font-semibold text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-50">
            ${pin.label}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersGroup);

      marker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        if (onPinClick) {
          onPinClick(pin);
        }
      });
    });

    if (showRoute && latlngs.length > 1) {
      routeLine.setLatLngs(latlngs);
    } else {
      routeLine.setLatLngs([]);
    }

    // Auto fit bounds on initial load / pin update if no pin is actively selected
    if (pins.length > 0 && !activePinId) {
      try {
        const bounds = markersGroup.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
      } catch (err) {
        console.error("Bounds fit error", err);
      }
    }
  }, [isLoaded, pins, showRoute, activePinId]);

  // Handle active pin transition (flyTo)
  useEffect(() => {
    if (!isLoaded || !leafletMapRef.current || !activePinId) return;
    const activePin = pins.find(p => p.id === activePinId);
    if (activePin) {
      let lat = activePin.lat;
      let lng = activePin.lng;
      if (lat === undefined || lng === undefined) {
        lng = 95 + (activePin.x / 100) * 46;
        lat = 6 - (activePin.y / 100) * 17;
      }
      leafletMapRef.current.setView([lat, lng], 8, { animate: true });
    }
  }, [isLoaded, activePinId, pins]);

  return (
    <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Sistem GIS Memuat OpenStreetMap...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}


// ==========================================
// 2. MAIN INTERACTIVE MAP VIEWER COMPONENT
// ==========================================
interface HistoricalMapViewerProps {
  mapItem: HistoricalMap;
  onClose?: () => void;
}

export function HistoricalMapViewer({ mapItem, onClose }: HistoricalMapViewerProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activePin, setActivePin] = useState<PinType | null>(null);
  
  // Interactive Simulation Walks
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(-1);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const pins = mapItem.pins || [];
  const theme = mapItem.mapStyle || 'vintage';
  const useGeographicMap = true; // Force-enabled for real-time GIS OpenStreetMap

  // Keyboard navigation for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '=' || e.key === '+') handleZoomIn();
      if (e.key === '-' || e.key === '_') handleZoomOut();
      if (e.key === '0') handleResetView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom]);

  // Handle route simulation intervals
  useEffect(() => {
    if (simulationActive && simulationIndex >= 0 && simulationIndex < pins.length) {
      const pin = pins[simulationIndex];
      // Focus map viewport on the active pin!
      focusOnCoordinate(pin.x, pin.y, 1.8);
      setActivePin(pin);

      // Setup timer to auto-move to next step
      simulationTimerRef.current = setTimeout(() => {
        if (simulationIndex + 1 < pins.length) {
          setSimulationIndex(prev => prev + 1);
        } else {
          // Finished route! Loop back to first or stop
          setSimulationActive(false);
          setSimulationIndex(-1);
          setActivePin(null);
          handleResetView();
        }
      }, 5000); // 5 seconds per stop
    } else if (!simulationActive) {
      if (simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
      }
    }

    return () => {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    };
  }, [simulationActive, simulationIndex, pins]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.3, 1);
      if (next === 1) {
        setPan({ x: 0, y: 0 }); // reset pan if unzoomed
      }
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePin(null);
    setSimulationActive(false);
    setSimulationIndex(-1);
  };

  // Drag-and-pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when zoomed in
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // Limit panning boundary slightly
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Auto-focus centering calculation on relative coordinate
  const focusOnCoordinate = (pctX: number, pctY: number, focusScale = 2) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setZoom(focusScale);
    
    // Coordinates corresponding to the relative points
    // Center point is rect.width / 2, and rect.height / 2
    const pixelX = (pctX / 100) * rect.width;
    const pixelY = (pctY / 100) * rect.height;
    
    // Pan offset is center minus scaled position
    const panX = (rect.width / 2) - (pixelX * focusScale);
    const panY = (rect.height / 2) - (pixelY * focusScale);
    
    setPan({ x: panX, y: panY });
  };

  const toggleSimulation = () => {
    if (pins.length === 0) return;
    if (simulationActive) {
      setSimulationActive(false);
    } else {
      setSimulationActive(true);
      setSimulationIndex(0);
    }
  };

  const handleNextStep = () => {
    if (simulationIndex + 1 < pins.length) {
      setSimulationIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (simulationIndex > 0) {
      setSimulationIndex(prev => prev - 1);
    }
  };

  // Convert mapStyle to beautiful theme variables
  const themeClasses = {
    vintage: {
      bg: 'bg-[#1E1B13]',
      text: 'text-[#8C6C3F]',
      badge: 'bg-[#D9CBA4] text-[#4A3B22] border-[#C19A6B]',
      card: 'bg-[#FAF3E0] border-[#D9CBA4] text-[#4A3E22]',
      accent: 'text-amber-700',
      lineColor: '#C19A6B',
      pinBg: 'bg-amber-700 border-white text-white ring-amber-500/30'
    },
    tactical: {
      bg: 'bg-[#030712]',
      text: 'text-cyan-400',
      badge: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
      card: 'bg-slate-900/95 border-cyan-500/30 text-slate-100',
      accent: 'text-cyan-400',
      lineColor: '#06B6D4',
      pinBg: 'bg-cyan-500 border-cyan-950 text-slate-950 ring-cyan-400/50'
    },
    maritime: {
      bg: 'bg-[#081521]',
      text: 'text-[#E1B16A]',
      badge: 'bg-[#E1B16A]/10 text-[#E1B16A] border-[#E1B16A]/30',
      card: 'bg-[#112330]/95 border-[#E1B16A]/30 text-yellow-100',
      accent: 'text-yellow-500',
      lineColor: '#E1B16A',
      pinBg: 'bg-yellow-600 border-[#112330] text-slate-950 ring-yellow-500/40'
    }
  }[theme];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col md:flex-row ${themeClasses.bg} text-slate-200 select-none`}>
      {/* LEFT DRAWER: MAP DETAILS & PIN SUMMARY */}
      <div className="w-full md:w-80 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 shrink-0 z-10 h-72 md:h-full bg-slate-950/80 backdrop-blur-md">
        {/* Header Section */}
        <div className="p-5 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${themeClasses.badge}`}>
              {mapItem.era}
            </span>
            {onClose && (
              <button 
                onClick={onClose}
                className="md:hidden p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <h2 className="font-bold text-base md:text-lg text-white font-serif uppercase tracking-wide">{mapItem.name}</h2>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{mapItem.description}</p>
        </div>

        {/* Pin List Walkthrough */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin size={12} className={themeClasses.accent} /> Titik Sejarah ({pins.length})
            </h4>
            {pins.length > 1 && (
              <button 
                onClick={toggleSimulation}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  simulationActive 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20'
                }`}
              >
                {simulationActive ? <Pause size={10} /> : <Play size={10} />}
                {simulationActive ? 'Hentikan Rute' : 'Mulai Simulasi Rute'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {pins.map((pin, idx) => {
              const isActive = activePin?.id === pin.id || simulationIndex === idx;
              return (
                <div 
                  key={pin.id}
                  onClick={() => {
                    setSimulationActive(false);
                    setSimulationIndex(-1);
                    focusOnCoordinate(pin.x, pin.y, 2);
                    setActivePin(pin);
                  }}
                  className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5 translate-x-1' 
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-md text-[10px] font-bold font-mono flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <h5 className={`font-bold text-xs ${isActive ? 'text-amber-400' : 'text-slate-300'}`}>
                      {pin.label}
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                      {pin.description || 'Tidak ada deskripsi rincian.'}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {pins.length === 0 && (
              <div className="text-center py-8 text-slate-600 text-[11px] italic">
                Belum ada titik pinpoint yang dikonfigurasi pada peta ini.
              </div>
            )}
          </div>
        </div>

        {/* Desktop Close Button footer */}
        {onClose && (
          <div className="p-4 border-t border-slate-900 hidden md:block">
            <button 
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-800"
            >
              Kembali ke Materi
            </button>
          </div>
        )}
      </div>

      {/* RIGHT DISPLAY: MAIN INTERACTIVE MAP CANVAS */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {/* Navigation Floating Header Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          {/* Zoom & View Indicators */}
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-xs text-slate-300 pointer-events-auto shadow-xl">
            {!useGeographicMap ? (
              <>
                <span className="font-mono px-2 py-0.5 bg-slate-900 rounded-md font-bold text-[#06B6D4]">
                  {Math.round(zoom * 100)}% Zoom
                </span>
                {zoom > 1 && (
                  <button 
                    onClick={handleResetView}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                    title="Reset Tampilan"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </>
            ) : (
              <span className="font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded-md font-bold flex items-center gap-1">
                <Globe size={12} /> GIS: OpenStreetMap
              </span>
            )}
          </div>

          {/* Desktop Close Button (Floating Top Right) */}
          {onClose && (
            <button 
              onClick={onClose}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 hover:bg-red-950 hover:text-red-300 border border-slate-800 hover:border-red-500/30 backdrop-blur-md text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all pointer-events-auto shadow-xl"
            >
              <X size={14} /> Tutup Peta
            </button>
          )}
        </div>

        {/* Interactive Map Viewport Container */}
        <div 
          ref={containerRef}
          onMouseDown={useGeographicMap ? undefined : handleMouseDown}
          onMouseMove={useGeographicMap ? undefined : handleMouseMove}
          onMouseUp={useGeographicMap ? undefined : handleMouseUp}
          onMouseLeave={useGeographicMap ? undefined : handleMouseUp}
          className={`flex-1 w-full h-full overflow-hidden relative ${useGeographicMap ? '' : (isDragging ? 'cursor-grabbing' : 'cursor-grab')}`}
        >
          {useGeographicMap ? (
            <GeographicOpenStreetMap
              pins={pins}
              showRoute={mapItem.showRoute}
              onPinClick={(pin) => setActivePin(pin)}
              activePinId={activePin?.id}
              editorMode="pan"
            />
          ) : (
            /* Zoomable Canvas Wrapper */
            <div 
              ref={mapRef}
              className="absolute inset-0 w-full h-full origin-center select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.1, 0.8, 0.25, 1)'
              }}
            >
              {/* The base map style backdrop */}
              <MapBackground style={theme} imageUrl={mapItem.imageUrl} />

              {/* ROUTE CONNECTING PATHS - SVG Overlay */}
              {mapItem.showRoute && pins.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  {/* SVG path connecting waypoint pins */}
                  <path 
                    d={pins.map((pin, idx) => `${idx === 0 ? 'M' : 'L'} ${pin.x} ${pin.y}`).join(' ')}
                    fill="none"
                    stroke={themeClasses.lineColor}
                    strokeWidth="0.75"
                    strokeDasharray="3 3"
                    className="animate-[dash_10s_linear_infinite]"
                    style={{
                      strokeDasharray: '4,4',
                      animation: 'mapRouteStroke 25s linear infinite'
                    }}
                  />
                </svg>
              )}

              {/* INTERACTIVE PINPOINTS markers */}
              {pins.map((pin, idx) => {
                const isSelected = activePin?.id === pin.id;
                const isSimStep = simulationIndex === idx;
                
                return (
                  <div
                    key={pin.id}
                    className="absolute z-20 cursor-pointer"
                    style={{ 
                      left: `${pin.x}%`, 
                      top: `${pin.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      focusOnCoordinate(pin.x, pin.y, 2.2);
                      setActivePin(pin);
                    }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.25 }}
                      className="relative flex items-center justify-center"
                    >
                      {/* Pulsing glow ring */}
                      {(isSelected || isSimStep) && (
                        <span className="absolute inline-flex h-8 w-8 rounded-full bg-amber-500 opacity-45 animate-ping"></span>
                      )}

                      {/* Standard pinpoint dot/number */}
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold font-mono shadow-lg transition-all text-xs ${
                        isSelected || isSimStep 
                          ? 'bg-amber-400 text-slate-950 border-white scale-110 ring-4 ring-amber-500/20' 
                          : themeClasses.pinBg
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Miniature floating label on map */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 text-white font-medium text-[9px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                        {pin.label}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVE PINPOINT HISTORY FLOATING DIALOG CARD */}
          <AnimatePresence>
            {activePin && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className={`absolute bottom-6 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-144 z-30 p-5 rounded-2xl border shadow-2xl backdrop-blur-md ${themeClasses.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest font-bold uppercase opacity-60">
                      Waypoint Analisis Spasial
                    </span>
                    <h3 className="font-bold text-sm md:text-base font-serif uppercase tracking-wide">
                      {activePin.label}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActivePin(null)}
                    className="p-1 hover:bg-slate-500/10 rounded-lg cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs md:text-sm mt-3 leading-relaxed font-sans font-light opacity-90 border-t border-slate-500/20 pt-3">
                  {activePin.description || 'Tidak ada detail rincian sejarah.'}
                </p>

                <div className="mt-4 flex items-center justify-between text-[10px] opacity-60 font-mono border-t border-slate-500/10 pt-3">
                  <span>
                    {useGeographicMap 
                      ? `Koordinat: Lat=${activePin.lat !== undefined ? activePin.lat : '?'}, Lng=${activePin.lng !== undefined ? activePin.lng : '?'}`
                      : `Sumbu Koordinat: X=${activePin.x}%, Y=${activePin.y}%`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Info size={11} /> 
                    {useGeographicMap 
                      ? 'Seret / cubit peta untuk eksplorasi dinamis'
                      : 'Klik seret untuk geser, atau gunakan kontrol zoom'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM HUD PANEL: CONTROL DASHBOARD & WALKTHROUGH SIMULATOR */}
        <div className="bg-slate-950/90 border-t border-slate-900 p-4 shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between z-10">
          {/* Map navigation / Simulation controls */}
          <div className="flex items-center gap-3">
            {simulationActive ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="font-mono text-slate-400 mr-2">SIMULASI AKTIF</span>
                <button 
                  onClick={handlePrevStep} 
                  disabled={simulationIndex <= 0}
                  className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-300"
                >
                  <SkipBack size={14} />
                </button>
                <span className="font-mono font-bold text-amber-400">
                  {simulationIndex + 1} / {pins.length}
                </span>
                <button 
                  onClick={handleNextStep} 
                  disabled={simulationIndex >= pins.length - 1}
                  className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-300"
                >
                  <SkipForward size={14} />
                </button>
                <button 
                  onClick={() => setSimulationActive(false)}
                  className="ml-2 px-2 py-0.5 bg-red-950 text-red-300 border border-red-500/20 rounded text-[10px] font-bold"
                >
                  Berhenti
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Compass size={14} className="text-amber-500 animate-spin-slow" />
                <span>Tekan rute simulasi atau klik pin untuk eksplorasi kronologi.</span>
              </div>
            )}
          </div>

          {/* Map zoom controls */}
          {!useGeographicMap ? (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-500 hidden sm:inline">Kontrol Zoom Spasial:</span>
              <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                <button 
                  onClick={handleZoomOut} 
                  disabled={zoom <= 1}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <input 
                  type="range" 
                  min="1" 
                  max="4" 
                  step="0.1" 
                  value={zoom}
                  onChange={(e) => {
                    const z = parseFloat(e.target.value);
                    setZoom(z);
                    if (z === 1) setPan({ x: 0, y: 0 });
                  }}
                  className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <button 
                  onClick={handleZoomIn} 
                  disabled={zoom >= 4}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <Info size={13} className="text-indigo-400" />
              <span>Gunakan scroll mouse atau cubit layar untuk zoom peta interaktif.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAP EDITOR WORKSPACE PANEL (MODAL)
// ==========================================
const MAP_PRESETS = [
  {
    name: 'Nusantara / East Indies Maritim (1680)',
    url: 'https://images.unsplash.com/photo-1581922814484-0b48460b7010?auto=format&fit=crop&q=80&w=1200',
    style: 'maritime'
  },
  {
    name: 'Peta Dunia Klasik / Cartography (1720)',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200',
    style: 'vintage'
  },
  {
    name: 'Peta Topografi Eropa Kuno (1815)',
    url: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&q=80&w=1200',
    style: 'vintage'
  },
  {
    name: 'Tactical Dark Satellite Grid (Modern/WWII)',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    style: 'tactical'
  }
];

interface HistoricalMapEditorProps {
  mapItem: Omit<HistoricalMap, 'id'>;
  onSave: (updated: Omit<HistoricalMap, 'id'>) => void;
  onClose: () => void;
}

export function HistoricalMapEditor({ mapItem, onSave, onClose }: HistoricalMapEditorProps) {
  // Map Config States
  const [name, setName] = useState(mapItem.name);
  const [era, setEra] = useState(mapItem.era);
  const [description, setDescription] = useState(mapItem.description);
  const [imageUrl, setImageUrl] = useState(mapItem.imageUrl || '');
  const [mapStyle, setMapStyle] = useState<'vintage' | 'tactical' | 'maritime'>(mapItem.mapStyle || 'vintage');
  const [showRoute, setShowRoute] = useState(mapItem.showRoute !== undefined ? mapItem.showRoute : true);
  const [pins, setPins] = useState<PinType[]>(mapItem.pins || []);

  const [useGeographicMap, setUseGeographicMap] = useState<boolean>(true); // Force-enabled for OpenStreetMap GIS

  // Zoom / Pan state inside editor canvas (only used for non-geographic custom maps)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tool Mode: 'pan' (scroll) or 'add-pin' (click to create pin)
  const [editorMode, setEditorMode] = useState<'pan' | 'add-pin'>('add-pin');
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-pan view
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.2, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (useGeographicMap || editorMode !== 'pan' || zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (useGeographicMap || !isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    if (!useGeographicMap) setIsDragging(false);
  };

  // Map Click Handler for placing pins on custom static map images
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editorMode !== 'add-pin') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;

    const roundedX = Math.round(pctX * 10) / 10;
    const roundedY = Math.round(pctY * 10) / 10;

    // Approximate equivalent lat/lng for Indonesia region fallback
    const lng = 95 + (roundedX / 100) * 46;
    const lat = 6 - (roundedY / 100) * 17;

    const newPin: PinType = {
      id: `pin-${Date.now()}`,
      label: `Pinpoint #${pins.length + 1}`,
      description: 'Detail rincian kronologi atau keterkaitan peristiwa geosejarah di lokasi ini...',
      x: roundedX,
      y: roundedY,
      lat: Math.round(lat * 100000) / 100000,
      lng: Math.round(lng * 100000) / 100000
    };

    setPins([...pins, newPin]);
    setActivePinId(newPin.id);
  };

  // Map Click Handler for placing pins on Geographic real maps
  const handleGeographicMapClick = (lat: number, lng: number) => {
    if (editorMode !== 'add-pin') return;

    // Compute back to percentage coordinate fallback
    const pctX = ((lng - 95) / 46) * 100;
    const pctY = ((6 - lat) / 17) * 100;

    const roundedX = Math.round(Math.max(0, Math.min(100, pctX)) * 10) / 10;
    const roundedY = Math.round(Math.max(0, Math.min(100, pctY)) * 10) / 10;

    const newPin: PinType = {
      id: `pin-${Date.now()}`,
      label: `Pinpoint #${pins.length + 1}`,
      description: 'Detail rincian kronologi atau keterkaitan peristiwa geosejarah di lokasi ini...',
      x: roundedX,
      y: roundedY,
      lat: Math.round(lat * 100000) / 100000,
      lng: Math.round(lng * 100000) / 100000
    };

    setPins([...pins, newPin]);
    setActivePinId(newPin.id);
  };

  // Delete a pinpoint
  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter(p => p.id !== pinId));
    if (activePinId === pinId) setActivePinId(null);
  };

  // Update pin text values
  const handleUpdatePin = (pinId: string, key: 'label' | 'description', value: string) => {
    setPins(pins.map(p => p.id === pinId ? { ...p, [key]: value } : p));
  };

  // Update pin geographic coordinates
  const handleUpdatePinCoords = (pinId: string, lat: number, lng: number) => {
    // Map Lat/Lng to fallbacks
    const pctX = ((lng - 95) / 46) * 100;
    const pctY = ((6 - lat) / 17) * 100;
    const roundedX = Math.round(Math.max(0, Math.min(100, pctX)) * 10) / 10;
    const roundedY = Math.round(Math.max(0, Math.min(100, pctY)) * 10) / 10;

    setPins(pins.map(p => p.id === pinId ? { ...p, lat, lng, x: roundedX, y: roundedY } : p));
  };

  const handleSaveWorkspace = () => {
    onSave({
      name,
      era,
      description,
      imageUrl: imageUrl || undefined,
      mapStyle,
      pins,
      showRoute,
      useGeographicMap
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-3 md:p-6 select-none font-sans overflow-hidden">
      <div className="bg-white text-slate-800 rounded-3xl w-full max-w-7xl h-full flex flex-col md:flex-row overflow-hidden shadow-2xl border border-slate-200">
        
        {/* LEFT WORKSPACE SIDEBAR: CONFIGURATORS */}
        <div className="w-full md:w-96 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 shrink-0 h-80 md:h-full bg-slate-50">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-indigo-50/50 flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={16} className="text-indigo-600" /> Map Pinpoint Workshop
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Buat koordinat interaktif dengan rute visual.</p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Config Controls */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
            
            {/* Meta input fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Peta Utama</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Peta Jalur Sutra"
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-semibold"
                />
              </div>

              {/* GIS Map Selector Switch */}
              <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="chk-use-geo" className="text-xs font-bold text-indigo-900 uppercase cursor-pointer flex items-center gap-1">
                    <Globe size={14} className="text-indigo-600" /> Gunakan Peta GIS Bumi Nyata
                  </label>
                  <input 
                    type="checkbox" 
                    id="chk-use-geo" 
                    checked={true}
                    disabled={true}
                    className="w-4 h-4 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Sistem dikonfigurasi untuk hanya menggunakan peta bumi realistik interaktif (OpenStreetMap) berdasarkan koordinat asli Bumi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Era Sejarah</label>
                  <input 
                    type="text"
                    value={era}
                    onChange={(e) => setEra(e.target.value)}
                    placeholder="Abad ke-2 SM"
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  />
                </div>
                {!useGeographicMap && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tema Background</label>
                    <select
                      value={mapStyle}
                      onChange={(e) => setMapStyle(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-indigo-700"
                    >
                      <option value="vintage">📜 Vintage Parchment</option>
                      <option value="tactical">📐 Tactical Cyber Grid</option>
                      <option value="maritime">⚓ Antique Maritime</option>
                    </select>
                  </div>
                )}
              </div>

              {!useGeographicMap && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">URL Gambar Khusus (Opsional)</label>
                  <input 
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Link gambar backdrop peta..."
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono"
                  />
                </div>
              )}
              
              {/* Preset selection of professional maps */}
              {!useGeographicMap ? (
                <div>
                  <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Compass size={11} className="text-indigo-500" /> Pilih Preset Peta Profesional
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MAP_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setImageUrl(p.url);
                          setMapStyle(p.style as any);
                        }}
                        className={`p-2 rounded-xl text-[9px] font-bold text-left leading-tight transition-all border cursor-pointer ${
                          imageUrl === p.url
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-500 ring-2 ring-indigo-50'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-[10px] text-indigo-800/80 leading-normal font-sans">
                  ℹ️ <strong>Sistem GIS Aktif:</strong> Latar gambar kustom dilewati karena sistem memuat peta interaktif bumi nyata dari satelit dunia. Anda bebas memperbesar dan menggeser peta di sebelah kanan.
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Ringkas Geopolitik</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan signifikansi peta ini..."
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 h-16 resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <input 
                  type="checkbox" 
                  id="chk-show-route" 
                  checked={showRoute}
                  onChange={(e) => setShowRoute(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="chk-show-route" className="text-xs font-bold text-slate-600 uppercase cursor-pointer">
                  Sambungkan Pin dengan Garis Rute
                </label>
              </div>
            </div>

            {/* List of Placed Pinpoints */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sumbu Pin Terpasang ({pins.length})
                </h4>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <HelpCircle size={10} /> Urutan pin menentukan rute garis
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
                {pins.map((pin, idx) => {
                  const isActive = activePinId === pin.id;
                  return (
                    <div 
                      key={pin.id}
                      className={`p-3 border rounded-xl transition-all flex flex-col gap-2 ${
                        isActive 
                          ? 'border-indigo-500 bg-indigo-50/40 shadow-sm' 
                          : 'bg-white hover:border-slate-300'
                      }`}
                      onClick={() => setActivePinId(pin.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {useGeographicMap ? (
                            <span className="text-[9px] font-mono text-indigo-600 font-semibold">GIS Map Coordinates</span>
                          ) : (
                            <span className="text-[9px] font-mono text-slate-400">X:{pin.x}% Y:{pin.y}%</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePin(pin.id);
                          }}
                          type="button"
                          className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                          title="Hapus pinpoint ini"
                        >
                          <Trash size={12} />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <input 
                          type="text"
                          value={pin.label}
                          onChange={(e) => handleUpdatePin(pin.id, 'label', e.target.value)}
                          placeholder="Nama Pin (Label)"
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
                        />
                        <textarea 
                          value={pin.description || ''}
                          onChange={(e) => handleUpdatePin(pin.id, 'description', e.target.value)}
                          placeholder="Deskripsi ringkasan peristiwa..."
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] leading-relaxed focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none h-12 resize-none"
                        />
                        {useGeographicMap && (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 mt-1">
                            <div>
                              <label className="block text-[8px] font-bold font-mono text-slate-400 uppercase">Latitude (Sumbu Y)</label>
                              <input 
                                type="number" 
                                step="0.00001"
                                value={pin.lat !== undefined ? pin.lat : Math.round((6 - (pin.y / 100) * 17) * 100000) / 100000}
                                onChange={(e) => {
                                  const valLat = parseFloat(e.target.value) || 0;
                                  const valLng = pin.lng !== undefined ? pin.lng : (95 + (pin.x / 100) * 46);
                                  handleUpdatePinCoords(pin.id, valLat, valLng);
                                }}
                                className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[9px] font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold font-mono text-slate-400 uppercase">Longitude (Sumbu X)</label>
                              <input 
                                type="number" 
                                step="0.00001"
                                value={pin.lng !== undefined ? pin.lng : Math.round((95 + (pin.x / 100) * 46) * 100000) / 100000}
                                onChange={(e) => {
                                  const valLng = parseFloat(e.target.value) || 0;
                                  const valLat = pin.lat !== undefined ? pin.lat : (6 - (pin.y / 100) * 17);
                                  handleUpdatePinCoords(pin.id, valLat, valLng);
                                }}
                                className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[9px] font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {pins.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 text-xs italic">
                    Belum ada pin. Aktifkan "Tambah Pin Mode" di sebelah kanan lalu klik pada peta.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-100 flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors text-center"
            >
              Batal
            </button>
            <button 
              type="button"
              onClick={handleSaveWorkspace}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1"
            >
              <Check size={14} /> Terapkan Pin
            </button>
          </div>
        </div>

        {/* RIGHT WORKSPACE DISPLAY: INTERACTIVE EDITOR CANVAS */}
        <div className="flex-1 bg-slate-950 relative flex flex-col min-h-0">
          
          {/* Editor Header Tools Controls */}
          <div className="p-3 border-b border-slate-900 bg-slate-950/80 backdrop-blur flex justify-between items-center z-10 select-none">
            {/* Tool selectors */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button 
                type="button"
                onClick={() => setEditorMode('add-pin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  editorMode === 'add-pin' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus size={14} /> Tambah Pin Mode
              </button>
              <button 
                type="button"
                onClick={() => {
                  setEditorMode('pan');
                  handleResetZoom();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  editorMode === 'pan' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Move size={14} /> Navigasi & Geser Peta
              </button>
            </div>

            {/* Hint Box based on Mode */}
            <div className="text-[10px] text-slate-400 hidden lg:block bg-slate-900/60 px-3 py-1.5 border border-slate-800/50 rounded-lg">
              {editorMode === 'add-pin' ? (
                <span className="text-amber-400 font-medium">🎯 KLIK pada area peta untuk langsung menempatkan pinpoint baru!</span>
              ) : (
                <span className="text-cyan-400 font-medium">🖐️ KLIK & SERET peta untuk menggeser koordinat dalam mode zoom.</span>
              )}
            </div>

            {/* Zoom Button Controls */}
            {!useGeographicMap ? (
              <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-1 rounded-xl border border-slate-800">
                <button 
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button 
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            ) : (
              <div className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/40 border border-indigo-900/20 px-2.5 py-1 rounded-lg">
                ✨ GIS OpenStreetMap aktif
              </div>
            )}
          </div>

          {/* Core Interactive Map Editor Stage */}
          <div 
            ref={containerRef}
            onMouseDown={useGeographicMap ? undefined : handleMouseDown}
            onMouseMove={useGeographicMap ? undefined : handleMouseMove}
            onMouseUp={useGeographicMap ? undefined : handleMouseUp}
            onMouseLeave={useGeographicMap ? undefined : handleMouseUp}
            className={`flex-1 w-full h-full overflow-hidden relative ${
              useGeographicMap ? '' : (editorMode === 'pan' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair')
            }`}
          >
            {useGeographicMap ? (
              <GeographicOpenStreetMap
                pins={pins}
                showRoute={showRoute}
                onMapClick={handleGeographicMapClick}
                onPinClick={(pin) => setActivePinId(pin.id)}
                activePinId={activePinId}
                editorMode={editorMode}
              />
            ) : (
              /* Inner Scaled Map */
              <div 
                onClick={handleCanvasClick}
                className="absolute inset-0 w-full h-full origin-center select-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.25s ease-out'
                }}
              >
                {/* Theme backdrop */}
                <MapBackground style={mapStyle} imageUrl={imageUrl} />

                {/* Connecting Route Line */}
                {showRoute && pins.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <path 
                      d={pins.map((pin, idx) => `${idx === 0 ? 'M' : 'L'} ${pin.x} ${pin.y}`).join(' ')}
                      fill="none"
                      stroke={mapStyle === 'vintage' ? '#C19A6B' : (mapStyle === 'tactical' ? '#06B6D4' : '#E1B16A')}
                      strokeWidth="0.75"
                      strokeDasharray="4 4"
                    />
                  </svg>
                )}

                {/* Pin markers */}
                {pins.map((pin, idx) => {
                  const isActive = activePinId === pin.id;
                  return (
                    <div
                      key={pin.id}
                      className="absolute z-20"
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePinId(pin.id);
                      }}
                    >
                      <div className="relative group flex items-center justify-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold font-mono shadow-md text-[10px] cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-amber-400 border-white text-slate-900 scale-110 ring-4 ring-amber-500/30' 
                            : 'bg-indigo-600 border-white text-white'
                        }`}>
                          {idx + 1}
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute top-7 bg-slate-950/90 border border-slate-800 text-white font-medium text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-80 group-hover:opacity-100">
                          {pin.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Guide Label */}
          <div className="p-3 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-900 flex justify-between items-center select-none shrink-0 font-mono">
            <span>Editor Koordinat: {useGeographicMap ? 'GIS Latitude & Longitude' : 'X, Y Persentase Responsif'}</span>
            <span className="text-indigo-400">Peta dapat diinteraksikan secara langsung</span>
          </div>

        </div>

      </div>
    </div>
  );
}
