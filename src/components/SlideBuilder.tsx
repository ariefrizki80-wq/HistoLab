import React, { useState, useEffect, useRef } from 'react';
import { 
  Presentation as PresType, StoryScene, StoryMediaItem, TimelineEvent, HistoricalMap, MapPin
} from '../types';
import { 
  Play, Plus, Trash2, Edit2, Copy, ArrowUp, ArrowDown, Type, Image as ImageIcon, 
  Quote, Sparkles, BookOpen, Clock, Map as MapIcon, Compass, Sliders, ChevronRight, 
  MapPin as MapPinIcon, Info, Eye, EyeOff, Save, Undo, Redo, ChevronLeft, ChevronRight as ChevronRightIcon, 
  Menu, X, CheckCircle2, AlertCircle, LayoutGrid, Layers, Tv, HelpCircle, Calendar, PlusCircle,
  Square, Circle, Minus, MousePointer2, AlignHorizontalSpaceAround, AlignVerticalSpaceAround, Folder
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapBackground, GeographicOpenStreetMap } from './HistoricalMapEngine';
import MapFocusMode from './MapFocusMode';
import { SlideRenderer } from './SlideRenderer';
import { INITIAL_PRESENTATIONS, PRESENTATION_TEMPLATES } from '../data/initialPresentations';
import AssetPickerModal from './AssetPickerModal';

