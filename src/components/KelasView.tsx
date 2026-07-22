import React, { useState } from 'react';
import { Users, Calendar, Plus, Trash, Edit, AlertCircle, FileSpreadsheet, Search } from 'lucide-react';
import { ClassItem, Student, Meeting, GradeItem, AttendanceStatus } from '../types';

interface KelasViewProps {
  classes: ClassItem[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onAddClass: (newClass: Omit<ClassItem, 'id' | 'students' | 'meetings' | 'gradeItems' | 'grades'>) => void;
  onDeleteClass: (id: string) => void;
  onAddStudent: (classId: string, student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (classId: string, studentId: string, student: Partial<Student>) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  onAddMeeting: (classId: string, meeting: Omit<Meeting, 'id' | 'attendance'>) => void;
  onUpdateMeetingAttendance: (classId: string, meetingId: string, studentId: string, status: AttendanceStatus) => void;
  onDeleteMeeting: (classId: string, meetingId: string) => void;
  onAddGradeItem: (classId: string, item: Omit<GradeItem, 'id'>) => void;
  onUpdateGrade: (classId: string, studentId: string, gradeItemId: string, score: number) => void;
  onDeleteGradeItem: (classId: string, gradeItemId: string) => void;
}

export default function KelasView({
  classes,
  selectedClassId,
  onSelectClass,
  onAddClass,
  onDeleteClass,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddMeeting,
  onUpdateMeetingAttendance,
  onDeleteMeeting,
  onAddGradeItem,
  onUpdateGrade,
  onDeleteGradeItem
}: KelasViewProps) {
  // Tabs for the active class: 'siswa' | 'absensi' | 'nilai'
  const [activeTab, setActiveTab] = useState<'siswa' | 'absensi' | 'nilai'>('siswa');

  // Selected class
  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Modals / Input states
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [newClassData, setNewClassData] = useState({
    name: '',
    subject: '',
    grade: 'X',
    scheduleDay: 'Senin',
    scheduleTimeStart: '07:30',
    scheduleTimeEnd: '09:00',
    teachingHours: 3
  });

  // Student CRUD states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({ nis: '', name: '', notes: '' });

  // Search filter for students
  const [studentSearch, setStudentSearch] = useState('');

  // Meeting states
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    topic: ''
  });
  const [activeMeetingId, setActiveMeetingId] = useState<string>('');

