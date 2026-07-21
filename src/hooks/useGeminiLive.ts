import { useState, useEffect, useRef, useCallback } from 'react';
import { AppContextPayload, OrbState } from '../context/AIContext';
import { getAIMemory } from '../lib/memoryManager';

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output.buffer;
}

function base64EncodeAudio(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToPCMFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

interface UseGeminiLiveOptions {
  isOpen: boolean;
  appContext: AppContextPayload;
  onToolCall?: (name: string, args: any) => void;
}

export function useGeminiLive({ isOpen, appContext, onToolCall }: UseGeminiLiveOptions) {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [aiTranscript, setAiTranscript] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isSpeakingRef = useRef<boolean>(false);

  // Stop current audio output (interruption)
  const stopAudioOutput = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    isSpeakingRef.current = false;
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  }, []);

  // Play incoming 24kHz PCM chunk from Gemini Live
  const playAudioChunk = useCallback((base64Pcm: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtxRef.current = new AudioCtxClass({ sampleRate: 24000 });
      }

      if (outputAudioCtxRef.current.state === 'suspended') {
        outputAudioCtxRef.current.resume();
      }

      const float32 = base64ToPCMFloat32(base64Pcm);
      if (float32.length === 0) return;

      const audioCtx = outputAudioCtxRef.current;
      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;

      activeSourcesRef.current.push(source);
      isSpeakingRef.current = true;
      setOrbState('speaking');

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          isSpeakingRef.current = false;
          setOrbState('idle');
        }
      };
    } catch (err) {
      console.error('Audio chunk playback error:', err);
    }
  }, []);

  // Stop Mic recording
  const stopMicrophone = useCallback(() => {
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (micAudioCtxRef.current) {
      micAudioCtxRef.current.close();
      micAudioCtxRef.current = null;
    }
    setMicVolume(0);
    setIsMicActive(false);
  }, []);

  // Start Mic recording (16kHz)
  const startMicrophone = useCallback(async () => {
    stopMicrophone();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const micCtx = new AudioCtxClass({ sampleRate: 16000 });
      micAudioCtxRef.current = micCtx;
      
      // Ensure context is running if it was created in suspended state
      if (micCtx.state === 'suspended') {
        await micCtx.resume();
      }

      const source = micCtx.createMediaStreamSource(stream);
      const processor = micCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(micCtx.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Volume meter calculation
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / inputData.length;
        const vol = Math.min(100, Math.round(avg * 400));
        setMicVolume(vol);

        // Natural Interruption check: If user speaks loudly while AI is speaking
        if (vol > 25 && isSpeakingRef.current) {
          stopAudioOutput();
          setOrbState('interrupted');
        }

        if (vol > 10 && !isSpeakingRef.current) {
          setOrbState('listening');
        }

        // Convert float32 to PCM 16-bit
        const pcmBuffer = floatTo16BitPCM(inputData);
        const base64Pcm = base64EncodeAudio(pcmBuffer);

        // Send to WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'audio', data: base64Pcm }));
        }
      };
      
      setIsMicActive(true);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      setErrorMessage('Mikrofon tidak dapat diakses. Mohon beri izin di browser Anda.');
      setIsMicActive(false);
    }
  }, [stopMicrophone, stopAudioOutput]);

  const toggleMicrophone = useCallback(() => {
    if (isMicActive) {
      stopMicrophone();
      setOrbState('idle');
    } else {
      startMicrophone();
      setOrbState('listening');
    }
  }, [isMicActive, stopMicrophone, startMicrophone]);

  const appContextRef = useRef(appContext);
  const onToolCallRef = useRef(onToolCall);

  useEffect(() => {
    appContextRef.current = appContext;
  }, [appContext]);

  useEffect(() => {
    onToolCallRef.current = onToolCall;
  }, [onToolCall]);

  // Connect WebSocket to /api/ai/live
  useEffect(() => {
    if (!isOpen) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      stopMicrophone();
      stopAudioOutput();
      setIsConnected(false);
      setOrbState('idle');
      return;
    }

    setOrbState('reconnecting');
    setErrorMessage(null);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ai/live`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Gemini Live WS connected');
      setIsConnected(true);
      setOrbState('idle');
      // Send initialization message with Context & Memory
      ws.send(
        JSON.stringify({
          type: 'init',
          appContext: appContextRef.current,
          userMemory: getAIMemory(),
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ready') {
          // AI connected, waiting for user to click mic
          setOrbState('idle');
        } else if (msg.type === 'audio') {
          playAudioChunk(msg.data);
        } else if (msg.type === 'transcript_ai') {
          setAiTranscript((prev) => prev + msg.text);
        } else if (msg.type === 'transcript_user') {
          setUserTranscript(msg.text);
          setOrbState('thinking');
        } else if (msg.type === 'interrupted') {
          stopAudioOutput();
          setOrbState('interrupted');
        } else if (msg.type === 'tool_call') {
          if (Array.isArray(msg.functionCalls) && onToolCallRef.current) {
            msg.functionCalls.forEach((fc: any) => {
              onToolCallRef.current!(fc.name, fc.args);
            });
          }
        } else if (msg.type === 'turn_complete') {
          if (!isSpeakingRef.current) {
            setOrbState('idle');
          }
        } else if (msg.type === 'error') {
          setErrorMessage(msg.message || 'Terjadi kendala pada koneksi Gemini Live.');
          setOrbState('idle');
        }
      } catch (e) {
        console.error('WS message parse error:', e);
      }
    };

    ws.onerror = (err: any) => {
      console.error('Gemini Live WS Error details:', err.message || err);
      setErrorMessage('Gagal terhubung ke Gemini Live Gateway. Cek status server atau jaringan.');
      setOrbState('idle');
    };

    ws.onclose = (event) => {
      console.log('Gemini Live WS closed:', event.code, event.reason);
      setIsConnected(false);
      stopMicrophone();
      stopAudioOutput();
    };

    return () => {
      if (ws) {
        ws.close();
      }
      stopMicrophone();
      stopAudioOutput();
    };
  }, [isOpen, startMicrophone, playAudioChunk, stopAudioOutput, stopMicrophone]);

  // Send manual text prompt over Live Session
  const sendTextPrompt = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setUserTranscript(text);
      setAiTranscript('');
      setOrbState('thinking');
      wsRef.current.send(JSON.stringify({ type: 'text', text }));
    }
  }, []);

  // Manual Interruption toggle
  const interrupt = useCallback(() => {
    stopAudioOutput();
    setOrbState('idle');
  }, [stopAudioOutput]);

  return {
    orbState,
    micVolume,
    userTranscript,
    aiTranscript,
    isConnected,
    errorMessage,
    isMicActive,
    toggleMicrophone,
    sendTextPrompt,
    interrupt,
  };
}
