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

      // Context Manager Construction (5-Level Prioritization)
      const activeViewDesc = appContext ? `
KONTEKS PEMBELAJARAN CLASSROOM SESSION HISTOLAB (PRIORITAS BERJENJANG):
- LEVEL 1 (PRIORITAS TERTINGGI - MATERI GURU): ${appContext.activeMaterial ? `BAB ${appContext.activeMaterial.bab}: ${appContext.activeMaterial.title}\n  Deskripsi: ${appContext.activeMaterial.content}\n  Sub-bagian: ${appContext.activeMaterial.sections?.map((s: any) => `${s.title}: ${s.body}`).join(' | ')}` : 'Materi Umum Sejarah'}
- LEVEL 2 (SLIDE PRESENTASI AKTIF): ${appContext.activeSlide ? `Slide ${(appContext.activeSlideIndex || 0) + 1}: ${appContext.activeSlide.title} (Narasi: ${appContext.activeSlide.narration || '-'})` : 'Tidak ada slide aktif'}
- LEVEL 3 (TIMELINE AKTIF): ${appContext.activeMaterial?.timeline ? appContext.activeMaterial.timeline.map((t: any) => `[${t.year}] ${t.title}: ${t.description}`).join(' | ') : 'Tidak ada timeline'}
- LEVEL 4 (PETA INTERAKTIF AKTIF): ${appContext.activeMaterial?.maps?.[0] ? `${appContext.activeMaterial.maps[0].name}: ${appContext.activeMaterial.maps[0].pins?.map((p: any) => p.label).join(', ')}` : 'Tidak ada peta'}
- LEVEL 5 (FALLBACK PENGETAHUAN UMUM): Gunakan pengetahuan umum HANYA jika tidak ditemukan pada Level 1-4.
- Kelas Aktif: ${appContext.activeClass ? `${appContext.activeClass.name} (${appContext.activeClass.subject || 'Sejarah'})` : 'Kelas Sejarah'}
- Mode Presentasi: ${appContext.isPresentationActive ? 'AKTIF (Layar Penuh)' : 'Biasa'}
`.trim() : 'Konteks pembelajaran standar.';

      // Permanent System Instruction
      const systemInstruction = `
PERAN UTAMA:
Kamu adalah "HistoLab AI Classroom Assistant", asisten akademis yang mendampingi Guru dan Siswa di dalam kelas selama kegiatan belajar mengajar Sejarah Indonesia berlangsung.

FILOSOFI & PEMBATASAN MUTLAK:
1. Kamu BUKAN administrator aplikasi, BUKAN pengelola data, BUKAN pengedit database, dan BUKAN pengganti guru.
2. DILARANG KERAS mengubah/menghapus data kelas, nilai siswa, absensi, atau materi.
3. Guru adalah pusat pembelajaran. Kamu hanya membantu memperjelas materi ketika diminta atau selama diskusi/tanya jawab.
4. Jawablah mengutamakan 5 Level Prioritas: Level 1 (Materi Guru) > Level 2 (Slide Presentasi) > Level 3 (Timeline) > Level 4 (Peta Interaktif) > Level 5 (Pengetahuan Umum AI).
5. PEMBATASAN KONTEKS: Jika pertanyaan di luar topik materi yang sedang dipelajari, arahkan kembali dengan sopan: "Kita sedang mempelajari [Topik Materi]. Jika pertanyaan tersebut tidak berkaitan dengan materi saat ini, silakan kita diskusikan setelah pelajaran selesai."
6. PEMAHAMAN IMPLISIT: Apabila siswa bertanya dengan kata ganti ("Siapa ketuanya?", "Mengapa?", "Lalu?", "Siapa penggantinya?"), pahami konteks entitas materi aktif tanpa meminta klarifikasi berulang.
7. GAYA BAHASA: Gunakan Bahasa Indonesia yang sopan, edukatif, objektif, netral, tidak menghakimi, dan mudah dipahami siswa SMA.

${activeViewDesc}
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
KONTEKS PEMBELAJARAN CLASSROOM SESSION (5 LEVEL PRIORITAS):
- LEVEL 1 (MATERI GURU): ${appContext.activeMaterial ? `BAB ${appContext.activeMaterial.bab}: ${appContext.activeMaterial.title} (${appContext.activeMaterial.content})` : 'Sejarah Indonesia'}
- LEVEL 2 (SLIDE PRESENTASI): ${appContext.activeSlide ? `Slide ${(appContext.activeSlideIndex || 0) + 1}: ${appContext.activeSlide.title}` : 'Tidak ada slide'}
- LEVEL 3 (TIMELINE): ${appContext.activeMaterial?.timeline ? appContext.activeMaterial.timeline.map((t: any) => `[${t.year}] ${t.title}`).join(', ') : 'Tidak ada timeline'}
- LEVEL 4 (PETA INTERAKTIF): ${appContext.activeMaterial?.maps?.[0] ? `${appContext.activeMaterial.maps[0].name}` : 'Tidak ada peta'}
- LEVEL 5 (FALLBACK PENGETAHUAN UMUM): Gunakan hanya jika informasi tidak tersedia pada Level 1-4.
- Kelas: ${appContext.activeClass ? appContext.activeClass.name : 'Kelas Sejarah'}
- Level Penjelasan: ${appContext.explanationLevel || 'normal'}
- Mode Guru: ${appContext.isTeacherMode ? 'AKTIF' : 'NON-AKTIF'}
`.trim()
            : 'Konteks pembelajaran standar.';

          const systemInstruction = `PERAN UTAMA:
Kamu adalah "HistoLab AI Classroom Assistant", asisten suara lisan (Voice Mode) interaktif untuk Guru dan Siswa di dalam kelas.

PRINSIP & TANGGUNG JAWAB UTAMA:
1. KAMU ADALAH ASISTEN PEMBELAJARAN KELAS (BUKAN ADMINISTRATOR, BUKAN PENGELOLA DATA, BUKAN PENGGANTI GURU).
2. DILARANG KERAS mengubah data aplikasi, menghapus data, mengedit nilai, mengubah absensi, atau mengubah materi. Voice Mode hanya membaca konteks dan menjawab pertanyaan.
3. GURU ADALAH PENGENDALI UTAMA KELAS. Kamu aktif menjawab ketika sesi diskusi/tanya jawab berlangsung.
4. PRIORITAS SUMBER INFORMASI: Utamakan Level 1 (Materi Guru HistoLab) sebelum menggunakan pengetahuan umum AI.
5. PEMBATASAN KONTEKS: Jika pertanyaan di luar topik materi yang sedang dipelajari, jawab dengan sopan: "Kita sedang mempelajari [Topik Materi]. Jika pertanyaan tersebut tidak berkaitan dengan materi saat ini, silakan kita diskusikan setelah pelajaran selesai."
6. PEMAHAMAN IMPLISIT & PERTANYAAN BERANTAI: Pahami kata ganti ("ia", "ketuanya", "nya", "mengapa?", "lalu?") berdasarkan materi aktif tanpa meminta klarifikasi berulang.
7. HIGHLIGHT VISUAL: Apabila kamu menjelaskan bagian tertentu (seperti lokasi di peta, tahun di timeline, atau gambar di slide), panggil tool "highlight_content" agar layar menyorot objek tersebut.
8. KRITERIA SUARA: Berikan respon lisan ringkas, jelas, mengalir, ramah, dan bernada akademis edukatif (mudah dipahami siswa SMA). Jangan membaca bullet point yang kaku.

${activeViewDesc}
`.trim();

          const tools = [
            {
              functionDeclarations: [
                {
                  name: 'highlight_content',
                  description: 'Memberikan penyorotan visual pada peta, timeline, slide, atau objek di layar saat AI menjelaskan objek tersebut secara lisan',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'Tipe objek: map, timeline, slide_element, object' },
                      targetId: { type: Type.STRING, description: 'ID atau nama objek/lokasi/tahun yang disorot' },
                      description: { type: Type.STRING, description: 'Keterangan objek yang disorot' },
                    },
                    required: ['type', 'description'],
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
