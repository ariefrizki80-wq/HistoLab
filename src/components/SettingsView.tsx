import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Settings as SettingsIcon, Database, Info, Save, Upload, Download, 
  RotateCcw, Palette, Languages, MousePointerClick, CheckCircle, AlertTriangle, 
  FileText, ShieldCheck, X, HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { ClassItem, Material, CalendarEvent, ReminderNote, Presentation } from '../types';
import { INITIAL_CLASSES, INITIAL_MATERIALS, INITIAL_CALENDAR_EVENTS, INITIAL_REMINDERS } from '../data/initialData';
import { INITIAL_PRESENTATIONS } from '../data/initialPresentations';

interface SettingsViewProps {
  onRestoreData?: () => void;
}

export default function SettingsView({ onRestoreData }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data' | 'about'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Backup Metadata State
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('histolab_last_backup_date');
  });
  const [lastBackupSize, setLastBackupSize] = useState<string | null>(() => {
    return localStorage.getItem('histolab_last_backup_size');
  });

  // Backup / Import Preview States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewBackupData, setPreviewBackupData] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Teacher Profile State
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('histolab_teacher_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      fullName: 'Paijo, S.Pd.',
      nickname: 'Pak Paijo',
      nip: '19800101 200501 1 001',
      subject: 'Sejarah Indonesia',
      school: 'SMA Negeri 1 Nusantara',
      email: 'paijo@sekolah.id',
      phone: '08123456789'
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('histolab_teacher_profile', JSON.stringify(profile));
      setSaveStatus('success');
      window.dispatchEvent(new Event('histolab_profile_updated'));
      showToast('✓ Profil guru berhasil diperbarui');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // EXPORT JSON SYSTEM (BACKUP)
  const handleExportData = () => {
    try {
      const getParsedItem = (key: string, fallback: any) => {
        const item = localStorage.getItem(key);
        if (!item) return fallback;
        try {
          return JSON.parse(item);
        } catch (e) {
          return fallback;
        }
      };

      const exportBundle = {
        schemaVersion: "1.0.0",
        app: "HistoLab",
        backupDate: new Date().toISOString(),
        exportedBy: profile.fullName || "Guru HistoLab",
        data: {
          teacherProfile: getParsedItem('histolab_teacher_profile', profile),
          classes: getParsedItem('histolab_classes_v1', INITIAL_CLASSES),
          materials: getParsedItem('histolab_materials_v1', INITIAL_MATERIALS),
          events: getParsedItem('histolab_events_v1', INITIAL_CALENDAR_EVENTS),
          reminders: getParsedItem('histolab_reminders_v1', INITIAL_REMINDERS),
          presentations: getParsedItem('histolab_presentations_v1', INITIAL_PRESENTATIONS)
        }
      };

      const jsonString = JSON.stringify(exportBundle, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const sizeKB = (blob.size / 1024).toFixed(1) + ' KB';

      const dateFormatted = new Date().toISOString().split('T')[0];
      const filename = `histolab-backup-${dateFormatted}.json`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const nowFormatted = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      localStorage.setItem('histolab_last_backup_date', nowFormatted);
      localStorage.setItem('histolab_last_backup_size', sizeKB);

      setLastBackupDate(nowFormatted);
      setLastBackupSize(sizeKB);

      showToast(`✓ Backup berhasil diunduh (${filename})`);
    } catch (error) {
      alert('Gagal mengeksport data backup. ' + String(error));
    }
  };

  // FILE PICKER & VALIDATION FOR IMPORT JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validate JSON Schema
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Format berkas JSON tidak valid.');
        }

        if (!parsed.data || typeof parsed.data !== 'object') {
          throw new Error('Struktur data HistoLab tidak ditemukan dalam file ini.');
        }

        if (!parsed.schemaVersion) {
          throw new Error('Versi skema backup tidak terdeteksi.');
        }

        setImportError(null);
        setPreviewBackupData(parsed);
        setIsImportModalOpen(true);
      } catch (err: any) {
        setImportError(err.message || 'Gagal membaca berkas JSON.');
        alert(`Gagal Memproses File Backup: ${err.message || 'File korup atau bukan format JSON HistoLab'}`);
      }
    };

    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  // EXECUTE IMPORT & RESTORE
  const handleConfirmImport = () => {
    if (!previewBackupData || !previewBackupData.data) return;

    try {
      const { teacherProfile, classes, materials, events, reminders, presentations } = previewBackupData.data;

      if (teacherProfile) localStorage.setItem('histolab_teacher_profile', JSON.stringify(teacherProfile));
      if (classes) localStorage.setItem('histolab_classes_v1', JSON.stringify(classes));
      if (materials) localStorage.setItem('histolab_materials_v1', JSON.stringify(materials));
      if (events) localStorage.setItem('histolab_events_v1', JSON.stringify(events));
      if (reminders) localStorage.setItem('histolab_reminders_v1', JSON.stringify(reminders));
      if (presentations) localStorage.setItem('histolab_presentations_v1', JSON.stringify(presentations));

      const nowFormatted = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      localStorage.setItem('histolab_last_backup_date', nowFormatted);

      // Trigger global event and callback
      window.dispatchEvent(new CustomEvent('histolab_data_restored', { detail: previewBackupData.data }));
      window.dispatchEvent(new Event('histolab_profile_updated'));

      if (onRestoreData) {
        onRestoreData();
      }

      setIsImportModalOpen(false);
      setPreviewBackupData(null);

      // Update local profile state
      if (teacherProfile) setProfile(teacherProfile);

      showToast('✓ Data berhasil dipulihkan dari file backup!');
    } catch (err) {
      alert('Gagal memulihkan data: ' + String(err));
    }
  };

  // EXECUTE RESET ALL DATA
  const handleResetData = () => {
    localStorage.setItem('histolab_classes_v1', JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem('histolab_materials_v1', JSON.stringify(INITIAL_MATERIALS));
    localStorage.setItem('histolab_events_v1', JSON.stringify(INITIAL_CALENDAR_EVENTS));
    localStorage.setItem('histolab_reminders_v1', JSON.stringify(INITIAL_REMINDERS));
    localStorage.setItem('histolab_presentations_v1', JSON.stringify(INITIAL_PRESENTATIONS));

    window.dispatchEvent(new CustomEvent('histolab_data_restored'));
    if (onRestoreData) onRestoreData();

    setIsResetConfirmOpen(false);
    showToast('✓ Seluruh data telah dikembalikan ke kondisi awal.');
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 animate-fade-in">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col gap-2 h-fit">
        <h3 className="font-bold text-lg mb-2 px-2 text-slate-900">Pengaturan</h3>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <User size={18} />
          <span>Profil Guru</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'preferences' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <SettingsIcon size={18} />
          <span>Preferensi</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'data' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Database size={18} />
          <span>Backup & Restore JSON</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'about' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Info size={18} />
          <span>Tentang HistoLab</span>
        </button>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-y-auto">
        {/* TAB 1: PROFIL GURU */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Profil Guru Sejarah</h2>
            
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 rounded-3xl bg-indigo-100 border-4 border-white shadow-lg flex items-center justify-center text-indigo-700 font-bold text-3xl overflow-hidden relative group">
                  <span>{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'P'}</span>
                </div>
                <p className="text-xs text-slate-500 font-bold">{profile.nickname || 'Pengajar Sejarah'}</p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                  <input type="text" name="fullName" value={profile.fullName} onChange={handleProfileChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Panggilan</label>
                  <input type="text" name="nickname" value={profile.nickname} onChange={handleProfileChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">NIP / ID Pendidik</label>
                  <input type="text" name="nip" value={profile.nip} onChange={handleProfileChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mata Pelajaran Utama</label>
                  <input type="text" name="subject" value={profile.subject} onChange={handleProfileChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Instansi / Sekolah</label>
                  <input type="text" name="school" value={profile.school} onChange={handleProfileChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Resmi</label>
                  <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nomor Kontak / WA</label>
                  <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                  saveStatus === 'success' ? 'bg-emerald-600 text-white' :
                  saveStatus === 'error' ? 'bg-red-600 text-white' :
                  isSaving ? 'bg-indigo-400 text-white cursor-not-allowed' :
                  'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                }`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveStatus === 'success' ? (
                  <CheckCircle size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>
                  {isSaving ? 'Menyimpan...' : 
                   saveStatus === 'success' ? 'Tersimpan!' : 
                   'Simpan Perubahan'}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: PREFERENSI TAMPILAN */}
        {activeTab === 'preferences' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">Preferensi Workspace</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                  <Palette size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">Tema Tampilan</h4>
                  <p className="text-xs text-slate-500 mb-3">Pilih nuansa warna antarmuka aplikasi.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold border-2 border-indigo-600 shadow-sm cursor-pointer">
                      Terang (Default)
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-slate-200 rounded-xl text-xs font-bold border-2 border-slate-900 cursor-pointer">
                      Dark Slate
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                  <Languages size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">Bahasa Sistem</h4>
                  <p className="text-xs text-slate-500 mb-3">Bahasa utama untuk istilah akademik dan bantuan AI.</p>
                  <select className="p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 bg-white min-w-[220px]">
                    <option value="id">Bahasa Indonesia (Resmi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: BACKUP & RESTORE JSON (PRIORITAS 3) */}
        {activeTab === 'data' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">Sistem Backup & Restore JSON</h2>
              <p className="text-xs text-slate-500 mt-1">
                Eksport seluruh data HistoLab ke berkas JSON terstruktur untuk menjaga cadangan lokal atau memindahkan data antar-perangkat.
              </p>
            </div>

            {/* Backup Info Header Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Status Cadangan Terakhir</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  Schema v1.0.0
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Tanggal Backup Terakhir:</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">
                    {lastBackupDate || 'Belum pernah dieksport'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Estimasi Ukuran Data:</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">
                    {lastBackupSize || '~ 45 KB'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="space-y-4">
              {/* EXPORT DATA */}
              <div className="p-5 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:border-indigo-200 transition-all shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Download size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Export Data (Download JSON)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Unduh arsip lengkap mencakup Profil Guru, Data Kelas, Kehadiran, Nilai, Bank Materi, Presentation Slide, dan Agenda.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-sm cursor-pointer shrink-0 transition-colors"
                >
                  Download JSON
                </button>
              </div>

              {/* IMPORT DATA */}
              <div className="p-5 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:border-indigo-200 transition-all shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Import Data (Restore JSON)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Unggah berkas cadangan JSON HistoLab untuk memulihkan seluruh riwayat kelas, siswa, dan materi.
                    </p>
                  </div>
                </div>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-sm cursor-pointer shrink-0 transition-colors"
                >
                  Pilih Berkas JSON
                </button>
              </div>

              {/* RESET ALL DATA */}
              <div className="p-5 border border-red-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50/50 mt-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <RotateCcw size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900">Reset Semua Data Aplikasi</h4>
                    <p className="text-xs text-red-700/80 mt-1 leading-relaxed">
                      Mengembalikan seluruh data kelas, siswa, dan materi ke setelan awal pabrik HistoLab.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-2xl shadow-sm cursor-pointer shrink-0 transition-colors"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: TENTANG HISTOLAB */}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl flex flex-col items-center justify-center text-center py-16">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center font-bold text-4xl text-white mb-6 shadow-xl shadow-indigo-200">
              H
            </div>
            <h2 className="text-3xl font-bold tracking-tight italic text-slate-900 mb-1">HistoLab</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Digital Workspace Guru Sejarah Indonesia</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-sm space-y-3 text-xs font-medium text-left">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-500">Versi Aplikasi</span>
                <span className="font-bold text-slate-900">v1.2.0 (Build 2026)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-500">Sistem Penyimpanan</span>
                <span className="font-bold text-emerald-700">Offline PWA + Local Storage</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500">Format Backup</span>
                <span className="font-bold text-slate-900">JSON Schema v1.0.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL: PREVIEW & CONFIRM IMPORT JSON */}
      {isImportModalOpen && previewBackupData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <FileText size={22} />
                <h3 className="font-bold text-lg text-slate-900">Konfirmasi Pemulihan Data</h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setPreviewBackupData(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Perhatian:</strong> Melakukan import akan menggantikan data aktif di aplikasi dengan isi dari berkas backup ini.
              </p>
            </div>

            {/* Metadata Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-900 border-b border-slate-200 pb-2">Rincian Berkas Cadangan:</p>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Di-export Oleh:</span>
                <span className="font-bold text-slate-900">{previewBackupData.exportedBy || 'Guru HistoLab'}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Tanggal Backup:</span>
                <span className="font-bold text-slate-900">
                  {new Date(previewBackupData.backupDate).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 border-t border-slate-200 pt-2">
                <span>Jumlah Kelas:</span>
                <span className="font-bold text-indigo-700">{previewBackupData.data?.classes?.length || 0} Kelas</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Jumlah Bank Materi:</span>
                <span className="font-bold text-indigo-700">{previewBackupData.data?.materials?.length || 0} Judul</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Data Slide Presentasi:</span>
                <span className="font-bold text-indigo-700">{previewBackupData.data?.presentations?.length || 0} Modul</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setPreviewBackupData(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs cursor-pointer shadow-md"
              >
                Pulihkan Data Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR RESET DATA */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-bold text-xl text-slate-900">Reset Seluruh Data?</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Seluruh data kelas, siswa, nilai, dan materi yang baru Anda buat akan dihapus dan dikembalikan ke contoh data bawaan aplikasi.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetData}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-2xl cursor-pointer shadow-md"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] animate-fade-in">
          <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 border border-slate-700">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
