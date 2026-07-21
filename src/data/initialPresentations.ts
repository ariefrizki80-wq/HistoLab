import { Presentation } from '../types';

export const PRESENTATION_TEMPLATES: Omit<Presentation, 'id' | 'createdAt'>[] = [
  {
    title: 'Kedatangan Bangsa Barat ke Nusantara',
    description: 'Eksplorasi jalur pelayaran samudra rempah-rempah abad ke-16 hingga berdirinya kongsi dagang VOC.',
    theme: 'parchment',
    scenes: [
      {
        id: 'scene-tmpl-1-1',
        type: 'cover',
        title: 'Ekspedisi Rempah Nusantara',
        narration: 'Petualangan mengarungi samudera demi menemukan kepulauan emas hijau di Kepulauan Banda.',
        backgroundType: 'parchment',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'm-tmpl-1-1-1',
            type: 'quote',
            content: '"Gold, Glory, and Gospel: Tiga pilar utama penjelajahan samudera bangsa Barat."',
            x: 10,
            y: 75,
            w: 80,
            h: 15,
            fontSize: 16,
            textColor: '#d97706'
          }
        ]
      },
      {
        id: 'scene-tmpl-1-2',
        type: 'narrative',
        title: 'Jatuhnya Konstantinopel 1453',
        narration: 'Penaklukan Konstantinopel oleh Kekaisaran Turki Utsmani memotong jalur suplai rempah Eropa, memaksa raja-raja Barat membiayai ekspedisi maritim berisiko tinggi melintasi lautan tidak dikenal.',
        backgroundType: 'dark_slate',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'm-tmpl-1-2-1',
            type: 'image',
            content: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=800',
            x: 60,
            y: 15,
            w: 35,
            h: 60,
            label: 'Lukisan Peta Navigasi Kuno Eropa'
          }
        ]
      },
      {
        id: 'scene-tmpl-1-3',
        type: 'map',
        title: 'Jalur Ekspedisi Portugis & Belanda',
        narration: 'Mengikuti rute pelayaran Bartholomeus Diaz, Vasco da Gama, hingga Cornelis de Houtman tiba di Banten 1596.',
        backgroundType: 'dark_slate',
        backgroundValue: '',
        activeMapId: 'tmpl-map-voc',
        activeMapStepIndex: 0
      },
      {
        id: 'scene-tmpl-1-4',
        type: 'timeline',
        title: 'Kronologi Hegemoni Kolonial',
        narration: 'Dari pendaratan pertama hingga monopoli perdagangan cengkeh dan pala di Maluku.',
        backgroundType: 'parchment',
        backgroundValue: ''
      },
      {
        id: 'scene-tmpl-1-5',
        type: 'quiz',
        title: 'Siapakah navigator Belanda pertama yang memimpin armada kapal tiba di Pelabuhan Banten pada tahun 1596?',
        narration: 'Kuis pemahaman awal siswa.',
        backgroundType: 'gradient',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'm-tmpl-1-5-1',
            type: 'text',
            content: 'A. Cornelis de Houtman\nB. Vasco da Gama\nC. Alfonso de Albuquerque\nD. Jan Carstenszoon',
            x: 10,
            y: 35,
            w: 80,
            h: 30
          },
          {
            id: 'm-tmpl-1-5-2',
            type: 'quote',
            content: 'Cornelis de Houtman memimpin ekspedisi pertama Belanda yang mendarat di Banten pada Juni 1596, meskipun awalnya disambut baik, ketegangan segera terjadi karena sikap kasar awak kapalnya.',
            x: 10,
            y: 70,
            w: 80,
            h: 20
          }
        ]
      },
      {
        id: 'scene-tmpl-1-6',
        type: 'reflection',
        title: 'Etika Perdagangan & Eksploitasi',
        narration: 'Bagaimana monopoli dagang VOC mengubah struktur sosial masyarakat pesisir Nusantara? Apakah efek ekonomi tersebut masih menyisakan warisan budaya hingga hari ini?',
        backgroundType: 'parchment',
        backgroundValue: '',
        mediaItems: []
      }
    ],
    timeline: [
      { id: 't-tmpl-1', year: '1511 M', title: 'Portugis Merebut Malaka', description: 'Dipimpin Afonso de Albuquerque, armada Portugis menaklukkan kota pelabuhan strategis Selat Malaka.' },
      { id: 't-tmpl-2', year: '1596 M', title: 'Belanda Tiba di Banten', description: 'Cornelis de Houtman membawa 4 kapal dagang pertama Belanda berlabuh di Kesultanan Banten.' },
      { id: 't-tmpl-3', year: '1602 M', title: 'Pembentukan VOC', description: 'Serikat dagang Hindia Timur Belanda (VOC) didirikan dengan hak istimewa (Octrooi) dari pemerintah Belanda.' },
      { id: 't-tmpl-4', year: '1619 M', title: 'Jan Pieterszoon Coen Merebut Jayakarta', description: 'VOC meruntuhkan Jayakarta dan mendirikan Batavia sebagai markas pusat administrasi perdagangan se-Asia.' }
    ],
    maps: [
      {
        id: 'tmpl-map-voc',
        name: 'Rute Pelayaran Rempah Nusantara',
        description: 'Jalur pelayaran mengitari Tanjung Harapan di Afrika Selatan menuju pelabuhan Banten dan Kepulauan Maluku.',
        era: 'Abad ke-16 - 17 M',
        mapStyle: 'maritime',
        showRoute: true,
        pins: [
          {
            id: 'p-voc-1',
            label: 'Lisbon / Amsterdam',
            description: 'Pelabuhan keberangkatan armada penjelajah maritim Eropa dengan perbekalan melimpah.',
            x: 15,
            y: 20,
            lat: 52.3702,
            lng: 4.8952
          },
          {
            id: 'p-voc-2',
            label: 'Tanjung Harapan',
            description: 'Titik perhentian krusial di ujung selatan Afrika untuk mengisi air bersih dan memulihkan kondisi kesehatan kru.',
            x: 35,
            y: 65,
            lat: -34.3568,
            lng: 18.4740
          },
          {
            id: 'p-voc-3',
            label: 'Pelabuhan Banten',
            description: 'Pusat niaga lada internasional di mana Cornelis de Houtman mendaratkan sauh kapalnya pada 1596.',
            x: 65,
            y: 45,
            lat: -6.0125,
            lng: 106.1503
          },
          {
            id: 'p-voc-4',
            label: 'Kepulauan Banda',
            description: 'Satu-satunya tempat di dunia pada masa itu yang menghasilkan pala berkualitas tinggi, bernilai setara emas murni.',
            x: 85,
            y: 50,
            lat: -4.5167,
            lng: 129.9000
          }
        ]
      }
    ]
  },
  {
    title: 'Revolusi Prancis: Liberty, Equality, Fraternity',
    description: 'Analisis mendalam keruntuhan monarki absolut Bourbon dan pengaruhnya pada sistem pemerintahan modern.',
    theme: 'dark_slate',
    scenes: [
      {
        id: 'scene-tmpl-2-1',
        type: 'cover',
        title: 'Revolusi Prancis 1789',
        narration: 'Runtuhnya benteng absolutisme dan lahirnya Piagam Hak Asasi Manusia modern.',
        backgroundType: 'dark_slate',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'm-tmpl-2-1-1',
            type: 'quote',
            content: '"Liberté, Égalité, Fraternité!"',
            x: 20,
            y: 70,
            w: 60,
            h: 15,
            fontSize: 22,
            textColor: '#ffffff'
          }
        ]
      },
      {
        id: 'scene-tmpl-2-2',
        type: 'narrative',
        title: 'Krisis Ekonomi & Pajak Rakyat',
        narration: 'Rakyat jelata (Estates Ketiga) memikul seluruh beban pajak negara sementara kaum bangsawan dan pendeta dibebaskan. Kelaparan massal menyulut kemarahan rakyat Prancis.',
        backgroundType: 'gradient',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'm-tmpl-2-2-1',
            type: 'image',
            content: 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=800',
            x: 55,
            y: 15,
            w: 40,
            h: 70,
            label: 'Ilustrasi Gerakan Revolusi Massa'
          }
        ]
      },
      {
        id: 'scene-tmpl-2-3',
        type: 'timeline',
        title: 'Linimasa Peristiwa Utama',
        narration: 'Perjalanan berdarah dari penyerbuan penjara Bastille hingga eksekusi Raja Louis XVI.',
        backgroundType: 'dark_slate',
        backgroundValue: ''
      },
      {
        id: 'scene-tmpl-2-4',
        type: 'quiz',
        title: 'Penjara manakah yang diserbu rakyat Paris pada 14 Juli 1789 sebagai simbol runtuhnya absolutisme raja?',
        narration: 'Kuis interaktif.',
        backgroundType: 'gradient',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'm-tmpl-2-4-1',
            type: 'text',
            content: 'A. Penjara Bastille\nB. Kastel Versailles\nC. Istana Tuileries\nD. Benteng Conciergerie',
            x: 10,
            y: 35,
            w: 80,
            h: 30
          }
        ]
      },
      {
        id: 'scene-tmpl-2-5',
        type: 'reflection',
        title: 'Revolusi vs Demokrasi Modern',
        narration: 'Apakah kekerasan yang terjadi pada masa revolusi dapat dibenarkan untuk mencapai kesetaraan hak sipil? Bagaimana prinsip penegakan hukum hari ini melindungi keadilan tanpa pertumpahan darah?',
        backgroundType: 'parchment',
        backgroundValue: '',
        mediaItems: []
      }
    ],
    timeline: [
      { id: 't2-1', year: '1789 M', title: 'Penyerbuan Bastille', description: 'Massa rakyat menduduki penjara Bastille untuk merebut mesiu dan senjata, memulai babak revolusi fisik.' },
      { id: 't2-2', year: '1791 M', title: 'Konstitusi Pertama', description: 'Prancis mengadopsi monarki konstitusional yang membatasi kekuasaan absolut raja.' },
      { id: 't2-3', year: '1793 M', title: 'Eksekusi Louis XVI', description: 'Raja Louis XVI dinyatakan bersalah atas pengkhianatan negara dan dieksekusi menggunakan guillotine.' },
      { id: 't2-4', year: '1799 M', title: 'Kudeta Napoleon Bonaparte', description: 'Napoleon mengambil alih kekuasaan lewat kudeta militer, mengakhiri era kekacauan Republik awal Prancis.' }
    ],
    maps: []
  }
];