export default function SlideBuilder() {
  // Global presentations state
  const [presentations, setPresentations] = useState<PresType[]>([]);
  const [activePresId, setActivePresId] = useState<string | null>(null);
  
  // Navigation tabs under Presentation screen when activePresId is null
  const [activePresTab, setActivePresTab] = useState<'all' | 'templates'>('all');
  
  // Slide builder editor states
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedMediaItemId, setSelectedMediaItemId] = useState<string | null>(null);
  const [isEditingTextInline, setIsEditingTextInline] = useState(false);
  const [inlineEditText, setInlineEditText] = useState('');
  
  // Collapsible panels state for professional workspace
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'slide' | 'element' | 'data'>('slide');
  
  // Asset Library Picker State
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState<'slide_bg' | 'media_element'>('slide_bg');
  
  // Interactive present mode state
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentSceneIndex, setPresentSceneIndex] = useState(0);
  const [presentMapWalkIndex, setPresentMapWalkIndex] = useState(0);
  const [presentTimelineIndex, setPresentTimelineIndex] = useState(0);
  const [presentSubMaterialId, setPresentSubMaterialId] = useState<string | null>(null);
  const [presentQuizRevealed, setPresentQuizRevealed] = useState(false);
  
  // Undo/Redo history stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoingOrRedoing, setIsUndoingOrRedoing] = useState(false);

  // Quick modals for adding/editing presentation's self-contained Map / Timeline nodes
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<Partial<HistoricalMap> | null>(null);
  const [newPinForm, setNewPinForm] = useState<Partial<MapPin>>({ label: '', description: '', x: 50, y: 50, lat: -6.1751, lng: 106.8272 });
  
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [editingTimelineEvent, setEditingTimelineEvent] = useState<Partial<TimelineEvent> | null>(null);

  // New presentation form modal
  const [isNewPresModalOpen, setIsNewPresModalOpen] = useState(false);
  const [newPresData, setNewPresData] = useState({ title: '', description: '', theme: 'dark_slate' });

  // Notifications/Toasts
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. INITIALIZE DATA & LOCAL STORAGE
  useEffect(() => {
    const saved = localStorage.getItem('histolab_presentations_v1');
    if (saved) {
      try {
        setPresentations(JSON.parse(saved));
      } catch (e) {
        setPresentations(INITIAL_PRESENTATIONS);
        localStorage.setItem('histolab_presentations_v1', JSON.stringify(INITIAL_PRESENTATIONS));
      }
    } else {
      setPresentations(INITIAL_PRESENTATIONS);
      localStorage.setItem('histolab_presentations_v1', JSON.stringify(INITIAL_PRESENTATIONS));
    }
  }, []);

  // Sync to local storage
  const savePresentations = (updated: PresType[]) => {
    setPresentations(updated);
    localStorage.setItem('histolab_presentations_v1', JSON.stringify(updated));
  };

  // Auto-select first slide when opening editor
  useEffect(() => {
    if (activePresId) {
      const activePres = presentations.find(p => p.id === activePresId);
      if (activePres && activePres.scenes.length > 0) {
        setSelectedSceneId(activePres.scenes[0].id);
        setSelectedMediaItemId(null);
        // Reset history
        setHistory([JSON.stringify(activePres)]);
        setHistoryIndex(0);
      }
    }
  }, [activePresId]);

  const activePres = presentations.find(p => p.id === activePresId) || null;
  const activeScene = activePres?.scenes.find(s => s.id === selectedSceneId) || activePres?.scenes[0] || null;
  const selectedMediaItem = activeScene?.mediaItems?.find(m => m.id === selectedMediaItemId) || null;

  // 2. UNDO & REDO CONTROLS
  const recordHistory = (nextPres: PresType) => {
    if (isUndoingOrRedoing) return;
    const nextString = JSON.stringify(nextPres);
    const cleanedHistory = history.slice(0, historyIndex + 1);
    const updatedHistory = [...cleanedHistory, nextString];
    
    // Limit history stack size to 30 for performance
    if (updatedHistory.length > 30) {
      updatedHistory.shift();
    }
    
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && activePresId) {
      setIsUndoingOrRedoing(true);
      const prevIndex = historyIndex - 1;
      const prevPres: PresType = JSON.parse(history[prevIndex]);
      
      const updated = presentations.map(p => p.id === activePresId ? prevPres : p);
      setPresentations(updated);
      localStorage.setItem('histolab_presentations_v1', JSON.stringify(updated));
      
      setHistoryIndex(prevIndex);
      if (selectedSceneId && !prevPres.scenes.some(s => s.id === selectedSceneId)) {
        setSelectedSceneId(prevPres.scenes[0]?.id || null);
      }
      setSelectedMediaItemId(null);
      setIsUndoingOrRedoing(false);
      showToast('Urungkan perubahan (Undo)');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && activePresId) {
      setIsUndoingOrRedoing(true);
      const nextIndex = historyIndex + 1;
      const nextPres: PresType = JSON.parse(history[nextIndex]);
      
      const updated = presentations.map(p => p.id === activePresId ? nextPres : p);
      setPresentations(updated);
      localStorage.setItem('histolab_presentations_v1', JSON.stringify(updated));
      
      setHistoryIndex(nextIndex);
      setSelectedMediaItemId(null);
      setIsUndoingOrRedoing(false);
      showToast('Ulangi perubahan (Redo)');
    }
  };

  // 3. PRESENTATION CRUD
  const handleCreatePresentation = (title: string, desc: string, theme: string) => {
    const newPres: PresType = {
      id: `pres-${Date.now()}`,
      title,
      description: desc || 'Deskripsi presentasi baru...',
      theme: theme || 'dark_slate',
      scenes: [
        {
          id: `scene-cover-${Date.now()}`,
          type: 'cover',
          title: title,
          narration: desc || 'Poin narasi guru...',
          backgroundType: 'dark_slate',
          backgroundValue: '',
          mediaItems: [
            {
              id: `m-${Date.now()}-1`,
              type: 'quote',
              content: '"Tulis kutipan bersejarah yang inspiratif di sini..."',
              x: 15, y: 70, w: 70, h: 15, fontSize: 16, textColor: '#fbbf24'
            }
          ]
        }
      ],
      timeline: [
        { id: `t-${Date.now()}-1`, year: '1945 M', title: 'Proklamasi Kemerdekaan', description: 'Soekarno-Hatta memproklamasikan kemerdekaan Indonesia di Pegangsaan Timur 56.' }
      ],
      maps: [
        {
          id: `map-${Date.now()}-1`,
          name: 'Peta Utama Presentasi',
          description: 'Keterangan peta geografis...',
          era: 'Abad ke-20 M',
          mapStyle: 'maritime',
          showRoute: true,
          pins: [
            { id: `pin-${Date.now()}-1`, label: 'Jakarta', description: 'Ibu kota negara Indonesia.', x: 40, y: 70, lat: -6.1751, lng: 106.8272 }
          ]
        }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...presentations, newPres];
    savePresentations(updated);
    setActivePresId(newPres.id);
    setIsNewPresModalOpen(false);
    showToast(`Presentasi "${title}" berhasil dibuat`);
  };

  const handleImportFromTemplate = (template: Omit<PresType, 'id' | 'createdAt'>) => {
    const newPres: PresType = {
      ...template,
      id: `pres-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [...presentations, newPres];
    savePresentations(updated);
    setActivePresId(newPres.id);
    showToast(`Template "${template.title}" berhasil diimpor`);
  };

  const handleDeletePresentation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus presentasi ini?')) {
      const updated = presentations.filter(p => p.id !== id);
      savePresentations(updated);
      showToast('Presentasi telah dihapus');
    }
  };

  // 4. SCENE OPERATIONS
  const handleUpdateActivePres = (updates: Partial<PresType>) => {
    if (!activePres) return;
    const updatedPres = { ...activePres, ...updates };
    const updated = presentations.map(p => p.id === activePres.id ? updatedPres : p);
    savePresentations(updated);
    recordHistory(updatedPres);
  };

  const handleAddScene = (type: StoryScene['type']) => {
    if (!activePres) return;
    
    const newScene: StoryScene = {
      id: `scene-${Date.now()}`,
      type,
      title: type === 'cover' ? 'Slide Cover Baru' 
           : type === 'narrative' ? 'Slide Narasi Baru' 
           : type === 'quiz' ? 'Slide Kuis Baru' 
           : type === 'reflection' ? 'Slide Refleksi Baru' 
           : type === 'map' ? 'Slide Peta Baru' : 'Slide Garis Waktu Baru',
      narration: 'Tambahkan catatan narasi guru untuk memandu pemaparan di kelas...',
      backgroundType: 'dark_slate',
      backgroundValue: '',
      mediaItems: type === 'quiz' ? [
        {
          id: `m-quiz-${Date.now()}`,
          type: 'text',
          content: 'A. Opsi Jawaban Benar (Pertama)\nB. Opsi Jawaban Kedua\nC. Opsi Jawaban Ketiga\nD. Opsi Jawaban Keempat',
          x: 10, y: 35, w: 80, h: 30
        }
      ] : []
    };

    if (type === 'map' && activePres.maps && activePres.maps.length > 0) {
      newScene.activeMapId = activePres.maps[0].id;
      newScene.activeMapStepIndex = 0;
    }

    if (type === 'timeline') {
      newScene.activeTimelineIndex = 0;
    }

    const updatedScenes = [...activePres.scenes, newScene];
    handleUpdateActivePres({ scenes: updatedScenes });
    setSelectedSceneId(newScene.id);
    setSelectedMediaItemId(null);
    showToast('Slide baru ditambahkan');
  };

  const handleDeleteScene = (sceneId: string) => {
    if (!activePres || activePres.scenes.length <= 1) {
      alert('Presentasi minimal harus memiliki 1 slide.');
      return;
    }
    const updatedScenes = activePres.scenes.filter(s => s.id !== sceneId);
    handleUpdateActivePres({ scenes: updatedScenes });
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(updatedScenes[0].id);
    }
    setSelectedMediaItemId(null);
    showToast('Slide telah dihapus');
  };

  const handleDuplicateScene = (sceneId: string) => {
    if (!activePres) return;
    const target = activePres.scenes.find(s => s.id === sceneId);
    if (!target) return;

    const duplicated: StoryScene = {
      ...target,
      id: `scene-dup-${Date.now()}`,
      title: `${target.title} (Salinan)`,
      mediaItems: target.mediaItems?.map(m => ({ ...m, id: `m-dup-${Math.random()}` }))
    };

    const idx = activePres.scenes.findIndex(s => s.id === sceneId);
    const updatedScenes = [...activePres.scenes];
    updatedScenes.splice(idx + 1, 0, duplicated);
    
    handleUpdateActivePres({ scenes: updatedScenes });
    setSelectedSceneId(duplicated.id);
    setSelectedMediaItemId(null);
    showToast('Slide disalin');
  };

  const handleReorderScene = (sceneId: string, direction: 'up' | 'down') => {
    if (!activePres) return;
    const idx = activePres.scenes.findIndex(s => s.id === sceneId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === activePres.scenes.length - 1) return;

    const updatedScenes = [...activePres.scenes];
    const target = updatedScenes[idx];
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    
    updatedScenes[idx] = updatedScenes[swapWith];
    updatedScenes[swapWith] = target;

    handleUpdateActivePres({ scenes: updatedScenes });
    showToast('Urutan slide diperbarui');
  };

  const handleUpdateSceneMeta = (updates: Partial<StoryScene>) => {
    if (!activePres || !selectedSceneId) return;
    const updatedScenes = activePres.scenes.map(s => {
      if (s.id === selectedSceneId) {
        return { ...s, ...updates };
      }
      return s;
    });
    handleUpdateActivePres({ scenes: updatedScenes });
  };

  // 5. ELEMENT (MEDIA ITEM) OPERATIONS
  const handleAddMediaItem = (type: 'title' | 'text' | 'quote' | 'image' | 'shape' | 'icon', shapeType?: StoryMediaItem['shapeType'], iconName?: string) => {
    if (!activePres || !selectedSceneId || !activeScene) return;

    const newItem: StoryMediaItem = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'title' ? 'Tambahkan Judul'
             : type === 'text' ? 'Tambahkan paragraf penjelasan sejarah yang berharga di sini...'
             : type === 'quote' ? '"Tulis kutipan sejarah yang puitis..."'
             : type === 'image' ? 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=800'
             : type === 'icon' ? (iconName || 'Compass') : '',
      x: 30, y: 40, w: type === 'shape' && shapeType === 'line' ? 40 : type === 'icon' ? 10 : 40, h: type === 'image' ? 30 : type === 'shape' && shapeType === 'line' ? 2 : type === 'icon' ? 10 : 15,
      fontSize: type === 'title' ? 24 : type === 'quote' ? 14 : type === 'icon' ? 48 : 12,
      textColor: type === 'quote' ? '#f59e0b' : '#ffffff',
      backgroundColor: type === 'shape' ? '#3b82f6' : undefined,
      shapeType: shapeType,
      label: type === 'image' ? 'Caption visual' : undefined,
      borderRadius: type === 'shape' && shapeType === 'rounded' ? 12 : undefined,
    };

    const updatedScenes = activePres.scenes.map(s => {
      if (s.id === selectedSceneId) {
        return {
          ...s,
          mediaItems: [...(s.mediaItems || []), newItem]
        };
      }
      return s;
    });

    handleUpdateActivePres({ scenes: updatedScenes });
    setSelectedMediaItemId(newItem.id);
    showToast(`Elemen ${type} ditambahkan`);
  };

  const handleUpdateMediaItem = (itemId: string, updates: Partial<StoryMediaItem>) => {
    if (!activePres || !selectedSceneId || !activeScene) return;

    const updatedScenes = activePres.scenes.map(s => {
      if (s.id === selectedSceneId) {
        const updatedItems = (s.mediaItems || []).map(m => {
          if (m.id === itemId) {
            return { ...m, ...updates };
          }
          return m;
        });
        return { ...s, mediaItems: updatedItems };
      }
      return s;
    });

    handleUpdateActivePres({ scenes: updatedScenes });
  };

  const handleDeleteMediaItem = (itemId: string) => {
    if (!activePres || !selectedSceneId || !activeScene) return;

    const updatedScenes = activePres.scenes.map(s => {
      if (s.id === selectedSceneId) {
        return {
          ...s,
          mediaItems: (s.mediaItems || []).filter(m => m.id !== itemId)
        };
      }
      return s;
    });

    handleUpdateActivePres({ scenes: updatedScenes });
    setSelectedMediaItemId(null);
    showToast('Elemen telah dihapus');
  };

  // 6. SELF-CONTAINED MAP OPERATIONS FOR PRESENTATION
  const handleSaveMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePres || !editingMap || !editingMap.name) return;

    let updatedMaps = [...(activePres.maps || [])];
    if (editingMap.id) {
      // Update
      updatedMaps = updatedMaps.map(m => m.id === editingMap.id ? (editingMap as HistoricalMap) : m);
    } else {
      // Create
      const newMap: HistoricalMap = {
        ...(editingMap as Omit<HistoricalMap, 'id'>),
        id: `map-${Date.now()}`,
        pins: editingMap.pins || []
      };
      updatedMaps.push(newMap);
    }

    handleUpdateActivePres({ maps: updatedMaps });
    setIsMapModalOpen(false);
    setEditingMap(null);
    showToast('Data Peta disimpan');
  };

  const handleAddPinToEditingMap = () => {
    if (!editingMap || !newPinForm.label) return;
    const pins = [...(editingMap.pins || [])];
    const newPin: MapPin = {
      id: `pin-${Date.now()}`,
      label: newPinForm.label,
      description: newPinForm.description || '',
      x: Number(newPinForm.x) || 50,
      y: Number(newPinForm.y) || 50,
      lat: Number(newPinForm.lat) || -6.1751,
      lng: Number(newPinForm.lng) || 106.8272
    };
    pins.push(newPin);
    setEditingMap({ ...editingMap, pins });
    setNewPinForm({ label: '', description: '', x: 50, y: 50, lat: -6.1751, lng: 106.8272 });
  };

  const handleDeletePinFromEditingMap = (pinId: string) => {
    if (!editingMap) return;
    const pins = (editingMap.pins || []).filter(p => p.id !== pinId);
    setEditingMap({ ...editingMap, pins });
  };

  // 7. SELF-CONTAINED TIMELINE OPERATIONS FOR PRESENTATION
  const handleSaveTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePres || !editingTimelineEvent || !editingTimelineEvent.year || !editingTimelineEvent.title) return;

    let updatedTimeline = [...(activePres.timeline || [])];
    if (editingTimelineEvent.id) {
      updatedTimeline = updatedTimeline.map(t => t.id === editingTimelineEvent.id ? (editingTimelineEvent as TimelineEvent) : t);
    } else {
      const newEvt: TimelineEvent = {
        ...(editingTimelineEvent as Omit<TimelineEvent, 'id'>),
        id: `t-${Date.now()}`
      };
      updatedTimeline.push(newEvt);
    }

    handleUpdateActivePres({ timeline: updatedTimeline });
    setIsTimelineModalOpen(false);
    setEditingTimelineEvent(null);
    showToast('Data Milestones Linimasa disimpan');
  };

  const handleDeleteTimelineEvent = (evtId: string) => {
    if (!activePres) return;
    const updated = (activePres.timeline || []).filter(t => t.id !== evtId);
    handleUpdateActivePres({ timeline: updated });
    showToast('Milestone linimasa dihapus');
  };

  // 8. PRESENTATION RUNNER CONTROLS
  const handleStartPresentation = () => {
    if (!activePres || activePres.scenes.length === 0) return;
    setPresentSceneIndex(0);
    setPresentMapWalkIndex(0);
    setPresentTimelineIndex(0);
    setPresentSubMaterialId(null);
    setPresentQuizRevealed(false);
    setIsPresenting(true);
  };

  const handleNextPresent = () => {
    if (!activePres) return;
    const currentScene = activePres.scenes[presentSceneIndex];

    // If map slide has pins walk through them
    if (currentScene.type === 'map' && currentScene.activeMapId) {
      const mapObj = activePres.maps?.find(m => m.id === currentScene.activeMapId);
      const pinsCount = mapObj?.pins?.length || 0;
      if (presentMapWalkIndex < pinsCount - 1) {
        setPresentMapWalkIndex(prev => prev + 1);
        return;
      }
    }

    // If timeline slide walk through milestones
    if (currentScene.type === 'timeline') {
      const tlCount = activePres.timeline?.length || 0;
      if (presentTimelineIndex < tlCount - 1) {
        setPresentTimelineIndex(prev => prev + 1);
        setPresentSubMaterialId(null);
        return;
      }
    }

    // Go to next slide
    if (presentSceneIndex < activePres.scenes.length - 1) {
      setPresentSceneIndex(prev => prev + 1);
      setPresentMapWalkIndex(0);
      setPresentTimelineIndex(0);
      setPresentSubMaterialId(null);
      setPresentQuizRevealed(false);
    }
  };

  const handlePrevPresent = () => {
    if (!activePres) return;
    const currentScene = activePres.scenes[presentSceneIndex];

    // Map backtrack
    if (currentScene.type === 'map' && presentMapWalkIndex > 0) {
      setPresentMapWalkIndex(prev => prev - 1);
      return;
    }

    // Timeline backtrack
    if (currentScene.type === 'timeline' && presentTimelineIndex > 0) {
      setPresentTimelineIndex(prev => prev - 1);
      setPresentSubMaterialId(null);
      return;
    }

    // Previous slide
    if (presentSceneIndex > 0) {
      const prevIdx = presentSceneIndex - 1;
      setPresentSceneIndex(prevIdx);
      setPresentQuizRevealed(false);
      const prevScene = activePres.scenes[prevIdx];
      if (prevScene.type === 'map' && prevScene.activeMapId) {
        const mapObj = activePres.maps?.find(m => m.id === prevScene.activeMapId);
        setPresentMapWalkIndex(Math.max(0, (mapObj?.pins?.length || 1) - 1));
      } else if (prevScene.type === 'timeline') {
        setPresentTimelineIndex(Math.max(0, (activePres.timeline?.length || 1) - 1));
      } else {
        setPresentMapWalkIndex(0);
        setPresentTimelineIndex(0);
      }
      setPresentSubMaterialId(null);
    }
  };

  // Keyboard navigation for Presenter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenting) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNextPresent();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPresent();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsPresenting(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, presentSceneIndex, presentMapWalkIndex, presentTimelineIndex]);


  return (
    <div id="slide-builder-app-root" className="w-full h-full relative font-sans">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-indigo-500 text-indigo-200 px-4 py-2.5 rounded-full shadow-2xl z-[100] flex items-center gap-2 text-xs font-semibold"
          >
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================
          VIEW A: ALL PRESENTATIONS MANAGER (Daftar Presentasi)
          ======================================================= */}
      {!activePresId && (
        <div id="all-presentations-manager" className="space-y-6 max-w-7xl mx-auto py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Katalog Presentasi Interaktif</h2>
              <p className="text-sm text-slate-500 mt-1">Buat, rancang, dan putar media presentasi modern yang mendukung peta rute peradaban dan linimasa interaktif.</p>
            </div>
            
            <button
              onClick={() => setIsNewPresModalOpen(true)}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer text-sm"
            >
              <Plus size={18} /> Buat Presentasi Baru
            </button>
          </div>

          {/* CATALOG TABS */}
          <div className="flex gap-2 border-b border-slate-200 pb-1">
            <button
              onClick={() => setActivePresTab('all')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activePresTab === 'all' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua Presentasi ({presentations.length})
            </button>
            <button
              onClick={() => setActivePresTab('templates')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activePresTab === 'templates' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Template Pembelajaran ({PRESENTATION_TEMPLATES.length})
            </button>
          </div>

          {/* VIEW TAB CONTENTS */}
          {activePresTab === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presentations.map((pres) => (
                <div 
                  key={pres.id}
                  onClick={() => setActivePresId(pres.id)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-56 shadow-sm relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {pres.scenes.length} Slide
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Dibuat: {pres.createdAt}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors text-base line-clamp-2 leading-snug">{pres.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{pres.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">Tema: <span className="text-slate-600 capitalize font-mono">{pres.theme?.replace('_', ' ') || 'Dark Slate'}</span></span>
                    
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActivePresId(pres.id); }}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl cursor-pointer"
                        title="Buka Editor"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActivePresId(pres.id); setTimeout(handleStartPresentation, 50); }}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl cursor-pointer"
                        title="Putar Presentasi"
                      >
                        <Play size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDeletePresentation(pres.id, e)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRESENTATION_TEMPLATES.map((tmpl, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleImportFromTemplate(tmpl)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-56 shadow-sm relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        {tmpl.scenes.length} Slide
                      </span>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg uppercase tracking-wide">Template Ready</span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors text-base line-clamp-2 leading-snug">{tmpl.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{tmpl.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">Tema: <span className="text-slate-600 capitalize font-mono">{tmpl.theme}</span></span>
                    <button
                      onClick={() => handleImportFromTemplate(tmpl)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow transition-all cursor-pointer"
                    >
                      <PlusCircle size={12} /> Gunakan Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =======================================================
          VIEW B: STANdalone slide BUILDER EDITOR WORKSPACE
          ======================================================= */}
      {activePresId && activePres && !isPresenting && (
        <div id="slide-builder-editor-root" className="fixed inset-0 bg-[#0F172A] text-slate-100 z-50 flex flex-col justify-between font-sans overflow-hidden select-none">
          
          {/* 1. TOP TOOLBAR BAR */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActivePresId(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Kembali ke Katalog"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div>
                <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-widest block">SLIDE BUILDER GEN-II</span>
                <h1 className="font-bold text-sm text-white truncate max-w-xs md:max-w-md">{activePres.title}</h1>
              </div>
            </div>

            {/* Editor Action Controls */}
            <div className="flex items-center gap-4">
              {/* History Undo/Redo */}
              <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Undo (Urungkan)"
                >
                  <Undo size={14} />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Redo (Ulangi)"
                >
                  <Redo size={14} />
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleStartPresentation}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Play size={14} fill="currentColor" /> Putar Presentasi (Present)
              </button>
              
              <button
                onClick={() => setActivePresId(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Tutup Editor
              </button>
            </div>
          </header>

          {/* 2. THE THREE-PANEL EDITOR SYSTEM */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            
            {/* A. LEFT PANEL: SLIDE NAVIGATOR (Collapsible) */}
            <div className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full shrink-0 transition-all duration-300 relative ${
              isNavigatorOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
            }`}>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest">Navigator Slide ({activePres.scenes.length})</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                {activePres.scenes.map((scene, idx) => {
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
                        
                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReorderScene(scene.id, 'up'); }}
                            disabled={idx === 0}
                            className="p-0.5 hover:bg-slate-800 rounded disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp size={11} className="text-slate-400 hover:text-white" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReorderScene(scene.id, 'down'); }}
                            disabled={idx === activePres.scenes.length - 1}
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
                          {activePres.scenes.length > 1 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteScene(scene.id); }}
                              className="p-0.5 hover:bg-red-955/65 rounded cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={11} className="text-red-400 hover:text-red-300" />
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

              {/* Add Scene Buttons panel */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 space-y-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-left">Tambah Slide Baru:</span>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-extrabold">
                  <button onClick={() => handleAddScene('cover')} className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1">
                    <Tv size={9} className="text-amber-400" /> Cover
                  </button>
                  <button onClick={() => handleAddScene('narrative')} className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1">
                    <BookOpen size={9} className="text-indigo-400" /> Narasi
                  </button>
                  <button onClick={() => handleAddScene('timeline')} className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1">
                    <Clock size={9} className="text-emerald-400" /> Timeline
                  </button>
                  <button onClick={() => handleAddScene('map')} className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1">
                    <MapIcon size={9} className="text-cyan-400" /> Peta
                  </button>
                  <button onClick={() => handleAddScene('quiz')} className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1">
                    <Sparkles size={9} className="text-purple-400" /> Kuis
                  </button>
                  <button onClick={() => handleAddScene('reflection')} className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-left truncate cursor-pointer flex items-center gap-1">
                    <Compass size={9} className="text-rose-400" /> Refleksi
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle Slide Navigator Trigger Button */}
            <button 
              onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-r-lg z-20 flex items-center justify-center cursor-pointer"
            >
              {isNavigatorOpen ? <ChevronLeft size={14} /> : <ChevronRightIcon size={14} />}
            </button>

            {/* B. MIDDLE AREA: INTERACTIVE VISUAL PREVIEW CANVAS (Taking up largest area) */}
            <div className="flex-1 bg-[#090D1A] p-6 flex flex-col justify-between items-center overflow-hidden min-w-0">
              
              <div className="text-center text-[10px] font-mono text-slate-500 shrink-0">
                Double-click teks untuk edit langsung • Geser slider koordinat di kanan untuk reposisi elemen
              </div>

              {activeScene ? (
                <div className="relative w-full aspect-video max-h-[85vh] bg-[#070A13] rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden shrink-0 transition-all">
                  <SlideRenderer
                    scene={activeScene}
                    material={activePres}
                    maps={activePres.maps}
                    timelineEvents={activePres.timeline}
                    mode="editor"
                    onOpenMapFocus={() => {
                      const sceneIdx = activePres.scenes.findIndex(s => s.id === activeScene.id);
                      if (sceneIdx !== -1) {
                        setPresentSceneIndex(sceneIdx);
                        setPresentMapWalkIndex(0);
                        setIsPresenting(true);
                      }
                    }}
                  >
                  {/* MEDIA ELEMENTS LIST */}
                  {activeScene.mediaItems?.map((item) => {
                    const isSelected = item.id === selectedMediaItemId;
                    
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
                      zIndex: item.zIndex || 20, // We could map index if no zIndex
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
                      textAlign: item.textAlign || 'left',
                      textTransform: item.textTransform || 'none',
                    };

                    const filterStyle = {
                      filter: `brightness(${item.brightness !== undefined ? item.brightness : 100}%) blur(${item.blur || 0}px) grayscale(${item.grayscale || 0}%) sepia(${item.sepia || 0}%)`
                    };

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediaItemId(item.id);
                          setActiveInspectorTab('element');
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediaItemId(item.id);
                          if (item.type !== 'image' && item.type !== 'shape' && item.type !== 'icon') {
                            setIsEditingTextInline(true);
                            setInlineEditText(item.content);
                          }
                        }}
                        style={{
                          ...itemStyle,
                          zIndex: isSelected ? 40 : itemStyle.zIndex
                        }}
                        className={`group cursor-move p-0 flex flex-col justify-center rounded transition-all ${
                          isSelected 
                            ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#070A13]' 
                            : 'hover:ring-1 hover:ring-slate-700/50 hover:bg-slate-850/5'
                        }`}
                      >
                        {isEditingTextInline && isSelected && item.type !== 'image' && item.type !== 'shape' && item.type !== 'icon' ? (
                          <textarea
                            value={inlineEditText}
                            onChange={(e) => setInlineEditText(e.target.value)}
                            onBlur={() => {
                              handleUpdateMediaItem(item.id, { content: inlineEditText });
                              setIsEditingTextInline(false);
                            }}
                            style={textStyle}
                            className="w-full h-full p-2 bg-slate-900/80 border border-indigo-500 outline-none resize-none"
                            autoFocus
                          />
                        ) : (
                          <div className="w-full h-full overflow-hidden flex flex-col relative select-text" style={{ justifyContent: item.type === 'shape' ? 'center' : 'flex-start' }}>
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
                        )}

                        {/* Element Controls */}
                        {isSelected && (
                          <div className="absolute top-1 right-1 flex items-center gap-1 z-40 bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMediaItem(item.id);
                              }}
                              className="p-1 hover:bg-red-950 rounded cursor-pointer"
                              title="Hapus Elemen"
                            >
                              <Trash2 size={10} className="text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </SlideRenderer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic space-y-2">
                  <LayoutGrid size={40} className="text-slate-700 animate-pulse" />
                  <p>Pilih atau buat slide dari panel kiri untuk mulai mendesain!</p>
                </div>
              )}

              {/* Slide Status info at bottom of canvas */}
              <div className="text-[10px] font-mono text-slate-500 shrink-0">
                Pencadangan Cloud Terintegrasi • HistoLab Slide Engine v2.0
              </div>
            </div>

            {/* C. RIGHT PANEL: PROPERTIES INSPECTOR (Collapsible) */}
            <div className={`bg-slate-900 border-l border-slate-800 flex flex-col justify-between h-full shrink-0 transition-all duration-300 relative ${
              isPropertiesOpen ? 'w-80' : 'w-0 overflow-hidden border-l-0'
            }`}>
              
              <div className="p-3 border-b border-slate-800 flex gap-1 bg-slate-950/30 shrink-0">
                <button
                  onClick={() => setActiveInspectorTab('slide')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer text-center ${
                    activeInspectorTab === 'slide' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Slide
                </button>
                <button
                  onClick={() => setActiveInspectorTab('element')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer text-center ${
                    activeInspectorTab === 'element' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Elemen
                </button>
                <button
                  onClick={() => setActiveInspectorTab('data')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer text-center ${
                    activeInspectorTab === 'data' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kelola Data
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar text-left">
                
                {/* TAB 1: SLIDE SETTINGS */}
                {activeInspectorTab === 'slide' && activeScene && (
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-slate-800 pb-1.5">Pengaturan Slide</span>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Judul Slide:</label>
                      <input
                        type="text"
                        value={activeScene.title}
                        onChange={(e) => handleUpdateSceneMeta({ title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Catatan Narasi Guru:</label>
                      <textarea
                        value={activeScene.narration || ''}
                        onChange={(e) => handleUpdateSceneMeta({ narration: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-serif text-slate-300 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                        placeholder="Tulis poin-poin pidato guru saat menerangkan slide ini..."
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Latar Belakang Slide:</label>
                        <select
                          value={activeScene.backgroundType}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            handleUpdateSceneMeta({ 
                              backgroundType: val,
                              backgroundValue: val === 'image' || val === 'pattern' || val === 'texture' ? '' : activeScene.backgroundValue,
                            });
                          }}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                        >
                          <option value="dark_slate">Dark Slate (Default)</option>
                          <option value="parchment">Kertas Klasik (Parchment)</option>
                          <option value="gradient">Gradient Modern</option>
                          <option value="color">Warna Solid</option>
                          <option value="image">Gambar Khusus</option>
                          <option value="pattern">Pola Khusus (Pattern)</option>
                          <option value="texture">Tekstur Khusus</option>
                        </select>
                      </div>

                      {activeScene.backgroundType === 'color' && (
                        <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Warna Solid:</label>
                          <input
                            type="color"
                            value={activeScene.backgroundValue || '#0F172A'}
                            onChange={(e) => handleUpdateSceneMeta({ backgroundValue: e.target.value })}
                            className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                          />
                        </div>
                      )}

                      {(activeScene.backgroundType === 'image' || activeScene.backgroundType === 'pattern' || activeScene.backgroundType === 'texture') && (
                        <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Media Latar Belakang:</label>
                            <button
                              type="button"
                              onClick={() => {
                                setAssetPickerTarget('slide_bg');
                                setIsAssetPickerOpen(true);
                              }}
                              className="w-full px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Folder size={14} /> Pilih dari Asset Library
                            </button>
                            {activeScene.backgroundValue && (
                              <div className="relative w-full h-20 rounded-lg overflow-hidden border border-slate-800 mt-2">
                                <img src={activeScene.backgroundValue} alt="Background preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Fill Mode:</label>
                            <select
                              value={activeScene.backgroundSettings?.fillMode || 'cover'}
                              onChange={(e) => handleUpdateSceneMeta({ 
                                backgroundSettings: { ...activeScene.backgroundSettings, fillMode: e.target.value as any }
                              })}
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                            >
                              <option value="cover">Fill (Cover)</option>
                              <option value="contain">Fit (Contain)</option>
                              <option value="repeat">Repeat (Tile)</option>
                              <option value="center">Center</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1.5 pt-1 border-t border-slate-800">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Opacity:</span>
                              <span className="font-bold text-indigo-400">{activeScene.backgroundSettings?.opacity !== undefined ? activeScene.backgroundSettings.opacity : 100}%</span>
                            </div>
                            <input
                              type="range" min="0" max="100" value={activeScene.backgroundSettings?.opacity !== undefined ? activeScene.backgroundSettings.opacity : 100}
                              onChange={(e) => handleUpdateSceneMeta({ 
                                backgroundSettings: { ...activeScene.backgroundSettings, opacity: parseInt(e.target.value) }
                              })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>
                          
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Blur:</span>
                              <span className="font-bold text-indigo-400">{activeScene.backgroundSettings?.blur || 0}px</span>
                            </div>
                            <input
                              type="range" min="0" max="20" value={activeScene.backgroundSettings?.blur || 0}
                              onChange={(e) => handleUpdateSceneMeta({ 
                                backgroundSettings: { ...activeScene.backgroundSettings, blur: parseInt(e.target.value) }
                              })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Map connection settings */}
                    {activeScene.type === 'map' && (
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <label className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wide block">Hubungkan Peta:</label>
                        <select
                          value={activeScene.activeMapId || ''}
                          onChange={(e) => handleUpdateSceneMeta({ activeMapId: e.target.value })}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-cyan-500"
                        >
                          <option value="">-- Pilih Peta Presentasi --</option>
                          {activePres.maps?.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.pins?.length || 0} Pin)</option>
                          ))}
                        </select>
                        <p className="text-[8px] text-slate-500 leading-normal">
                          Gunakan tab "Kelola Data" di atas untuk membuat atau mengedit database koordinat peta untuk presentasi ini.
                        </p>
                      </div>
                    )}

                    {/* Add layout elements triggers */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Tambah Elemen Visual</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                        <button onClick={() => handleAddMediaItem('title')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <Type size={12} className="text-indigo-400" /> Judul
                        </button>
                        <button onClick={() => handleAddMediaItem('text')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <BookOpen size={12} className="text-emerald-400" /> Paragraf
                        </button>
                        <button onClick={() => handleAddMediaItem('quote')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <Quote size={12} className="text-amber-400" /> Kutipan
                        </button>
                        <button onClick={() => handleAddMediaItem('image')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <ImageIcon size={12} className="text-cyan-400" /> Gambar
                        </button>
                      </div>
                      
                      <span className="font-mono text-[10px] font-bold text-emerald-500 uppercase tracking-widest block pt-2 border-t border-slate-800">Shapes & Icons</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                        <button onClick={() => handleAddMediaItem('shape', 'rectangle')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <Square size={12} className="text-blue-400" /> Kotak
                        </button>
                        <button onClick={() => handleAddMediaItem('shape', 'circle')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <Circle size={12} className="text-red-400" /> Lingkaran
                        </button>
                        <button onClick={() => handleAddMediaItem('shape', 'line')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <Minus size={12} className="text-emerald-400" /> Garis
                        </button>
                        <button onClick={() => handleAddMediaItem('icon', undefined, 'Landmark')} className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <MousePointer2 size={12} className="text-purple-400" /> Icon
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SELECTED ELEMENT PROPERTIES */}
                {activeInspectorTab === 'element' && (
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-slate-800 pb-1.5">Properties Elemen</span>
                    
                    {selectedMediaItem ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                            {selectedMediaItem.type === 'image' ? 'Gambar Elemen:' : 'Konten / Teks:'}
                          </label>
                          {selectedMediaItem.type === 'image' ? (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAssetPickerTarget('media_element');
                                  setIsAssetPickerOpen(true);
                                }}
                                className="w-full px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Folder size={14} /> Pilih dari Asset Library
                              </button>
                              {selectedMediaItem.content && (
                                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-800">
                                  <img src={selectedMediaItem.content} alt="Element preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <textarea
                              value={selectedMediaItem.content}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { content: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none font-serif"
                            />
                          )}
                        </div>

                        {selectedMediaItem.type === 'image' && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Caption Gambar:</label>
                            <input
                              type="text"
                              value={selectedMediaItem.label || ''}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { label: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                              placeholder="Keterangan gambar..."
                            />
                          </div>
                        )}

                        {/* Coordinates and Sizing */}
                        <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Dimensi & Posisi (%)</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleUpdateMediaItem(selectedMediaItem.id, { x: 50 - (selectedMediaItem.w / 2) })} className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white" title="Align Center X"><AlignVerticalSpaceAround size={10} /></button>
                              <button onClick={() => handleUpdateMediaItem(selectedMediaItem.id, { y: 50 - (selectedMediaItem.h / 2) })} className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white" title="Align Center Y"><AlignHorizontalSpaceAround size={10} /></button>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Horisontal (X):</span>
                              <span className="font-bold text-indigo-400">{selectedMediaItem.x}%</span>
                            </div>
                            <input
                              type="range" min="0" max="90" value={selectedMediaItem.x}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { x: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Vertikal (Y):</span>
                              <span className="font-bold text-indigo-400">{selectedMediaItem.y}%</span>
                            </div>
                            <input
                              type="range" min="0" max="90" value={selectedMediaItem.y}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { y: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Lebar (W):</span>
                              <span className="font-bold text-indigo-400">{selectedMediaItem.w}%</span>
                            </div>
                            <input
                              type="range" min="10" max="100" value={selectedMediaItem.w}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { w: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Tinggi (H):</span>
                              <span className="font-bold text-indigo-400">{selectedMediaItem.h}%</span>
                            </div>
                            <input
                              type="range" min="5" max="100" value={selectedMediaItem.h}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { h: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>
                        </div>

                        {/* Text formatting options */}
                        {selectedMediaItem.type !== 'image' && selectedMediaItem.type !== 'shape' && (
                          <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Typography</span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Font Family:</label>
                                <select
                                  value={selectedMediaItem.fontFamily || 'inherit'}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { fontFamily: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                                >
                                  <option value="inherit">Default</option>
                                  <option value="var(--font-sans)">Sans Serif</option>
                                  <option value="var(--font-serif)">Serif (Playfair)</option>
                                  <option value="var(--font-mono)">Monospace</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Alignment:</label>
                                <select
                                  value={selectedMediaItem.textAlign || 'left'}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { textAlign: e.target.value as any })}
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                                >
                                  <option value="left">Kiri</option>
                                  <option value="center">Tengah</option>
                                  <option value="right">Kanan</option>
                                  <option value="justify">Justify</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Font Size:</label>
                                <input
                                  type="number" min="8" max="144" value={selectedMediaItem.fontSize || 14}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { fontSize: parseInt(e.target.value) })}
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Warna Teks:</label>
                                <input
                                  type="color" value={selectedMediaItem.textColor || '#ffffff'}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { textColor: e.target.value })}
                                  className="w-full h-7 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateMediaItem(selectedMediaItem.id, { fontWeight: selectedMediaItem.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                className={`flex-1 py-1 text-xs font-serif font-bold border rounded-lg ${selectedMediaItem.fontWeight === 'bold' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                              >
                                B
                              </button>
                              <button
                                onClick={() => handleUpdateMediaItem(selectedMediaItem.id, { fontStyle: selectedMediaItem.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                className={`flex-1 py-1 text-xs font-serif italic border rounded-lg ${selectedMediaItem.fontStyle === 'italic' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                              >
                                I
                              </button>
                              <button
                                onClick={() => handleUpdateMediaItem(selectedMediaItem.id, { textDecoration: selectedMediaItem.textDecoration === 'underline' ? 'none' : 'underline' })}
                                className={`flex-1 py-1 text-xs font-serif underline border rounded-lg ${selectedMediaItem.textDecoration === 'underline' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                              >
                                U
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Appearance / Shape Options */}
                        <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Appearance</span>
                          
                          {(selectedMediaItem.type === 'shape') && (
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Warna Fill / Background:</label>
                              <input
                                type="color" value={selectedMediaItem.backgroundColor || '#3b82f6'}
                                onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { backgroundColor: e.target.value })}
                                className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                              />
                            </div>
                          )}

                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Rotasi:</span>
                              <span className="font-bold text-indigo-400">{selectedMediaItem.rotate || 0}°</span>
                            </div>
                            <input
                              type="range" min="-180" max="180" value={selectedMediaItem.rotate || 0}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { rotate: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>
                          
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Opacity:</span>
                              <span className="font-bold text-indigo-400">{selectedMediaItem.opacity !== undefined ? selectedMediaItem.opacity : 100}%</span>
                            </div>
                            <input
                              type="range" min="0" max="100" value={selectedMediaItem.opacity !== undefined ? selectedMediaItem.opacity : 100}
                              onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { opacity: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                            />
                          </div>

                          {selectedMediaItem.type === 'image' && (
                            <>
                              <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                  <span>Border Radius:</span>
                                  <span className="font-bold text-indigo-400">{selectedMediaItem.borderRadius || 0}px</span>
                                </div>
                                <input
                                  type="range" min="0" max="100" value={selectedMediaItem.borderRadius || 0}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { borderRadius: parseInt(e.target.value) })}
                                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                                />
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                  <span>Brightness:</span>
                                  <span className="font-bold text-indigo-400">{selectedMediaItem.brightness !== undefined ? selectedMediaItem.brightness : 100}%</span>
                                </div>
                                <input
                                  type="range" min="0" max="200" value={selectedMediaItem.brightness !== undefined ? selectedMediaItem.brightness : 100}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { brightness: parseInt(e.target.value) })}
                                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                                />
                              </div>
                              
                              <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                  <span>Blur:</span>
                                  <span className="font-bold text-indigo-400">{selectedMediaItem.blur || 0}px</span>
                                </div>
                                <input
                                  type="range" min="0" max="20" value={selectedMediaItem.blur || 0}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { blur: parseInt(e.target.value) })}
                                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                                />
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                  <span>Grayscale:</span>
                                  <span className="font-bold text-indigo-400">{selectedMediaItem.grayscale || 0}%</span>
                                </div>
                                <input
                                  type="range" min="0" max="100" value={selectedMediaItem.grayscale || 0}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { grayscale: parseInt(e.target.value) })}
                                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                                />
                              </div>
                              
                              <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                  <span>Sepia:</span>
                                  <span className="font-bold text-indigo-400">{selectedMediaItem.sepia || 0}%</span>
                                </div>
                                <input
                                  type="range" min="0" max="100" value={selectedMediaItem.sepia || 0}
                                  onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { sepia: parseInt(e.target.value) })}
                                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                                />
                              </div>
                            </>
                          )}
                          
                          <div className="space-y-1.5 pt-1 border-t border-slate-800 mt-2">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block mt-2">Layer (z-Index):</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateMediaItem(selectedMediaItem.id, { zIndex: (selectedMediaItem.zIndex || 20) + 1 })}
                                className="flex-1 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded"
                              >
                                Bring Forward
                              </button>
                              <button
                                onClick={() => handleUpdateMediaItem(selectedMediaItem.id, { zIndex: Math.max(1, (selectedMediaItem.zIndex || 20) - 1) })}
                                className="flex-1 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded"
                              >
                                Send Backward
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMediaItem(selectedMediaItem.id)}
                          className="w-full py-2 bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-900/20 transition-all cursor-pointer"
                        >
                          Hapus Elemen
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center pt-8">Pilih salah satu elemen di canvas untuk melihat propertinya.</p>
                    )}
                  </div>
                )}

                {/* TAB 3: MANAGE INTERNAL DATA (MAPS & TIMELINE) */}
                {activeInspectorTab === 'data' && (
                  <div className="space-y-5">
                    <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-1.5">Database Presentasi</span>
                    
                    {/* PRESENTATION MAPS DATABASE */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Peta & Koordinat ({activePres.maps?.length || 0})</span>
                        <button
                          onClick={() => { setEditingMap({ name: '', description: '', era: 'Era Kuno', mapStyle: 'vintage', pins: [] }); setIsMapModalOpen(true); }}
                          className="px-2 py-1 bg-indigo-950/60 border border-indigo-900/40 hover:bg-indigo-900/40 rounded-lg text-[10px] font-bold text-indigo-300 cursor-pointer"
                        >
                          + Peta Baru
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {activePres.maps && activePres.maps.length > 0 ? (
                          activePres.maps.map(m => (
                            <div key={m.id} className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs">
                              <div className="min-w-0">
                                <span className="font-bold text-slate-200 block truncate">{m.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono block">Provider: Leaflet • {m.pins?.length || 0} Pin</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => { setEditingMap(m); setIsMapModalOpen(true); }}
                                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                                  title="Edit Peta & Pins"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus peta "${m.name}"?`)) {
                                      handleUpdateActivePres({ maps: activePres.maps?.filter(x => x.id !== m.id) });
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-950/35 rounded text-red-400 hover:text-red-300 cursor-pointer"
                                  title="Hapus Peta"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">Belum ada peta. Buat baru untuk rute peradaban!</p>
                        )}
                      </div>
                    </div>

                    {/* PRESENTATION TIMELINE DATABASE */}
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Milestones Linimasa ({activePres.timeline?.length || 0})</span>
                        <button
                          onClick={() => { setEditingTimelineEvent({ year: '1500 M', title: '', description: '' }); setIsTimelineModalOpen(true); }}
                          className="px-2 py-1 bg-indigo-950/60 border border-indigo-900/40 hover:bg-indigo-900/40 rounded-lg text-[10px] font-bold text-indigo-300 cursor-pointer"
                        >
                          + Milestone
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {activePres.timeline && activePres.timeline.length > 0 ? (
                          activePres.timeline.map(t => (
                            <div key={t.id} className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs">
                              <div className="min-w-0">
                                <span className="font-bold text-slate-200 block truncate">{t.year}: {t.title}</span>
                                <span className="text-[9px] text-slate-500 block truncate font-serif">{t.description}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => { setEditingTimelineEvent(t); setIsTimelineModalOpen(true); }}
                                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTimelineEvent(t.id)}
                                  className="p-1.5 hover:bg-red-955/40 rounded text-red-400 hover:text-red-300 cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">Belum ada milestone linimasa.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Properties Inspector Trigger Button */}
            <button 
              onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-l-lg z-20 flex items-center justify-center cursor-pointer"
            >
              {isPropertiesOpen ? <ChevronRightIcon size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* =======================================================
          VIEW C: FULL-SCREEN INTERACTIVE PRESENTATION RUNNER
          ======================================================= */}
      {isPresenting && activePres && (() => {
        const currentScene = activePres.scenes[presentSceneIndex] || activePres.scenes[0];
        if (currentScene.type === 'map') {
          const linkedMap = activePres.maps?.find(m => m.id === currentScene.activeMapId);
          if (linkedMap) {
            return (
              <MapFocusMode
                mapItem={linkedMap}
                initialPinIndex={presentMapWalkIndex}
                isPresentationMode={true}
                onClose={() => setIsPresenting(false)}
                onNextSlide={() => {
                  if (presentSceneIndex < activePres.scenes.length - 1) {
                    setPresentSceneIndex(prev => prev + 1);
                    setPresentMapWalkIndex(0);
                    setPresentTimelineIndex(0);
                    setPresentQuizRevealed(false);
                    setPresentSubMaterialId(null);
                  } else {
                    setIsPresenting(false);
                  }
                }}
              />
            );
          }
        }

        return (
          <div id="presentation-runner-root" className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col justify-between p-6 font-sans overflow-hidden select-none">
          
          {/* BACKGROUND TEXTURE BASED ON ACTIVE PRESENTATION SLIDE */}
          {(() => {
            const currentScene = activePres.scenes[presentSceneIndex] || activePres.scenes[0];
            return (
              <>
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
                {(currentScene.backgroundType === 'image' || currentScene.backgroundType === 'pattern' || currentScene.backgroundType === 'texture') && currentScene.backgroundValue && (
                  <div 
                    className="absolute inset-0 transition-all duration-700"
                    style={{
                      backgroundImage: `url(${currentScene.backgroundValue})`,
                      backgroundSize: currentScene.backgroundSettings?.fillMode === 'contain' ? 'contain' : currentScene.backgroundSettings?.fillMode === 'repeat' ? 'auto' : currentScene.backgroundSettings?.fillMode === 'center' ? 'auto' : 'cover',
                      backgroundRepeat: currentScene.backgroundSettings?.fillMode === 'repeat' ? 'repeat' : 'no-repeat',
                      backgroundPosition: 'center',
                      opacity: currentScene.backgroundSettings?.opacity !== undefined ? currentScene.backgroundSettings.opacity / 100 : 1,
                      filter: `blur(${currentScene.backgroundSettings?.blur || 0}px)`,
                    }}
                  />
                )}
              </>
            );
          })()}

          {/* 1. PRESENTATION HEADER */}
          <header id="pres-viewer-header" className="relative z-10 flex items-center justify-between border-b border-slate-850 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-indigo-400">
                <Play size={16} fill="currentColor" />
              </div>
              <div>
                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">HISTOLAB PRESENTATION PLAYER</span>
                <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wide truncate max-w-md">{activePres.title}</h2>
              </div>
            </div>

            {/* QUICK SLIDE NAVIGATOR TRACK */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 p-1 rounded-xl">
              {activePres.scenes.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setPresentSceneIndex(idx);
                    setPresentMapWalkIndex(0);
                    setPresentTimelineIndex(0);
                    setPresentQuizRevealed(false);
                    setPresentSubMaterialId(null);
                  }}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                    idx === presentSceneIndex
                      ? 'bg-indigo-600 text-white font-extrabold shadow-md scale-105'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={scene.title}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsPresenting(false)}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Keluar (Esc)
            </button>
          </header>

          {/* 2. MAIN STORY SCREEN WORKSPACE */}
          <main className="relative flex-1 my-6 flex flex-col justify-center items-center z-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {(() => {
                const currentScene = activePres.scenes[presentSceneIndex] || activePres.scenes[0];
                return (
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
                      material={activePres}
                      maps={activePres.maps}
                      timelineEvents={activePres.timeline}
                      mode="presentation"
                      activeTimelineIndex={presentTimelineIndex}
                      activeMapWalkIndex={presentMapWalkIndex}
                      quizRevealed={presentQuizRevealed}
                      activeSubMaterialId={presentSubMaterialId}
                      setActiveTimelineIndex={setPresentTimelineIndex}
                      setMapWalkIndex={setPresentMapWalkIndex}
                      setQuizRevealed={setPresentQuizRevealed}
                      setActiveSubMaterialId={setPresentSubMaterialId}
                    />
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </main>

          {/* 3. CONTROL FOOTER BAR */}
          <footer id="pres-viewer-footer" className="relative z-10 flex items-center justify-between border-t border-slate-850 pt-4 shrink-0">
            <div className="text-slate-500 text-[10px] font-mono text-left">
              Gunakan tombol <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">Esc</kbd> untuk keluar • <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">Space</kbd> / <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">→</kbd> untuk slide berikutnya
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevPresent}
                disabled={presentSceneIndex === 0 && presentMapWalkIndex === 0 && presentTimelineIndex === 0}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="font-mono text-xs text-slate-300 font-extrabold bg-slate-900/65 px-3 py-1 rounded-lg border border-slate-800">
                {presentSceneIndex + 1} / {activePres.scenes.length}
              </span>

              <button
                onClick={handleNextPresent}
                disabled={presentSceneIndex === activePres.scenes.length - 1 && 
                          (activePres.scenes[presentSceneIndex]?.type !== 'map' || presentMapWalkIndex === (activePres.maps?.find(m => m.id === activePres.scenes[presentSceneIndex]?.activeMapId)?.pins?.length || 1) - 1) &&
                          (activePres.scenes[presentSceneIndex]?.type !== 'timeline' || presentTimelineIndex === (activePres.timeline?.length || 1) - 1)}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Berikutnya"
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </footer>
        </div>
        );
      })()}


      {/* =======================================================
          MODAL 1: CREATE NEW PRESENTATION (Modal Baru)
          ======================================================= */}
      {isNewPresModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl text-left space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Buat Presentasi Sejarah Baru</h3>
              <button onClick={() => setIsNewPresModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreatePresentation(newPresData.title, newPresData.description, newPresData.theme); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Judul Presentasi:</label>
                <input
                  type="text" required placeholder="Contoh: Pendudukan Jepang di Jawa..."
                  value={newPresData.title}
                  onChange={(e) => setNewPresData({ ...newPresData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Ringkas:</label>
                <textarea
                  placeholder="Contoh: Menganalisis respon tokoh pergerakan..."
                  value={newPresData.description}
                  onChange={(e) => setNewPresData({ ...newPresData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-serif outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tema Awal:</label>
                <select
                  value={newPresData.theme}
                  onChange={(e) => setNewPresData({ ...newPresData, theme: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="dark_slate">Dark Slate Theme (Elegant Malam)</option>
                  <option value="parchment">Parchment Theme (Kertas Kuno Klasik)</option>
                  <option value="gradient">Gradient Theme (Modern Cosmic)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setIsNewPresModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Mulai Mendesain
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


      {/* =======================================================
          MODAL 2: MANAGE MAPS & GEOGRAPHIC PINS
          ======================================================= */}
      {isMapModalOpen && editingMap && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 max-w-3xl w-full shadow-2xl text-left space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">Editor Koordinat Peta Presentasi</h3>
              <button onClick={() => { setIsMapModalOpen(false); setEditingMap(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMap} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nama Peta:</label>
                    <input
                      type="text" required placeholder="Contoh: Rute Ekspedisi Belanda..."
                      value={editingMap.name}
                      onChange={(e) => setEditingMap({ ...editingMap, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Keterangan / Era Sejarah:</label>
                    <input
                      type="text" required placeholder="Contoh: Tahun 1595-1596 M..."
                      value={editingMap.era}
                      onChange={(e) => setEditingMap({ ...editingMap, era: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Style:</label>
                    <select
                      value={editingMap.mapStyle}
                      onChange={(e) => setEditingMap({ ...editingMap, mapStyle: e.target.value as any })}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs outline-none"
                    >
                      <option value="vintage">Vintage (Klasik Sejarah)</option>
                      <option value="maritime">Maritime (Kelautan)</option>
                      <option value="tactical">Tactical (Agresi Militer)</option>
                    </select>
                  </div>
                </div>

                {/* PIN MANAGER IN MODAL */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Database Pin Lokasi ({editingMap.pins?.length || 0})</span>
                  
                  {/* Pin form inputs */}
                  <div className="space-y-2 border-b border-slate-200 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text" placeholder="Nama Lokasi..."
                        value={newPinForm.label}
                        onChange={(e) => setNewPinForm({ ...newPinForm, label: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs"
                      />
                      <input
                        type="text" placeholder="Detail Ringkas..."
                        value={newPinForm.description}
                        onChange={(e) => setNewPinForm({ ...newPinForm, description: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number" step="0.0001" placeholder="Latitude (contoh: -6.175)..."
                        value={newPinForm.lat || ''}
                        onChange={(e) => setNewPinForm({ ...newPinForm, lat: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-[11px] font-mono"
                      />
                      <input
                        type="number" step="0.0001" placeholder="Longitude (contoh: 106.82)..."
                        value={newPinForm.lng || ''}
                        onChange={(e) => setNewPinForm({ ...newPinForm, lng: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-[11px] font-mono"
                      />
                    </div>
                    <button
                      type="button" onClick={handleAddPinToEditingMap}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      + Tambahkan Pin ke Peta
                    </button>
                  </div>

                  {/* List of current map pins */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {editingMap.pins && editingMap.pins.length > 0 ? (
                      editingMap.pins.map((pin, pIdx) => (
                        <div key={pin.id} className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="font-bold text-slate-700 block">{pIdx+1}. {pin.label}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{pin.lat}, {pin.lng}</span>
                          </div>
                          <button
                            type="button" onClick={() => handleDeletePinFromEditingMap(pin.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic text-center pt-4">Belum ada rute pin lokasi. Tambahkan di atas!</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button" onClick={() => { setIsMapModalOpen(false); setEditingMap(null); }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer text-center shadow"
                >
                  Simpan Peta
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


      {/* =======================================================
          MODAL 3: MANAGE TIMELINE EVENT MILESTONES
          ======================================================= */}
      {isTimelineModalOpen && editingTimelineEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl text-left space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">Editor Milestone Linimasa</h3>
              <button onClick={() => { setIsTimelineModalOpen(false); setEditingTimelineEvent(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTimelineEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tahun / Penanggalan:</label>
                <input
                  type="text" required placeholder="Contoh: 1602 M, Abad ke-5 SM..."
                  value={editingTimelineEvent.year}
                  onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, year: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Judul Peristiwa:</label>
                <input
                  type="text" required placeholder="Contoh: Pendirian Serikat Dagang VOC..."
                  value={editingTimelineEvent.title}
                  onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Kejadian:</label>
                <textarea
                  placeholder="Ceritakan kejadian sejarah penting tersebut..."
                  value={editingTimelineEvent.description}
                  onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, description: e.target.value })}
                  rows={4}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-serif outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => { setIsTimelineModalOpen(false); setEditingTimelineEvent(null); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer text-center shadow"
                >
                  Simpan Milestone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        category={assetPickerTarget === 'slide_bg' ? 'background' : 'materi'}
        onSelectAsset={(asset) => {
          if (assetPickerTarget === 'slide_bg') {
            handleUpdateSceneMeta({ backgroundValue: asset.dataUrl });
          } else if (assetPickerTarget === 'media_element' && selectedMediaItemId) {
            handleUpdateMediaItem(selectedMediaItemId, { content: asset.dataUrl });
          }
        }}
      />
    </div>
  );
}
