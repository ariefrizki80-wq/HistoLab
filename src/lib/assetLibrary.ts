export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'svg' | 'audio';
  mimeType: string;
  dataUrl: string; // Base64 data URL or SVG string or Blob URL
  thumbnailUrl?: string;
  size: number; // in bytes
  uploadedAt: string; // ISO string
  tags?: string[];
  category: 'history' | 'map' | 'background' | 'avatar' | 'document' | 'other';
  width?: number;
  height?: number;
}

const DB_NAME = 'HistoLab_Asset_DB';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

// Initial curated historical stock assets as vector SVG / offline canvas Data URLs
const DEFAULT_PRESET_ASSETS: Asset[] = [
  {
    id: 'asset-map-voc-1600',
    name: 'Peta Rute Pelayaran VOC & Jalur Rempah 1600',
    type: 'svg',
    mimeType: 'image/svg+xml',
    category: 'map',
    size: 24500,
    uploadedAt: new Date().toISOString(),
    tags: ['peta', 'voc', 'rempah', 'nusantara', 'maritim'],
    width: 800,
    height: 500,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <rect width="800" height="500" fill="%230F172A"/>
      <path d="M50 400 C 150 200, 300 450, 450 250 S 700 300, 750 100" fill="none" stroke="%23D97706" stroke-width="3" stroke-dasharray="6,6"/>
      <circle cx="100" cy="380" r="10" fill="%23EF4444"/>
      <text x="120" y="385" fill="%23F8FAFC" font-size="14" font-family="sans-serif" font-weight="bold">Konstantinopel (1453)</text>
      <circle cx="320" cy="420" r="10" fill="%233B82F6"/>
      <text x="340" y="425" fill="%23F8FAFC" font-size="14" font-family="sans-serif" font-weight="bold">Tanjung Harapan</text>
      <circle cx="580" cy="280" r="12" fill="%2310B981"/>
      <text x="600" y="285" fill="%23F8FAFC" font-size="16" font-family="sans-serif" font-weight="bold">Banten (1596)</text>
      <circle cx="720" cy="180" r="12" fill="%23F59E0B"/>
      <text x="640" y="160" fill="%23F59E0B" font-size="16" font-family="sans-serif" font-weight="bold">Kepulauan Banda (Pusat Pala)</text>
      <text x="400" y="50" fill="%23E2E8F0" font-size="22" font-family="serif" text-anchor="middle" font-weight="bold">PETA JALUR SAMUDERA & MONOPOLI REMPAH VOC</text>
    </svg>`,
  },
  {
    id: 'asset-monumen-proklamasi',
    name: 'Ilustrasi Teks & Gedung Proklamasi 1945',
    type: 'svg',
    mimeType: 'image/svg+xml',
    category: 'history',
    size: 18200,
    uploadedAt: new Date().toISOString(),
    tags: ['proklamasi', '1945', 'kemerdekaan', 'soekarno', 'hatta'],
    width: 800,
    height: 500,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <rect width="800" height="500" fill="%231E293B"/>
      <rect x="80" y="60" width="640" height="380" rx="16" fill="%23F8FAFC" stroke="%23CBD5E1" stroke-width="4"/>
      <text x="400" y="120" fill="%230F172A" font-size="28" font-family="serif" text-anchor="middle" font-weight="bold">P R O K L A M A S I</text>
      <text x="400" y="180" fill="%23334155" font-size="16" font-family="sans-serif" text-anchor="middle">Kami bangsa Indonesia dengan ini menyatakan kemerdekaan Indonesia.</text>
      <text x="400" y="220" fill="%23334155" font-size="16" font-family="sans-serif" text-anchor="middle">Hal-hal jang mengenai pemindahan kekoeasaan d.l.l., diselenggarakan</text>
      <text x="400" y="260" fill="%23334155" font-size="16" font-family="sans-serif" text-anchor="middle">dengan tjara saksama dan dalam tempoh jang sesingkat-singkatnja.</text>
      <text x="550" y="340" fill="%230F172A" font-size="18" font-family="serif" text-anchor="middle" font-weight="bold">Jakarta, hari 17 boelan 8 tahoen 05</text>
      <text x="550" y="370" fill="%23D97706" font-size="20" font-family="serif" text-anchor="middle" font-weight="bold">Atas nama bangsa Indonesia</text>
      <text x="550" y="400" fill="%230F172A" font-size="22" font-family="serif" text-anchor="middle" font-weight="bold">Soekarno - Hatta</text>
    </svg>`,
  },
  {
    id: 'asset-bg-parchment-texture',
    name: 'Tekstur Naskah Kuno Parchment Gold',
    type: 'svg',
    mimeType: 'image/svg+xml',
    category: 'background',
    size: 12000,
    uploadedAt: new Date().toISOString(),
    tags: ['background', 'parchment', 'kuno', 'vintage', 'tekstur'],
    width: 800,
    height: 600,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="%23FEF3C7"/>
          <stop offset="60%" stop-color="%23FDE68A"/>
          <stop offset="100%" stop-color="%23D97706"/>
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(%23grad)"/>
      <rect width="800" height="600" fill="%2378350F" opacity="0.08"/>
    </svg>`,
  },
  {
    id: 'asset-bg-dark-slate-constellation',
    name: 'Tekstur Dark Slate Twilight HistoLab',
    type: 'svg',
    mimeType: 'image/svg+xml',
    category: 'background',
    size: 14000,
    uploadedAt: new Date().toISOString(),
    tags: ['background', 'dark', 'twilight', 'modern'],
    width: 800,
    height: 600,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="%230F172A"/>
      <circle cx="200" cy="150" r="2" fill="%2338BDF8" opacity="0.6"/>
      <circle cx="600" cy="100" r="3" fill="%23F59E0B" opacity="0.8"/>
      <circle cx="400" cy="450" r="2" fill="%23E2E8F0" opacity="0.5"/>
      <circle cx="700" cy="500" r="2" fill="%2338BDF8" opacity="0.7"/>
    </svg>`,
  },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function getAllAssets(): Promise<Asset[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const items: Asset[] = request.result || [];
        if (items.length === 0) {
          // Seed initial default assets
          seedDefaultAssets().then((seeded) => resolve(seeded));
        } else {
          resolve(items);
        }
      };
      request.onerror = () => resolve(DEFAULT_PRESET_ASSETS);
    });
  } catch (e) {
    // Fallback to LocalStorage or Default Presets
    const local = localStorage.getItem('histolab_asset_library_v1');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (err) {
        return DEFAULT_PRESET_ASSETS;
      }
    }
    return DEFAULT_PRESET_ASSETS;
  }
}

