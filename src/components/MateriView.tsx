import React, { useState, useEffect } from 'react';
import { 
  Map, Compass, Clock, Plus, Trash, Edit, Check, Sparkles, 
  Presentation, Sliders, ArrowLeft, ArrowRight, BookOpen, 
  ChevronDown, ChevronUp, Layers, Minimize2, ExternalLink, 
  FileText, CheckCircle2, Focus, Eye, Target, MapPin,
  Copy, Settings, Type, Image, Quote, ArrowUp, ArrowDown, Tv, Upload, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Material, ClassItem, TimelineEvent, HistoricalMap, StoryScene, StoryMediaItem } from '../types';
import { HistoricalMapViewer, HistoricalMapEditor, MapBackground } from './HistoricalMapEngine';
import { StorytellingPresentation } from './StorytellingPresentation';
import { StorytellingDesigner } from './StorytellingDesigner';

interface MateriViewProps {
  classes: ClassItem[];
  materials: Material[];
  onAddMaterial: (material: Omit<Material, 'id'>) => void;
  onUpdateMaterial: (id: string, material: Partial<Material>) => void;
  onDeleteMaterial: (id: string) => void;
  initialMaterialId?: string | null;
  initialMode?: 'view' | 'edit' | 'create' | 'presentation' | null;
  onClearInitialState?: () => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create' | 'presentation' | 'story_editor') => void;
}

const getInitialStoryScenes = (material: Material): StoryScene[] => {
  if (material.storyScenes && material.storyScenes.length > 0) {
    return material.storyScenes;
  }

  const scenes: StoryScene[] = [];

  // 1. Cover Scene
  scenes.push({
    id: `scene-cover-${Date.now()}`,
    type: 'cover',
    title: 'Halaman Judul',
    narration: material.subtitle || 'Pembelajaran Sejarah Interaktif',
    backgroundType: 'dark_slate',
    backgroundValue: 'from-slate-900 via-slate-950 to-indigo-950',
    mediaItems: [
      {
        id: `med-cover-title-${Date.now()}`,
        type: 'title',
        content: material.title,
        x: 10, y: 25, w: 80, h: 22,
        fontSize: 32,
        textColor: '#ffffff',
        rotate: 0
      },
      {
        id: `med-cover-sub-${Date.now()}`,
        type: 'text',
        content: material.subtitle || 'Ketuk untuk mulai menelusuri sejarah.',
        x: 15, y: 50, w: 70, h: 15,
        fontSize: 18,
        textColor: '#F59E0B',
        rotate: 0
      },
      {
        id: `med-cover-bab-${Date.now()}`,
        type: 'quote',
        content: material.bab || 'Materi Sejarah',
        x: 35, y: 72, w: 30, h: 10,
        fontSize: 12,
        textColor: '#94A3B8',
        rotate: 0
      }
    ]
  });

  // 2. Narrative Scene
  scenes.push({
    id: `scene-intro-${Date.now()}`,
    type: 'narrative',
    title: 'Pengantar Cerita',
    narration: material.content,
    backgroundType: 'parchment',
    backgroundValue: 'bg-amber-50/95 text-slate-900',
    mediaItems: [
      {
        id: `med-narr-content-${Date.now()}`,
        type: 'quote',
        content: material.content || 'Tambahkan paragraf narasi pengantar cerita sejarah di sini...',
        x: 10, y: 20, w: 50, h: 60,
        fontSize: 15,
        textColor: '#1E293B',
        rotate: 0
      },
      ...(material.imageUrl ? [{
        id: `med-narr-img-${Date.now()}`,
        type: 'image' as const,
        content: material.imageUrl,
        x: 65, y: 20, w: 25, h: 45,
        rotate: 2,
        label: material.imageCaption || 'Ilustrasi Peristiwa'
      }] : [])
    ]
  });

  // 3. Timeline Scene (if timeline exists)
  if (material.timeline && material.timeline.length > 0) {
    scenes.push({
      id: `scene-timeline-${Date.now()}`,
      type: 'timeline',
      title: 'Linimasa Peristiwa',
      narration: 'Gunakan tombol arah untuk melintasi linimasa kronologis.',
      backgroundType: 'dark_slate',
      backgroundValue: 'from-slate-950 to-slate-900',
      activeTimelineIndex: 0,
      mediaItems: []
    });
  }

  // 4. Map Scene (if maps exist)
  if (material.maps && material.maps.length > 0) {
    material.maps.forEach((m, mIdx) => {
      scenes.push({
        id: `scene-map-${mIdx}-${Date.now()}`,
        type: 'map',
        title: `Peta: ${m.name}`,
        narration: m.description,
        backgroundType: 'dark_slate',
        backgroundValue: m.mapStyle || 'vintage',
        activeMapId: m.id,
        activeMapStepIndex: 0,
        mediaItems: []
      });
    });
  }

  // 5. Reflection Scene
  scenes.push({
    id: `scene-reflection-${Date.now()}`,
    type: 'reflection',
    title: 'Refleksi Sejarah',
    narration: 'Mari diskusikan hikmah moral yang bisa kita ambil dari peristiwa ini.',
    backgroundType: 'dark_slate',
    backgroundValue: 'from-slate-950 via-slate-900 to-slate-950',
    mediaItems: [
      {
        id: `med-refl-title-${Date.now()}`,
        type: 'title',
        content: 'Refleksi Sejarah',
        x: 10, y: 15, w: 80, h: 15,
        fontSize: 28,
        textColor: '#ffffff'
      },
      {
        id: `med-refl-quote-${Date.now()}`,
        type: 'quote',
        content: '“Sejarah tidak hanya memberitahu kita apa yang terjadi, tetapi juga membimbing kita tentang siapa kita dan bagaimana seharusnya kita bertindak.”',
        x: 15, y: 35, w: 70, h: 30,
        fontSize: 18,
        textColor: '#F59E0B',
        rotate: -1
      },
      {
        id: `med-refl-text-${Date.now()}`,
        type: 'text',
        content: 'Pelajaran moral apa yang paling berkesan dari materi hari ini untuk kehidupan modern?',
        x: 20, y: 70, w: 60, h: 15,
        fontSize: 14,
        textColor: '#E2E8F0'
      }
    ]
  });

  return scenes;
};

