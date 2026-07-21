import React, { useState, useEffect } from 'react';
import SettingsView from './components/SettingsView';
import { LayoutDashboard, GraduationCap, BookOpen, Menu, X, Sparkles, Tv, Settings as SettingsIcon } from 'lucide-react';
import { ClassItem, Material, CalendarEvent, ReminderNote, Student, Meeting, GradeItem, AttendanceStatus } from './types';
import { INITIAL_CLASSES, INITIAL_MATERIALS, INITIAL_CALENDAR_EVENTS, INITIAL_REMINDERS } from './data/initialData';
import DashboardView from './components/DashboardView';
import KelasView from './components/KelasView';
import MateriView from './components/MateriView';
import SlideBuilder from './components/SlideBuilder';

export default function App() {
  // Global states
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<ReminderNote[]>([]);
  
  // Navigation states
  const [activeView, setActiveView] = useState<'dashboard' | 'kelas' | 'materi' | 'presentasi' | 'pengaturan'>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [materiInitialMaterialId, setMateriInitialMaterialId] = useState<string | null>(null);
  const [materiInitialMode, setMateriInitialMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [currentMateriMode, setCurrentMateriMode] = useState<'view' | 'edit' | 'create'>('view');
  
  const isPresentationModeActive = false;
  
  // Mobile responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);

  const [teacherProfile, setTeacherProfile] = useState({
    fullName: 'Paijo, S.Pd.',
    school: 'SMA Negeri 1 Nusantara',
    initial: 'P'
  });

  useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem('histolab_teacher_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTeacherProfile({
            fullName: parsed.fullName || 'Paijo, S.Pd.',
            school: parsed.school || 'SMA Negeri 1 Nusantara',
            initial: parsed.fullName ? parsed.fullName.charAt(0).toUpperCase() : 'P'
          });
        } catch (e) {
          // ignore
        }
      }
    };
    loadProfile();
    window.addEventListener('histolab_profile_updated', loadProfile);
    return () => window.removeEventListener('histolab_profile_updated', loadProfile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* SIDEBAR NAVIGATION (RESPONSIVE) */}
      {!isPresentationModeActive && (
        <>
          {/* Overlay for Tablet/Mobile */}
          {isSidebarOpen && (
             <div 
               className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 xl:hidden"
               onClick={() => setIsSidebarOpen(false)}
             />
          )}

          {/* Sidebar */}
          <aside className={`fixed xl:relative top-0 bottom-0 left-0 bg-[#0F172A] text-white flex flex-col justify-between z-50 transition-all duration-300 ease-in-out shrink-0 ${
            isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full xl:translate-x-0'
          }`}>
             <div className="flex flex-col h-full overflow-hidden">
                {/* Logo Area */}
                <div className="flex items-center gap-3 p-5 h-16 shrink-0 border-b border-white/5">
                   <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl text-white shrink-0">
                      H
                   </div>
                   {isSidebarOpen && <h1 className="font-bold text-2xl tracking-tight italic whitespace-nowrap">HistoLab</h1>}
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                  <button
                    onClick={() => {
                      setActiveView('dashboard');
                      if (window.innerWidth < 1280) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeView === 'dashboard'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Dashboard"
                  >
                    <LayoutDashboard size={isSidebarOpen ? 18 : 22} className="shrink-0" />
                    {isSidebarOpen && <span className="ml-3 truncate">Dashboard</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (classes.length > 0 && !selectedClassId) {
                        setSelectedClassId(classes[0].id);
                      }
                      setActiveView('kelas');
                      if (window.innerWidth < 1280) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeView === 'kelas'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Data Kelas"
                  >
                    <GraduationCap size={isSidebarOpen ? 18 : 22} className="shrink-0" />
                    {isSidebarOpen && <span className="ml-3 truncate">Data Kelas</span>}
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('materi');
                      if (window.innerWidth < 1280) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeView === 'materi'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Bank Materi"
                  >
                    <BookOpen size={isSidebarOpen ? 18 : 22} className="shrink-0" />
                    {isSidebarOpen && <span className="ml-3 truncate">Bank Materi</span>}
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('presentasi');
                      if (window.innerWidth < 1280) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeView === 'presentasi'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Slide Builder"
                  >
                    <Tv size={isSidebarOpen ? 18 : 22} className="shrink-0" />
                    {isSidebarOpen && <span className="ml-3 truncate">Slide Builder</span>}
                  </button>
                </nav>

                <div className="p-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      setActiveView('pengaturan');
                      if (window.innerWidth < 1280) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeView === 'pengaturan'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Pengaturan"
                  >
                    <SettingsIcon size={isSidebarOpen ? 18 : 22} className="shrink-0" />
                    {isSidebarOpen && <span className="ml-3 truncate">Pengaturan</span>}
                  </button>
                </div>
             </div>
          </aside>
        </>
      )}

      {/* MAIN VIEW AREA */}
      <div className={`flex-1 flex flex-col min-w-0 ${isPresentationModeActive ? 'bg-slate-950' : 'bg-[#F8F9FA]'}`}>
         
         {/* TOP HEADER */}
         {!isPresentationModeActive && (
           <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 xl:px-8 shrink-0 shadow-sm z-30">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                   className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                 >
                   <Menu size={24} />
                 </button>
                 
                 <div className="hidden sm:block ml-2">
                   <h2 className="font-bold text-slate-800 text-lg leading-tight">
                     {activeView === 'dashboard' && 'Dashboard'}
                     {activeView === 'kelas' && 'Manajemen Kelas'}
                     {activeView === 'materi' && 'Bank Materi'}
                     {activeView === 'presentasi' && 'Slide Builder'}
                     {activeView === 'pengaturan' && 'Pengaturan'}
                   </h2>
                   <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                     Digital Workspace Guru Sejarah
                   </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span>Sinkronisasi Aktif</span>
                 </div>
                 
                 <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                 
                 <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('pengaturan')}>
                    <div className="text-right hidden md:block">
                       <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{teacherProfile.fullName}</p>
                       <p className="text-[10px] text-slate-500">{teacherProfile.school}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm border-2 border-white ring-2 ring-transparent group-hover:ring-indigo-200 transition-all">
                       {teacherProfile.initial}
                    </div>
                 </div>
              </div>
           </header>
         )}
         
         <main className={`flex-1 overflow-y-auto ${isPresentationModeActive ? 'p-0' : 'p-4 xl:p-8'}`}>
            <div className={`mx-auto w-full h-full ${isPresentationModeActive ? 'max-w-none' : 'max-w-[1600px]'}`}>
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
              {activeView === 'presentasi' && (
                <SlideBuilder />
              )}
              {activeView === 'pengaturan' && (
                <SettingsView />
              )}
            </div>
         </main>
      </div>
    </div>
  );
}