async function seedDefaultAssets(): Promise<Asset[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const asset of DEFAULT_PRESET_ASSETS) {
      store.put(asset);
    }
  } catch (e) {
    localStorage.setItem('histolab_asset_library_v1', JSON.stringify(DEFAULT_PRESET_ASSETS));
  }
  return DEFAULT_PRESET_ASSETS;
}

export async function saveAsset(asset: Omit<Asset, 'id' | 'uploadedAt'> & { id?: string }): Promise<Asset> {
  const newAsset: Asset = {
    id: asset.id || `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: asset.name || 'Asset Baru',
    type: asset.type || 'image',
    mimeType: asset.mimeType || 'image/png',
    dataUrl: asset.dataUrl,
    thumbnailUrl: asset.thumbnailUrl || asset.dataUrl,
    size: asset.size || asset.dataUrl.length,
    uploadedAt: new Date().toISOString(),
    tags: asset.tags || ['sejarah'],
    category: asset.category || 'history',
    width: asset.width,
    height: asset.height,
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(newAsset);
  } catch (e) {
    const current = await getAllAssets();
    const updated = [newAsset, ...current];
    try {
      localStorage.setItem('histolab_asset_library_v1', JSON.stringify(updated.slice(0, 30)));
    } catch (err) {
      console.warn('LocalStorage full for assets');
    }
  }

  // Dispatch custom event for app reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('histolab_assets_updated', { detail: newAsset }));
  }

  return newAsset;
}

export async function deleteAsset(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (e) {
    const current = await getAllAssets();
    const updated = current.filter((a) => a.id !== id);
    localStorage.setItem('histolab_asset_library_v1', JSON.stringify(updated));
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('histolab_assets_updated'));
  }
  return true;
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const all = await getAllAssets();
  return all.find((a) => a.id === id) || null;
}

// Convert HTML File to Base64 Data URL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
