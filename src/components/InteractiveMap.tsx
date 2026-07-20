import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Trash, Plus, Check, X, Compass, Globe, Navigation, 
  Map as MapIcon, Layers, Sliders, Info, Edit2, ChevronRight, AlertTriangle,
  Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map as GoogleMapComponent, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { MapPin as PinType } from '../types';

// Simple polyline renderer using Google Maps JS SDK via useMap hook
function GoogleMapPolyline({ pins }: { pins: PinType[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || pins.length < 2) return;

    const path = pins
      .filter(p => p.lat !== undefined && p.lng !== undefined && !p.hidden)
      .map(p => ({ lat: p.lat!, lng: p.lng! }));

    if (path.length < 2) return;

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#06B6D4', // cyan-500
      strokeOpacity: 0.85,
      strokeWeight: 3,
      icons: [{
        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
        offset: '100%',
        repeat: '100px'
      }]
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, pins]);

  return null;
}

// Controller to handle center/zoom sync for Google Map
function GoogleMapController({ activePin, pins }: { activePin: PinType | null; pins: PinType[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (activePin && activePin.lat !== undefined && activePin.lng !== undefined && !activePin.hidden) {
      map.panTo({ lat: activePin.lat, lng: activePin.lng });
      map.setZoom(8);
    } else if (pins.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      let hasCoords = false;
      pins.forEach(p => {
        if (p.lat !== undefined && p.lng !== undefined && !p.hidden) {
          bounds.extend({ lat: p.lat, lng: p.lng });
          hasCoords = true;
        }
      });
      if (hasCoords) {
        map.fitBounds(bounds, 80);
      }
    }
  }, [map, activePin, pins]);

  return null;
}

// Hook to load Leaflet resources dynamically for the fallback OSM view
function useLeafletLoaded() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).L) {
      setLoaded(true);
      return;
    }

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.id = 'leaflet-css';
    document.head.appendChild(link);

    // Inject JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.id = 'leaflet-js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  return loaded;
}

// OpenStreetMap Fallback interactive map component
interface OsmInteractiveMapProps {
  pins: PinType[];
  onMapClick: (lat: number, lng: number) => void;
  onPinClick: (pin: PinType) => void;
  activePinId: string | null;
}

function OsmInteractiveMap({ pins, onMapClick, onPinClick, activePinId }: OsmInteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const isLoaded = useLeafletLoaded();

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Default view over Indonesia archipelagos
    const map = L.map(mapContainerRef.current).setView([-2.5489, 118.0149], 5);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersGroupRef.current = L.featureGroup().addTo(map);
    routeLineRef.current = L.polyline([], {
      color: '#06B6D4',
      weight: 3,
      dashArray: '5, 8'
    }).addTo(map);

    map.on('click', (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  // Sync pins and route
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const markersGroup = markersGroupRef.current;
    const routeLine = routeLineRef.current;

    if (!markersGroup || !routeLine) return;

    markersGroup.clearLayers();
    const latlngs: [number, number][] = [];

    pins.forEach((pin, idx) => {
      if (pin.lat === undefined || pin.lng === undefined) return;
      if (!pin.hidden) {
        latlngs.push([pin.lat, pin.lng]);
      }

      const isSelected = activePinId === pin.id;
      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center font-bold font-mono shadow-xl text-xs transition-all ${
            pin.hidden
              ? 'bg-slate-700 text-slate-400 opacity-45'
              : isSelected 
                ? 'bg-cyan-400 text-slate-900 scale-125 ring-4 ring-cyan-400/30 font-black' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }">
            ${idx + 1}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(markersGroup);
      marker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        onPinClick(pin);
      });
    });

    if (latlngs.length > 1) {
      routeLine.setLatLngs(latlngs);
    } else {
      routeLine.setLatLngs([]);
    }

    if (pins.length > 0 && !activePinId) {
      try {
        const bounds = markersGroup.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      } catch (err) {
        console.error("Bounds calculation error", err);
      }
    }
  }, [isLoaded, pins, activePinId]);

  // Active pin zoom
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !activePinId) return;
    const activePin = pins.find(p => p.id === activePinId);
    if (activePin && activePin.lat !== undefined && activePin.lng !== undefined) {
      mapInstanceRef.current.setView([activePin.lat, activePin.lng], 9, { animate: true });
    }
  }, [isLoaded, activePinId, pins]);

  return (
    <div className="w-full h-full relative bg-slate-950">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat Mesin Peta Alternatif OpenStreetMap...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}

