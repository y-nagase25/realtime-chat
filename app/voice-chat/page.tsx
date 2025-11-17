'use client';

import { useState, useCallback } from 'react';
import { useRealtimeAPI } from '@/lib/hooks/voice-chat/use-realtime-api';
import { useAudioPlayer } from '@/lib/hooks/voice-chat/use-audio-player';
import { useAudioRecorder } from '@/lib/hooks/voice-chat/use-audio-recorder';
import { useConversationStorage } from '@/lib/hooks/voice-chat/use-conversation-storage';
import { Button } from '@/components/ui/button';
import { ApiKeyDialog } from '@/components/voice-chat/api-key-dialog';

export default function VoiceChatPage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [error, setError] = useState<string>('');

  // Load API key from local storage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      } else {
        setShowApiKeyDialog(true);
      }
    }
  });

  const { messages, addMessage } = useConversationStorage();

  // Audio player with playback end callback
  const { isPlaying, stopAudio, queueAudio } = useAudioPlayer({
    onPlaybackEnd: () => {
      console.log('Playback ended');
    },
  });

  // Realtime API connection
  const { isConnected, connect, disconnect, sendAudio, interrupt } = useRealtimeAPI({
    apiKey,
    onTranscriptReceived: (speaker, text) => {
      addMessage(speaker, text);
    },
    onAudioReceived: (audioData) => {
      queueAudio(audioData);
    },
    onError: (err) => {
      setError(err.message);
      console.error('API Error:', err);
    },
  });

  // Audio recorder with interruption coordination
  const { isRecording, startRecording, stopRecording, hasPermission } = useAudioRecorder({
    onAudioData: (audioData) => {
      sendAudio(audioData);
    },
    onError: (err) => {
      setError(err.message);
      console.error('Recording Error:', err);
    },
  });

  // Handle recording start with interruption support
  const handleStartRecording = useCallback(async () => {
    // INTERRUPTION COORDINATION: If AI is currently playing, interrupt it
    if (isPlaying) {
      // Stop audio playback immediately
      stopAudio();

      // Send interruption signal to API
      interrupt();

      console.log('Interrupted AI playback');
    }

    // Start recording new user input
    await startRecording();
  }, [isPlaying, stopAudio, interrupt, startRecording]);

  // Handle API key save
  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
    setShowApiKeyDialog(false);
  }, []);

  // Connect to API when component mounts and API key is available
  useState(() => {
    if (apiKey && !isConnected) {
      connect().catch((err) => {
        setError(err.message);
      });
    }
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Voice Chat with AI Assistant</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">{error}</div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span
              className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-400'}`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">AI is speaking...</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={isRecording ? stopRecording : handleStartRecording}
            disabled={!isConnected || hasPermission === false}
            variant={isRecording ? 'destructive' : 'default'}
          >
            {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
          </Button>

          <Button onClick={() => setShowApiKeyDialog(true)} variant="outline">
            Configure API Key
          </Button>

          {isConnected ? (
            <Button onClick={disconnect} variant="outline">
              Disconnect
            </Button>
          ) : (
            <Button onClick={() => connect()} variant="outline">
              Connect
            </Button>
          )}
        </div>

        <div className="border rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Conversation</h2>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No messages yet. Start recording to begin the conversation.
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.speaker === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {message.speaker === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-sm">{message.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Interruption Support:</strong> You can start recording while the AI is speaking
            to interrupt it. The AI will stop speaking immediately and begin processing your new
            input.
          </p>
        </div>
      </div>

      <ApiKeyDialog
        open={showApiKeyDialog}
        onSave={handleSaveApiKey}
        onCancel={() => setShowApiKeyDialog(false)}
      />
    </div>
  );
}
