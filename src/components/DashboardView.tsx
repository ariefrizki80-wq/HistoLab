import React, { useState } from 'react';
import { 
  Calendar, Users, BookOpen, Clock, Plus, Trash, CheckCircle2, Sparkles, 
  BookMarked, Presentation, ChevronLeft, ChevronRight, X, GraduationCap, 
  CalendarDays, Layers, ArrowRight
} from 'lucide-react';
import { ClassItem, Material, CalendarEvent, ReminderNote } from '../types';

interface DashboardViewProps {
  classes: ClassItem[];
  materials: Material[];
  events: CalendarEvent[];
  reminders: ReminderNote[];
  teacherProfile?: { fullName: string; school: string; initial: string; subject?: string };
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onAddReminder: (reminder: Omit<ReminderNote, 'id' | 'createdAt'>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onNavigateToClass: (classId: string) => void;
  onNavigateToMaterial: (materialId: string, mode?: 'view' | 'presentation') => void;
}

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function DashboardView({
  classes,
  materials,
  events,
  reminders,
  teacherProfile,
  onAddEvent,
  onDeleteEvent,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onNavigateToClass,
  onNavigateToMaterial
}: DashboardViewProps) {
  // Calendar View State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  
  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0],
    timeStart: '07:30',
    timeEnd: '09:00',
    className: '',
    topic: ''
  });

  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    text: '',
    category: 'reminder' as 'lesson_plan' | 'grading' | 'reminder' | 'trivia'
  });

  // Calculate dynamic stats from classes (Single Source of Truth)
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);
  const totalTeachingHours = classes.reduce((acc, c) => acc + (c.teachingHours || 2), 0);
  const totalMaterials = materials.length;

  // Subjects list
  const subjectsSet = new Set<string>();
  classes.forEach(c => {
    if (c.subject) subjectsSet.add(c.subject);
  });
  const subjectsList = Array.from(subjectsSet);

  // Calculate average attendance rate across all meetings in classes
  let totalAttendanceChecks = 0;
  let presentCount = 0;
  classes.forEach(c => {
    c.meetings.forEach(m => {
      Object.values(m.attendance).forEach(status => {
        totalAttendanceChecks++;
        if (status === 'Hadir') presentCount++;
      });
    });
  });
  const attendanceRate = totalAttendanceChecks > 0 
    ? Math.round((presentCount / totalAttendanceChecks) * 100) 
    : 100;

  // Real Today & Tomorrow calculation
  const now = new Date();
  const todayDayName = INDONESIAN_DAYS[now.getDay()];
  const todayDateStr = now.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDayName = INDONESIAN_DAYS[tomorrow.getDay()];
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

  // Helper to find classes on a given day name or YYYY-MM-DD
  const getClassesForDay = (dayName: string, dateStr: string) => {
    const scheduledClasses = classes.filter(c => {
      if (!c.scheduleDay) return false;
      const days = c.scheduleDay.split(',').map(d => d.trim());
      return days.includes(dayName);
    });

    const specificEvents = events.filter(e => e.date === dateStr);

    return { scheduledClasses, specificEvents };
  };

  const todaySchedule = getClassesForDay(todayDayName, todayDateStr);
  const tomorrowSchedule = getClassesForDay(tomorrowDayName, tomorrowDateStr);

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Event submission
  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.className || !newEvent.topic) {
      alert('Mohon lengkapi nama kelas dan topik pembelajaran.');
      return;
    }
    onAddEvent({
      date: newEvent.date,
      timeStart: newEvent.timeStart,
      timeEnd: newEvent.timeEnd,
      className: newEvent.className,
      topic: newEvent.topic
    });
    setIsEventModalOpen(false);
    setNewEvent({
      date: new Date().toISOString().split('T')[0],
      timeStart: '07:30',
      timeEnd: '09:00',
      className: '',
      topic: ''
    });
  };

  // Reminder submission
  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.text) return;
    onAddReminder({
      text: newReminder.text,
      category: newReminder.category,
      isDone: false
    });
    setNewReminder({ text: '', category: 'reminder' });
    setIsReminderFormOpen(false);
  };

  // History Quotes
  const historyQuotes = [
    { quote: "Historia Magistra Vitae - Sejarah adalah guru kehidupan.", author: "Marcus Tullius Cicero" },
    { quote: "Jangan sekali-kali meninggalkan sejarah (Jasmerah).", author: "Ir. Soekarno" },
    { quote: "Bangsa yang besar adalah bangsa yang menghargai jasa para pahlawannya.", author: "Ir. Soekarno" },
    { quote: "Sejarah ditulis oleh para pemenang, namun kebenaran dicari oleh para pembaca.", author: "Anonim" },
    { quote: "Satu-satunya hal baru di dunia ini adalah sejarah yang belum Anda ketahui.", author: "Harry S. Truman" }
  ];
  const randomQuote = historyQuotes[now.getDay() % historyQuotes.length];

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="welcome-banner">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <BookMarked size={280} className="text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 mb-4">
            <Sparkles size={12} /> Digital Workspace Guru Sejarah
          </span>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
            Selamat Datang, {teacherProfile ? teacherProfile.fullName.split(',')[0] : 'Paijo, S.Pd.'}!
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
            Pusat kendali aktivitas mengajar sejarah di {teacherProfile?.school || 'SMA Negeri 1 Nusantara'}. Siapkan materi multimedia, kelola kelas bimbingan, catat kehadiran siswa, dan pantau perkembangan nilai secara terpusat.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus size={16} /> Tambah Agenda Mengajar
            </button>
            <div className="text-sm font-medium text-slate-300 bg-slate-800/80 backdrop-blur-xs px-4 py-2.5 rounded-full border border-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" /> 
              <span>{todayDayName}, {now.getDate()} {INDONESIAN_MONTHS[now.getMonth()]} {now.getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm text-slate-800" id="quote-banner">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <BookMarked size={24} />
          </div>
          <div>
            <p className="text-sm font-medium italic">"{randomQuote.quote}"</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">— {randomQuote.author}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 bg-slate-100 text-slate-600 rounded-full shrink-0 self-end md:self-auto">
          Trivia Sejarah
        </span>
      </div>

      {/* Dynamic Key Performance Stats (Derived from Classes Single Source of Truth) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6" id="stats-grid">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Kelas Aktif</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalClasses}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <GraduationCap size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Siswa</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalStudents}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Jam Mengajar</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalTeachingHours} <span className="text-xs font-medium text-slate-500">JP/mg</span></p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Rata-Rata Kehadiran</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{attendanceRate}%</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Bank Materi</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalMaterials}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <BookOpen size={22} />
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Jadwal Hari Ini, Jadwal Besok, Calendar & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
        {/* Left 2 Columns: Schedule Widgets & Calendar */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* JADWAL HARI INI & JADWAL BESOK SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* WIDGET 1: JADWAL HARI INI */}
            <div className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="font-bold text-base text-slate-900">Jadwal Hari Ini</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold">
                    {todayDayName}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {todaySchedule.scheduledClasses.length === 0 && todaySchedule.specificEvents.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <CalendarDays size={28} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">Tidak ada jadwal mengajar hari ini.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Gunakan waktu untuk persiapan materi & kuis.</p>
                    </div>
                  ) : (
                    <>
                      {todaySchedule.scheduledClasses.map(cls => (
                        <div key={cls.id} className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-900 px-2 py-0.5 bg-indigo-100 rounded-md">
                              {cls.name}
                            </span>
                            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                              <Clock size={12} /> {cls.scheduleTimeStart || '07:30'} - {cls.scheduleTimeEnd || '09:00'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{cls.subject}</p>
                            <p className="text-[11px] text-slate-500">{cls.students.length} Siswa • {cls.teachingHours || 2} JP</p>
                          </div>
                          <button
                            onClick={() => onNavigateToClass(cls.id)}
                            className="w-full mt-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            Mulai Sesi / Absensi <ArrowRight size={12} />
                          </button>
                        </div>
                      ))}

                      {todaySchedule.specificEvents.map(evt => (
                        <div key={evt.id} className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900">{evt.className}</span>
                            <span className="text-xs font-medium text-amber-700">{evt.timeStart} - {evt.timeEnd}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-700">Materi: {evt.topic}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span>Status Hari Ini</span>
                <span className="font-bold text-slate-700">{todaySchedule.scheduledClasses.length} Sesi Terjadwal</span>
              </div>
            </div>

            {/* WIDGET 2: JADWAL BESOK */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <h3 className="font-bold text-base text-slate-900">Jadwal Besok</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold">
                    {tomorrowDayName}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {tomorrowSchedule.scheduledClasses.length === 0 && tomorrowSchedule.specificEvents.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <CalendarDays size={28} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">Tidak ada jadwal mengajar besok.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Bisa digunakan untuk koreksi nilai / rileks.</p>
                    </div>
                  ) : (
                    <>
                      {tomorrowSchedule.scheduledClasses.map(cls => (
                        <div key={cls.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-200 rounded-md">
                              {cls.name}
                            </span>
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              <Clock size={12} /> {cls.scheduleTimeStart || '07:30'} - {cls.scheduleTimeEnd || '09:00'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{cls.subject}</p>
                            <p className="text-[11px] text-slate-500">{cls.students.length} Siswa • {cls.teachingHours || 2} JP</p>
                          </div>
                          <button
                            onClick={() => onNavigateToClass(cls.id)}
                            className="w-full mt-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            Pratinjau Kelas <ArrowRight size={12} />
                          </button>
                        </div>
                      ))}

                      {tomorrowSchedule.specificEvents.map(evt => (
                        <div key={evt.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{evt.className}</span>
                            <span className="text-xs font-medium text-slate-600">{evt.timeStart} - {evt.timeEnd}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-700">Materi: {evt.topic}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span>Persiapan Besok</span>
                <span className="font-bold text-slate-700">{tomorrowSchedule.scheduledClasses.length} Sesi Terjadwal</span>
              </div>
            </div>

          </div>

          {/* INTERACTIVE MONTHLY CALENDAR WIDGET */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4" id="dashboard-calendar">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Kalender Mengajar</h3>
                <p className="text-xs text-slate-500">Klik tanggal untuk melihat rincian kelas & agenda mengajar.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-slate-800 px-2 min-w-[120px] text-center">
                  {INDONESIAN_MONTHS[month]} {year}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty padding cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-12 rounded-xl bg-slate-50/30"></div>
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateObj = new Date(year, month, dayNum);
                const dayName = INDONESIAN_DAYS[dateObj.getDay()];
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                
                const isToday = dateObj.toDateString() === now.toDateString();

                // Check schedules
                const { scheduledClasses, specificEvents } = getClassesForDay(dayName, dateStr);
                const totalDayItems = scheduledClasses.length + specificEvents.length;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedCalendarDate(dateObj)}
                    className={`h-12 rounded-2xl border flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                      isToday
                        ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                        : totalDayItems > 0
                        ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-slate-900 font-bold'
                        : 'border-slate-100 hover:border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-xs">{dayNum}</span>
                    
                    {/* Badge / Indicator for days with classes */}
                    {totalDayItems > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? 'bg-amber-300' : 'bg-indigo-600'}`}></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MATA PELAJARAN YANG DIAMPU */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Mata Pelajaran yang Diampu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjectsList.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada mata pelajaran terdaftar.</p>
              ) : (
                subjectsList.map((subj, idx) => {
                  const matchingClasses = classes.filter(c => c.subject === subj);
                  return (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{subj}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {matchingClasses.map(c => c.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-full">
                        {matchingClasses.length} Kelas
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Agenda, Reminders and Quick Notes */}
        <div className="space-y-6">
          
          {/* PROMO PRESENTATION FEATURE */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 text-white rounded-3xl p-6 shadow-lg space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                Fitur Baru
              </span>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" /> Presentation Mode
              </h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Tampilkan slide mengajar interaktif dengan timeline kronologis dan peta geospasial sejarah.
            </p>
            <button
              onClick={() => onNavigateToMaterial('mat-4', 'presentation')}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm uppercase tracking-wider"
            >
              <Presentation size={14} /> Coba Mode Presentasi
            </button>
          </div>

          {/* AGENDA KHUSUS LIST */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Agenda Tambahan</h3>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                title="Tambah Agenda"
              >
                <Plus size={18} />
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada agenda khusus.</p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {events.map(evt => (
                  <div key={evt.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-3 group">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                        {evt.date} • {evt.timeStart}-{evt.timeEnd}
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">{evt.className}</p>
                      <p className="text-[11px] text-slate-500">{evt.topic}</p>
                    </div>
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REMINDERS / CATATAN PENTING */}
          <div className="bg-orange-50 rounded-3xl border border-orange-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-orange-900">Catatan & Pengingat Guru</h3>
              <button
                onClick={() => setIsReminderFormOpen(!isReminderFormOpen)}
                className="p-1 text-orange-600 hover:bg-orange-100 rounded-md transition-colors cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Reminder Form */}
            {isReminderFormOpen && (
              <form onSubmit={handleReminderSubmit} className="bg-white p-4 rounded-xl border border-orange-200 space-y-3">
                <input
                  type="text"
                  placeholder="Isi catatan pengingat..."
                  value={newReminder.text}
                  onChange={e => setNewReminder({ ...newReminder, text: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  required
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newReminder.category}
                    onChange={e => setNewReminder({ ...newReminder, category: e.target.value as any })}
                    className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none text-slate-700 bg-white"
                  >
                    <option value="reminder">Pengingat Umum</option>
                    <option value="lesson_plan">Rencana Pelajaran</option>
                    <option value="grading">Koreksi Nilai</option>
                    <option value="trivia">Trivia Sejarah</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}

            {/* Reminder List */}
            <ul className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {reminders.map(rem => (
                <li key={rem.id} className="flex gap-3 items-start group p-2.5 rounded-xl bg-white/70 border border-orange-100/80">
                  <input 
                    type="checkbox" 
                    className="mt-0.5 rounded text-orange-600 cursor-pointer"
                    checked={rem.isDone}
                    onChange={() => onToggleReminder(rem.id)}
                  />
                  <div className="flex-1">
                    <p className={`text-xs text-orange-950 font-medium leading-relaxed ${rem.isDone ? 'line-through opacity-50' : ''}`}>
                      {rem.text}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="text-orange-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                  >
                    <Trash size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* POPUP MODAL: CALENDAR DATE DETAILS */}
      {selectedCalendarDate && (() => {
        const selectedDayName = INDONESIAN_DAYS[selectedCalendarDate.getDay()];
        const selectedDateStr = selectedCalendarDate.toISOString().split('T')[0];
        const { scheduledClasses, specificEvents } = getClassesForDay(selectedDayName, selectedDateStr);

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Jadwal Tanggal {selectedCalendarDate.getDate()} {INDONESIAN_MONTHS[selectedCalendarDate.getMonth()]} {selectedCalendarDate.getFullYear()}</h3>
                  <p className="text-xs text-slate-500 font-bold">Hari {selectedDayName}</p>
                </div>
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-2 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {scheduledClasses.length === 0 && specificEvents.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">Tidak ada jadwal mengajar pada tanggal ini.</p>
                  </div>
                ) : (
                  <>
                    {scheduledClasses.map(cls => (
                      <div key={cls.id} className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 px-2.5 py-1 bg-indigo-100 rounded-lg">
                            {cls.name}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">
                            {cls.scheduleTimeStart || '07:30'} - {cls.scheduleTimeEnd || '09:00'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{cls.subject}</p>
                        <p className="text-[11px] text-slate-500">{cls.students.length} Siswa • {cls.teachingHours || 2} JP</p>
                        <button
                          onClick={() => {
                            setSelectedCalendarDate(null);
                            onNavigateToClass(cls.id);
                          }}
                          className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          Buka Halaman Kelas <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}

                    {specificEvents.map(evt => (
                      <div key={evt.id} className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900">{evt.className}</span>
                          <span className="text-xs font-medium text-amber-700">{evt.timeStart} - {evt.timeEnd}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">Materi: {evt.topic}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: ADD AGENDA EVENT */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-lg p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-xl text-slate-900">Tambah Agenda Mengajar</h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEventSubmit} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-slate-700 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5">Jam Mulai</label>
                  <input
                    type="time"
                    value={newEvent.timeStart}
                    onChange={e => setNewEvent({ ...newEvent, timeStart: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5">Jam Selesai</label>
                  <input
                    type="time"
                    value={newEvent.timeEnd}
                    onChange={e => setNewEvent({ ...newEvent, timeEnd: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Kelas</label>
                <select
                  value={newEvent.className}
                  onChange={e => setNewEvent({ ...newEvent, className: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">Pilih Kelas...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name} - {c.subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Topik Pembelajaran</label>
                <input
                  type="text"
                  placeholder="Misal: Kehidupan Zaman Paleolitikum"
                  value={newEvent.topic}
                  onChange={e => setNewEvent({ ...newEvent, topic: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold cursor-pointer"
                >
                  Tambah Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
