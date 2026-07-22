import { Material, StoryScene, HistoricalMap, TimelineEvent, ClassItem } from '../types';

export interface ExplanationLevel {
  level: 'singkat' | 'normal' | 'mendalam';
}

export interface ContextEngineInput {
  activeClass?: ClassItem | null;
  activeMaterial?: Material | null;
  activeSlide?: StoryScene | null;
  activeSlideIndex?: number;
  activeMap?: HistoricalMap | null;
  activeTimeline?: TimelineEvent[] | null;
  explanationLevel?: 'singkat' | 'normal' | 'mendalam';
  isTeacherMode?: boolean;
}

export function buildClassroomContextPrompt(input: ContextEngineInput): string {
  const {
    activeClass,
    activeMaterial,
    activeSlide,
    activeSlideIndex = 0,
    activeMap,
    activeTimeline,
    explanationLevel = 'normal',
    isTeacherMode = false,
  } = input;

  let prompt = `=== KONTEKS PEMBELAJARAN AI CLASSROOM ASSISTANT ===\n\n`;

  // LEVEL 1: MATERI GURU HISTOLAB (PRIORITAS TERTINGGI)
  prompt += `--- LEVEL 1: MATERI GURU (PRIORITAS TERTINGGI) ---\n`;
  if (activeMaterial) {
    prompt += `Bab/Materi: BAB ${activeMaterial.bab} - ${activeMaterial.title}\n`;
    prompt += `Subjudul/Pengantar: ${activeMaterial.subtitle || '-'}\n`;
    prompt += `Ringkasan Materi Guru:\n${activeMaterial.content}\n`;
    if (activeMaterial.sections && activeMaterial.sections.length > 0) {
      prompt += `Bagian-bagian Materi Guru:\n`;
      activeMaterial.sections.forEach((sec, idx) => {
        prompt += `  ${idx + 1}. [${sec.title}]: ${sec.body}\n`;
      });
    }
  } else {
    prompt += `Materi Spesifik: Belum dipilih (Gunakan pengetahuan umum Sejarah Indonesia sesuai pertanyaan).\n`;
  }

  if (activeClass) {
    prompt += `Kelas Aktif: ${activeClass.name} | Mata Pelajaran: ${activeClass.subject || 'Sejarah Indonesia'}\n`;
  }

  // LEVEL 2: SLIDE PRESENTASI AKTIF
  prompt += `\n--- LEVEL 2: SLIDE PRESENTASI AKTIF ---\n`;
  if (activeSlide) {
    prompt += `Slide Ke-${activeSlideIndex + 1}: ${activeSlide.title} (Tipe: ${activeSlide.type})\n`;
    if (activeSlide.narration) {
      prompt += `Teks Narasi Slide: "${activeSlide.narration}"\n`;
    }
    if (activeSlide.mediaItems && activeSlide.mediaItems.length > 0) {
      prompt += `Elemen-elemen Visual di Slide:\n`;
      activeSlide.mediaItems.forEach((item, idx) => {
        prompt += `  - [${item.type}] ${item.label ? `${item.label}: ` : ''}${item.content}\n`;
      });
    }
  } else {
    prompt += `Slide Presentasi: Tidak ada slide aktif.\n`;
  }

  // LEVEL 3: TIMELINE SEJARAH AKTIF
  prompt += `\n--- LEVEL 3: GARIS WAKTU / TIMELINE AKTIF ---\n`;
  const timelineToUse = activeTimeline || activeMaterial?.timeline;
  if (timelineToUse && timelineToUse.length > 0) {
    prompt += `Peristiwa dalam Garis Waktu:\n`;
    timelineToUse.forEach((evt) => {
      prompt += `  - [Tahun ${evt.year}] ${evt.title}: ${evt.description}\n`;
      if (evt.subMaterials && evt.subMaterials.length > 0) {
        evt.subMaterials.forEach((sub) => {
          prompt += `      * ${sub.title}: ${sub.content}\n`;
        });
      }
    });
  } else {
    prompt += `Timeline: Belum ada timeline spesifik yang dimuat.\n`;
  }

  // LEVEL 4: INTERACTIVE MAP / PETA SEJARAH
  prompt += `\n--- LEVEL 4: PETA SEJARAH INTERAKTIF ---\n`;
  const mapToUse = activeMap || activeMaterial?.maps?.[0];
  if (mapToUse) {
    prompt += `Nama Peta: ${mapToUse.name} (${mapToUse.era})\n`;
    prompt += `Deskripsi Peta: ${mapToUse.description}\n`;
    if (mapToUse.pins && mapToUse.pins.length > 0) {
      prompt += `Pin/Titik Lokasi Peta:\n`;
      mapToUse.pins.forEach((pin) => {
        prompt += `  - Lokasi: ${pin.label} | Keterangan: ${pin.description || '-'}\n`;
        if (pin.keyFacts && pin.keyFacts.length > 0) {
          prompt += `    Fakta Kunci: ${pin.keyFacts.join(', ')}\n`;
        }
      });
    }
  } else {
    prompt += `Peta Interaktif: Tidak ada peta aktif.\n`;
  }

  // LEVEL 5: PENGETAHUAN UMUM AI (FALLBACK)
  prompt += `\n--- LEVEL 5: PENGETAHUAN UMUM AI (FALLBACK) ---\n`;
  prompt += `Gunakan pengetahuan sejarah umum HANYA jika informasi tidak ditemukan pada Level 1-4 di atas, dan SELALU pastikan relevan dengan materi guru.\n`;

  // TINGKAT PENJELASAN & MODE GURU
  prompt += `\n--- ATURAN PENJELASAN & MODE --- \n`;
  prompt += `Tingkat Penjelasan: ${explanationLevel.toUpperCase()}\n`;
  if (explanationLevel === 'singkat') {
    prompt += `- Berikan jawaban lisan 1-2 kalimat ringkas, padat, dan langsung ke inti pembahasan.\n`;
  } else if (explanationLevel === 'mendalam') {
    prompt += `- Berikan penjelasan komprehensif, urutan kronologis, sebab-akibat, serta relevansi historisnya.\n`;
  } else {
    prompt += `- Berikan penjelasan normal (2-3 kalimat seimbang), edukatif, dan mudah dipahami siswa SMA.\n`;
  }

  if (isTeacherMode) {
    prompt += `MODE GURU: AKTIF\n`;
    prompt += `- Berikan tips internal untuk Guru: sertakan ide pertanyaan pemantik (HOTS), miskonsepsi siswa yang perlu diluruskan, atau poin penekanan utama.\n`;
  } else {
    prompt += `MODE GURU: NON-AKTIF (Penjelasan ditujukan langsung untuk interaksi siswa di kelas).\n`;
  }

  return prompt;
}
