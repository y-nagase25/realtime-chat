/**
 * Audio utility functions for recording and playback
 */

/**
 * Create a single audio blob from recorded chunks
 */
export async function createAudioBlob(chunks: Blob[]): Promise<Blob> {
  return new Blob(chunks, { type: 'audio/webm;codecs=opus' });
}

/**
 * Format duration in milliseconds as MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get audio level from media stream (0-100)
 * Returns null if AudioContext is not supported
 */
export function getAudioLevel(stream: MediaStream): number | null {
  try {
    if (typeof window === 'undefined' || !window.AudioContext) {
      return null;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

    // Cleanup
    microphone.disconnect();
    audioContext.close();

    // Normalize to 0-100
    return Math.min(100, (average / 255) * 100);
  } catch (error) {
    console.error('Error getting audio level:', error);
    return null;
  }
}
