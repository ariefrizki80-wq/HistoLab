import React, { useState } from 'react';
import { Calendar, Users, BookOpen, Clock, Plus, Trash, CheckCircle2, Sparkles, BookMarked, Presentation } from 'lucide-react';
import { ClassItem, Material, CalendarEvent, ReminderNote } from '../types';

interface DashboardViewProps {
  classes: ClassItem[];
  materials: Material[];
  events: CalendarEvent[];
  reminders: ReminderNote[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onAddReminder: (reminder: Omit<ReminderNote, 'id' | 'createdAt'>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onNavigateToClass: (classId: string) => void;
  onNavigateToMaterial: (materialId: string, mode?: 'view' | 'presentation') => void;
}

export default function DashboardView({
  classes,
  materials,
  events,
  reminders,
  onAddEvent,
  onDeleteEvent,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onNavigateToClass,
  onNavigateToMaterial
}: DashboardViewProps) {
  // Local state for modals/forms
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

  // Calculate stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);
  const totalMaterials = materials.length;

  // Calculate average attendance rate
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

  // Handle Event submission
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

  // Handle Reminder submission
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

  // Quick Quotes for History Teachers
  const historyQuotes = [
    { quote: "Historia Magistra Vitae - Sejarah adalah guru kehidupan.", author: "Marcus Tullius Cicero" },
    { quote: "Jangan sekali-kali meninggalkan sejarah (Jasmerah).", author: "Ir. Soekarno" },
    { quote: "Bangsa yang besar adalah bangsa yang menghargai jasa para pahlawannya.", author: "Ir. Soekarno" },
    { quote: "Sejarah ditulis oleh para pemenang, namun kebenaran dicari oleh para pembaca.", author: "Anonim" },
    { quote: "Satu-satunya hal baru di dunia ini adalah sejarah yang belum Anda ketahui.", author: "Harry S. Truman" }
  ];

  const randomQuote = historyQuotes[new Date().getDay() % historyQuotes.length];

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="welcome-banner">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <BookMarked size={280} className="text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 mb-4">
            <Sparkles size={12} /> Digital Workspace Guru Sejarah
          </span>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
            Selamat Datang di HistoLab, Paijo!
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
            Pusat kendali aktivitas mengajar sejarah Anda. Siapkan materi multimedia, kelola kelas bimbingan, catat kehadiran siswa, dan pantau nilai secara terpusat dalam satu ruangan kerja digital yang modern.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={16} /> Tambah Agenda Mengajar
            </button>
            <div className="text-sm font-medium text-slate-300 bg-slate-800 px-4 py-2.5 rounded-full border border-slate-700 flex items-center gap-2">
              <Clock size={16} /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm text-slate-800" id="quote-banner">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
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

      {/* FEATURE HIGHLIGHT: TRY PRESENTATION MODE */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/20 text-white rounded-3xl p-6 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden" id="feature-presentation-promo">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider animate-pulse shadow-sm">
              Fitur Baru
            </span>
            <h3 className="font-bold text-lg text-white flex items-center gap-2 tracking-tight">
              <Sparkles size={18} className="text-amber-400" /> Mode Presentasi Kronologis Interaktif
            </h3>
          </div>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            Modul pengajaran <strong>BAB III: Sejarah Pendudukan Jepang di Indonesia (XII MIPA 3)</strong> kini dilengkapi dengan visualisasi garis waktu interaktif, sub-bahasan mendalam (zoomable nodes), serta referensi geospasial (peta rute sejarah). Cobalah mengajar secara interaktif sekarang!
          </p>
        </div>
        <button
          onClick={() => onNavigateToMaterial('mat-4', 'presentation')}
          className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-2xl flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-amber-500/10 shrink-0 uppercase tracking-wider"
        >
          <Presentation size={15} /> Coba Mode Presentasi
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6" id="stats-grid">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Kelas</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalClasses}</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Siswa</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalStudents}</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rata-Rata Absensi</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{attendanceRate}%</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Materi Sejarah</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalMaterials}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <BookOpen size={24} />
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
        {/* Left 2 Columns: Calendar and Quick Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar Block */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Jadwal Mengajar</h3>
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 uppercase font-bold tracking-wider">Minggu Ini</span>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">Belum ada agenda mengajar terjadwal.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events
                  .sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart))
                  .map(event => {
                    const eventDateObj = new Date(event.date);
                    const isToday = new Date().toISOString().split('T')[0] === event.date;
                    
                    return (
                      <div
                        key={event.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${
                          isToday 
                            ? 'bg-indigo-50 border-l-4 border-l-indigo-500 border-indigo-100' 
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-sm font-bold w-20 shrink-0 text-slate-700">
                          {event.timeStart} - {event.timeEnd}
                        </span>
                        <div className="flex-1">
                          <h4 className={`font-bold ${isToday ? 'text-indigo-900' : 'text-slate-900'}`}>
                            {event.className}
                          </h4>
                          <p className={`text-xs mt-0.5 ${isToday ? 'text-indigo-700' : 'text-slate-500'}`}>
                            Materi: {event.topic}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const matchingClass = classes.find(c => c.name.toLowerCase().includes(event.className.toLowerCase()) || event.className.toLowerCase().includes(c.name.toLowerCase()));
                              if (matchingClass) {
                                onNavigateToClass(matchingClass.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all"
                          >
                            Mulai
                          </button>
                          <button
                            onClick={() => onDeleteEvent(event.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Quick Classes Cards */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-slate-900">Daftar Kelas</h3>
              <button className="text-indigo-600 font-bold text-xs">Lihat Semua</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {classes.slice(0, 4).map(cls => (
                <div
                  key={cls.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 transition-all cursor-pointer"
                  onClick={() => onNavigateToClass(cls.id)}
                >
                  <span className="text-3xl font-bold text-slate-900">{cls.students.length}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">{cls.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Reminders and Quick Notes */}
        <div className="space-y-6">
          <div className="bg-orange-50 rounded-3xl border border-orange-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-orange-900">Catatan Penting</h3>
              <button
                onClick={() => setIsReminderFormOpen(!isReminderFormOpen)}
                className="p-1 text-orange-600 hover:bg-orange-100 rounded-md transition-colors cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Reminder Form */}
            {isReminderFormOpen && (
              <form onSubmit={handleReminderSubmit} className="bg-white p-4 rounded-xl border border-orange-200 space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Isi catatan pengingat..."
                  value={newReminder.text}
                  onChange={e => setNewReminder({ ...newReminder, text: e.target.value })}
                  className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  required
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newReminder.category}
                    onChange={e => setNewReminder({ ...newReminder, category: e.target.value as any })}
                    className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
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
            <ul className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {reminders.map(rem => (
                <li key={rem.id} className="flex gap-3 items-start group">
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded text-orange-600"
                    checked={rem.isDone}
                    onChange={() => onToggleReminder(rem.id)}
                  />
                  <div className="flex-1">
                    <p className={`text-sm text-orange-900 font-medium ${rem.isDone ? 'line-through opacity-50' : ''}`}>
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

      {/* Interactive Modal for adding Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-lg p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-xl text-slate-900">Tambah Agenda</h3>
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
