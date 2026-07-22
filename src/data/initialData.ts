import { ClassItem, Material, CalendarEvent, ReminderNote } from '../types';

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'class-x-a',
    name: 'Kelas X - A',
    subject: 'Sejarah Indonesia',
    grade: 'X',
    scheduleDay: 'Rabu',
    scheduleTimeStart: '07:30',
    scheduleTimeEnd: '09:00',
    teachingHours: 3,
    students: [
      { id: 'std-1', nis: '26001', name: 'Ahmad Fauzi', notes: 'Sangat aktif dalam diskusi kelas' },
      { id: 'std-2', nis: '26002', name: 'Budi Santoso', notes: 'Tertarik pada sejarah kerajaan Nusantara' },
      { id: 'std-3', nis: '26003', name: 'Dewi Lestari', notes: 'Sering membuat rangkuman kreatif' },
      { id: 'std-4', nis: '26004', name: 'Eko Prasetyo', notes: 'Perlu bimbingan ekstra untuk materi tertulis' },
      { id: 'std-5', nis: '26005', name: 'Fitri Handayani', notes: 'Rajin mengumpulkan tugas tepat waktu' },
      { id: 'std-6', nis: '26006', name: 'Hendra Wijaya', notes: 'Kritis menanyakan analisis sejarah' },
      { id: 'std-7', nis: '26007', name: 'Indah Permatasari', notes: 'Fokus pada sejarah budaya' },
      { id: 'std-8', nis: '26008', name: 'Joko Widodo (Siswa)', notes: 'Pandai berkolaborasi dalam kelompok' },
      { id: 'std-9', nis: '26009', name: 'Kartika Sari', notes: 'Suka membaca buku referensi tambahan' },
      { id: 'std-10', nis: '26010', name: 'Lukman Hakim', notes: 'Sering absen sakit, perlu pantauan khusus' }
    ],
    meetings: [
      {
        id: 'meet-1',
        date: '2026-07-13',
        topic: 'Kontrak Belajar & Pengantar Ilmu Sejarah',
        attendance: {
          'std-1': 'Hadir', 'std-2': 'Hadir', 'std-3': 'Hadir', 'std-4': 'Hadir', 'std-5': 'Hadir',
          'std-6': 'Hadir', 'std-7': 'Hadir', 'std-8': 'Hadir', 'std-9': 'Hadir', 'std-10': 'Sakit'
        }
      },
      {
        id: 'meet-2',
        date: '2026-07-15',
        topic: 'Konsep Berpikir Diakronis & Sinkronis',
        attendance: {
          'std-1': 'Hadir', 'std-2': 'Hadir', 'std-3': 'Hadir', 'std-4': 'Izin', 'std-5': 'Hadir',
          'std-6': 'Hadir', 'std-7': 'Hadir', 'std-8': 'Hadir', 'std-9': 'Hadir', 'std-10': 'Hadir'
        }
      },
      {
        id: 'meet-3',
        date: '2026-07-17',
        topic: 'Jenis-Jenis Sumber Sejarah',
        attendance: {
          'std-1': 'Hadir', 'std-2': 'Hadir', 'std-3': 'Hadir', 'std-4': 'Hadir', 'std-5': 'Hadir',
          'std-6': 'Hadir', 'std-7': 'Hadir', 'std-8': 'Alpa', 'std-9': 'Hadir', 'std-10': 'Hadir'
        }
      }
    ],
    gradeItems: [
      { id: 'g-1', name: 'Tugas 1: Konsep Diakronis', weight: 20 },
      { id: 'g-2', name: 'UH 1: Pengantar Sejarah', weight: 30 },
      { id: 'g-3', name: 'Tugas 2: Sumber Sejarah', weight: 20 },
      { id: 'g-4', name: 'Projek Timeline (UTS)', weight: 30 }
    ],
    grades: {
      'std-1': { 'g-1': 85, 'g-2': 88, 'g-3': 90, 'g-4': 92 },
      'std-2': { 'g-1': 80, 'g-2': 82, 'g-3': 85, 'g-4': 80 },
      'std-3': { 'g-1': 95, 'g-2': 94, 'g-3': 92, 'g-4': 96 },
      'std-4': { 'g-1': 70, 'g-2': 75, 'g-3': 70, 'g-4': 78 },
      'std-5': { 'g-1': 90, 'g-2': 85, 'g-3': 88, 'g-4': 85 },
      'std-6': { 'g-1': 88, 'g-2': 90, 'g-3': 85, 'g-4': 90 },
      'std-7': { 'g-1': 82, 'g-2': 80, 'g-3': 84, 'g-4': 85 },
      'std-8': { 'g-1': 75, 'g-2': 78, 'g-3': 80, 'g-4': 82 },
      'std-9': { 'g-1': 92, 'g-2': 90, 'g-3': 94, 'g-4': 95 },
      'std-10': { 'g-1': 65, 'g-2': 70, 'g-3': 60, 'g-4': 72 }
    }
  },
  {
    id: 'class-xi-ips',
    name: 'Kelas XI - IPS 1',
    subject: 'Sejarah Dunia (Peminatan)',
    grade: 'XI',
    scheduleDay: 'Kamis',
    scheduleTimeStart: '09:15',
    scheduleTimeEnd: '10:45',
    teachingHours: 2,
    students: [
      { id: 'std-201', nis: '25001', name: 'Ade Irma', notes: 'Menyukai topik sejarah revolusi' },
      { id: 'std-202', nis: '25002', name: 'Bambang Pamungkas', notes: 'Fokus olahragawan, perlu didorong dalam materi teoretis' },
      { id: 'std-203', nis: '25003', name: 'Citra Kirana', notes: 'Sangat rapi dalam pengerjaan infografis' },
      { id: 'std-204', nis: '25004', name: 'Dian Sastro', notes: 'Bagus dalam melakukan presentasi visual' },
      { id: 'std-205', nis: '25005', name: 'Fedi Nuril', notes: 'Tenang, selalu mendengarkan dengan baik' },
      { id: 'std-206', nis: '25006', name: 'Gita Gutawa', notes: 'Kreatif, senang membuat ringkasan audio-visual' },
      { id: 'std-207', nis: '25007', name: 'Irfan Bachdim', notes: 'Semangat tinggi saat tugas kelompok' },
      { id: 'std-208', nis: '25008', name: 'Maudy Ayunda', notes: 'Kemampuan akademis sangat tinggi di seluruh materi' }
    ],
    meetings: [
      {
        id: 'meet-11',
        date: '2026-07-14',
        topic: 'Latar Belakang Abad Pencerahan (Aufklärung)',
        attendance: {
          'std-201': 'Hadir', 'std-202': 'Hadir', 'std-203': 'Hadir', 'std-204': 'Hadir',
          'std-205': 'Hadir', 'std-206': 'Hadir', 'std-207': 'Izin', 'std-208': 'Hadir'
        }
      },
      {
        id: 'meet-12',
        date: '2026-07-16',
        topic: 'Revolusi Industri Inggris dan Dampak Sosialnya',
        attendance: {
          'std-201': 'Hadir', 'std-202': 'Hadir', 'std-203': 'Hadir', 'std-204': 'Hadir',
          'std-205': 'Hadir', 'std-206': 'Hadir', 'std-207': 'Hadir', 'std-208': 'Hadir'
        }
      }
    ],
    gradeItems: [
      { id: 'g-21', name: 'Tugas 1: Peta Dampak Merkantilisme', weight: 40 },
      { id: 'g-22', name: 'Kuis 1: Revolusi Industri', weight: 60 }
    ],
    grades: {
      'std-201': { 'g-21': 80, 'g-22': 85 },
      'std-202': { 'g-21': 70, 'g-22': 72 },
      'std-203': { 'g-21': 92, 'g-22': 88 },
      'std-204': { 'g-21': 95, 'g-22': 90 },
      'std-205': { 'g-21': 82, 'g-22': 80 },
      'std-206': { 'g-21': 88, 'g-22': 85 },
      'std-207': { 'g-21': 75, 'g-22': 78 },
      'std-208': { 'g-21': 98, 'g-22': 96 }
    }
  },
  {
    id: 'class-xii-ipa',
    name: 'Kelas XII - MIPA 3',
    subject: 'Sejarah Indonesia Kontemporer',
    grade: 'XII',
    scheduleDay: 'Rabu',
    scheduleTimeStart: '10:00',
    scheduleTimeEnd: '11:30',
    teachingHours: 3,
    students: [
      { id: 'std-301', nis: '24001', name: 'Agus Salim', notes: 'Sangat berminat pada diplomasi awal RI' },
      { id: 'std-302', nis: '24002', name: 'Chairil Anwar', notes: 'Kemampuan menulis narasi sejarah sangat puitis' },
      { id: 'std-303', nis: '24003', name: 'Fatmawati', notes: 'Penyusun dokumentasi kelompok yang andal' },
      { id: 'std-304', nis: '24004', name: 'Mohammad Hatta', notes: 'Sangat kritis dalam analisis ekonomi sejarah' },
      { id: 'std-305', nis: '24005', name: 'Sutan Sjahrir', notes: 'Pemimpin alami saat kerja kelompok' }
    ],
    meetings: [
      {
        id: 'meet-21',
        date: '2026-07-15',
        topic: 'Perjuangan Mempertahankan Kemerdekaan (Diplomasi vs Konfrontasi)',
        attendance: {
          'std-301': 'Hadir', 'std-302': 'Hadir', 'std-303': 'Hadir', 'std-304': 'Hadir', 'std-305': 'Hadir'
        }
      }
    ],
    gradeItems: [
      { id: 'g-31', name: 'Analisis Perjanjian Linggarjati', weight: 100 }
    ],
    grades: {
      'std-301': { 'g-31': 85 },
      'std-302': { 'g-31': 90 },
      'std-303': { 'g-31': 88 },
      'std-304': { 'g-31': 95 },
      'std-305': { 'g-31': 92 }
    }
  }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    classId: 'class-x-a',
    bab: 'BAB I',
    title: 'Pengantar Ilmu Sejarah',
    subtitle: 'Menyingkap Konsep Dasar Manusia, Ruang, dan Waktu',
    content: 'Sejarah bukanlah sekadar urutan angka tahun yang harus dihafal. Sejarah adalah sebuah ilmu rekonstruksi tentang aktivitas manusia di masa lalu, yang diikat oleh dimensi ruang dan waktu, serta berfungsi sebagai panduan berharga untuk masa kini dan masa depan.',
    sections: [
      {
        id: 'sec-1-1',
        title: '1. Manusia, Ruang, dan Waktu sebagai Pilar Sejarah',
        body: 'Manusia adalah aktor atau pelaku utama dalam setiap drama sejarah. Ruang (spasial) adalah panggung tempat terjadinya peristiwa tersebut, sedangkan Waktu (temporal) memberikan batasan dinamis kapan peristiwa itu berlangsung. Tanpa salah satu pilar ini, sebuah narasi sejarah tidak akan pernah utuh.'
      },
      {
        id: 'sec-1-2',
        title: '2. Cara Berpikir Sejarah: Sinkronis vs Diakronis',
        body: 'Cara berpikir Diakronis (kronologis) mengajak kita melintasi waktu secara linier. Fokus utamanya adalah dinamika perkembangan, perubahan, dan keberlanjutan sebuah peristiwa sepanjang waktu. Sebaliknya, cara berpikir Sinkronis menganalisis peristiwa pada suatu masa tertentu dengan sangat mendalam dari berbagai sudut pandang (sosial, ekonomi, politik), seolah-olah menghentikan waktu sejenak untuk meneliti struktur di dalamnya.'
      },
      {
        id: 'sec-1-3',
        title: '3. Jenis dan Validitas Sumber Sejarah',
        body: 'Sejarah dibangun di atas dasar bukti, bukan mitos. Sumber sejarah terbagi menjadi Sumber Primer (catatan langsung dari saksi mata, prasasti, dokumen arsip sezaman) dan Sumber Sekunder (analisis sejarawan, buku teks, hasil rekonstruksi). Guru sejarah harus melatih siswa untuk melakukan kritik intern (menilai kredibilitas isi) dan kritik ekstern (menilai keaslian fisik sumber).'
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=800',
    imageCaption: 'Ilustrasi arsip kuno dan alat tulis sejarah sebagai bukti autentisitas peristiwa masa lampau.',
    timeline: [
      { id: 'te-1-1', year: 'Abad ke-5 SM', title: 'Herodotus Merintis Penulisan Sejarah', description: 'Herodotus menulis karya monumental "Histories" tentang Perang Persia, memperkenalkan metode investigasi empiris pertama di dunia.' },
      { id: 'te-1-2', year: 'Abad ke-14 M', title: 'Ibn Khaldun Menulis Muqaddimah', description: 'Ibn Khaldun meletakkan fondasi sosiologi sejarah dan menganalisis siklus jatuh bangunnya peradaban.' },
      { id: 'te-1-3', year: '1929 M', title: 'Lahirnya Mazhab Annales di Prancis', description: 'Lucien Febvre dan Marc Bloch menggeser fokus sejarah dari sekadar politik raja-raja ke sejarah sosial-ekonomi jangka panjang (longue durée).' }
    ],
    maps: [
      { 
        id: 'map-1-1', 
        name: 'Wilayah Kajian Sejarah Maritim Nusantara', 
        description: 'Peta rute perdagangan kuno Selat Malaka, menghubungkan Dinasti Tang/Song di Tiongkok dengan Kekaisaran Romawi dan India kuno.', 
        era: 'Abad ke-7 - 14 M',
        mapStyle: 'maritime',
        showRoute: true,
        pins: [
          {
            id: 'pin-1-1-1',
            label: 'Barus (Pelabuhan Kuno)',
            description: 'Pusat niaga kapur barus kuno bermutu tinggi yang dikunjungi pelaut ulung dari Mesir, Yunani, dan Arab sejak abad ke-5 SM.',
            x: 25.5,
            y: 45.2
          },
          {
            id: 'pin-1-1-2',
            label: 'Selat Malaka (Gerbang Niaga)',
            description: 'Pintu gerbang jalur sutra laut yang dikontrol ketat oleh armada patroli laut Sriwijaya untuk menjamin keamanan kapal-kapal asing.',
            x: 45.8,
            y: 38.6
          },
          {
            id: 'pin-1-1-3',
            label: 'Sriwijaya (Palembang)',
            description: 'Kedatuan besar yang menjadi pusat kekuasaan politik maritim, perdagangan rempah, serta pusat pengajaran bahasa Sanskerta dan Buddha di Asia Tenggara.',
            x: 62.1,
            y: 65.4
          }
        ]
      }
    ]
  },
  {
    id: 'mat-2',
    classId: 'class-x-a',
    bab: 'BAB II',
    title: 'Asal-Usul Nenek Moyang Bangsa Indonesia',
    subtitle: 'Migrasi Manusia Purba dan Teori Asal-Usul Nusantara',
    content: 'Kepulauan Indonesia yang strategis telah menjadi titik temu migrasi berbagai peradaban sejak ratusan ribu tahun lalu. Bab ini mengeksplorasi jejak fosil manusia purba serta rumpun bangsa Proto dan Deutro Melayu.',
    sections: [
      {
        id: 'sec-2-1',
        title: '1. Situs Manusia Purba Sangiran dan Trinil',
        body: 'Jawa merupakan salah satu lokasi terkaya di dunia bagi penemuan fosil hominid. Penemuan Pithecanthropus erectus oleh Eugene Dubois di Trinil membuktikan posisi penting kepulauan Indonesia dalam rantai evolusi manusia purba.'
      },
      {
        id: 'sec-2-2',
        title: '2. Empat Teori Asal-Usul Bangsa Indonesia',
        body: 'Para ahli sejarah dan antropologi mengajukan empat teori utama: Teori Yunnan (migrasi dari Tiongkok Selatan), Teori Nusantara (bangsa Indonesia asli dari kepulauan sendiri), Teori Out of Taiwan (migrasi penutur Austronesia), dan Teori Out of Africa (migrasi manusia modern dari Afrika).'
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800',
    imageCaption: 'Situs arkeologi prasejarah yang melestarikan peninggalan batu dan kehidupan gua.',
    timeline: [
      { id: 'te-2-1', year: '1.8 Juta Tahun Lalu', title: 'Migrasi Awal ke Sangiran', description: 'Homo erectus pertama kali tiba di dataran kering Sangiran dan beradaptasi dengan lingkungan sabana kuno.' },
      { id: 'te-2-2', year: '2000 SM', title: 'Migrasi Rumpun Proto Melayu', description: 'Arus migrasi pembawa kebudayaan Neolitikum (kapak persegi) mulai memasuki Nusantara lewat jalur barat.' },
      { id: 'te-2-3', year: '500 SM', title: 'Migrasi Deutro Melayu & Kebudayaan Dongson', description: 'Perpindahan gelombang kedua membawa teknologi logam perunggu, melahirkan karya seni nekara dan bejana logam.' }
    ],
    maps: [
      { 
        id: 'map-2-1', 
        name: 'Peta Migrasi Austronesia (Out of Taiwan)', 
        description: 'Peta rute penyebaran pelaut ulung penutur bahasa Austronesia dari Taiwan menuju Filipina, Nusantara, hingga Madagaskar dan Pasifik.', 
        era: '3000 - 1500 SM',
        mapStyle: 'vintage',
        showRoute: true,
        pins: [
          {
            id: 'pin-2-1-1',
            label: 'Taiwan (Titik Asal)',
            description: 'Tanah asal leluhur penutur Austronesia sebelum meluncurkan perahu bercadik untuk mengarungi perairan terbuka.',
            x: 52.3,
            y: 22.1
          },
          {
            id: 'pin-2-1-2',
            label: 'Filipina (Lompatan Utama)',
            description: 'Lompatan migrasi pertama, di mana para penjelajah mengembangkan teknik pelayaran maritim tingkat lanjut.',
            x: 54.8,
            y: 43.6
          },
          {
            id: 'pin-2-1-3',
            label: 'Nusantara (Pusat Penyebaran)',
            description: 'Kepulauan subur yang menjadi basis peradaban neolitikum besar, melahirkan kebudayaan bercocok tanam dan pelayaran lokal.',
            x: 42.6,
            y: 68.2
          },
          {
            id: 'pin-2-1-4',
            label: 'Ekspedisi Samudera (Pasifik & Madagaskar)',
            description: 'Penjelajahan terjauh umat manusia dalam sejarah pra-modern, membentang dari Madagaskar di lepas pantai Afrika hingga pulau Paskah di Pasifik.',
            x: 75.1,
            y: 84.5
          }
        ]
      }
    ]
  },
  {
    id: 'mat-3',
    classId: 'class-xi-ips',
    bab: 'BAB I',
    title: 'Abad Pencerahan & Revolusi Industri',
    subtitle: 'Bagaimana Pemikiran Mengubah Roda Industri Dunia',
    content: 'Bab ini membahas jembatan besar peradaban barat dari kegelapan dogma menuju rasionalitas ilmiah, yang akhirnya memicu inovasi mesin uap dan restrukturisasi ekonomi sosial dunia.',
    sections: [
      {
        id: 'sec-3-1',
        title: '1. Sapere Aude: Beranilah Berpikir Sendiri!',
        body: 'Aufklärung (Abad Pencerahan) melahirkan pemikir besar seperti John Locke (hak asasi), Montesquieu (Trias Politica), dan Voltaire. Kebebasan berpikir ini melucuti legitimasi monarki absolut dan membuka keran inovasi ilmiah.'
      },
      {
        id: 'sec-3-2',
        title: '2. James Watt dan Revolusi Industri 1.0',
        body: 'Penyempurnaan mesin uap oleh James Watt pada tahun 1769 menjadi katalis utama perpindahan tenaga manusia/hewan ke kekuatan mesin mekanik. Inggris menjadi pelopor berkat ketersediaan batu bara melimpah dan kolonisasi bahan baku.'
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    imageCaption: 'Ilustrasi mesin industri uap klasik abad ke-18 di Eropa.',
    timeline: [
      { id: 'te-3-1', year: '1689 M', title: 'Glorious Revolution di Inggris', description: 'Terbentuknya monarki konstitusional Inggris yang membatasi kekuasaan raja, membuka stabilitas ekonomi bagi kaum borjuis.' },
      { id: 'te-3-2', year: '1769 M', title: 'Paten Mesin Uap James Watt', description: 'Mesin uap praktis dipatenkan, menandai lompatan efisiensi produksi manufaktur tekstil dan tambang.' },
      { id: 'te-3-3', year: '1789 M', title: 'Revolusi Prancis Meletus', description: 'Runtuhnya absolutisme Raja Louis XVI digantikan tatanan Republik baru, mengubah tata politik seluruh benua Eropa.' }
    ],
    maps: [
      { 
        id: 'map-3-1', 
        name: 'Peta Pusat Industri Inggris Raya', 
        description: 'Konsentrasi industri awal di Manchester, Birmingham, dan Lancashire dekat dengan ladang batu bara utama.', 
        era: 'Abad ke-18 M',
        mapStyle: 'vintage',
        showRoute: true,
        pins: [
          {
            id: 'pin-3-1-1',
            label: 'Birmingham (Workshop Dunia)',
            description: 'Pusat manufaktur logam dan tempat James Watt menyempurnakan mesin uapnya di SoHo Manufactory.',
            x: 45.0,
            y: 58.5
          },
          {
            id: 'pin-3-1-2',
            label: 'Manchester (Cottonopolis)',
            description: 'Ibu kota tekstil dunia yang ditenagai oleh mesin uap bertenaga batu bara dan jaringan kanal air modern.',
            x: 42.5,
            y: 38.2
          },
          {
            id: 'pin-3-1-3',
            label: 'Lancashire (Kanal Batubara)',
            description: 'Lembah tambang batu bara raksasa yang memasok energi murah bagi ribuan pabrik pemintalan kapas di seluruh Inggris.',
            x: 39.8,
            y: 28.6
          }
        ]
      }
    ]
  },
  {
    id: 'mat-4',
    classId: 'class-xii-ipa',
    bab: 'BAB III',
    title: 'Sejarah Pendudukan Jepang di Indonesia',
    subtitle: 'Dinamika Ekspansi Militer, Pendudukan, dan Menuju Kemerdekaan',
    content: 'Materi ini membahas secara kronologis bagaimana kekuasaan militer Jepang berekspansi di Asia, menduduki wilayah Indonesia, hingga keruntuhannya pasca bom atom yang membuka jalan emas bagi Proklamasi Kemerdekaan RI.',
    sections: [
      {
        id: 'sec-4-1',
        title: '1. Latar Belakang Restorasi Meiji dan Militerisme Jepang',
        body: 'Sejak Restorasi Meiji pada akhir abad ke-19, Jepang bertransformasi menjadi kekuatan industri modern yang membutuhkan bahan baku dan pasar baru. Hal ini mendorong lahirnya imperialisme dan militerisme Jepang di kawasan Asia-Pasifik.'
      },
      {
        id: 'sec-4-2',
        title: '2. Kebijakan Pendudukan Jepang di Indonesia',
        body: 'Pendudukan Jepang di Indonesia (1942-1945) ditandai dengan pembentukan pemerintahan militer, eksploitasi romusha, serta mobilisasi militer pemuda (PETA, Heiho) yang nantinya justru menjadi modal perjuangan bersenjata rakyat Indonesia.'
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=800',
    imageCaption: 'Gerbang kuil Tori Jepang, melambangkan identitas spiritual dan nasionalisme yang melandasi ekspansi era Shōwa.',
    timeline: [
      {
        id: 'te-4-1',
        year: '1930',
        title: 'Kebangkitan Fasisme dan Imperialisme Jepang',
        description: 'Jepang memasuki era militerisme radikal akibat Great Depression. Krisis ekonomi memicu invasi ke Manchuria sebagai langkah ekspansi teritorial awal.',
        subMaterials: [
          { id: 'sub-4-1-1', title: 'Invasi Manchuria (1931)', content: 'Jepang merekayasa Insiden Mukden dan mendirikan negara boneka Manchukuo untuk mengamankan cadangan batu bara, besi, dan tanah pertanian.' },
          { id: 'sub-4-1-2', title: 'Pakta Anti-Comintern', content: 'Jepang menandatangani pakta kerja sama militer dengan Jerman Nazi dan Italia Fasis, membentuk poros kekuatan Axis.' }
        ]
      },
      {
        id: 'te-4-2',
        year: '1942',
        title: 'Invasi Hindia Belanda dan Penyerahan Kalijati',
        description: 'Militer Jepang merebut wilayah pertahanan Belanda di Indonesia dengan cepat. Perjanjian Kalijati ditandatangani, memulai era pendudukan 3,5 tahun.',
        subMaterials: [
          { id: 'sub-4-2-1', title: 'Pendaratan Pasukan Gurita Jepang', content: 'Pasukan Angkatan Darat ke-16 Jepang mendarat serentak di Tarakan, Balikpapan, Banten, Eretan Wetan, dan Kragan.' },
          { id: 'sub-4-2-2', title: 'Kapitulasi Kalijati (8 Maret 1942)', content: 'Letnan Jenderal Ter Poorten menyerah tanpa syarat kepada Letnan Jenderal Hitoshi Imamura di Lanud Kalijati, Subang.' },
          { id: 'sub-4-2-3', title: 'Propaganda Gerakan 3A', content: 'Slogan "Jepang Pelindung Asia, Jepang Pemimpin Asia, Jepang Cahaya Asia" digencarkan untuk menarik simpati tokoh nasionalis.' }
        ]
      },
      {
        id: 'te-4-3',
        year: '1945',
        title: 'Pembentukan BPUPKI & Janji Kemerdekaan',
        description: 'Akibat posisi militer yang semakin terdesak oleh pasukan Sekutu, Jepang memberikan janji kemerdekaan di kemudian hari untuk menjaga stabilitas di Indonesia.',
        subMaterials: [
          { id: 'sub-4-3-1', title: 'Pidato Perdana Menteri Koiso', content: 'Janji kemerdekaan diberikan di depan parlemen Tokyo untuk membendung simpati rakyat Indonesia terhadap pendaratan Sekutu.' },
          { id: 'sub-4-3-2', title: 'BPUPKI Didirikan (1 Maret 1945)', content: 'Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia dibentuk di bawah kepemimpinan Dr. Radjiman Wedyodiningrat untuk menyusun konstitusi.' }
        ]
      },
      {
        id: 'te-4-4',
        year: 'Hirosima',
        title: 'Tragedi Bom Atom Hiroshima & Nagasaki',
        description: 'Kota Hiroshima dibom atom oleh Sekutu pada 6 Agustus 1945, disusul Nagasaki pada 9 Agustus, melumpuhkan seluruh rantai komando militer Jepang.',
        subMaterials: [
          { id: 'sub-4-4-1', title: 'Pesawat Enola Gay (6 Agustus 1945)', content: 'Bom atom uranium bernama "Little Boy" dijatuhkan di Hiroshima, menewaskan lebih dari 140.000 jiwa seketika.' },
          { id: 'sub-4-4-2', title: 'Kehancuran Nagasaki (9 Agustus 1945)', content: 'Bom atom plutonium "Fat Man" meluluhlantakkan kota Nagasaki, memaksa Kaisar Hirohito menyadari kekalahan mutlak.' }
        ]
      },
      {
        id: 'te-4-5',
        year: 'Akhir',
        title: 'Penyerahan Jepang Tanpa Syarat & Proklamasi RI',
        description: 'Jepang menyerah tanpa syarat kepada Sekutu pada 15 Agustus 1945. Vakum kekuasaan (vacuum of power) ini dimanfaatkan pejuang Indonesia untuk memproklamasikan kemerdekaan.',
        subMaterials: [
          { id: 'sub-4-5-1', title: 'Peristiwa Rengasdengklok', content: 'Golongan muda menculik Soekarno dan Hatta ke Rengasdengklok untuk mendesak Proklamasi segera dibacakan tanpa menunggu restu PPKI.' },
          { id: 'sub-4-5-2', title: 'Naskah Proklamasi Dirumuskan', content: 'Naskah Proklamasi disusun di kediaman Laksamana Tadashi Maeda di Jakarta oleh Soekarno, Hatta, dan Ahmad Soebardjo.' },
          { id: 'sub-4-5-3', title: 'Hari Proklamasi (17 Agustus 1945)', content: 'Teks proklamasi dibacakan di Jalan Pegangsaan Timur No. 56, Jakarta, menandai lahirnya Negara Kesatuan Republik Indonesia.' }
        ]
      }
    ],
    maps: [
      { 
        id: 'map-4-1', 
        name: 'Peta Jalur Ekspansi Militer Jepang di Asia', 
        description: 'Menunjukkan rute pergerakan pasukan Kekaisaran Jepang dari Manchuria, daratan Tiongkok, hingga menguasai seluruh Asia Tenggara termasuk Hindia Belanda.', 
        era: '1937 - 1942 M',
        mapStyle: 'tactical',
        showRoute: true,
        pins: [
          {
            id: 'pin-4-1-1',
            label: 'Manchuria (Konsolidasi Militer)',
            description: 'Titik awal agresi Jepang di daratan Asia Timur melalui pendirian negara boneka Manchukuo sebagai sumber mineral industri militer.',
            x: 58.2,
            y: 18.5
          },
          {
            id: 'pin-4-1-2',
            label: 'Pearl Harbor (Serangan Kejutan)',
            description: 'Serangan udara mendadak armada kapal induk pimpinan Laksamana Nagumo, menghancurkan kekuatan laut utama Sekutu di Pasifik.',
            x: 82.5,
            y: 42.1
          },
          {
            id: 'pin-4-1-3',
            label: 'Semenanjung Malaya (Singapura Jatuh)',
            description: 'Gerakan cepat infanteri sepeda militer Jepang menembus pertahanan hutan Malaya, memaksa pangkalan laut terbesar Inggris menyerah tanpa syarat.',
            x: 32.1,
            y: 60.5
          },
          {
            id: 'pin-4-1-4',
            label: 'Hindia Belanda (Kalijati Jawa)',
            description: 'Pendaratan serentak militer Jepang di Pulau Jawa yang memaksa Panglima Tentara Sekutu, Jenderal ter Poorten, menyerah di Kalijati.',
            x: 35.8,
            y: 80.4
          }
        ]
      }
    ]
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    date: '2026-07-20',
    timeStart: '07:30',
    timeEnd: '09:00',
    className: 'Kelas X - A',
    topic: 'Sejarah Indonesia: Masa Praaksara di Nusantara'
  },
  {
    id: 'cal-2',
    date: '2026-07-21',
    timeStart: '09:15',
    timeEnd: '10:45',
    className: 'Kelas XI - IPS 1',
    topic: 'Sejarah Dunia: Merkantilisme & Lahirnya Kolonialisme'
  },
  {
    id: 'cal-3',
    date: '2026-07-22',
    timeStart: '07:30',
    timeEnd: '09:00',
    className: 'Kelas XII - MIPA 3',
    topic: 'Sejarah Kontemporer: Dampak Agresi Militer Belanda'
  },
  {
    id: 'cal-4',
    date: '2026-07-22',
    timeStart: '10:00',
    timeEnd: '11:30',
    className: 'Kelas X - A',
    topic: 'Sejarah Indonesia: Evaluasi Pemahaman Sumber Sejarah'
  },
  {
    id: 'cal-5',
    date: '2026-07-23',
    timeStart: '08:00',
    timeEnd: '09:30',
    className: 'Kelas XI - IPS 1',
    topic: 'Sejarah Dunia: Revolusi Amerika & Kemerdekaan 13 Koloni'
  }
];

export const INITIAL_REMINDERS: ReminderNote[] = [
  {
    id: 'rem-1',
    text: 'Siapkan materi presentasi Peta Rute Austronesia (out of Taiwan) untuk Kelas X-A.',
    isDone: false,
    category: 'lesson_plan',
    createdAt: '2026-07-15'
  },
  {
    id: 'rem-2',
    text: 'Koreksi tugas esai "Dampak Sosial Revolusi Industri" dari Kelas XI-IPS 1.',
    isDone: false,
    category: 'grading',
    createdAt: '2026-07-16'
  },
  {
    id: 'rem-3',
    text: 'Siswa Joko Widodo (Kelas X-A) belum mengumpulkan projek UTS, hubungi wali kelas.',
    isDone: false,
    category: 'reminder',
    createdAt: '2026-07-17'
  },
  {
    id: 'rem-4',
    text: 'Sejarah Trivia Hari Ini: Proklamasi 1945 dibacakan pada hari Jumat tanggal 9 Ramadhan 1364 H.',
    isDone: true,
    category: 'trivia',
    createdAt: '2026-07-17'
  }
];