export const INITIAL_PRESENTATIONS: Presentation[] = [
  {
    id: 'pres-1',
    title: 'Peradaban Sriwijaya: Poros Maritim Asia Tenggara',
    description: 'Bagaimana sebuah kerajaan sungai kecil di Palembang mampu menguasai jalur lalu lintas pelayaran Selat Malaka.',
    theme: 'dark_slate',
    createdAt: '2026-07-15',
    scenes: [
      {
        id: 'pres-1-s1',
        type: 'cover',
        title: 'Sriwijaya: Kedatuan Bahari Terbesar',
        narration: 'Poros emas pelayaran komersial kuno yang dihormati di seluruh dinasti Tiongkok, India, dan Arab.',
        backgroundType: 'dark_slate',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'pres-1-m1',
            type: 'quote',
            content: '"Kekuasaan bahari tidak ditentukan oleh luasnya tanah, melainkan kemampuan menguasai gerbang-gerbang perairan."',
            x: 10,
            y: 70,
            w: 80,
            h: 15,
            fontSize: 15,
            textColor: '#fbbf24'
          }
        ]
      },
      {
        id: 'pres-1-s2',
        type: 'narrative',
        title: 'Prasasti Kedukan Bukit (682 M)',
        narration: 'Perjalanan suci (Siddhayatra) Dapunta Hyang memimpin 20.000 tentara menaklukkan Minanga Tamwan dan mendirikan pangkalan Kedatuan Sriwijaya yang jaya di Palembang.',
        backgroundType: 'parchment',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'pres-1-m2',
            type: 'image',
            content: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800',
            x: 60,
            y: 15,
            w: 35,
            h: 65,
            label: 'Ilustrasi Prasasti Batu Kuno Nusantara'
          }
        ]
      },
      {
        id: 'pres-1-s3',
        type: 'map',
        title: 'Patroli Laut & Selat Malaka',
        narration: 'Menempatkan pos armada pengawal di pulau-pulau kecil untuk memungut pajak bea cukai pelayaran dan melindungi kapal dagang.',
        backgroundType: 'dark_slate',
        backgroundValue: '',
        activeMapId: 'pres-1-map-sriwijaya',
        activeMapStepIndex: 0
      },
      {
        id: 'pres-1-s4',
        type: 'timeline',
        title: 'Puncak Kejayaan hingga Keruntuhan',
        narration: 'Linimasa hubungan luar negeri, ekspedisi Dinasti Chola India, hingga pergeseran kekuasaan oleh Majapahit.',
        backgroundType: 'dark_slate',
        backgroundValue: ''
      },
      {
        id: 'pres-1-s5',
        type: 'quiz',
        title: 'Apakah nama kapal ekspedisi Dapunta Hyang yang tercantum pada Prasasti Kedukan Bukit?',
        narration: 'Uji daya ingat siswa.',
        backgroundType: 'gradient',
        backgroundValue: '',
        mediaItems: [
          {
            id: 'pres-1-m5',
            type: 'text',
            content: 'A. Perahu Samudra\nB. Lancang Kuning\nC. Pinisi Agung\nD. Kora-Kora',
            x: 10,
            y: 35,
            w: 80,
            h: 30
          }
        ]
      },
      {
        id: 'pres-1-s6',
        type: 'reflection',
        title: 'Kedaulatan Maritim Indonesia Hari Ini',
        narration: 'Sebagai negara kepulauan, pelajaran berharga apa yang diwariskan Sriwijaya kepada Indonesia modern untuk menegakkan poros maritim global dunia?',
        backgroundType: 'parchment',
        backgroundValue: '',
        mediaItems: []
      }
    ],
    timeline: [
      { id: 'st1', year: '682 M', title: 'Prasasti Kedukan Bukit', description: 'Dapunta Hyang memimpin ekspedisi militer suci mendirikan kota Sriwijaya.' },
      { id: 'st2', year: 'Abad ke-8 M', title: 'Menguasai Selat Sunda', description: 'Ekspansi militer ke Jawa Barat mengamankan Selat Sunda dan memonopoli komoditi perdagangan lada awal.' },
      { id: 'st3', year: '1025 M', title: 'Serangan Dinasti Chola', description: 'Serangan mendadak dari Kerajaan Chola di India Selatan merusak armada dan menawan raja Sriwijaya.' },
      { id: 'st4', year: '1377 M', title: 'Serbuan Kerajaan Majapahit', description: 'Serbuan Majapahit melenyapkan sisa-sisa administrasi otonomi Sriwijaya di Sumatera Selatan.' }
    ],
    maps: [
      {
        id: 'pres-1-map-sriwijaya',
        name: 'Kawasan Mandala Sriwijaya',
        description: 'Pusat administrasi pelabuhan utama di Palembang hingga pos pengawasan lalu lintas laut Jambi dan Kedah.',
        era: 'Abad ke-7 - 11 M',
        mapStyle: 'vintage',
        showRoute: true,
        pins: [
          {
            id: 'ps1',
            label: 'Palembang (Ibu Kota)',
            description: 'Pusat kedudukan raja, biara Buddha besar, dan pelabuhan bongkar muat barang niaga internasional.',
            x: 62.1,
            y: 65.4,
            lat: -2.9909,
            lng: 104.7565
          },
          {
            id: 'ps2',
            label: 'Bangka (Prasasti Kota Kapur)',
            description: 'Benteng pertahanan untuk mengontrol gerbang Selat Sunda dan memperingatkan kapal pembangkang.',
            x: 75.2,
            y: 68.1,
            lat: -2.1384,
            lng: 106.1157
          },
          {
            id: 'ps3',
            label: 'Jambi (Melayu)',
            description: 'Kawasan pelabuhan sungai subur penghasil kayu gaharu yang ditaklukkan Sriwijaya untuk mencegah persaingan ekspor.',
            x: 52.4,
            y: 55.6,
            lat: -1.6101,
            lng: 103.6131
          },
          {
            id: 'ps4',
            label: 'Kedah (Lembah Bujang)',
            description: 'Pangkalan maritim utara di Semenanjung Malaya yang menyambut kapal pelaut dari India kuno.',
            x: 41.5,
            y: 25.2,
            lat: 5.6836,
            lng: 100.4136
          }
        ]
      }
    ]
  }
];
