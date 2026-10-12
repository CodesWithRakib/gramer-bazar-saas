'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface IWindowWithSpeech {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseVoiceSearchOptions {
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
}

/**
 * Bangla & English Voice Search Hook
 * Seamlessly integrates browser Web Speech API with automatic fallback and visual feedback.
 */
export function useVoiceSearch({
  lang = 'bn-BD',
  onResult,
  onError,
}: UseVoiceSearchOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const windowWithSpeech = window as unknown as IWindowWithSpeech;
      const SpeechRecognitionConstructor =
        windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognitionConstructor));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(
    (customLang?: string) => {
      if (typeof window === 'undefined') return;
      const windowWithSpeech = window as unknown as IWindowWithSpeech;
      const SpeechRecognitionConstructor =
        windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        onError?.('Speech recognition is not supported in this browser.');
        return;
      }

      if (isListening) {
        stopListening();
        return;
      }

      try {
        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = customLang || lang || 'bn-BD';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          let isFinal = false;

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0]?.transcript || '';
            currentTranscript += piece;
            if (event.results[i]?.isFinal) {
              isFinal = true;
            }
          }

          const trimmed = currentTranscript.trim();
          setTranscript(trimmed);
          onResult?.(trimmed, isFinal);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          const errorMsg =
            event.error === 'not-allowed'
              ? 'Microphone permission denied'
              : event.error === 'no-speech'
                ? 'No speech detected'
                : event.error || 'Speech recognition error';
          onError?.(errorMsg);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setIsListening(false);
        onError?.(err?.message || 'Failed to start speech recognition');
      }
    },
    [isListening, lang, onError, onResult, stopListening]
  );

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  };
}
