import React, { useState } from 'react';
import { User, Settings as SettingsIcon, Database, Info, Save, Upload, Download, RotateCcw, Palette, Languages, MousePointerClick, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data' | 'about'>('profile');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2 h-fit">
        <h3 className="font-bold text-lg mb-2 px-2 text-slate-800">Pengaturan</h3>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <User size={18} />
          <span>Profil Guru</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'preferences' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <SettingsIcon size={18} />
          <span>Preferensi</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'data' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Database size={18} />
          <span>Manajemen Data</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'about' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Info size={18} />
          <span>Tentang</span>
        </button>
      </div>

      {/* Main Settings Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-y-auto">
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Profil Guru</h2>
            
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-white shadow-md flex items-center justify-center text-indigo-600 font-bold text-3xl overflow-hidden relative group cursor-pointer">
                  <span>P</span>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs">Ubah Foto</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                  <input type="text" defaultValue="Paijo, S.Pd." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nama Panggilan</label>
                  <input type="text" defaultValue="Pak Paijo" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">NIP</label>
                  <input type="text" defaultValue="19800101 200501 1 001" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Mata Pelajaran</label>
                  <input type="text" defaultValue="Sejarah" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Nama Sekolah</label>
                  <input type="text" defaultValue="SMA Negeri 1 Nusantara" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Email</label>
                  <input type="email" defaultValue="paijo@sekolah.id" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nomor HP</label>
                  <input type="tel" defaultValue="08123456789" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
              >
                {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
                <span>{isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Preferensi</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Palette size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-1">Tema Aplikasi</h4>
                  <p className="text-sm text-slate-500 mb-3">Pilih tampilan warna utama aplikasi.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold border-2 border-slate-900 cursor-pointer">Gelap</button>
                    <button className="px-4 py-2 bg-white text-slate-800 rounded-lg text-sm font-bold border-2 border-indigo-500 cursor-pointer">Terang</button>
                    <button className="px-4 py-2 bg-white text-slate-800 rounded-lg text-sm font-bold border-2 border-slate-200 hover:border-slate-300 cursor-pointer">Sistem</button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Languages size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-1">Bahasa</h4>
                  <p className="text-sm text-slate-500 mb-3">Bahasa pengantar pada antarmuka.</p>
                  <select className="p-2.5 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-indigo-500 bg-white min-w-[200px]">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <MousePointerClick size={20} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Animasi UI</h4>
                    <p className="text-sm text-slate-500">Aktifkan efek transisi dan animasi.</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-indigo-500 cursor-pointer shadow-inner">
                    <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transform translate-x-6 transition-transform shadow-sm"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Save size={20} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Auto Save</h4>
                    <p className="text-sm text-slate-500">Simpan perubahan otomatis di editor materi.</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-indigo-500 cursor-pointer shadow-inner">
                    <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transform translate-x-6 transition-transform shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Manajemen Data</h2>
            
            <div className="space-y-4">
              <div className="p-5 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Export Data</h4>
                    <p className="text-xs text-slate-500 mt-1">Unduh seluruh data kelas dan materi sebagai file JSON.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:text-slate-900 shadow-sm cursor-pointer">
                  Export
                </button>
              </div>

              <div className="p-5 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Import Data</h4>
                    <p className="text-xs text-slate-500 mt-1">Pulihkan data dari file JSON yang telah diexport.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:text-slate-900 shadow-sm cursor-pointer">
                  Import
                </button>
              </div>

              <div className="p-5 border border-red-100 rounded-xl flex items-center justify-between bg-red-50 hover:bg-red-100 transition-colors mt-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700">Reset Semua Data</h4>
                    <p className="text-xs text-red-500/80 mt-1">Hapus seluruh data kelas dan materi, kembalikan ke awal.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 cursor-pointer">
                  Reset Data
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-3xl flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center font-bold text-4xl text-white mb-6 shadow-lg shadow-indigo-200">
              H
            </div>
            <h2 className="text-3xl font-bold tracking-tight italic mb-2">HistoLab</h2>
            <p className="text-slate-500 font-medium mb-8">Digital Workspace Guru Sejarah</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[250px]">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500 font-medium">Versi</span>
                <span className="text-sm font-bold text-slate-800">1.0.1</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500 font-medium">Pembaruan</span>
                <span className="text-sm font-bold text-slate-800">Okt 2023</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500 font-medium">Lisensi</span>
                <span className="text-sm font-bold text-slate-800">MIT</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