export default function MateriView({
  classes,
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  initialMaterialId,
  initialMode,
  onClearInitialState,
  onModeChange
}: MateriViewProps) {
  // Navigation: list of materials, filter by class
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [activeMaterialId, setActiveMaterialId] = useState<string>(materials[0]?.id || '');
  
  // Mode: 'view' | 'edit' | 'create' | 'presentation' | 'story_editor'
  const [mode, setMode] = useState<'view' | 'edit' | 'create' | 'presentation' | 'story_editor'>('view');

  // Trigger onModeChange callback on mode change
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // Storytelling Presentation & Designer States
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [localScenes, setLocalScenes] = useState<StoryScene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedMediaItemId, setSelectedMediaItemId] = useState<string | null>(null);
  const [mapWalkIndex, setMapWalkIndex] = useState<number>(0);
  const [quizRevealed, setQuizRevealed] = useState<boolean>(false);
  const [isEditingTextInline, setIsEditingTextInline] = useState<boolean>(false);
  const [inlineEditText, setInlineEditText] = useState<string>('');

  // Selected Material
  const activeMaterial = materials.find(m => m.id === activeMaterialId) || materials[0];

  // Sync Local Scenes when activeMaterial loads
  useEffect(() => {
    if (activeMaterial) {
      if (activeMaterial.storyScenes && activeMaterial.storyScenes.length > 0) {
        setLocalScenes(activeMaterial.storyScenes);
      } else {
        const initial = getInitialStoryScenes(activeMaterial);
        setLocalScenes(initial);
      }
    }
  }, [activeMaterialId, activeMaterial]);

  // Sync with initial props if triggered externally (e.g. from Dashboard)
  useEffect(() => {
    if (initialMaterialId) {
      setActiveMaterialId(initialMaterialId);
    }
    if (initialMode) {
      if (initialMode === 'presentation') {
        setMode('presentation');
        setActiveSceneIndex(0);
        setMapWalkIndex(0);
        setQuizRevealed(false);
      } else {
        setMode(initialMode as any);
      }
    }
    if (initialMaterialId || initialMode) {
      onClearInitialState?.();
    }
  }, [initialMaterialId, initialMode, onClearInitialState]);

  // Presentation Mode slide index (deprecated fallback)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Presentation Engine States
  const [presentationStage, setPresentationStage] = useState<'cover' | 'timeline'>('cover');
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number>(0);
  const [activeSubMaterialId, setActiveSubMaterialId] = useState<string | null>(null);
  const [showMapsOverlay, setShowMapsOverlay] = useState<boolean>(false);
  const [showSectionsOverlay, setShowSectionsOverlay] = useState<boolean>(false);
  const [isFocusing, setIsFocusing] = useState<boolean>(false);

  // Interactive Map States
  const [editingMapIndex, setEditingMapIndex] = useState<number | null>(null);
  const [projectedMap, setProjectedMap] = useState<HistoricalMap | null>(null);

  // Trigger camera focus zoom effect when timeline node or presentation stage changes
  useEffect(() => {
    if (mode === 'presentation' && presentationStage === 'timeline') {
      setIsFocusing(true);
      const timer = setTimeout(() => setIsFocusing(false), 950);
      return () => clearTimeout(timer);
    }
  }, [activeTimelineIndex, presentationStage, mode]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (mode !== 'presentation') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode('view');
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        const currentScene = localScenes[activeSceneIndex];
        
        // If map scene has walking steps and we haven't reached the end, step map pin!
        if (currentScene?.type === 'map' && currentScene.activeMapId) {
          const linkedMap = activeMaterial.maps?.find(m => m.id === currentScene.activeMapId);
          const maxSteps = linkedMap?.pins?.length || 0;
          if (mapWalkIndex < maxSteps - 1) {
            setMapWalkIndex(prev => prev + 1);
            return;
          }
        }

        // If timeline scene, step through years
        if (currentScene?.type === 'timeline') {
          if (activeTimelineIndex < (activeMaterial.timeline?.length || 1) - 1) {
            setActiveTimelineIndex(prev => prev + 1);
            setActiveSubMaterialId(null);
            return;
          }
        }
        
        // Otherwise, move to next scene
        if (activeSceneIndex < localScenes.length - 1) {
          setActiveSceneIndex(prev => prev + 1);
          setMapWalkIndex(0);
          setActiveTimelineIndex(0);
          setQuizRevealed(false);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentScene = localScenes[activeSceneIndex];
        
        // If map scene has walking steps and we aren't at the first pin, go back in pins!
        if (currentScene?.type === 'map' && currentScene.activeMapId && mapWalkIndex > 0) {
          setMapWalkIndex(prev => prev - 1);
          return;
        }

        // If timeline scene, step back in years
        if (currentScene?.type === 'timeline' && activeTimelineIndex > 0) {
          setActiveTimelineIndex(prev => prev - 1);
          setActiveSubMaterialId(null);
          return;
        }

        // Otherwise, move to previous scene
        if (activeSceneIndex > 0) {
          setActiveSceneIndex(prev => prev - 1);
          setQuizRevealed(false);
          const prevScene = localScenes[activeSceneIndex - 1];
          if (prevScene?.type === 'map' && prevScene.activeMapId) {
            const linkedMap = activeMaterial.maps?.find(m => m.id === prevScene.activeMapId);
            setMapWalkIndex(Math.max(0, (linkedMap?.pins?.length || 1) - 1));
          } else if (prevScene?.type === 'timeline') {
            setActiveTimelineIndex(Math.max(0, (activeMaterial.timeline?.length || 1) - 1));
          } else {
            setMapWalkIndex(0);
            setActiveTimelineIndex(0);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, activeSceneIndex, localScenes, mapWalkIndex, activeTimelineIndex, activeMaterial]);

  // Form states for Create/Edit
  const [formBab, setFormBab] = useState('BAB I');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  
  // Dynamic fields lists for Form
  const [formSections, setFormSections] = useState<{ title: string; body: string }[]>([
    { title: '', body: '' }
  ]);
  const [formTimeline, setFormTimeline] = useState<(Omit<TimelineEvent, 'id'> & { subMaterials?: { id: string; title: string; content: string }[] })[]>([
    { year: '', title: '', description: '', subMaterials: [] }
  ]);
  const [formMaps, setFormMaps] = useState<(Omit<HistoricalMap, 'id'> & { id?: string })[]>([
    { name: '', description: '', era: '', imageUrl: '', mapStyle: 'vintage', pins: [], showRoute: true }
  ]);

  // Storytelling Visual Editor Handlers
  const handleAddScene = (type: StoryScene['type']) => {
    const newScene: StoryScene = {
      id: `scene-${Date.now()}`,
      type,
      title: type === 'cover' ? 'Halaman Judul Baru' : type === 'narrative' ? 'Narasi Baru' : type === 'quiz' ? 'Kuis Baru' : type === 'reflection' ? 'Refleksi Baru' : 'Scene Baru',
      narration: '',
      backgroundType: type === 'narrative' ? 'parchment' : 'dark_slate',
      backgroundValue: type === 'narrative' ? 'bg-amber-50/95 text-slate-900' : 'from-slate-900 via-slate-950 to-indigo-950',
      mediaItems: type === 'quiz' ? [
        {
          id: `med-quiz-q-${Date.now()}`,
          type: 'title',
          content: 'Pertanyaan Kuis Sejarah?',
          x: 10, y: 15, w: 80, h: 15,
          fontSize: 24,
          textColor: '#ffffff'
        },
        {
          id: `med-quiz-opts-${Date.now()}`,
          type: 'text',
          content: 'A. Pilihan Satu\nB. Pilihan Dua\nC. Pilihan Tiga\nD. Pilihan Empat',
          x: 10, y: 35, w: 80, h: 30,
          fontSize: 16,
          textColor: '#CBD5E1'
        },
        {
          id: `med-quiz-ans-${Date.now()}`,
          type: 'quote',
          content: 'Jawaban yang benar: A. Pilihan Satu karena...',
          x: 10, y: 70, w: 80, h: 20,
          fontSize: 14,
          textColor: '#F59E0B'
        }
      ] : [
        {
          id: `med-item-${Date.now()}`,
          type: type === 'cover' ? 'title' : 'text',
          content: type === 'cover' ? 'Judul Baru' : 'Klik ganda untuk mengetik teks cerita di sini...',
          x: 20, y: 30, w: 60, h: 20,
          fontSize: type === 'cover' ? 28 : 16,
          textColor: type === 'cover' ? '#ffffff' : '#CBD5E1'
        }
      ]
    };
    
    // Auto-link map or timeline if they exist
    if (type === 'map' && activeMaterial.maps && activeMaterial.maps.length > 0) {
      newScene.activeMapId = activeMaterial.maps[0].id;
      newScene.activeMapStepIndex = 0;
    }
    if (type === 'timeline') {
      newScene.activeTimelineIndex = 0;
    }

    const updated = [...localScenes, newScene];
    setLocalScenes(updated);
    setSelectedSceneId(newScene.id);
    setSelectedMediaItemId(null);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  const handleDeleteScene = (sceneId: string) => {
    if (localScenes.length <= 1) {
      alert('Satu presentasi minimal harus memiliki 1 scene.');
      return;
    }
    const updated = localScenes.filter(s => s.id !== sceneId);
    setLocalScenes(updated);
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(updated[0].id);
    }
    setSelectedMediaItemId(null);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  const handleDuplicateScene = (sceneId: string) => {
    const target = localScenes.find(s => s.id === sceneId);
    if (!target) return;
    const duplicated: StoryScene = {
      ...target,
      id: `scene-dup-${Date.now()}`,
      title: `${target.title} (Salinan)`,
      mediaItems: target.mediaItems?.map(item => ({
        ...item,
        id: `med-dup-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
      }))
    };
    const index = localScenes.findIndex(s => s.id === sceneId);
    const updated = [...localScenes];
    updated.splice(index + 1, 0, duplicated);
    setLocalScenes(updated);
    setSelectedSceneId(duplicated.id);
    setSelectedMediaItemId(null);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  const handleReorderScene = (sceneId: string, direction: 'up' | 'down') => {
    const index = localScenes.findIndex(s => s.id === sceneId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localScenes.length - 1) return;

    const updated = [...localScenes];
    const target = updated[index];
    const swapWithIndex = direction === 'up' ? index - 1 : index + 1;
    updated[index] = updated[swapWithIndex];
    updated[swapWithIndex] = target;

    setLocalScenes(updated);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  const handleAddMediaItem = (type: StoryMediaItem['type']) => {
    if (!selectedSceneId) return;
    const itemContent = 
      type === 'title' ? 'Judul Baru' :
      type === 'quote' ? '“Kutipan sejarah penting di sini.”' :
      type === 'image' ? 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400' :
      'Teks cerita baru yang bisa digeser dan disesuaikan ukurannya...';

    const newItem: StoryMediaItem = {
      id: `med-item-${Date.now()}`,
      type,
      content: itemContent,
      x: 30,
      y: 35,
      w: type === 'image' ? 30 : 40,
      h: type === 'image' ? 35 : 18,
      fontSize: type === 'title' ? 24 : type === 'quote' ? 18 : 14,
      textColor: type === 'quote' ? '#F59E0B' : '#ffffff',
      rotate: 0
    };

    const updated = localScenes.map(s => {
      if (s.id === selectedSceneId) {
        return {
          ...s,
          mediaItems: [...(s.mediaItems || []), newItem]
        };
      }
      return s;
    });

    setLocalScenes(updated);
    setSelectedMediaItemId(newItem.id);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  const handleUpdateMediaItem = (itemId: string, fields: Partial<StoryMediaItem>) => {
    const updated = localScenes.map(s => {
      if (s.id === selectedSceneId) {
        return {
          ...s,
          mediaItems: s.mediaItems?.map(item => {
            if (item.id === itemId) {
              return { ...item, ...fields };
            }
            return item;
          })
        };
      }
      return s;
    });
    setLocalScenes(updated);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  const handleDeleteMediaItem = (itemId: string) => {
    const updated = localScenes.map(s => {
      if (s.id === selectedSceneId) {
        return {
          ...s,
          mediaItems: s.mediaItems?.filter(item => item.id !== itemId)
        };
      }
      return s;
    });
    setLocalScenes(updated);
    setSelectedMediaItemId(null);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  const handleUpdateSceneMeta = (fields: Partial<StoryScene>) => {
    const updated = localScenes.map(s => {
      if (s.id === selectedSceneId) {
        return { ...s, ...fields };
      }
      return s;
    });
    setLocalScenes(updated);
    onUpdateMaterial(activeMaterial.id, { storyScenes: updated });
  };

  // Filter materials based on selected class
  const filteredMaterials = selectedClassId === 'all' 
    ? materials 
    : materials.filter(m => m.classId === selectedClassId);

  // Initialize form for editing
  const handleStartEdit = () => {
    if (!activeMaterial) return;
    setFormBab(activeMaterial.bab);
    setFormTitle(activeMaterial.title);
    setFormSubtitle(activeMaterial.subtitle);
    setFormContent(activeMaterial.content);
    setFormImageUrl(activeMaterial.imageUrl || '');
    setFormImageCaption(activeMaterial.imageCaption || '');
    setFormClassId(activeMaterial.classId);
    setFormSections(activeMaterial.sections.map(s => ({ title: s.title, body: s.body })));
    setFormTimeline(activeMaterial.timeline?.map(t => ({ 
      year: t.year, 
      title: t.title, 
      description: t.description,
      subMaterials: t.subMaterials?.map(sub => ({ id: sub.id, title: sub.title, content: sub.content })) || []
    })) || []);
    setFormMaps(activeMaterial.maps?.map(m => ({ 
      id: m.id,
      name: m.name, 
      description: m.description, 
      era: m.era, 
      imageUrl: m.imageUrl || '',
      mapStyle: m.mapStyle || 'vintage',
      pins: m.pins || [],
      showRoute: m.showRoute !== undefined ? m.showRoute : true
    })) || []);
    setMode('edit');
  };

  // Initialize form for creating
  const handleStartCreate = () => {
    setFormBab('BAB I');
    setFormTitle('');
    setFormSubtitle('');
    setFormContent('');
    setFormImageUrl('');
    setFormImageCaption('');
    setFormClassId(classes[0]?.id || '');
    setFormSections([{ title: '', body: '' }]);
    setFormTimeline([{ year: '', title: '', description: '', subMaterials: [] }]);
    setFormMaps([{ name: '', description: '', era: '', imageUrl: '', mapStyle: 'vintage', pins: [], showRoute: true }]);
    setMode('create');
  };

  // Sections dynamic field handlers
  const addFormSection = () => setFormSections([...formSections, { title: '', body: '' }]);
  const removeFormSection = (index: number) => setFormSections(formSections.filter((_, i) => i !== index));
  const updateFormSection = (index: number, key: 'title' | 'body', value: string) => {
    const updated = [...formSections];
    updated[index][key] = value;
    setFormSections(updated);
  };

  // Timeline dynamic field handlers
  const addFormTimeline = () => setFormTimeline([...formTimeline, { year: '', title: '', description: '', subMaterials: [] }]);
  const removeFormTimeline = (index: number) => setFormTimeline(formTimeline.filter((_, i) => i !== index));
  const updateFormTimeline = (index: number, key: 'year' | 'title' | 'description', value: string) => {
    const updated = [...formTimeline];
    updated[index][key] = value;
    setFormTimeline(updated);
  };

  // Nested sub-materials handlers for timeline events
  const addFormTimelineSubMaterial = (timelineIndex: number) => {
    const updated = [...formTimeline];
    if (!updated[timelineIndex].subMaterials) {
      updated[timelineIndex].subMaterials = [];
    }
    updated[timelineIndex].subMaterials!.push({ id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, title: '', content: '' });
    setFormTimeline(updated);
  };

  const removeFormTimelineSubMaterial = (timelineIndex: number, subIndex: number) => {
    const updated = [...formTimeline];
    if (updated[timelineIndex].subMaterials) {
      updated[timelineIndex].subMaterials = updated[timelineIndex].subMaterials!.filter((_, i) => i !== subIndex);
    }
    setFormTimeline(updated);
  };

  const updateFormTimelineSubMaterial = (timelineIndex: number, subIndex: number, key: 'title' | 'content', value: string) => {
    const updated = [...formTimeline];
    if (updated[timelineIndex].subMaterials && updated[timelineIndex].subMaterials![subIndex]) {
      updated[timelineIndex].subMaterials![subIndex][key] = value;
    }
    setFormTimeline(updated);
  };

  // Maps dynamic field handlers
  const addFormMap = () => setFormMaps([...formMaps, { name: '', description: '', era: '', imageUrl: '', mapStyle: 'vintage', pins: [], showRoute: true }]);
  const removeFormMap = (index: number) => setFormMaps(formMaps.filter((_, i) => i !== index));
  const updateFormMap = (index: number, key: 'name' | 'description' | 'era' | 'imageUrl' | 'mapStyle' | 'showRoute', value: any) => {
    const updated = [...formMaps];
    updated[index][key] = value;
    setFormMaps(updated);
  };

  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    
    let file: File | null = null;
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    } else if ('target' in e && e.target.files) {
      file = e.target.files[0];
    }

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file gambar yang valid (JPG, PNG, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setFormImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle submit for Create/Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      alert('Mohon isi judul dan ringkasan materi.');
      return;
    }

    const sectionsWithId = formSections
      .filter(s => s.title && s.body)
      .map((s, idx) => ({ id: `sec-${Date.now()}-${idx}`, ...s }));

    const timelineWithId = formTimeline
      .filter(t => t.year && t.title)
      .map((t, idx) => ({
        id: `te-${Date.now()}-${idx}`,
        year: t.year,
        title: t.title,
        description: t.description,
        subMaterials: t.subMaterials?.filter(sub => sub.title && sub.content).map((sub, sidx) => ({
          id: sub.id || `sub-${Date.now()}-${idx}-${sidx}`,
          title: sub.title,
          content: sub.content
        })) || []
      }));

    const mapsWithId = formMaps
      .filter(m => m.name && m.description)
      .map((m, idx) => ({ 
        id: m.id || `map-${Date.now()}-${idx}`,
        name: m.name,
        description: m.description,
        era: m.era,
        imageUrl: m.imageUrl || undefined,
        mapStyle: m.mapStyle || 'vintage',
        pins: m.pins || [],
        showRoute: m.showRoute !== undefined ? m.showRoute : true
      }));

    const payload = {
      classId: formClassId,
      bab: formBab,
      title: formTitle,
      subtitle: formSubtitle,
      content: formContent,
      sections: sectionsWithId,
      imageUrl: formImageUrl || undefined,
      imageCaption: formImageCaption || undefined,
      timeline: timelineWithId,
      maps: mapsWithId
    };

    if (mode === 'create') {
      onAddMaterial(payload);
      setMode('view');
    } else if (mode === 'edit' && activeMaterial) {
      onUpdateMaterial(activeMaterial.id, payload);
      setMode('view');
    }
  };

  // Handle transition helper functions
  const handleNextTimelineNode = () => {
    const timelineEvents = activeMaterial?.timeline || [];
    if (activeTimelineIndex < timelineEvents.length - 1) {
      setActiveTimelineIndex(activeTimelineIndex + 1);
      setActiveSubMaterialId(null);
    }
  };

  const handlePrevTimelineNode = () => {
    if (activeTimelineIndex > 0) {
      setActiveTimelineIndex(activeTimelineIndex - 1);
      setActiveSubMaterialId(null);
    }
  };

  if (mode === 'presentation' && activeMaterial) {
    return (
      <StorytellingPresentation
        activeMaterial={activeMaterial}
        localScenes={localScenes}
        activeSceneIndex={activeSceneIndex}
        setActiveSceneIndex={setActiveSceneIndex}
        mapWalkIndex={mapWalkIndex}
        setMapWalkIndex={setMapWalkIndex}
        activeTimelineIndex={activeTimelineIndex}
        setActiveTimelineIndex={setActiveTimelineIndex}
        activeSubMaterialId={activeSubMaterialId}
        setActiveSubMaterialId={setActiveSubMaterialId}
        quizRevealed={quizRevealed}
        setQuizRevealed={setQuizRevealed}
        setMode={setMode}
      />
    );
  }

  if (mode === 'story_editor' && activeMaterial) {
    return (
      <StorytellingDesigner
        activeMaterial={activeMaterial}
        localScenes={localScenes}
        setLocalScenes={setLocalScenes}
        selectedSceneId={selectedSceneId}
        setSelectedSceneId={setSelectedSceneId}
        selectedMediaItemId={selectedMediaItemId}
        setSelectedMediaItemId={setSelectedMediaItemId}
        isEditingTextInline={isEditingTextInline}
        setIsEditingTextInline={setIsEditingTextInline}
        inlineEditText={inlineEditText}
        setInlineEditText={setInlineEditText}
        onUpdateMaterial={onUpdateMaterial}
        setMode={setMode}
        handleAddScene={handleAddScene}
        handleDeleteScene={handleDeleteScene}
        handleDuplicateScene={handleDuplicateScene}
        handleReorderScene={handleReorderScene}
        handleAddMediaItem={handleAddMediaItem}
        handleUpdateMediaItem={handleUpdateMediaItem}
        handleDeleteMediaItem={handleDeleteMediaItem}
        handleUpdateSceneMeta={handleUpdateSceneMeta}
        setActiveSceneIndex={setActiveSceneIndex}
        setMapWalkIndex={setMapWalkIndex}
        setQuizRevealed={setQuizRevealed}
      />
    );
  }

  return (
    <div className="animate-fade-in" id="materi-container">
      {mode === 'create' || mode === 'edit' ? (
        /* MATERIAL CREATOR / EDITOR VIEW */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <Sliders className="text-indigo-600" size={24} />
              <h2 className="font-bold text-lg text-slate-900">
                {mode === 'create' ? 'Tulis Materi Sejarah Baru' : 'Ubah Detail Materi Sejarah'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setMode('view')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold cursor-pointer"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-sm font-medium">
            {/* Meta Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-slate-700 mb-1.5">Materi untuk Kelas</label>
                <select
                  value={formClassId}
                  onChange={e => setFormClassId(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5">BAB Pembahasan</label>
                <input
                  type="text"
                  placeholder="Misal: BAB I"
                  value={formBab}
                  onChange={e => setFormBab(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5">Judul Utama</label>
                <input
                  type="text"
                  placeholder="Misal: Pengantar Ilmu Sejarah"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-bold outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1.5">Sub-judul / Pengantar Tambahan</label>
              <input
                type="text"
                placeholder="Misal: Konsep berpikir kronologis dan validitas sejarah"
                value={formSubtitle}
                onChange={e => setFormSubtitle(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1.5">Ringkasan Materi Pendahuluan</label>
              <textarea
                placeholder="Tuliskan pengantar singkat mengenai bab ini untuk memantik minat siswa..."
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 h-28 resize-none leading-relaxed outline-none"
                required
              />
            </div>

            {/* Multimedia Image Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div>
                <label className="block text-slate-700 mb-1.5">Gambar Pendukung Topik</label>
                {!formImageUrl ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingImage(false); }}
                    onDrop={handleImageUpload}
                    className={`relative w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all bg-white cursor-pointer ${
                      isDraggingImage ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="font-bold text-sm text-slate-700">Pilih file atau drag & drop di sini</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                  </div>
                ) : (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                        title="Hapus Gambar"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5">Keterangan Gambar / Hak Cipta</label>
                <input
                  type="text"
                  placeholder="Misal: Lukisan dinding gua tertua di Maros."
                  value={formImageCaption}
                  onChange={e => setFormImageCaption(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Interactive Dynamic Sections Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-base text-slate-900">1. Rincian Sub-Materi (Paragraphs)</h3>
                <button
                  type="button"
                  onClick={addFormSection}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Sub-Bab
                </button>
              </div>
              <div className="space-y-4">
                {formSections.map((sec, index) => (
                  <div key={index} className="p-4 border border-slate-200 bg-slate-50 rounded-2xl space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-500 uppercase font-mono tracking-wider">Bagian #{index + 1}</span>
                      {formSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormSection(index)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-xs font-bold"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Judul Sub-Bab (misal: Konsep Sinkronis)"
                      value={sec.title}
                      onChange={e => updateFormSection(index, 'title', e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      required
                    />
                    <textarea
                      placeholder="Isi rincian materi lengkap..."
                      value={sec.body}
                      onChange={e => updateFormSection(index, 'body', e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white h-24 resize-none leading-relaxed focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Future Presenter Timeline Events */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    2. Peristiwa Timeline Pembelajaran
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Disusun kronologis untuk fondasi slide timeline interaktif.</p>
                </div>
                <button
                  type="button"
                  onClick={addFormTimeline}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Event
                </button>
              </div>
              <div className="space-y-4">
                {formTimeline.map((ev, index) => (
                  <div key={index} className="p-5 border border-slate-200 bg-slate-50 rounded-2xl space-y-4">
                    {/* Event Core Meta fields */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tahun / Era / Label</label>
                        <input
                          type="text"
                          placeholder="Misal: 1930 atau Hiroshima"
                          value={ev.year}
                          onChange={e => updateFormTimeline(index, 'year', e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Judul Peristiwa</label>
                        <input
                          type="text"
                          placeholder="Misal: Kebangkitan Fasisme"
                          value={ev.title}
                          onChange={e => updateFormTimeline(index, 'title', e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2 items-end md:col-span-1">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rangkuman / Deskripsi</label>
                          <input
                            type="text"
                            placeholder="Ringkasan singkat..."
                            value={ev.description}
                            onChange={e => updateFormTimeline(index, 'description', e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                            required
                          />
                        </div>
                        {formTimeline.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFormTimeline(index)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                            title="Hapus Event ini"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* NESTED SUB-MATERIALS LIST FOR THIS EVENT */}
                    <div className="pl-4 border-l-2 border-indigo-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-indigo-700">Sub-Materi Detail ({ev.subMaterials?.length || 0})</span>
                          <span className="text-[10px] text-slate-400 font-normal">Pembahasan mendalam pada tahun/milestone ini.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => addFormTimelineSubMaterial(index)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus size={12} /> Tambah Sub-Materi
                        </button>
                      </div>

                      {ev.subMaterials && ev.subMaterials.length > 0 ? (
                        <div className="space-y-2">
                          {ev.subMaterials.map((sub, subIdx) => (
                            <div key={sub.id || subIdx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white border border-slate-200 rounded-xl items-start">
                              <div className="md:col-span-4">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Judul Sub-Topik</label>
                                <input
                                  type="text"
                                  placeholder="Misal: Invasi Manchuria"
                                  value={sub.title}
                                  onChange={e => updateFormTimelineSubMaterial(index, subIdx, 'title', e.target.value)}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                  required
                                />
                              </div>
                              <div className="md:col-span-7">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rincian / Isi Penjelasan</label>
                                <textarea
                                  placeholder="Penjelasan detail peristiwa..."
                                  value={sub.content}
                                  onChange={e => updateFormTimelineSubMaterial(index, subIdx, 'content', e.target.value)}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white h-12 resize-none leading-relaxed focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                  required
                                />
                              </div>
                              <div className="md:col-span-1 flex justify-center pt-5">
                                <button
                                  type="button"
                                  onClick={() => removeFormTimelineSubMaterial(index, subIdx)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Sub-Materi ini"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Belum ada sub-materi terstruktur. Klik "Tambah Sub-Materi" di atas untuk memperdalam peristiwa ini.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Presenter Historical Maps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">3. Pemetaan Sejarah Terkait</h3>
                  <p className="text-xs text-slate-500 mt-1">Geografi sejarah untuk fondasi modul peta interaktif.</p>
                </div>
                <button
                  type="button"
                  onClick={addFormMap}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Peta
                </button>
              </div>
              <div className="space-y-4">
                {formMaps.map((mp, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-slate-200 bg-slate-50 rounded-2xl items-start">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Peta</label>
                      <input
                        type="text"
                        placeholder="Misal: Peta Kerajaan Sriwijaya"
                        value={mp.name}
                        onChange={e => updateFormMap(index, 'name', e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Era Sejarah</label>
                      <input
                        type="text"
                        placeholder="Misal: Abad ke-7 M"
                        value={mp.era}
                        onChange={e => updateFormMap(index, 'era', e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deskripsi Wilayah</label>
                        <input
                          type="text"
                          placeholder="Keterangan rute atau luas wilayah..."
                          value={mp.description}
                          onChange={e => updateFormMap(index, 'description', e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      {formMaps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormMap(index)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Map pinning configuration button row */}
                    <div className="md:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 pt-3 border-t border-slate-200/60 gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Geospasial:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                            {mp.pins?.length || 0} Pin Terpasang
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-600 uppercase px-2 py-0.5 bg-amber-50 rounded-md">
                            Style: {mp.mapStyle || 'vintage'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase px-2 py-0.5 bg-cyan-50 rounded-md">
                            Route: {mp.showRoute ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setEditingMapIndex(index)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all self-end sm:self-auto"
                      >
                        <MapPin size={13} /> Atur Pin & Rute Workshop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-2"
              >
                <Check size={18} /> Simpan Materi
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* STANDARD VIEWING MODE */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]" id="materi-view-panel">
          {/* LEFT PANEL: CATEGORY FILTER & MATERIALS LIST */}
          <div className="md:col-span-4 lg:col-span-3 h-full min-h-0">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="font-bold text-lg text-slate-900">Perpustakaan Sejarah</h3>
                <button
                  onClick={handleStartCreate}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <Plus size={14} /> Tulis Baru
                </button>
              </div>

              {/* Class Filter Dropdown */}
              <div className="space-y-1.5 shrink-0">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Filter Kelas:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    // Select first matching material automatically
                    const matches = e.target.value === 'all' 
                      ? materials 
                      : materials.filter(m => m.classId === e.target.value);
                    if (matches.length > 0) setActiveMaterialId(matches[0].id);
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium outline-none"
                >
                  <option value="all">Semua Kelas ({materials.length})</option>
                  {classes.map(c => {
                    const count = materials.filter(m => m.classId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>{c.name} ({count})</option>
                    );
                  })}
                </select>
              </div>

              {/* Materials List */}
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                {filteredMaterials.map(mat => {
                  const targetClass = classes.find(c => c.id === mat.classId);
                  return (
                    <div
                      key={mat.id}
                      onClick={() => setActiveMaterialId(mat.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                        mat.id === activeMaterial?.id
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-mono font-bold ${
                          mat.id === activeMaterial?.id ? 'text-indigo-700' : 'text-slate-500 group-hover:text-indigo-600'
                        }`}>
                          {mat.bab}
                        </span>
                        <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-bold">
                          {targetClass ? targetClass.name : 'Umum'}
                        </span>
                      </div>
                      <h4 className={`font-bold text-sm mt-2 line-clamp-2 leading-snug transition-colors ${
                        mat.id === activeMaterial?.id ? 'text-indigo-900' : 'text-slate-900 group-hover:text-indigo-700'
                      }`}>
                        {mat.title}
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: RICH MATERIAL CONTENT WINDOW */}
          <div className="md:col-span-8 lg:col-span-9 h-full min-h-0">
            {activeMaterial ? (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
                {/* Content Toolbar */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold">
                      {activeMaterial.bab}
                    </span>
                    <span className="text-sm text-slate-500 font-bold">
                      Kelas: {classes.find(c => c.id === activeMaterial.classId)?.name || 'Umum'}
                    </span>
                  </div>
                  
                  {/* Action Bar */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (localScenes.length > 0) {
                          setSelectedSceneId(localScenes[0].id);
                        }
                        setMode('story_editor');
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Sparkles size={16} /> Desain Alur Cerita
                    </button>
                    <button
                      onClick={() => {
                        setActiveSceneIndex(0);
                        setMapWalkIndex(0);
                        setQuizRevealed(false);
                        setMode('presentation');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Presentation size={16} /> Mode Presentasi Cerita
                    </button>
                    <button
                      onClick={handleStartEdit}
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    {materials.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus materi "${activeMaterial.title}"?`)) {
                            onDeleteMaterial(activeMaterial.id);
                            // Auto-select another
                            const remainder = materials.filter(m => m.id !== activeMaterial.id);
                            if (remainder.length > 0) setActiveMaterialId(remainder[0].id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Materi"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Window */}
                <div className="p-8 md:p-10 space-y-10 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  {/* Title Header */}
                  <div className="space-y-3 border-b border-slate-100 pb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                      {activeMaterial.title}
                    </h1>
                    <p className="text-lg text-slate-500 italic">
                      {activeMaterial.subtitle}
                    </p>
                  </div>

                  {/* Core Introduction */}
                  <p className="text-base text-slate-700 leading-relaxed max-w-4xl bg-indigo-50/50 p-6 border-l-4 border-indigo-400 rounded-r-2xl italic">
                    {activeMaterial.content}
                  </p>

                  {/* Optional Supporting Image with Referrer Policy */}
                  {activeMaterial.imageUrl && (
                    <div className="space-y-3 max-w-3xl">
                      <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-slate-100">
                        <img
                          src={activeMaterial.imageUrl}
                          alt={activeMaterial.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {activeMaterial.imageCaption && (
                        <p className="text-sm text-slate-500 italic font-medium leading-relaxed">
                          📌 {activeMaterial.imageCaption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sections Body */}
                  <div className="space-y-8">
                    {activeMaterial.sections.map((sec, idx) => (
                      <div key={sec.id || idx} className="space-y-3 max-w-4xl">
                        <h3 className="font-bold text-2xl text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                          {sec.title}
                        </h3>
                        <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                          {sec.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ACTIVE TIMELINE COMPONENT (FOUNDATION PREVIEW) */}
                  {activeMaterial.timeline && activeMaterial.timeline.length > 0 && (
                    <div className="border-t border-slate-200 pt-8 space-y-6 max-w-4xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="text-indigo-600 animate-pulse" size={24} />
                          <h3 className="font-bold text-xl text-slate-900">
                            Garis Waktu Peristiwa (Timeline)
                          </h3>
                        </div>
                        <span className="text-xs uppercase font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <Sparkles size={14} /> Siap Presentasi
                        </span>
                      </div>

                      <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-8 py-4">
                        {activeMaterial.timeline.map((event) => (
                          <div key={event.id} className="relative group">
                            {/* Marker dot */}
                            <div className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-4 border-slate-200 bg-white group-hover:border-indigo-500 transition-colors z-10"></div>
                            
                            <div className="space-y-1.5 bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:border-slate-200 transition-colors">
                              <span className="inline-block text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md mb-2">
                                {event.year}
                              </span>
                              <h4 className="font-bold text-lg text-slate-900">{event.title}</h4>
                              <p className="text-sm text-slate-600 leading-relaxed font-sans">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HISTORICAL MAPS PREVIEW (GEOSPATIAL REALTIME ENGINE) */}
                  {activeMaterial.maps && activeMaterial.maps.length > 0 && (
                    <div className="border-t border-slate-200 pt-8 space-y-6 max-w-4xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Map className="text-indigo-600" size={24} />
                          <h3 className="font-bold text-xl text-slate-900">
                            Integrasi Peta Sejarah Terkait
                          </h3>
                        </div>
                        <span className="text-xs uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg shadow-sm">
                          Modul Peta Interaktif
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                          {activeMaterial.maps.map((mapItem) => (
                            <div key={mapItem.id} className="p-5 border border-slate-200 bg-white shadow-sm rounded-2xl space-y-3 hover:border-indigo-300 transition-all flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-base text-slate-900">{mapItem.name}</h4>
                                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                                    {mapItem.era}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-sans">{mapItem.description}</p>
                              </div>
                              
                              <button
                                onClick={() => setProjectedMap(mapItem)}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                              >
                                <Compass size={13} className="animate-spin-slow" /> Buka Peta Interaktif ({mapItem.pins?.length || 0} Pin)
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Interactive Geovisualizer Real Stage */}
                        <div className="border border-indigo-200 bg-indigo-950 rounded-3xl h-64 relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-md text-white">
                          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                          
                          {/* Animated compass rose backdrop */}
                          <Compass size={96} className="text-indigo-800 absolute opacity-30 animate-spin-slow" />
                          
                          <div className="text-center space-y-3 z-10 p-5 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl max-w-xs">
                            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400">Tactical Map Engine Active</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                              Sistem geovisualisasi HistoLab aktif. Proyeksikan peta untuk menyimulasikan rute kronologis perjalanan sejarah.
                            </p>
                            {activeMaterial.maps[0] && (
                              <button
                                onClick={() => setProjectedMap(activeMaterial.maps[0])}
                                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow cursor-pointer w-full flex items-center justify-center gap-1.5"
                              >
                                <Compass size={14} className="animate-spin-slow" /> Proyeksikan Peta Utama
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 border border-slate-200 bg-white rounded-3xl shadow-sm">
                <BookOpen size={64} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-slate-900 mb-2">Belum ada materi pembelajaran terdaftar.</h3>
                <p className="text-slate-500 text-base max-w-md mx-auto mb-6">
                  Gunakan tombol 'Tulis Baru' untuk merancang modul pembelajaran sejarah pertama Anda.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus size={18} /> Tulis Materi Baru
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS & INTERACTIVE OVERLAYS */}
      <AnimatePresence>
        {editingMapIndex !== null && (
          <HistoricalMapEditor
            mapItem={formMaps[editingMapIndex]}
            onSave={(updatedMap) => {
              const updated = [...formMaps];
              updated[editingMapIndex] = {
                ...updated[editingMapIndex],
                ...updatedMap
              };
              setFormMaps(updated);
            }}
            onClose={() => setEditingMapIndex(null)}
          />
        )}

        {projectedMap !== null && (
          <HistoricalMapViewer
            mapItem={projectedMap}
            onClose={() => setProjectedMap(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
