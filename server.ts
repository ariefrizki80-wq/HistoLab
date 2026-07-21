import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

// Workaround for __dirname in both ESM (dev) and CJS (prod build)
const isESM = typeof import.meta !== 'undefined' && import.meta.url;
const currentFilename = isESM ? fileURLToPath(import.meta.url) : __filename;
const currentDirname = isESM ? path.dirname(currentFilename) : __dirname;

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper to get GoogleGenAI client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_FALLBACK;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Gateway Status
  app.get('/api/ai/status', (req, res) => {
    const ai = getAiClient();
    res.json({
      configured: !!ai,
      chatModel: 'gemini-3.6-flash',
      liveModel: 'gemini-3.1-flash-live-preview',
      voiceEngine: 'Gemini Live API',
      mediaIntegration: true,
    });
  });

  // AI Gateway Chat Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt, history, appContext, userMemory } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server environment',
          details: 'Please set GEMINI_API_KEY in process.env or .env file.',
        });
      }

      // Context Manager Construction
      const activeViewDesc = appContext ? `
KONTEKS APLIKASI HISTOLAB AKTIF:
- Tampilan Utama: ${appContext.activeView || 'Dashboard'}
- Kelas Aktif: ${appContext.activeClass ? `${appContext.activeClass.name} (${appContext.activeClass.subject || 'Sejarah'})` : 'Belum dipilih'}
- Materi Aktif: ${appContext.activeMaterial ? `BAB ${appContext.activeMaterial.bab}: ${appContext.activeMaterial.title}` : 'Belum dipilih'}
- Slide Presentasi Aktif: ${appContext.activeSlide ? `Slide ${(appContext.activeSlideIndex || 0) + 1}: ${appContext.activeSlide.title} (Tipe: ${appContext.activeSlide.type})` : 'Belum ada slide aktif'}
- Mode Presentasi Layar Penuh: ${appContext.isPresentationActive ? 'AKTIF (Guru sedang mengajar di depan kelas)' : 'Tidak Aktif'}
- Total Asset di Asset Library HistoLab: ${appContext.assetsCount || 0} items
${appContext.recentAssets ? `- Sample Asset di Library: ${JSON.stringify(appContext.recentAssets)}` : ''}
`.trim() : 'Konteks aplikasi standar.';

      // Memory Manager Construction
      let memoryDesc = '';
      if (userMemory) {
        const { items, summary } = userMemory;
        memoryDesc = `
MEMORI & CATATAN PENGGUNA TERSIMPAN:
- Topik Pembelajaran Aktif: ${summary?.activeTopic || 'Sejarah Indonesia'}
- Maksud Terakhir Guru: ${summary?.lastIntent || 'Mengajar'}
- Catatan Kunci Guru: ${Array.isArray(summary?.keyNotes) && summary.keyNotes.length > 0 ? summary.keyNotes.join('; ') : 'Belum ada catatan'}
- Memori Entitas Tersimpan: ${Array.isArray(items) && items.length > 0 ? items.map((i: any) => `${i.key}: ${i.value}`).join(' | ') : 'Tidak ada entitas khusus'}
`.trim();
      }

      // Permanent System Instruction
      const systemInstruction = `
Identitas & Peran Utama:
Kamu adalah "HistoLab AI Assistant", asisten kecerdasan buatan khusus untuk Guru Sejarah Indonesia di platform HistoLab (Digital Workspace Guru Sejarah).
Kamu BUKAN chatbot umum biasa. Spesialisasi utama kamu adalah pedagogi sejarah Indonesia (pembelajaran sejarah interaktif, analisis sejarah faktual, metode historiografi, pembuatan RPP, modul ajar, kuis, peta sejarah, dan penyusunan slide presentasi).

Tugas Utama Kamu:
1. Membantu Guru Sejarah menyusun RPP, modul ajar, kuis, dan narasi sejarah yang mendalam, faktual, dan mendidik.
2. Membantu mengedit dan menambah konten slide presentasi interaktif di HistoLab (teks, gambar, kutipan, kuis).
3. Memberikan rekomendasi peta sejarah interaktif, garis waktu (timeline), serta pengelolaan kelas dan absensi.
4. Menjawab pertanyaan murid/guru mengenai sejarah Indonesia dan Sejarah Dunia dengan pendekatan pedagogis yang santun, menarik, dan berimbang.

Kriteria Respon:
- Bahasa utama: Bahasa Indonesia yang ramah, hangat, edukatif, dan profesional (sapa pengguna sebagai "Bapak/Ibu Guru" atau nama yang relevan).
- Responsif terhadap konteks halaman aktif dan memori tersimpan guru.
- Jika permintaan melibatkan tindakan aplikasi (misal berpindah modul, menambah slide element, membuka kelas/materi), manfaatkan Function Calling jika sesuai.

${activeViewDesc}

${memoryDesc}
`.trim();

      const tools = [
        {
          functionDeclarations: [
            {
              name: 'add_slide_element',
              description: 'Menambahkan elemen baru (gambar, teks, kutipan, kuis) ke slide presentasi yang sedang aktif',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'Tipe elemen: image, text, quote, shape' },
                  content: { type: Type.STRING, description: 'Isi teks atau URL/DataURL gambar' },
                  label: { type: Type.STRING, description: 'Keterangan atau caption singkat' },
                },
                required: ['type', 'content'],
              },
            },
            {
              name: 'update_slide_background',
              description: 'Mengubah latar belakang slide presentasi aktif menggunakan warna, pola, atau gambar',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  backgroundType: { type: Type.STRING, description: 'color, gradient, image, texture, parchment, dark_slate' },
                  backgroundValue: { type: Type.STRING, description: 'Nilai hex warna atau URL gambar' },
                },
                required: ['backgroundType', 'backgroundValue'],
              },
            },
            {
              name: 'navigate_to_view',
              description: 'Berpindah tampilan modul utama HistoLab (dashboard, kelas, materi, presentasi, pengaturan)',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  view: { type: Type.STRING, description: 'Nama view target: dashboard, kelas, materi, presentasi, pengaturan' },
                },
                required: ['view'],
              },
            },
            {
              name: 'open_material',
              description: 'Membuka materi pelajaran sejarah tertentu berdasarkan ID materi',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  materialId: { type: Type.STRING, description: 'ID materi yang ingin dibuka' },
                },
                required: ['materialId'],
              },
            },
            {
              name: 'open_class',
              description: 'Membuka kelas siswa tertentu berdasarkan ID kelas',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  classId: { type: Type.STRING, description: 'ID kelas yang ingin dibuka' },
                },
                required: ['classId'],
              },
            },
          ],
        },
      ];

      const contents = [];
      if (Array.isArray(history)) {
        for (const msg of history.slice(-8)) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content || msg.text || '' }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          tools,
        },
      });

      const responseText = response.text || 'Maaf, saya tidak dapat memproses tanggapan saat ini.';
      const functionCalls = response.functionCalls;

      return res.json({
        text: responseText,
        functionCalls: functionCalls || null,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('AI Gateway Error:', err);
      return res.status(500).json({
        error: 'Gagal menghubungkan ke AI Gateway',
        details: err?.message || 'Error internal server',
      });
    }
  });

  // WebSocket Server Gateway for Gemini Live API
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    console.log('[Upgrade] Request URL:', request.url);
    try {
      // In some environments request.url doesn't start with /
      const urlStr = request.url?.startsWith('/') ? `http://${request.headers.host}${request.url}` : request.url;
      const pathname = urlStr ? new URL(urlStr!).pathname : '';
      console.log('[Upgrade] Pathname:', pathname);
      
      if (pathname === '/api/ai/live') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        // Let other handlers (like Vite) handle the upgrade
      }
    } catch (e) {
      console.error('[Upgrade] Error parsing URL:', e);
    }
  });

  wss.on('connection', async (clientWs: WebSocket, request: any) => {
    let session: any = null;

    clientWs.on('message', async (rawMsg: any) => {
      try {
        const msg = JSON.parse(rawMsg.toString());

        if (msg.type === 'init') {
          const { appContext, userMemory } = msg;
          const ai = getAiClient();
          if (!ai) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                message: 'GEMINI_API_KEY environment variable is not configured on server.',
              })
            );
            return;
          }

          const activeViewDesc = appContext
            ? `
KONTEKS APLIKASI HISTOLAB AKTIF:
- Tampilan Utama: ${appContext.activeView || 'Dashboard'}
- Kelas Aktif: ${appContext.activeClass ? `${appContext.activeClass.name} (${appContext.activeClass.subject || 'Sejarah'})` : 'Belum dipilih'}
- Materi Aktif: ${appContext.activeMaterial ? `BAB ${appContext.activeMaterial.bab}: ${appContext.activeMaterial.title}` : 'Belum dipilih'}
- Slide Presentasi Aktif: ${appContext.activeSlide ? `Slide ${(appContext.activeSlideIndex || 0) + 1}: ${appContext.activeSlide.title} (Tipe: ${appContext.activeSlide.type})` : 'Belum ada slide aktif'}
- Mode Presentasi Layar Penuh: ${appContext.isPresentationActive ? 'AKTIF (Guru sedang mengajar di depan kelas)' : 'Tidak Aktif'}
- Total Asset di Asset Library HistoLab: ${appContext.assetsCount || 0} items
`.trim()
            : 'Konteks aplikasi standar.';

          let memoryDesc = '';
          if (userMemory) {
            const { summary } = userMemory;
            memoryDesc = `
MEMORI & CATATAN PENGGUNA TERSIMPAN:
- Topik Pembelajaran Aktif: ${summary?.activeTopic || 'Sejarah Indonesia'}
- Maksud Terakhir Guru: ${summary?.lastIntent || 'Mengajar'}
`.trim();
          }

          const systemInstruction = `Identitas & Peran Utama:
Kamu adalah "HistoLab AI Teaching Assistant", asisten suara (Voice Mode) untuk Guru Sejarah Indonesia di platform HistoLab.

PRIORITAS UTAMA (TEACHING ASSISTANT):
Fokus utama kamu adalah mendampingi Guru saat mereka mengajar secara langsung di kelas. 
Kamu harus merespons lisan secara edukatif dan interaktif ketika:
1. Murid atau guru bertanya secara spontan mengenai materi sejarah.
2. Guru membutuhkan penjelasan tambahan, analogi, cerita, atau contoh terkait topik.
3. Guru ingin membuat pertanyaan pemantik (HOTS) atau kuis dadakan.
4. Guru membutuhkan ide ice breaking atau aktivitas pembelajaran sejarah yang seru.
5. Guru ingin menghubungkan peristiwa sejarah masa lalu dengan konteks modern masa kini.
6. Guru ingin menyederhanakan penjelasan yang rumit.

PENGGUNAAN TOOL CALLING (HANYA JIKA DIMINTA EKSPLISIT):
Hanya panggil Tool/Function Declaration JIKA guru SECARA EKSPLISIT menginstruksikan kamu untuk mengubah sesuatu di aplikasi (contoh: "Tolong buka modul bab 2", "Tambahkan gambar ke slide", "Tutup presentasi"). 
Jika guru hanya berdiskusi, bertanya konsep, atau meminta cerita, JANGAN gunakan Tool Calling. Jawablah lisan dengan natural.

Kriteria Respons Suara:
- Berikan respon lisan ringkas, jelas, dan mengalir seperti layaknya asisten manusia agar nyaman didengarkan di kelas.
- Jangan menggunakan kalimat panjang bertele-tele atau membaca daftar poin (bullet points) yang kaku.
- Sapa dengan "Bapak/Ibu Guru" sesekali.
- Jangan selalu menawarkan bantuan di akhir setiap jawaban.

${activeViewDesc}

${memoryDesc}
`.trim();

          const tools = [
            {
              functionDeclarations: [
                {
                  name: 'add_slide_element',
                  description: 'Menambahkan elemen baru (gambar, teks, kutipan, kuis) ke slide presentasi yang sedang aktif',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'Tipe elemen: image, text, quote, shape' },
                      content: { type: Type.STRING, description: 'Isi teks atau URL/DataURL gambar' },
                      label: { type: Type.STRING, description: 'Keterangan atau caption singkat' },
                    },
                    required: ['type', 'content'],
                  },
                },
                {
                  name: 'update_slide_background',
                  description: 'Mengubah latar belakang slide presentasi aktif menggunakan warna, pola, atau gambar',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      backgroundType: { type: Type.STRING, description: 'color, gradient, image, texture, parchment, dark_slate' },
                      backgroundValue: { type: Type.STRING, description: 'Nilai hex warna atau URL gambar' },
                    },
                    required: ['backgroundType', 'backgroundValue'],
                  },
                },
                {
                  name: 'navigate_to_view',
                  description: 'Berpindah tampilan modul utama HistoLab (dashboard, kelas, materi, presentasi, pengaturan)',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      view: { type: Type.STRING, description: 'Nama view target: dashboard, kelas, materi, presentasi, pengaturan' },
                    },
                    required: ['view'],
                  },
                },
                {
                  name: 'open_material',
                  description: 'Membuka materi pelajaran sejarah tertentu berdasarkan ID materi',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      materialId: { type: Type.STRING, description: 'ID materi yang ingin dibuka' },
                    },
                    required: ['materialId'],
                  },
                },
                {
                  name: 'open_class',
                  description: 'Membuka kelas siswa tertentu berdasarkan ID kelas',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      classId: { type: Type.STRING, description: 'ID kelas yang ingin dibuka' },
                    },
                    required: ['classId'],
                  },
                },
              ],
            },
          ];

          try {
            console.log(`[Gemini Live] Connecting session for client. Active View: ${appContext.activeView || 'Dashboard'}`);
            session = await ai.live.connect({
              model: 'gemini-3.1-flash-live-preview',
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction,
                tools,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
              },
              callbacks: {
                onmessage: (serverMessage: any) => {
                  // Forward audio chunks
                  const audio = serverMessage.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                  if (audio && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'audio', data: audio }));
                  }

                  // Forward transcriptions
                  const outputTrans = serverMessage.serverContent?.outputAudioTranscription?.text;
                  if (outputTrans && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'transcript_ai', text: outputTrans }));
                  }

                  const inputTrans = serverMessage.serverContent?.inputAudioTranscription?.text;
                  if (inputTrans && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'transcript_user', text: inputTrans }));
                  }

                  // Forward interruption
                  if (serverMessage.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'interrupted' }));
                  }

                  // Forward Tool Calls
                  if (serverMessage.toolCall && clientWs.readyState === WebSocket.OPEN) {
                    const functionCalls = serverMessage.toolCall.functionCalls;
                    if (functionCalls && Array.isArray(functionCalls)) {
                      clientWs.send(JSON.stringify({ type: 'tool_call', functionCalls }));
                      const responses = functionCalls.map((fc: any) => ({
                        name: fc.name,
                        id: fc.id,
                        response: { status: 'success' },
                      }));
                      session.sendToolResponse({ functionResponses: responses });
                    }
                  }

                  if (serverMessage.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'turn_complete' }));
                  }
                },
                onclose: () => {
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'session_closed' }));
                  }
                },
                onerror: (err: any) => {
                  console.error('Gemini Live Session error:', err);
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Sesi Gemini Live mengalami masalah.' }));
                  }
                },
              },
            });

            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'ready' }));
            }
          } catch (connErr: any) {
            console.error('Gemini Live connect error:', connErr);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'error', message: connErr?.message || 'Gagal terhubung ke Gemini Live API' }));
            }
          }
        } else if (msg.type === 'audio' && session) {
          session.sendRealtimeInput({
            audio: { data: msg.data, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (msg.type === 'text' && session) {
          session.sendRealtimeInput({
            text: msg.text,
          });
        }
      } catch (e: any) {
        console.error('WS client message processing error:', e);
      }
    });

    clientWs.on('close', () => {
      if (session) {
        try {
          session.close();
        } catch (e) {}
      }
    });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`HistoLab server with Gemini Live running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
