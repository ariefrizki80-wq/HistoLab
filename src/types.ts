export interface Student {
  id: string;
  nis: string;
  name: string;
  notes?: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface Meeting {
  id: string;
  date: string;
  topic: string;
  attendance: Record<string, AttendanceStatus>; // studentId -> status
}

export interface GradeItem {
  id: string;
  name: string;
  weight: number; // percentage or default weight
}

export interface TimelineSubMaterial {
  id: string;
  title: string;
  content: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  subMaterials?: TimelineSubMaterial[];
}

export interface MapPin {
  id: string;
  label: string;
  description?: string;
  x: number; // percentage position 0 to 100 (for static visual maps)
  y: number; // percentage position 0 to 100 (for static visual maps)
  lat?: number; // Real latitude (for real map providers)
  lng?: number; // Real longitude (for real map providers)
  hidden?: boolean; // Toggle on/off
}

export interface HistoricalMap {
  id: string;
  name: string;
  description: string;
  era: string;
  imageUrl?: string;
  mapStyle?: 'vintage' | 'tactical' | 'maritime';
  pins?: MapPin[];
  showRoute?: boolean;
  useGeographicMap?: boolean; // Whether to use real GIS maps instead of custom images
  mapProvider?: 'openstreetmap' | 'googlemaps'; // Selected provider
  mapCenterLat?: number; // Center coordinate
  mapCenterLng?: number; // Center coordinate
  mapZoom?: number; // Map zoom level
}

export interface StoryMediaItem {
  id: string;
  type: 'image' | 'text' | 'quote' | 'title' | 'map' | 'timeline' | 'quiz';
  content: string; // text content or URL
  x: number; // percentage from left, e.g. 10
  y: number; // percentage from top, e.g. 20
  w: number; // percentage width, e.g. 30
  h: number; // percentage height, e.g. 25
  rotate?: number; // degrees, e.g. 0
  fontSize?: number; // e.g. 16
  textColor?: string;
  backgroundColor?: string;
  label?: string; // caption or title
}

export interface StoryScene {
  id: string;
  type: 'cover' | 'narrative' | 'timeline' | 'map' | 'quiz' | 'reflection';
  title: string;
  narration?: string;
  backgroundType: 'color' | 'gradient' | 'image' | 'parchment' | 'dark_slate';
  backgroundValue: string; // e.g. color code, image URL, or gradient class
  mediaItems?: StoryMediaItem[];
  activeTimelineIndex?: number; // index of focused timeline event
  activeMapId?: string; // ID of focused historical map
  activeMapStepIndex?: number; // current step of map route
  scenePins?: MapPin[]; // Custom list of dropped coordinates & labels for this scene
  useGeographicMap?: boolean; // Toggle dynamic map (OpenStreetMap) vs static map
  mapCenterLat?: number;
  mapCenterLng?: number;
  mapZoom?: number;
}

export interface Material {
  id: string;
  classId: string; // references Class.id
  bab: string; // e.g. "BAB I" or "BAB 1"
  title: string;
  subtitle: string;
  content: string; // main description
  sections: {
    id: string;
    title: string;
    body: string;
  }[];
  imageUrl?: string;
  imageCaption?: string;
  timeline?: TimelineEvent[];
  maps?: HistoricalMap[];
  storyScenes?: StoryScene[];
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "X - IPA 1"
  subject: string; // e.g. "Sejarah Indonesia"
  grade: string; // e.g. "X", "XI", "XII"
  students: Student[];
  meetings: Meeting[];
  gradeItems: GradeItem[];
  grades: Record<string, Record<string, number>>; // studentId -> gradeItemId -> score
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:MM
  timeEnd: string; // HH:MM
  className: string;
  topic: string;
  completed?: boolean;
}

export interface ReminderNote {
  id: string;
  text: string;
  isDone: boolean;
  category: 'lesson_plan' | 'grading' | 'reminder' | 'trivia';
  createdAt: string;
}