  // Grade Item states
  const [isGradeItemModalOpen, setIsGradeItemModalOpen] = useState(false);
  const [gradeItemForm, setGradeItemForm] = useState({ name: '', weight: 25 });
  
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Create Class
  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassData.name || !newClassData.subject) return;
    onAddClass({
      name: newClassData.name,
      subject: newClassData.subject,
      grade: newClassData.grade,
      scheduleDay: newClassData.scheduleDay,
      scheduleTimeStart: newClassData.scheduleTimeStart,
      scheduleTimeEnd: newClassData.scheduleTimeEnd,
      teachingHours: Number(newClassData.teachingHours) || 2
    });
    setIsNewClassModalOpen(false);
    setNewClassData({
      name: '',
      subject: '',
      grade: 'X',
      scheduleDay: 'Senin',
      scheduleTimeStart: '07:30',
      scheduleTimeEnd: '09:00',
      teachingHours: 3
    });
  };

  // Handle Student Submit (Create/Update)
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.nis || !studentForm.name) return;
    if (editingStudent) {
      onUpdateStudent(activeClass.id, editingStudent.id, {
        nis: studentForm.nis,
        name: studentForm.name,
        notes: studentForm.notes
      });
    } else {
      onAddStudent(activeClass.id, {
        nis: studentForm.nis,
        name: studentForm.name,
        notes: studentForm.notes
      });
    }
    setIsStudentModalOpen(false);
    setEditingStudent(null);
    setStudentForm({ nis: '', name: '', notes: '' });
  };

  // Handle Meeting Submit
  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.topic) return;
    onAddMeeting(activeClass.id, {
      date: meetingForm.date,
      topic: meetingForm.topic
    });
    setIsMeetingModalOpen(false);
    setMeetingForm({ date: new Date().toISOString().split('T')[0], topic: '' });
  };

  // Handle Grade Item Submit
  const handleGradeItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeItemForm.name) return;
    onAddGradeItem(activeClass.id, {
      name: gradeItemForm.name,
      weight: Number(gradeItemForm.weight)
    });
    setIsGradeItemModalOpen(false);
    setGradeItemForm({ name: '', weight: 25 });
  };

  // Export Absensi to CSV
  const exportAttendanceCSV = () => {
    if (!activeClass || activeClass.meetings.length === 0) {
      alert('Belum ada data pertemuan untuk diekspor.');
      return;
    }

    // CSV Headers
    const headers = ['No', 'NIS', 'Nama Siswa', ...activeClass.meetings.map(m => `${m.date} (${m.topic})`)];
    
    // CSV Rows
    const rows = activeClass.students.map((std, idx) => {
      const attendanceCells = activeClass.meetings.map(m => {
        return m.attendance[std.id] || 'Hadir';
      });
      return [idx + 1, std.nis, std.name, ...attendanceCells];
    });

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    
    // Download Trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `absensi_${activeClass.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Nilai to CSV
  const exportGradesCSV = () => {
    if (!activeClass || activeClass.students.length === 0) {
      alert('Belum ada data siswa untuk diekspor.');
      return;
    }

    const gradeItems = activeClass.gradeItems;
    // CSV Headers
    const headers = ['No', 'NIS', 'Nama Siswa', ...gradeItems.map(g => g.name), 'Rata-Rata'];
    
    // CSV Rows
    const rows = activeClass.students.map((std, idx) => {
      const scores = gradeItems.map(g => {
        const score = activeClass.grades[std.id]?.[g.id];
        return score !== undefined ? score : '-';
      });
      
      // Calculate average
      const studentScores = gradeItems
        .map(g => activeClass.grades[std.id]?.[g.id])
        .filter((s): s is number => s !== undefined);
      const avg = studentScores.length > 0 
        ? Math.round(studentScores.reduce((a, b) => a + b, 0) / studentScores.length) 
        : '-';

      return [idx + 1, std.nis, std.name, ...scores, avg];
    });

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    
    // Download Trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nilai_${activeClass.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students based on search
  const filteredStudents = activeClass?.students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.nis.includes(studentSearch)
  ) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in" id="kelas-container">
      {/* LEFT COLUMN: CLASS LIST & QUICK METRICS */}
      <div className="md:col-span-4 lg:col-span-3 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">Daftar Kelas</h3>
            <button
              onClick={() => setIsNewClassModalOpen(true)}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={14} /> Tambah
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => {
                  onSelectClass(cls.id);
                  setActiveMeetingId('');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  cls.id === activeClass?.id
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm'
                    : 'bg-slate-50 border-slate-100 hover:bg-white text-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm">{cls.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{cls.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold">
                    {cls.students.length} Siswa
                  </span>
                  {classes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setClassToDelete(cls);
                      }}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Hapus Kelas"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Class Core Overview */}
        {activeClass && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ikhtisar Kelas</h4>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Tingkat Kelas</span>
                <span className="font-bold text-slate-900">Kelas {activeClass.grade}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Rata-Rata Nilai</span>
                <span className="font-bold text-slate-900">
                  {(() => {
                    let total = 0;
                    let count = 0;
                    Object.values(activeClass.grades).forEach(studentGrades => {
                      Object.values(studentGrades).forEach(score => {
                        total += score;
                        count++;
                      });
                    });
                    return count > 0 ? `${Math.round(total / count)}` : '-';
                  })()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Pertemuan Absensi</span>
                <span className="font-bold text-slate-900">{activeClass.meetings.length} Sesi</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: DETAILED WORKSPACE */}
      <div className="md:col-span-8 lg:col-span-9 space-y-6">
        {activeClass ? (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {/* Header Area with Title & Tabs */}
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full uppercase">
                  Workspace Aktif
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeClass.name} — {activeClass.subject}</h2>
              </div>
              
              {/* Navigation Tabs */}
              <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab('siswa')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'siswa' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar Siswa
                </button>
                <button
                  onClick={() => setActiveTab('absensi')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'absensi' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Absensi
                </button>
                <button
                  onClick={() => setActiveTab('nilai')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'nilai' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Buku Nilai
                </button>
              </div>
            </div>

            {/* TAB CONTENT: SISWA */}
            {activeTab === 'siswa' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIS siswa..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setStudentForm({ nis: '', name: '', notes: '' });
                      setIsStudentModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
                  >
                    <Plus size={16} /> Tambah Siswa Baru
                  </button>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <Users size={48} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600">Tidak ada data siswa ditemukan.</p>
                    <p className="text-xs text-slate-400 mt-1">Tambahkan siswa baru untuk memulai pendataan kelas ini.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider text-[10px]">
                          <th className="py-4 px-6 w-16">No</th>
                          <th className="py-4 px-6 w-32">NIS</th>
                          <th className="py-4 px-6 w-64">Nama Lengkap</th>
                          <th className="py-4 px-6">Catatan Perkembangan Siswa</th>
                          <th className="py-4 px-6 w-24 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredStudents.map((std, idx) => (
                          <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6 text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-4 px-6 font-mono font-medium text-slate-600">{std.nis}</td>
                            <td className="py-4 px-6 font-bold text-slate-900">{std.name}</td>
                            <td className="py-4 px-6 text-slate-500 italic">{std.notes || '—'}</td>
                            <td className="py-4 px-6 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingStudent(std);
                                  setStudentForm({ nis: std.nis, name: std.name, notes: std.notes || '' });
                                  setIsStudentModalOpen(true);
                                }}
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-colors cursor-pointer inline-block shadow-sm"
                                title="Edit Siswa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus siswa ${std.name}? Data absensi dan nilainya akan ikut terhapus.`)) {
                                    onDeleteStudent(activeClass.id, std.id);
                                  }
                                }}
                                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-block shadow-sm"
                                title="Hapus Siswa"
                              >
                                <Trash size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ABSENSI */}
            {activeTab === 'absensi' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900">Rekap Presensi & Riwayat Pertemuan</h3>
                    <p className="text-sm text-slate-500">Kelola dan input daftar hadir siswa di setiap pertemuan kelas.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={exportAttendanceCSV}
                      className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet size={16} /> Ekspor CSV
                    </button>
                    <button
                      onClick={() => setIsMeetingModalOpen(true)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus size={16} /> Tambah Pertemuan Baru
                    </button>
                  </div>
                </div>

                {activeClass.meetings.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <Calendar size={48} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600">Belum ada riwayat pertemuan pembelajaran.</p>
                    <p className="text-xs text-slate-400 mt-1">Tambahkan pertemuan baru untuk mengaktifkan daftar absensi siswa.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Meeting Selector Matrix */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-100">
                      <span className="text-xs uppercase font-bold text-slate-500 pr-2 block shrink-0">Pilih Pertemuan:</span>
                      {activeClass.meetings.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => setActiveMeetingId(m.id)}
                          className={`px-4 py-2 text-sm rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                            m.id === (activeMeetingId || activeClass.meetings[activeClass.meetings.length - 1]?.id)
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          Sesi {idx + 1}: {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </button>
                      ))}
                    </div>

                    {/* Active Meeting Attendance Panel */}
                    {(() => {
                      const selectedMeeting = activeClass.meetings.find(m => m.id === (activeMeetingId || activeClass.meetings[activeClass.meetings.length - 1]?.id));
                      if (!selectedMeeting) return null;

                      // Metrics for active meeting
                      const attStats = Object.values(selectedMeeting.attendance);
                      const stats = {
                        H: attStats.filter(s => s === 'Hadir').length,
                        S: attStats.filter(s => s === 'Sakit').length,
                        I: attStats.filter(s => s === 'Izin').length,
                        A: attStats.filter(s => s === 'Alpa').length
                      };

                      return (
                        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                                Sesi Aktif
                              </span>
                              <h4 className="font-bold text-lg text-slate-900 mt-2">
                                {selectedMeeting.topic} ({new Date(selectedMeeting.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
                              </h4>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Quick Mini Stats */}
                              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100">
                                <span className="text-emerald-600">Hadir: {stats.H}</span>
                                <span className="text-blue-600">Sakit: {stats.S}</span>
                                <span className="text-amber-600">Izin: {stats.I}</span>
                                <span className="text-red-600">Alpa: {stats.A}</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm('Apakah Anda ingin menandai HADIR semua siswa untuk pertemuan ini?')) {
                                    activeClass.students.forEach(s => {
                                      onUpdateMeetingAttendance(activeClass.id, selectedMeeting.id, s.id, 'Hadir');
                                    });
                                  }
                                }}
                                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                              >
                                Tandai Hadir Semua
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus pertemuan "${selectedMeeting.topic}"?`)) {
                                    onDeleteMeeting(activeClass.id, selectedMeeting.id);
                                    setActiveMeetingId('');
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                title="Hapus Pertemuan"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Attendance Table */}
                          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider text-[10px]">
                                  <th className="py-4 px-6 w-16">No</th>
                                  <th className="py-4 px-6 w-32">NIS</th>
                                  <th className="py-4 px-6 w-64">Nama Lengkap</th>
                                  <th className="py-4 px-6 text-center">Status Presensi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {activeClass.students.map((std, index) => {
                                  const currentStatus = selectedMeeting.attendance[std.id] || 'Hadir';
                                  
                                  return (
                                    <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="py-4 px-6 font-bold text-slate-400">{index + 1}</td>
                                      <td className="py-4 px-6 font-mono font-medium text-slate-600">{std.nis}</td>
                                      <td className="py-4 px-6 font-bold text-slate-900">{std.name}</td>
                                      <td className="py-4 px-6">
                                        <div className="flex justify-center items-center gap-2 max-w-lg mx-auto">
                                          {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as AttendanceStatus[]).map(status => {
                                            const colors = {
                                              'Hadir': currentStatus === 'Hadir' ? 'bg-emerald-500 text-white shadow-md scale-[1.02]' : 'hover:bg-emerald-50 text-emerald-600 border border-slate-200 bg-white',
                                              'Sakit': currentStatus === 'Sakit' ? 'bg-blue-500 text-white shadow-md scale-[1.02]' : 'hover:bg-blue-50 text-blue-600 border border-slate-200 bg-white',
                                              'Izin': currentStatus === 'Izin' ? 'bg-amber-500 text-white shadow-md scale-[1.02]' : 'hover:bg-amber-50 text-amber-600 border border-slate-200 bg-white',
                                              'Alpa': currentStatus === 'Alpa' ? 'bg-red-500 text-white shadow-md scale-[1.02]' : 'hover:bg-red-50 text-red-600 border border-slate-200 bg-white'
                                            };
                                            return (
                                              <button
                                                key={status}
                                                onClick={() => onUpdateMeetingAttendance(activeClass.id, selectedMeeting.id, std.id, status)}
                                                className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-bold text-center transition-all cursor-pointer ${colors[status]}`}
                                              >
                                                {status}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: NILAI */}
            {activeTab === 'nilai' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900">Buku Nilai Pembelajaran</h3>
                    <p className="text-sm text-slate-500">Kelola bobot tugas, input skor siswa, dan pantau rekapitulasi rata-rata nilai secara langsung.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={exportGradesCSV}
                      className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet size={16} /> Ekspor CSV
                    </button>
                    <button
                      onClick={() => setIsGradeItemModalOpen(true)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus size={16} /> Tambah Kolom Penilaian
                    </button>
                  </div>
                </div>

                {activeClass.students.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <Users size={48} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600">Belum ada data siswa.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Grade Items Weights Legend */}
                    {activeClass.gradeItems.length > 0 && (
                      <div className="flex flex-wrap gap-3 items-center text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <span className="font-bold text-slate-700">Daftar Komponen & Bobot:</span>
                        {activeClass.gradeItems.map(g => (
                          <div key={g.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 shadow-sm">
                            <span className="font-bold">{g.name}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">({g.weight}%)</span>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus kolom penilaian "${g.name}" beserta seluruh nilai siswa di dalamnya?`)) {
                                  onDeleteGradeItem(activeClass.id, g.id);
                                }
                              }}
                              className="text-slate-400 hover:text-red-600 font-bold ml-1 hover:bg-red-50 rounded p-1 transition-colors"
                              title="Hapus Kolom"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grades Grid Table */}
                    {activeClass.gradeItems.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-slate-50">
                        <AlertCircle size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-600">Belum ada kolom komponen nilai.</p>
                        <p className="text-xs text-slate-500 mt-1">Buat kolom penilaian (seperti Tugas, UTS, UAS) terlebih dahulu.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider text-[10px]">
                              <th className="py-4 px-6 w-16 text-center">No</th>
                              <th className="py-4 px-6 w-32">NIS</th>
                              <th className="py-4 px-6 w-64">Nama Lengkap</th>
                              {activeClass.gradeItems.map(g => (
                                <th key={g.id} className="py-4 px-6 text-center min-w-[140px]">
                                  <div className="font-bold text-slate-700">{g.name}</div>
                                  <div className="text-[10px] text-slate-400 mt-1">Bobot: {g.weight}%</div>
                                </th>
                              ))}
                              <th className="py-4 px-6 text-center w-32 bg-indigo-50 text-indigo-900 border-l border-slate-200">Rerata</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {activeClass.students.map((std, idx) => {
                              // Calculate average
                              const scores = activeClass.gradeItems
                                .map(g => activeClass.grades[std.id]?.[g.id])
                                .filter((s): s is number => s !== undefined);
                              const average = scores.length > 0
                                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                                : null;

                              return (
                                <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-4 px-6 text-center text-slate-400 font-bold">{idx + 1}</td>
                                  <td className="py-4 px-6 font-mono font-medium text-slate-600">{std.nis}</td>
                                  <td className="py-4 px-6 font-bold text-slate-900">{std.name}</td>
                                  
                                  {activeClass.gradeItems.map(g => {
                                    const score = activeClass.grades[std.id]?.[g.id];
                                    const displayVal = score !== undefined ? score : '';
                                    
                                    return (
                                      <td key={g.id} className="py-4 px-6 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="—"
                                          value={displayVal}
                                          onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                                            onUpdateGrade(activeClass.id, std.id, g.id, val);
                                          }}
                                          className="w-20 p-2 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-slate-50 font-mono font-bold"
                                        />
                                      </td>
                                    );
                                  })}

                                  <td className={`py-4 px-6 text-center font-mono font-bold border-l border-slate-200 text-lg ${
                                    average !== null 
                                      ? average >= 75 ? 'text-emerald-600 bg-emerald-50/50' : 'text-red-600 bg-red-50/50' 
                                      : 'text-slate-400 bg-slate-50/50'
                                  }`}>
                                    {average !== null ? average : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border border-slate-200 bg-white rounded-3xl shadow-sm">
            <Users size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Belum ada kelas pembelajaran terdaftar.</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Tambah' di sebelah kiri untuk mendaftarkan kelas.</p>
          </div>
        )}
      </div>

      {/* POPUP MODAL: CREATE CLASS */}
      {isNewClassModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">Buat Kelas Baru</h3>
              <button onClick={() => setIsNewClassModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateClassSubmit} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-slate-700 mb-1.5">Nama Kelas</label>
                <input
                  type="text"
                  placeholder="Misal: Kelas X - A"
                  value={newClassData.name}
                  onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Mata Pelajaran Sejarah</label>
                <input
                  type="text"
                  placeholder="Misal: Sejarah Indonesia atau Sejarah Dunia"
                  value={newClassData.subject}
                  onChange={e => setNewClassData({ ...newClassData, subject: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Tingkat Kelas (Grade)</label>
                <select
                  value={newClassData.grade}
                  onChange={e => setNewClassData({ ...newClassData, grade: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="X">Tingkat X (Sepuluh)</option>
                  <option value="XI">Tingkat XI (Sebelas)</option>
                  <option value="XII">Tingkat XII (Duabelas)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1.5">Hari Mengajar</label>
                  <select
                    value={newClassData.scheduleDay}
                    onChange={e => setNewClassData({ ...newClassData, scheduleDay: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                    required
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5">Jam Pelajaran (JP/Minggu)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newClassData.teachingHours}
                    onChange={e => setNewClassData({ ...newClassData, teachingHours: Number(e.target.value) })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1.5">Jam Mulai</label>
                  <input
                    type="time"
                    value={newClassData.scheduleTimeStart}
                    onChange={e => setNewClassData({ ...newClassData, scheduleTimeStart: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5">Jam Selesai</label>
                  <input
                    type="time"
                    value={newClassData.scheduleTimeEnd}
                    onChange={e => setNewClassData({ ...newClassData, scheduleTimeEnd: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClassModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: CREATE/EDIT STUDENT */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full my-auto shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingStudent ? 'Edit Profil Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer p-2 rounded-lg hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleStudentSubmit} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-slate-700 mb-1.5">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  placeholder="Misal: 26021"
                  value={studentForm.nis}
                  onChange={e => setStudentForm({ ...studentForm, nis: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={studentForm.name}
                  onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Catatan Perkembangan (Opsional)</label>
                <textarea
                  placeholder="Misal: Sangat aktif, perlu dorongan visual, dll."
                  value={studentForm.notes}
                  onChange={e => setStudentForm({ ...studentForm, notes: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 h-24 resize-none outline-none"
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  {editingStudent ? 'Simpan' : 'Daftarkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: CREATE MEETING */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">Tambah Pertemuan Pembelajaran</h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleMeetingSubmit} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-slate-700 mb-1.5">Tanggal Sesi</label>
                <input
                  type="date"
                  value={meetingForm.date}
                  onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Topik Pembahasan / Judul Materi</label>
                <input
                  type="text"
                  placeholder="Misal: Pertemuan 4: Kebudayaan Neolitikum"
                  value={meetingForm.topic}
                  onChange={e => setMeetingForm({ ...meetingForm, topic: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Buat Pertemuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: CREATE GRADE ITEM */}
      {isGradeItemModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">Tambah Komponen Penilaian</h3>
              <button onClick={() => setIsGradeItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleGradeItemSubmit} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-slate-700 mb-1.5">Nama Kolom Penilaian</label>
                <input
                  type="text"
                  placeholder="Misal: Tugas 3: Analisis Artefak"
                  value={gradeItemForm.name}
                  onChange={e => setGradeItemForm({ ...gradeItemForm, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Bobot Nilai (%)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={gradeItemForm.weight}
                  onChange={e => setGradeItemForm({ ...gradeItemForm, weight: Number(e.target.value) })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGradeItemModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Buat Kolom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Class Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2">Hapus {classToDelete.name}?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Seluruh data siswa, jadwal, dan nilai dalam kelas ini akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setClassToDelete(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteClass(classToDelete.id);
                  setClassToDelete(null);
                  showToast(`✓ Kelas ${classToDelete.name} berhasil dihapus`);
                }}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-red-500/20"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] animate-fade-in">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 border border-slate-700">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
