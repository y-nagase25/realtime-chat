import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioPlayerOptions {
  onPlaybackEnd: () => void;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  playAudio: (audioData: ArrayBuffer) => void;
  stopAudio: () => void;
  queueAudio: (audioData: ArrayBuffer) => void;
}

export function useAudioPlayer(options: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const { onPlaybackEnd } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isProcessingRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  // Initialize Audio Context
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Process audio queue
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    setIsPlaying(true);

    const audioContext = audioContextRef.current;
    if (!audioContext) {
      isProcessingRef.current = false;
      return;
    }

    const audioData = audioQueueRef.current.shift();
    if (!audioData) {
      isProcessingRef.current = false;
      setIsPlaying(false);
      onPlaybackEnd();
      return;
    }

    try {
      // Decode audio buffer
      const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));

      // Create source node
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      currentSourceRef.current = source;

      // Schedule playback
      const currentTime = audioContext.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      // Handle playback end
      source.onended = () => {
        currentSourceRef.current = null;
        isProcessingRef.current = false;

        // Process next in queue or end playback
        if (audioQueueRef.current.length > 0) {
          processQueue();
        } else {
          setIsPlaying(false);
          nextStartTimeRef.current = 0;
          onPlaybackEnd();
        }
      };

      source.start(startTime);
    } catch (error) {
      console.error('Error playing audio:', error);
      isProcessingRef.current = false;

      // Continue processing queue even if one chunk fails
      if (audioQueueRef.current.length > 0) {
        processQueue();
      } else {
        setIsPlaying(false);
        nextStartTimeRef.current = 0;
        onPlaybackEnd();
      }
    }
  }, [onPlaybackEnd]);

  // Queue audio for smooth playback
  const queueAudio = useCallback(
    (audioData: ArrayBuffer) => {
      audioQueueRef.current.push(audioData);
      processQueue();
    },
    [processQueue]
  );

  // Play audio immediately (clears queue)
  const playAudio = useCallback(
    (audioData: ArrayBuffer) => {
      // Stop current playback
      stopAudio();

      // Clear queue and add new audio
      audioQueueRef.current = [audioData];
      nextStartTimeRef.current = 0;
      processQueue();
    },
    [processQueue]
  );

  // Stop audio playback for interruption support
  const stopAudio = useCallback(() => {
    // Stop current source
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
      } catch (error) {
        // Ignore errors if already stopped
      }
      currentSourceRef.current = null;
    }

    // Clear queue
    audioQueueRef.current = [];
    isProcessingRef.current = false;
    nextStartTimeRef.current = 0;
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    playAudio,
    stopAudio,
    queueAudio,
  };
}

// Utility function to decode base64 PCM16 audio from API responses
export function decodeBase64PCM16(base64Audio: string): ArrayBuffer {
  // Decode base64 to binary string
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert PCM16 to Float32 for Web Audio API
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);

  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0; // Convert to -1.0 to 1.0 range
  }

  // Create audio buffer compatible format
  // We need to create a proper WAV header for decodeAudioData
  return createWavBuffer(float32, 24000);
}

// Create WAV buffer from PCM data
function createWavBuffer(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Convert float32 samples back to int16 for WAV
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset + i * 2, sample * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