// MAIN COMPONENT EXPORT
interface InteractiveMapProps {
  initialPins?: PinType[];
  onSave: (pins: PinType[]) => void;
  onClose: () => void;
  sceneTitle: string;
}

export function InteractiveMap({ initialPins = [], onSave, onClose, sceneTitle }: InteractiveMapProps) {
  const [pins, setPins] = useState<PinType[]>(initialPins);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [provider, setProvider] = useState<'googlemaps' | 'openstreetmap'>('openstreetmap');
  
  // Input fields for editing pin properties
  const [pinLabel, setPinLabel] = useState('');
  const [pinDesc, setPinDesc] = useState('');

  // Inline editing & toggle visibility states
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelText, setEditingLabelText] = useState('');

  const startEditingLabel = (pinId: string, currentLabel: string) => {
    setEditingLabelId(pinId);
    setEditingLabelText(currentLabel);
  };

  const handleSaveInlineLabel = (pinId: string) => {
    const updated = pins.map(p => {
      if (p.id === pinId) {
        return {
          ...p,
          label: editingLabelText || 'Titik Tanpa Nama'
        };
      }
      return p;
    });
    setPins(updated);
    setEditingLabelId(null);
    if (activePinId === pinId) {
      setPinLabel(editingLabelText || 'Titik Tanpa Nama');
    }
  };

  const togglePinVisibility = (pinId: string) => {
    const updated = pins.map(p => {
      if (p.id === pinId) {
        return {
          ...p,
          hidden: !p.hidden
        };
      }
      return p;
    });
    setPins(updated);
  };

  // Get API key
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  const hasGoogleKey = Boolean(API_KEY) && API_KEY !== '';

  // Autodetect Google Maps key
  useEffect(() => {
    if (hasGoogleKey) {
      setProvider('googlemaps');
    } else {
      setProvider('openstreetmap');
    }
  }, [hasGoogleKey]);

  // Sync edit form with selected pin
  useEffect(() => {
    const activePin = pins.find(p => p.id === activePinId);
    if (activePin) {
      setPinLabel(activePin.label);
      setPinDesc(activePin.description || '');
    } else {
      setPinLabel('');
      setPinDesc('');
    }
  }, [activePinId, pins]);

  // Drop a new pin
  const handleMapClick = (lat: number, lng: number) => {
    const newPin: PinType = {
      id: `pin-${Date.now()}`,
      label: `Titik Sejarah ${pins.length + 1}`,
      description: 'Deskripsi peristiwa di titik koordinat ini...',
      x: 50, // Dummy percentage positions for compatibility
      y: 50,
      lat,
      lng
    };
    const updated = [...pins, newPin];
    setPins(updated);
    setActivePinId(newPin.id);
  };

  // Click handler on map for Google Maps wrapper
  const handleGoogleMapClick = (e: any) => {
    if (e.detail.latLng) {
      handleMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  };

  // Save edits of active pin
  const handleSavePinEdit = () => {
    if (!activePinId) return;
    const updated = pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          label: pinLabel || 'Titik Tanpa Nama',
          description: pinDesc
        };
      }
      return p;
    });
    setPins(updated);
  };

  // Delete a pin
  const handleDeletePin = (pinId: string) => {
    const updated = pins.filter(p => p.id !== pinId);
    setPins(updated);
    if (activePinId === pinId) {
      setActivePinId(null);
    }
  };

  // Reorder pins
  const movePin = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pins.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pins];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPins(updated);
  };

  // Save modifications to scene
  const handleFinalSave = () => {
    onSave(pins);
  };

  const activePin = pins.find(p => p.id === activePinId) || null;

  return (
    <div id="interactive-map-editor" className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDE PANEL: PIN LIST & COORDINATE METADATA BUILDER */}
      <div className="w-full md:w-96 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col h-[400px] md:h-full shrink-0">
        
        {/* Editor header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Compass className="text-cyan-400 animate-spin-slow" size={20} />
            <div>
              <span className="font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">GIS META MANAGER</span>
              <h2 className="font-extrabold text-sm text-white truncate max-w-[180px]" title={sceneTitle}>
                {sceneTitle}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X size={14} className="text-slate-400" />
          </button>
        </div>

        {/* Map Provider Selector */}
        <div className="p-3 bg-slate-950/20 border-b border-slate-800 flex items-center justify-between text-xs font-bold gap-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Peta Engine:</span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                if (hasGoogleKey) setProvider('googlemaps');
                else alert('Sila masukkan GOOGLE_MAPS_PLATFORM_KEY di Secrets terlebih dahulu.');
              }}
              className={`px-2 py-1 rounded-md text-[10px] flex items-center gap-1 transition-all ${
                provider === 'googlemaps' 
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={11} /> Google Maps
            </button>
            <button
              onClick={() => setProvider('openstreetmap')}
              className={`px-2 py-1 rounded-md text-[10px] flex items-center gap-1 transition-all ${
                provider === 'openstreetmap' 
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon size={11} /> OpenStreetMap
            </button>
          </div>
        </div>

        {/* Active Pin Edit form */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/30 space-y-3 shrink-0">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
            <Sliders size={12} /> Detail Pin Terpilih:
          </span>
          {activePin ? (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Label Lokasi Sejarah:</label>
                <input
                  type="text"
                  value={pinLabel}
                  onChange={(e) => { setPinLabel(e.target.value); }}
                  onBlur={handleSavePinEdit}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-cyan-500/50"
                  placeholder="Contoh: Benteng Vredeburg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Peristiwa Sejarah (Narasi):</label>
                <textarea
                  value={pinDesc}
                  onChange={(e) => { setPinDesc(e.target.value); }}
                  onBlur={handleSavePinEdit}
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none focus:border-cyan-500/50 resize-none font-serif"
                  placeholder="Ketik detail narasi/peristiwa yang terjadi di koordinat ini..."
                />
              </div>
              
              <div className="flex items-center justify-between py-1.5 border-t border-slate-800/40 mt-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Status Tampilan Pin:</span>
                <button
                  type="button"
                  onClick={() => togglePinVisibility(activePin.id)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activePin.hidden
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                      : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/25'
                  }`}
                >
                  {activePin.hidden ? (
                    <>
                      <EyeOff size={11} /> Sembunyi (Off)
                    </>
                  ) : (
                    <>
                      <Eye size={11} /> Tampil (On)
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 bg-slate-950/80 p-1.5 rounded border border-slate-850">
                <span>LAT: {activePin.lat?.toFixed(5)}</span>
                <span>LNG: {activePin.lng?.toFixed(5)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 italic bg-slate-900/40">
              Ketuk titik mana saja di peta kanan untuk meletakkan Pin Baru.
            </div>
          )}
        </div>

        {/* Pin list scrollarea */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Daftar Titik Rute ({pins.length})</span>
          
          {pins.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-sans leading-relaxed">
              Belum ada titik rute dropped.<br/>Letakkan pin pertama Anda dengan mengetuk peta.
            </div>
          ) : (
            <div className="space-y-2">
              {pins.map((p, idx) => {
                const isSelected = p.id === activePinId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePinId(p.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                      isSelected 
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-md ring-1 ring-cyan-500/20' 
                        : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/50'
                    } ${p.hidden ? 'opacity-55' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5 ${
                      p.hidden
                        ? 'bg-slate-800 text-slate-500'
                        : isSelected ? 'bg-cyan-400 text-slate-900' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      {editingLabelId === p.id ? (
                        <input
                          type="text"
                          value={editingLabelText}
                          onChange={(e) => setEditingLabelText(e.target.value)}
                          onBlur={() => handleSaveInlineLabel(p.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveInlineLabel(p.id);
                            } else if (e.key === 'Escape') {
                              setEditingLabelId(null);
                            }
                          }}
                          className="w-full px-1.5 py-0.5 bg-slate-950 border border-cyan-500/50 rounded text-xs font-bold text-white outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 group/label">
                          <h4 
                            className={`text-xs font-bold truncate ${
                              p.hidden 
                                ? 'text-slate-500 line-through' 
                                : isSelected ? 'text-cyan-300' : 'text-slate-200'
                            }`}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              startEditingLabel(p.id, p.label);
                            }}
                          >
                            {p.label}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingLabel(p.id, p.label);
                            }}
                            className="opacity-0 group-hover/label:opacity-100 p-0.5 text-slate-500 hover:text-white transition-opacity cursor-pointer"
                            title="Edit Label"
                          >
                            <Edit2 size={10} />
                          </button>
                        </div>
                      )}
                      <p className={`text-[10px] line-clamp-1 font-serif leading-none ${p.hidden ? 'text-slate-600' : 'text-slate-500'}`}>
                        {p.description || 'Tanpa keterangan.'}
                      </p>
                    </div>
 
                    <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => togglePinVisibility(p.id)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          p.hidden 
                            ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-800' 
                            : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40'
                        }`}
                        title={p.hidden ? "Tampilkan Pin" : "Sembunyikan Pin"}
                      >
                        {p.hidden ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                      <button
                        onClick={() => movePin(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-800 rounded disabled:opacity-25 text-slate-400 hover:text-white"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => movePin(idx, 'down')}
                        disabled={idx === pins.length - 1}
                        className="p-1 hover:bg-slate-800 rounded disabled:opacity-25 text-slate-400 hover:text-white"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleDeletePin(p.id)}
                        className="p-1 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded cursor-pointer"
                        title="Hapus"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action bar bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0 space-y-2">
          <button
            onClick={handleFinalSave}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-colors cursor-pointer"
          >
            <Check size={14} /> Simpan Pin ke Slide Cerita
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>

      </div>

      {/* RIGHT AREA: REAL-TIME GIS VIEWPORT */}
      <div className="flex-1 relative h-[300px] md:h-full">
        {provider === 'googlemaps' ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <div className="w-full h-full relative">
              <GoogleMapComponent
                defaultCenter={{ lat: -2.5489, lng: 118.0149 }}
                defaultZoom={5}
                mapId="DEMO_MAP_ID"
                onClick={handleGoogleMapClick}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                <GoogleMapController activePin={activePin} pins={pins} />
                <GoogleMapPolyline pins={pins} />

                 {pins.map((pin, idx) => {
                  if (pin.lat === undefined || pin.lng === undefined) return null;
                  const isSelected = activePinId === pin.id;
                  return (
                    <AdvancedMarker
                      key={pin.id}
                      position={{ lat: pin.lat, lng: pin.lng }}
                      onClick={() => setActivePinId(pin.id)}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold font-mono shadow-2xl text-xs transition-all ${
                          pin.hidden
                            ? 'bg-slate-700 text-slate-500 opacity-45'
                            : isSelected 
                              ? 'bg-cyan-400 text-slate-900 scale-125 ring-4 ring-cyan-400/30 font-black' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500'
                        }`}>
                          {idx + 1}
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </GoogleMapComponent>

              {/* HUD / Overlay info on map */}
              <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[9px] text-cyan-400 pointer-events-none shadow-xl z-20 flex items-center gap-1.5">
                <Navigation size={10} className="animate-pulse text-cyan-400" />
                <span>GOOGLE MAPS INTERACTIVE GPS CANVAS • ACTIVE</span>
              </div>
            </div>
          </APIProvider>
        ) : (
          <div className="w-full h-full relative">
            <OsmInteractiveMap 
              pins={pins}
              onMapClick={handleMapClick}
              onPinClick={(pin) => setActivePinId(pin.id)}
              activePinId={activePinId}
            />

            {/* Warning if Google Maps API Key is missing and we fallbacked to OpenStreetMap */}
            {!hasGoogleKey && (
              <div className="absolute bottom-4 left-4 right-4 bg-amber-950/95 border border-amber-900/30 p-3 rounded-2xl shadow-2xl flex items-start gap-2.5 max-w-md z-20 text-left">
                <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">Mode Terpaut OpenStreetMap (No-Key)</h4>
                  <p className="text-[10px] text-amber-200 leading-relaxed font-sans">
                    Google Maps Platform API Key belum terkonfigurasi di Secrets. Kami menyediakan OpenStreetMap interaktif sepenuhnya agar Anda tetap bisa mengetuk peta dan meletakkan pin cerita dengan lancar!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
