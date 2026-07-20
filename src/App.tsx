import React, { useState, useEffect } from 'react';
import { LayoutDashboard, GraduationCap, BookOpen, Menu, X, Sparkles } from 'lucide-react';
import { ClassItem, Material, CalendarEvent, ReminderNote, Student, Meeting, GradeItem, AttendanceStatus } from './types';
import { INITIAL_CLASSES, INITIAL_MATERIALS, INITIAL_CALENDAR_EVENTS, INITIAL_REMINDERS } from './data/initialData';
import DashboardView from './components/DashboardView';
import KelasView from './components/KelasView';
import MateriView from './components/MateriView';

export default function App() {
  // Global states
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<ReminderNote[]>([]);
  
  // Navigation states
  const [activeView, setActiveView] = useState<'dashboard' | 'kelas' | 'materi'>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [materiInitialMaterialId, setMateriInitialMaterialId] = useState<string | null>(null);
  const [materiInitialMode, setMateriInitialMode] = useState<'view' | 'presentation' | null>(null);
  const [currentMateriMode, setCurrentMateriMode] = useState<'view' | 'edit' | 'create' | 'presentation' | 'story_editor'>('view');
  
  const isPresentationModeActive = activeView === 'materi' && (currentMateriMode === 'presentation' || currentMateriMode === 'story_editor');
  
  // Mobile responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize and synchronize with LocalStorage
  useEffect(() => {
    const localClasses = localStorage.getItem('histolab_classes_v1');
    const localMaterials = localStorage.getItem('histolab_materials_v1');
    const localEvents = localStorage.getItem('histolab_events_v1');
    const localReminders = localStorage.getItem('histolab_reminders_v1');

    if (localClasses) {
      setClasses(JSON.parse(localClasses));
    } else {
      setClasses(INITIAL_CLASSES);
      localStorage.setItem('histolab_classes_v1', JSON.stringify(INITIAL_CLASSES));
    }

    if (localMaterials) {
      const parsed = JSON.parse(localMaterials);
      let needsMigration = false;
      const migrated = parsed.map((m: any) => {
        const initialMatch = INITIAL_MATERIALS.find(im => im.id === m.id);
        if (initialMatch && initialMatch.maps) {
          const updatedMaps = m.maps?.map((mapItem: any) => {
            const initialMapMatch = initialMatch.maps?.find(imMap => imMap.id === mapItem.id);
            if (initialMapMatch) {
              const missingPins = !mapItem.pins || mapItem.pins.length === 0;
              const hasInitialPins = initialMapMatch.pins && initialMapMatch.pins.length > 0;
              if (missingPins && hasInitialPins) {
                needsMigration = true;
                return {
                  ...mapItem,
                  pins: initialMapMatch.pins,
                  mapStyle: mapItem.mapStyle || initialMapMatch.mapStyle || 'maritime',
                  showRoute: mapItem.showRoute !== undefined ? mapItem.showRoute : (initialMapMatch.showRoute !== undefined ? initialMapMatch.showRoute : true)
                };
              }
            }
            return mapItem;
          });
          if (updatedMaps) {
            return { ...m, maps: updatedMaps };
          }
        }
        return m;
      });

      if (needsMigration) {
        setMaterials(migrated);
        localStorage.setItem('histolab_materials_v1', JSON.stringify(migrated));
      } else {
        setMaterials(parsed);
      }
    } else {
      setMaterials(INITIAL_MATERIALS);
      localStorage.setItem('histolab_materials_v1', JSON.stringify(INITIAL_MATERIALS));
    }

    if (localEvents) {
      setEvents(JSON.parse(localEvents));
    } else {
      setEvents(INITIAL_CALENDAR_EVENTS);
      localStorage.setItem('histolab_events_v1', JSON.stringify(INITIAL_CALENDAR_EVENTS));
    }

    if (localReminders) {
      setReminders(JSON.parse(localReminders));
    } else {
      setReminders(INITIAL_REMINDERS);
      localStorage.setItem('histolab_reminders_v1', JSON.stringify(INITIAL_REMINDERS));
    }
  }, []);

  // Helper to persist state to LocalStorage on updates
  const updateClassesState = (updated: ClassItem[]) => {
    setClasses(updated);
    localStorage.setItem('histolab_classes_v1', JSON.stringify(updated));
  };

  const updateMaterialsState = (updated: Material[]) => {
    setMaterials(updated);
    localStorage.setItem('histolab_materials_v1', JSON.stringify(updated));
  };

  const updateEventsState = (updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem('histolab_events_v1', JSON.stringify(updated));
  };

  const updateRemindersState = (updated: ReminderNote[]) => {
    setReminders(updated);
    localStorage.setItem('histolab_reminders_v1', JSON.stringify(updated));
  };

  // CALLBACKS FOR CLASS OPERATIONS
  const handleAddClass = (newClass: Omit<ClassItem, 'id' | 'students' | 'meetings' | 'gradeItems' | 'grades'>) => {
    const createdClass: ClassItem = {
      id: `class-${Date.now()}`,
      ...newClass,
      students: [],
      meetings: [],
      gradeItems: [
        { id: `g-${Date.now()}-1`, name: 'Keaktifan', weight: 30 },
        { id: `g-${Date.now()}-2`, name: 'Ulangan Harian', weight: 40 },
        { id: `g-${Date.now()}-3`, name: 'Tugas Projek', weight: 30 }
      ],
      grades: {}
    };
    const updated = [...classes, createdClass];
    updateClassesState(updated);
    setSelectedClassId(createdClass.id);
  };

  const handleDeleteClass = (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    updateClassesState(updated);
    if (selectedClassId === id && updated.length > 0) {
      setSelectedClassId(updated[0].id);
    }
  };

  // Student CRUD callbacks
  const handleAddStudent = (classId: string, studentData: Omit<Student, 'id'>) => {
    const createdStudent: Student = {
      id: `std-${Date.now()}`,
      ...studentData
    };
    const updated = classes.map(c => {
      if (c.id === classId) {
        // Pre-fill existing meetings with attendance 'Hadir' for this new student
        const updatedMeetings = c.meetings.map(m => ({
          ...m,
          attendance: { ...m.attendance, [createdStudent.id]: 'Hadir' as const }
        }));
        return {
          ...c,
          students: [...c.students, createdStudent],
          meetings: updatedMeetings
        };
      }
      return c;
    });
    updateClassesState(updated);
  };

  const handleUpdateStudent = (classId: string, studentId: string, updatedFields: Partial<Student>) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        const updatedStudents = c.students.map(s => s.id === studentId ? { ...s, ...updatedFields } : s);
        return { ...c, students: updatedStudents };
      }
      return c;
    });
    updateClassesState(updated);
  };

  const handleDeleteStudent = (classId: string, studentId: string) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        // Remove from list
        const filteredStudents = c.students.filter(s => s.id !== studentId);
        // Clean grades
        const cleanedGrades = { ...c.grades };
        delete cleanedGrades[studentId];
        // Clean attendance
        const cleanedMeetings = c.meetings.map(m => {
          const att = { ...m.attendance };
          delete att[studentId];
          return { ...m, attendance: att };
        });
        return {
          ...c,
          students: filteredStudents,
          meetings: cleanedMeetings,
          grades: cleanedGrades
        };
      }
      return c;
    });
    updateClassesState(updated);
  };

  // Attendance callbacks
  const handleAddMeeting = (classId: string, meetingData: Omit<Meeting, 'id' | 'attendance'>) => {
    // Default all current students to 'Hadir'
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const initialAttendance: Record<string, AttendanceStatus> = {};
    targetClass.students.forEach(s => {
      initialAttendance[s.id] = 'Hadir';
    });

    const createdMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      ...meetingData,
      attendance: initialAttendance
    };

    const updated = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          meetings: [...c.meetings, createdMeeting]
        };
      }
      return c;
    });
    updateClassesState(updated);
  };

  const handleUpdateMeetingAttendance = (classId: string, meetingId: string, studentId: string, status: AttendanceStatus) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        const updatedMeetings = c.meetings.map(m => {
          if (m.id === meetingId) {
            return {
              ...m,
              attendance: { ...m.attendance, [studentId]: status }
            };
          }
          return m;
        });
        return { ...c, meetings: updatedMeetings };
      }
      return c;
    });
    updateClassesState(updated);
  };

  const handleDeleteMeeting = (classId: string, meetingId: string) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          meetings: c.meetings.filter(m => m.id !== meetingId)
        };
      }
      return c;
    });
    updateClassesState(updated);
  };

  // Grade Book callbacks
  const handleAddGradeItem = (classId: string, itemData: Omit<GradeItem, 'id'>) => {
    const createdItem: GradeItem = {
      id: `g-${Date.now()}`,
      ...itemData
    };
    const updated = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          gradeItems: [...c.gradeItems, createdItem]
        };
      }
      return c;
    });
    updateClassesState(updated);
  };

  const handleUpdateGrade = (classId: string, studentId: string, gradeItemId: string, score: number) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        const studentGrades = c.grades[studentId] || {};
        return {
          ...c,
          grades: {
            ...c.grades,
            [studentId]: {
              ...studentGrades,
              [gradeItemId]: score
            }
          }
        };
      }
      return c;
    });
    updateClassesState(updated);
  };

  const handleDeleteGradeItem = (classId: string, gradeItemId: string) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        // Clean student grade entry keys
        const updatedGrades = { ...c.grades };
        Object.keys(updatedGrades).forEach(studentId => {
          if (updatedGrades[studentId]) {
            delete updatedGrades[studentId][gradeItemId];
          }
        });
        return {
          ...c,
          gradeItems: c.gradeItems.filter(g => g.id !== gradeItemId),
          grades: updatedGrades
        };
      }
      return c;
    });
    updateClassesState(updated);
  };

  // MATERIAL CALLBACKS
  const handleAddMaterial = (materialData: Omit<Material, 'id'>) => {
    const createdMaterial: Material = {
      id: `mat-${Date.now()}`,
      ...materialData
    };
    updateMaterialsState([...materials, createdMaterial]);
  };

  const handleUpdateMaterial = (id: string, updatedFields: Partial<Material>) => {
    const updated = materials.map(m => m.id === id ? { ...m, ...updatedFields } : m);
    updateMaterialsState(updated);
  };

  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    updateMaterialsState(updated);
  };

  // CALENDAR EVENT CALLBACKS
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const createdEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      ...eventData
    };
    updateEventsState([...events, createdEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    updateEventsState(events.filter(e => e.id !== id));
  };

  // REMINDER NOTES CALLBACKS
  const handleAddReminder = (reminderData: Omit<ReminderNote, 'id' | 'createdAt'>) => {
    const createdReminder: ReminderNote = {
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      ...reminderData
    };
    updateRemindersState([createdReminder, ...reminders]);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, isDone: !r.isDone } : r);
    updateRemindersState(updated);
  };

  const handleDeleteReminder = (id: string) => {
    updateRemindersState(reminders.filter(r => r.id !== id));
  };

  // Helper Navigation Triggers from Dashboard cards
  const handleNavigateToClass = (classId: string) => {
    setSelectedClassId(classId);
    setActiveView('kelas');
  };

  const handleNavigateToMaterial = (materialId: string, mode?: 'view' | 'presentation') => {
    setMateriInitialMaterialId(materialId);
    if (mode) {
      setMateriInitialMode(mode);
    }
    setActiveView('materi');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col md:flex-row relative overflow-hidden">

      {/* MOBILE TOPBAR HEADER */}
      {!isPresentationModeActive && (
        <header className="md:hidden bg-[#0F172A] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">H</div>
            <span className="font-bold text-lg italic tracking-tight">HistoLab</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 text-slate-400 hover:text-white"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
      )}

      {/* SIDEBAR NAVIGATION (RESPONSIVE) */}
      {!isPresentationModeActive && (
        <aside className={`fixed md:sticky top-0 bottom-0 left-0 bg-[#0F172A] text-white w-64 p-8 flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:h-screen md:flex shrink-0`}>
          <div className="space-y-4">
            {/* Logo Brand with Feather Pen Icon */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl text-white">
                H
              </div>
              <h1 className="font-bold text-2xl tracking-tight italic">HistoLab</h1>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  if (classes.length > 0 && !selectedClassId) {
                    setSelectedClassId(classes[0].id);
                  }
                  setActiveView('kelas');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeView === 'kelas'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap size={18} />
                <span>Data Kelas</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('materi');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeView === 'materi'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen size={18} />
                <span>Bank Materi</span>
              </button>
            </nav>
          </div>

          {/* Teacher profile details at bottom of Sidebar */}
          <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3 mt-6">
            <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              P
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Paijo, S.Pd.</p>
              <p className="text-[10px] text-slate-400 truncate">Guru Sejarah</p>
            </div>
          </div>
        </aside>
      )}

      {/* OVERLAY FOR MOBILE SIDEBAR DRAWER */}
      {!isPresentationModeActive && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* MAIN VIEW AREA */}
      <main className={`flex-1 flex flex-col z-10 w-full ${
        isPresentationModeActive 
          ? 'p-0 gap-0 h-screen overflow-hidden bg-slate-950' 
          : 'p-6 md:p-8 gap-6 overflow-y-auto h-[calc(100vh-56px)] md:h-screen'
      }`}>
        {/* Dynamic header row on desktop */}
        {!isPresentationModeActive && (
          <div className="hidden md:flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold">Ruang Kerja Digital</h2>
              <p className="text-slate-500 mt-1">HistoLab – Sistem Ruang Kerja Guru</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-6 py-2.5 rounded-full shadow-sm">
              <Sparkles size={16} className="text-indigo-500" />
              <span>Koneksi Stabil</span>
            </div>
          </div>
        )}

        {/* SUBVIEWS DISPATCH */}
        {activeView === 'dashboard' && (
          <DashboardView
            classes={classes}
            materials={materials}
            events={events}
            reminders={reminders}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddReminder={handleAddReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onNavigateToClass={handleNavigateToClass}
            onNavigateToMaterial={handleNavigateToMaterial}
          />
        )}

        {activeView === 'kelas' && (
          <KelasView
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddMeeting={handleAddMeeting}
            onUpdateMeetingAttendance={handleUpdateMeetingAttendance}
            onDeleteMeeting={handleDeleteMeeting}
            onAddGradeItem={handleAddGradeItem}
            onUpdateGrade={handleUpdateGrade}
            onDeleteGradeItem={handleDeleteGradeItem}
          />
        )}

        {activeView === 'materi' && (
          <MateriView
            classes={classes}
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            initialMaterialId={materiInitialMaterialId}
            initialMode={materiInitialMode}
            onClearInitialState={() => {
              setMateriInitialMaterialId(null);
              setMateriInitialMode(null);
            }}
            onModeChange={setCurrentMateriMode}
          />
        )}
      </main>
    </div>
  );
}
