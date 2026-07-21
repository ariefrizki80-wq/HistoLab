import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Check, Search, X, Sparkles, Folder, Tag, FileText, Map, Layers, RefreshCw } from 'lucide-react';
import { Asset, getAllAssets, saveAsset, deleteAsset, fileToDataUrl } from '../lib/assetLibrary';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset?: (asset: Asset) => void;
  title?: string;
  category?: string;
  allowedCategory?: string;
}

export default function AssetPickerModal({
  isOpen,
  onClose,
  onSelectAsset,
  title = 'Pilih Media dari Asset Library',
  category,
  allowedCategory,
}: AssetPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const filterCat = category || allowedCategory || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(filterCat);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Upload Form State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<'history' | 'map' | 'background' | 'avatar' | 'document' | 'other'>(
    allowedCategory || 'history'
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAllAssets = async () => {
    setLoading(true);
    const list = await getAllAssets();
    setAssets(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAllAssets();
      setSelectedCategory(allowedCategory || 'all');
    }
  }, [isOpen, allowedCategory]);

  useEffect(() => {
    const handleUpdate = () => {
      loadAllAssets();
    };
    window.addEventListener('histolab_assets_updated', handleUpdate);
    return () => window.removeEventListener('histolab_assets_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFileDrop = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/') && !file.type.includes('svg')) {
      alert('Format file tidak didukung. Harap unggah gambar JPG, PNG, WEBP, atau SVG.');
      return;
    }
    setUploadFile(file);
    setUploadName(file.name.replace(/\.[^/.]+$/, ''));
    try {
      const dataUrl = await fileToDataUrl(file);
      setUploadPreview(dataUrl);
    } catch (e) {
      console.error('File read error', e);
    }
  };

  const handleSaveUpload = async () => {
    if (!uploadPreview || !uploadName) return;
    setIsSaving(true);
    try {
      const saved = await saveAsset({
        name: uploadName,
        type: uploadFile?.type.includes('svg') ? 'svg' : 'image',
        mimeType: uploadFile?.type || 'image/png',
        dataUrl: uploadPreview,
        size: uploadFile?.size || uploadPreview.length,
        category: uploadCategory,
        tags: [uploadCategory, 'upload_guru'],
      });
      setIsSaving(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadName('');
      await loadAllAssets();
      onSelectAsset(saved);
      onClose();
    } catch (err) {
      setIsSaving(false);
      console.error('Failed to save asset', err);
    }
  };

  const handleDeleteAsset = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus asset ini dari Asset Library?')) {
      await deleteAsset(id);
      await loadAllAssets();
      if (selectedAssetId === id) setSelectedAssetId(null);
    }
  };

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Folder size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pusat Manajemen Media & Asset Terintegrasi HistoLab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'library'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon size={16} />
            Perpustakaan Asset ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Upload size={16} />
            Unggah File Baru
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'library' ? (
            <div className="space-y-4">
              {/* Search & Category Filter */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari asset berdasarkan nama atau tag..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'history', label: 'Sejarah' },
                    { id: 'map', label: 'Peta' },
                    { id: 'background', label: 'Background' },
                    { id: 'document', label: 'Dokumen' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw size={24} className="animate-spin text-amber-500" />
                  <span className="ml-2 text-sm text-slate-500">Memuat Asset Library...</span>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <ImageIcon size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Tidak ada media ditemukannya
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    Belum ada asset dengan kategori atau pencarian tersebut.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Upload size={14} /> Unggah Gambar Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAssetId === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        onDoubleClick={() => {
                          onSelectAsset(asset);
                          onClose();
                        }}
                        className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all bg-slate-900/5 dark:bg-slate-800/40 ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Aspect Ratio Box */}
                        <div className="aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                          <img
                            src={asset.dataUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500 text-white shadow-lg">
                              <Check size={14} />
                            </div>
                          )}
                          {/* Delete Action Overlay */}
                          <button
                            onClick={(e) => handleDeleteAsset(e, asset.id)}
                            title="Hapus dari Asset Library"
                            className="absolute top-2 left-2 p-1.5 rounded-lg bg-red-600/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Title & Category info */}
                        <div className="p-2.5 bg-white dark:bg-slate-900">
                          <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                            {asset.name}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {asset.category}
                            </span>
                            <span>
                              {new Date(asset.uploadedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Upload Tab */
            <div className="max-w-xl mx-auto space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileDrop(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileDrop(e.target.files)}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />

                {uploadPreview ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="w-48 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md relative bg-slate-950">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-slate-500">Klik atau drag untuk mengganti gambar</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 mb-3">
                      <Upload size={32} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Tarik dan Lepas file gambar di sini, atau <span className="text-amber-500">Pilih File</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Mendukung JPG, PNG, WEBP, SVG hingga 20MB
                    </p>
                  </>
                )}
              </div>

              {uploadPreview && (
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nama Asset
                    </label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="Masukkan nama asset..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Kategori Asset
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e: any) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                    >
                      <option value="history">Sejarah & Dokumentasi</option>
                      <option value="map">Peta & Geografis</option>
                      <option value="background">Background & Texture</option>
                      <option value="document">Manuskrip & Naskah</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveUpload}
                    disabled={isSaving || !uploadName}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                    Simpan ke Asset Library
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === 'library' && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {selectedAsset ? (
                <span>
                  Asset terpilih: <strong className="text-slate-800 dark:text-slate-200">{selectedAsset.name}</strong>
                </span>
              ) : (
                'Pilih salah satu asset dari daftar untuk digunakan.'
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                disabled={!selectedAsset}
                onClick={() => {
                  if (selectedAsset) {
                    onSelectAsset(selectedAsset);
                    onClose();
                  }
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Check size={16} />
                Gunakan Asset Ini
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
