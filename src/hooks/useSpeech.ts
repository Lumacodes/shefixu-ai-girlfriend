import { useState, useCallback, useRef } from 'react';

// Persistent AudioContext — browsers limit how many you can create
let sharedAudioContext: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

const TTS_URL = 'http://127.0.0.1:8000/tts';
const VOICE = 'en-US-AnaNeural';
const RATE = '+12%';
const PITCH = '+10Hz';

function stripText(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
    .replace(/[~*()✧✨💖💕🌸🎀♡]/g, '')
    .replace(/\bSubhajit\b/g, 'Shubhojit')
    .replace(/\bSubha\b/g, 'Shubho')
    .trim();
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const playingRef = useRef(false);

  const cleanup = useCallback(() => {
    playingRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.removeAttribute('src');
      currentAudioRef.current.load();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setAudioLevel(0);
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    cleanup();

    const cleanText = stripText(text);
    if (!cleanText) return;

    if (playingRef.current) return;
    playingRef.current = true;
    setIsSpeaking(true);

    try {
      const url = `${TTS_URL}?text=${encodeURIComponent(cleanText)}&voice=${VOICE}&rate=${encodeURIComponent(RATE)}&pitch=${encodeURIComponent(PITCH)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`TTS server error: ${response.status}`);

      const blob = await response.blob();
      if (blob.size < 100) throw new Error('TTS returned empty audio');

      if (!playingRef.current) return;

      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      currentAudioRef.current = audio;

      // Wire up audio analysis for lip sync
      const ctx = getAudioContext();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!currentAudioRef.current || audio.paused || audio.ended) {
          setAudioLevel(0);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 2; i < 40; i++) sum += dataArray[i];
        setAudioLevel((sum / 38) / 128);
        animFrameRef.current = requestAnimationFrame(tick);
      };

      audio.onplay = () => tick();

      audio.onended = () => {
        playingRef.current = false;
        setIsSpeaking(false);
        setAudioLevel(0);
        URL.revokeObjectURL(blobUrl);
      };

      audio.onerror = () => {
        console.warn('Audio element error');
        playingRef.current = false;
        setIsSpeaking(false);
        setAudioLevel(0);
      };

      await audio.play();

    } catch (error) {
      console.error('Edge TTS Error:', error);
      playingRef.current = false;
      setIsSpeaking(false);
      setAudioLevel(0);
    }
  }, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return { speak, stop, isSpeaking, audioLevel };
};
