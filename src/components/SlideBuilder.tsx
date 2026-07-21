import React, { useState, useEffect, useRef } from 'react';
import { 
  Presentation as PresType, StoryScene, StoryMediaItem, TimelineEvent, HistoricalMap, MapPin
} from '../types';
import { 
  Play, Plus, Trash2, Edit2, Copy, ArrowUp, ArrowDown, Type, Image as ImageIcon, 
  Quote, Sparkles, BookOpen, Clock, Map as MapIcon, Compass, Sliders, ChevronRight, 
  MapPin as MapPinIcon, Info, Eye, EyeOff, Save, Undo, Redo, ChevronLeft, ChevronRight as ChevronRightIcon, 
  Menu, X, CheckCircle2, AlertCircle, LayoutGrid, Layers, Tv, HelpCircle, Calendar, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapBackground, GeographicOpenStreetMap } from './HistoricalMapEngine';
import MapFocusMode from './MapFocusMode';
import { INITIAL_PRESENTATIONS, PRESENTATION_TEMPLATES } from '../data/initialPresentations';

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
  const handleAddMediaItem = (type: 'title' | 'text' | 'quote' | 'image') => {
    if (!activePres || !selectedSceneId || !activeScene) return;

    const newItem: StoryMediaItem = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'title' ? 'Tambahkan Judul'
             : type === 'text' ? 'Tambahkan paragraf penjelasan sejarah yang berharga di sini...'
             : type === 'quote' ? '"Tulis kutipan sejarah yang puitis..."'
             : 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=800',
      x: 30, y: 40, w: 40, h: type === 'image' ? 30 : 15,
      fontSize: type === 'title' ? 24 : type === 'quote' ? 14 : 12,
      textColor: type === 'quote' ? '#f59e0b' : '#ffffff',
      label: type === 'image' ? 'Caption visual' : undefined
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
                  
                  {/* BACKGROUND THEME RENDERER */}
                  {activeScene.backgroundType === 'dark_slate' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
                      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
                    </div>
                  )}
                  {activeScene.backgroundType === 'parchment' && (
                    <div className="absolute inset-0 bg-[#FDFBF7] text-slate-900">
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400')`, backgroundSize: 'cover' }}></div>
                    </div>
                  )}
                  {activeScene.backgroundType === 'gradient' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950 text-slate-100"></div>
                  )}
                  {activeScene.backgroundType === 'color' && (
                    <div className="absolute inset-0 text-slate-100" style={{ backgroundColor: activeScene.backgroundValue || '#0F172A' }}></div>
                  )}

                  {/* SPECIAL AUTOMATED TEMPLATES */}
                  {activeScene.type === 'timeline' && (
                    <div className="absolute inset-6 flex flex-col justify-between z-10 pointer-events-none text-left">
                      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl max-w-sm">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Slide Linimasa Otomatis</span>
                        <h4 className="text-xs font-bold text-white uppercase">Slide ini memuat Milestone Garis Waktu Presentasi Anda secara otomatis</h4>
                      </div>
                      <div className="w-full h-1/2 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/60 font-mono text-[11px]">
                        {activePres.timeline && activePres.timeline.length > 0 ? (
                          <div className="text-center space-y-2">
                            <span className="text-emerald-400 font-bold block">✓ Terhubung dengan {activePres.timeline.length} Milestones Linimasa</span>
                            <div className="flex gap-2 justify-center max-w-md flex-wrap opacity-50 text-[9px]">
                              {activePres.timeline.map(t => (
                                <span key={t.id} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{t.year}</span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span>Belum ada Garis Waktu yang dibuat untuk presentasi ini. Gunakan tab 'Kelola Data' di kanan untuk menambahkannya!</span>
                        )}
                      </div>
                    </div>
                  )}

                  {activeScene.type === 'map' && (
                    <div className="absolute inset-6 z-10 text-left flex flex-col justify-between">
                      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl max-w-sm shrink-0">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">GIS Interactive Map Slide</span>
                        <h4 className="text-xs font-bold text-white uppercase">{activeScene.title || "Slide Peta Rute Perjalanan"}</h4>
                      </div>

                      {/* Map content info */}
                      <div className="flex-1 my-4 bg-slate-950/75 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center">
                        {(() => {
                          const linkedMap = activePres.maps?.find(m => m.id === activeScene.activeMapId);
                          if (!linkedMap) {
                            return (
                              <div className="text-center space-y-2">
                                <MapPinIcon className="text-cyan-400 mx-auto opacity-50" size={28} />
                                <p className="text-slate-400 text-xs">Belum ada peta yang dihubungkan.</p>
                                <p className="text-[9px] text-slate-500">Silakan hubungkan peta di panel sebelah kanan.</p>
                              </div>
                            );
                          }

                          if (!linkedMap.pins || linkedMap.pins.length === 0) {
                            return (
                              <div className="text-center space-y-2">
                                <MapPinIcon className="text-cyan-400 mx-auto" size={28} />
                                <p className="text-slate-400 text-xs">Peta "{linkedMap.name}" belum memiliki koordinat rute.</p>
                                <p className="text-[9px] text-slate-500">Kelola pin peta melalui tab 'Kelola Data' di panel kanan.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4 text-center">
                              <span className="text-cyan-400 font-bold block text-sm">✓ Terhubung dengan Peta: {linkedMap.name} ({linkedMap.pins.length} Rute)</span>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                {linkedMap.pins.map((pin, pIdx) => (
                                  <React.Fragment key={pin.id}>
                                    <div className="bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-lg text-[10px] text-slate-300">
                                      {pIdx + 1}. {pin.label}
                                    </div>
                                    {pIdx < linkedMap.pins.length - 1 && <ChevronRight size={10} className="text-cyan-500" />}
                                  </React.Fragment>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const sceneIdx = activePres.scenes.findIndex(s => s.id === activeScene.id);
                                  if (sceneIdx !== -1) {
                                    setPresentSceneIndex(sceneIdx);
                                    setPresentMapWalkIndex(0);
                                    setIsPresenting(true);
                                  }
                                }}
                                className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer border border-indigo-500/30 group"
                              >
                                <Compass size={14} className="animate-spin-slow text-amber-400 group-hover:scale-110 transition-transform" />
                                Buka Peta (Map Focus Mode)
                              </button>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="bg-slate-900/95 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 max-w-md text-[9px] text-slate-400">
                        <Info size={12} className="text-cyan-400 shrink-0" />
                        <span>Sistem memuat peta interaktif secara dinamis selama Mode Presentasi berlangsung menggunakan data di atas.</span>
                      </div>
                    </div>
                  )}

                  {/* MEDIA ELEMENTS LIST */}
                  {activeScene.mediaItems?.map((item) => {
                    const isSelected = item.id === selectedMediaItemId;
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
                        className={`group cursor-move p-2.5 flex flex-col justify-center rounded-xl transition-all ${
                          isSelected 
                            ? 'ring-2 ring-indigo-500 border border-indigo-400 bg-indigo-500/10 z-30' 
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
                            className="w-full h-full p-1.5 bg-slate-900 text-white border border-indigo-500 rounded outline-none resize-none text-[12px] font-medium leading-relaxed font-serif text-left"
                            autoFocus
                          />
                        ) : (
                          <div className="w-full h-full overflow-hidden flex flex-col justify-center relative select-text">
                            {item.type === 'title' && (
                              <h3 
                                style={{ fontSize: `${item.fontSize || 22}px`, color: item.textColor || '#ffffff' }}
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
                                className="italic border-l-2 border-amber-500/50 pl-3 font-serif py-0.5 text-center w-full"
                              >
                                {item.content}
                              </blockquote>
                            )}
                            {item.type === 'image' && (
                              <div className="w-full h-full relative border border-slate-800 rounded-lg overflow-hidden bg-slate-950 flex flex-col justify-between">
                                <img src={item.content} alt={item.label || "Visual"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                {item.label && (
                                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/95 text-white font-bold text-[8px] p-1 text-center truncate border-t border-slate-800">
                                    {item.label}
                                  </span>
                                )}
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

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Latar Belakang:</label>
                        <select
                          value={activeScene.backgroundType}
                          onChange={(e) => handleUpdateSceneMeta({ backgroundType: e.target.value as any })}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                        >
                          <option value="dark_slate">Dark Slate</option>
                          <option value="parchment">Parchment</option>
                          <option value="gradient">Gradient</option>
                          <option value="color">Warna Solid</option>
                        </select>
                      </div>

                      {activeScene.backgroundType === 'color' && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Warna Latar:</label>
                          <input
                            type="color"
                            value={activeScene.backgroundValue || '#0F172A'}
                            onChange={(e) => handleUpdateSceneMeta({ backgroundValue: e.target.value })}
                            className="w-full h-8 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-0.5"
                          />
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
                    </div>
                  </div>
                )}

                {/* TAB 2: SELECTED ELEMENT PROPERTIES */}
                {activeInspectorTab === 'element' && (
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-slate-800 pb-1.5">Properties Elemen</span>
                    
                    {selectedMediaItem ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                            {selectedMediaItem.type === 'image' ? 'URL Gambar:' : 'Konten / Teks:'}
                          </label>
                          <textarea
                            value={selectedMediaItem.content}
                            onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { content: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none font-serif"
                          />
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
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Dimensi & Posisi (%)</span>
                          
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
                        {selectedMediaItem.type !== 'image' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Font Size:</label>
                              <input
                                type="number" min="10" max="48" value={selectedMediaItem.fontSize || 14}
                                onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { fontSize: parseInt(e.target.value) })}
                                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Warna:</label>
                              <input
                                type="color" value={selectedMediaItem.textColor || '#ffffff'}
                                onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { textColor: e.target.value })}
                                className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[9px] font-mono text-slate-400">
                            <span>Rotasi:</span>
                            <span className="font-bold text-indigo-400">{selectedMediaItem.rotate || 0}°</span>
                          </div>
                          <input
                            type="range" min="-45" max="45" value={selectedMediaItem.rotate || 0}
                            onChange={(e) => handleUpdateMediaItem(selectedMediaItem.id, { rotate: parseInt(e.target.value) })}
                            className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800"
                          />
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
                    {/* A. COVER SLIDE */}
                    {currentScene.type === 'cover' && (
                      <div className="w-full max-w-4xl text-center space-y-6 px-4">
                        <span className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          PRESENTATION COVER
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
                          {currentScene.title}
                        </h1>
                        <p className="text-slate-300 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                          {currentScene.narration}
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
                              <p style={{ color: item.textColor || '#fbbf24', fontSize: `${item.fontSize || 16}px` }} className="italic font-serif pl-4 border-l-2 border-amber-500/50 text-left">
                                {item.content}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* B. NARRATIVE SLIDE */}
                    {currentScene.type === 'narrative' && (
                      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center px-4">
                        <div className="md:col-span-7 space-y-5 text-left">
                          <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-widest">NARASI SEJARAH</span>
                          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                            {currentScene.title}
                          </h2>
                          <p className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line font-serif">
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
                                {currentScene.mediaItems?.find(m => m.type === 'quote')?.content || '"Penyelidikan sejarah yang mendalam membuka jalan bagi pemahaman masa depan."'}
                              </blockquote>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* C. TIMELINE SLIDE */}
                    {currentScene.type === 'timeline' && (
                      <div className="w-full h-full flex flex-col justify-between px-4 text-left">
                        <div className="text-center space-y-1 shrink-0">
                          <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Interactive Milestone Timeline</span>
                          <h3 className="font-extrabold text-lg text-white">{currentScene.title}</h3>
                        </div>

                        {activePres.timeline?.[presentTimelineIndex] && (
                          <div className="flex-1 my-4 flex items-center justify-center max-w-4xl mx-auto w-full overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
                              <div className="md:col-span-12 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center space-y-3 shadow-xl">
                                <span className="text-amber-400 font-mono font-black text-xl md:text-2xl">{activePres.timeline[presentTimelineIndex].year}</span>
                                <h4 className="font-bold text-base md:text-lg text-white tracking-tight uppercase">{activePres.timeline[presentTimelineIndex].title}</h4>
                                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-serif">{activePres.timeline[presentTimelineIndex].description}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Horizontal Track */}
                        <div className="h-20 border-t border-slate-800 bg-slate-950/60 rounded-2xl p-3 flex items-center justify-between gap-4 shrink-0 overflow-x-auto no-scrollbar">
                          {activePres.timeline?.map((evt, idx) => (
                            <div
                              key={evt.id}
                              onClick={() => setPresentTimelineIndex(idx)}
                              className={`px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer text-center shrink-0 min-w-[140px] ${
                                idx === presentTimelineIndex
                                  ? 'bg-amber-500/10 border border-amber-500/40 shadow-lg scale-105'
                                  : 'border border-slate-900 hover:bg-slate-900/40'
                              }`}
                            >
                              <span className={`block text-xs font-mono font-black ${idx === presentTimelineIndex ? 'text-amber-400' : 'text-slate-400'}`}>{evt.year}</span>
                              <span className={`block text-[10px] truncate ${idx === presentTimelineIndex ? 'text-white font-extrabold' : 'text-slate-500'}`}>{evt.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* D. MAP SLIDE */}
                    {currentScene.type === 'map' && (
                      <div className="w-full h-full flex flex-col justify-between px-4 text-left">
                        <div className="text-center space-y-1 shrink-0">
                          <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Peta Rute Peradaban Terpadu (Leaflet Live)</span>
                          <h3 className="font-extrabold text-lg text-white">{currentScene.title}</h3>
                        </div>

                        <div className="flex-1 my-3 relative overflow-hidden rounded-3xl border border-slate-800 bg-[#070B13]">
                          {(() => {
                            const linkedMap = activePres.maps?.find(m => m.id === currentScene.activeMapId);
                            const pins = (linkedMap?.pins || []);
                            const activePin = pins[presentMapWalkIndex] || null;

                            return (
                              <div className="w-full h-full relative">
                                <GeographicOpenStreetMap
                                  pins={pins}
                                  showRoute={linkedMap?.showRoute ?? true}
                                  activePinId={activePin?.id || null}
                                  onPinClick={(p) => {
                                    const idx = pins.findIndex(x => x.id === p.id);
                                    if (idx !== -1) setPresentMapWalkIndex(idx);
                                  }}
                                />

                                {/* GPS HUD overlay */}
                                <div className="absolute top-4 left-4 bg-slate-950/95 border border-slate-800 px-3.5 py-2 rounded-xl font-mono text-[9px] text-cyan-400 pointer-events-none shadow-xl z-[400] flex items-center gap-1.5">
                                  <Compass size={11} className="animate-spin-slow text-cyan-400" />
                                  <span>POSISI GPS • LOKASI {pins.length > 0 ? presentMapWalkIndex + 1 : 0} DARI {pins.length}</span>
                                </div>

                                {/* HUD Detailed Card */}
                                {activePin && (
                                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-slate-800 p-4 rounded-2xl shadow-2xl z-[400] flex items-start gap-3">
                                    <div className="bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-xl text-cyan-400 font-mono font-black text-xs shrink-0">
                                      POS {presentMapWalkIndex + 1}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <h5 className="font-extrabold text-sm text-white uppercase tracking-wider">{activePin.label}</h5>
                                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{activePin.description}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* E. QUIZ SLIDE */}
                    {currentScene.type === 'quiz' && (
                      <div className="w-full max-w-3xl space-y-6 px-4 text-left">
                        <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          KUIS INTERAKTIF SEJARAH
                        </span>
                        
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                          {currentScene.title}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentScene.mediaItems?.find(m => m.type === 'text')?.content.split('\n').map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => setPresentQuizRevealed(true)}
                              className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                                presentQuizRevealed && opt.startsWith('A.')
                                  ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg scale-102 ring-1 ring-emerald-500/20'
                                  : presentQuizRevealed
                                    ? 'bg-slate-900/40 border-slate-900/60 opacity-50'
                                    : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850'
                              }`}
                            >
                              <span className={`text-xs md:text-sm font-bold ${presentQuizRevealed && opt.startsWith('A.') ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {opt}
                              </span>
                            </button>
                          ))}
                        </div>

                        {presentQuizRevealed ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3"
                          >
                            <Sparkles className="text-amber-400 shrink-0 mt-0.5" size={16} />
                            <div className="space-y-1">
                              <span className="font-mono text-[10px] font-black text-amber-500 uppercase tracking-widest">Eksplorasi Pembahasan:</span>
                              <p className="text-xs text-slate-300 font-serif leading-relaxed">
                                {currentScene.mediaItems?.find(m => m.type === 'quote')?.content || 'Jawaban A merupakan jawaban yang terverifikasi secara autentik menurut dokumen arsip kontemporer.'}
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => setPresentQuizRevealed(true)}
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 mx-auto cursor-pointer transition-colors"
                          >
                            <CheckCircle2 size={14} /> Periksa Jawaban Benar
                          </button>
                        )}
                      </div>
                    )}

                    {/* F. REFLECTION SLIDE */}
                    {currentScene.type === 'reflection' && (
                      <div className="w-full max-w-3xl text-center space-y-6 px-4">
                        <span className="inline-block bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          REFLEKSI SEJARAH
                        </span>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-serif">
                          {currentScene.title}
                        </h2>
                        
                        <div className="p-6 bg-slate-900/65 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4">
                          <Compass size={24} className="text-rose-400 mx-auto" />
                          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-serif italic leading-relaxed">
                            {currentScene.narration}
                          </p>
                        </div>
                      </div>
                    )}
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

    </div>
  );
}
