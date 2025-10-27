import { useCallback, useRef, useState } from 'react';

export interface WordBoundary {
  text: string;
  offset: number;
  duration: number;
}

export interface AzureSpeechConfig {
  subscriptionKey: string;
  region: string;
}

export interface SpeechCallbacks {
  onWordBoundary?: (word: WordBoundary, wordIndex: number) => void;
  onSynthesisStart?: () => void;
  onSynthesisEnd?: () => void;
  onError?: (error: string) => void;
}

export const useAzureSpeech = (config?: AzureSpeechConfig) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const synthesizerRef = useRef<any>(null);
  const sdkRef = useRef<any>(null);

  // Initialize SDK dynamically
  const initializeSDK = useCallback(async () => {
    if (sdkRef.current) return sdkRef.current;

    try {
      // Dynamic import of Azure Speech SDK
      const sdk = await import('microsoft-cognitiveservices-speech-sdk');
      sdkRef.current = sdk;
      return sdk;
    } catch (error) {
      console.error('Failed to load Azure Speech SDK:', error);
      throw new Error('Azure Speech SDK not available. Please install: npm install microsoft-cognitiveservices-speech-sdk');
    }
  }, []);

  const speak = useCallback(async (
    text: string,
    callbacks?: SpeechCallbacks,
    customConfig?: AzureSpeechConfig
  ) => {
    const finalConfig = customConfig || config;
    
    if (!finalConfig?.subscriptionKey || !finalConfig?.region) {
      const error = 'Azure Speech configuration is missing. Please provide subscriptionKey and region.';
      callbacks?.onError?.(error);
      console.error(error);
      return;
    }

    try {
      const sdk = await initializeSDK();
      
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        finalConfig.subscriptionKey,
        finalConfig.region
      );
      
      // Configure speech synthesis
      speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural'; // You can make this configurable
      
      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      synthesizerRef.current = synthesizer;

      setIsSpeaking(true);
      setCurrentWordIndex(-1);
      callbacks?.onSynthesisStart?.();

      let wordIndex = 0;

      // Word boundary event
      synthesizer.wordBoundary = (s: any, e: any) => {
        const wordBoundary: WordBoundary = {
          text: e.text,
          offset: e.audioOffset / 10000, // Convert to milliseconds
          duration: e.duration / 10000,
        };
        
        setCurrentWordIndex(wordIndex);
        callbacks?.onWordBoundary?.(wordBoundary, wordIndex);
        wordIndex++;
      };

      // Synthesize speech
      synthesizer.speakTextAsync(
        text,
        (result: any) => {
          if (result) {
            synthesizer.close();
            setIsSpeaking(false);
            callbacks?.onSynthesisEnd?.();
          }
        },
        (error: any) => {
          console.error('Speech synthesis error:', error);
          synthesizer.close();
          setIsSpeaking(false);
          callbacks?.onError?.(error);
        }
      );
    } catch (error: any) {
      console.error('Error initializing speech:', error);
      setIsSpeaking(false);
      callbacks?.onError?.(error.message || 'Unknown error');
    }
  }, [config, initializeSDK]);

  const stop = useCallback(() => {
    if (synthesizerRef.current) {
      synthesizerRef.current.close();
      synthesizerRef.current = null;
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    currentWordIndex,
  };
};
