import { useCallback, useRef, useState, useEffect } from 'react';

export interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const speak = useCallback(async (
    text: string,
    callbacks?: SpeechCallbacks
  ) => {
    const synth = window.speechSynthesis;
    
    if (!synth) {
      callbacks?.onError?.('Speech Synthesis not supported');
      return;
    }

    // Stop current speech if any
    if (synth.speaking) {
      synth.cancel();
    }

    setElapsedTime(0);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      
      // Update elapsed time every 100ms
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }, 100);
      
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (timerRef.current) clearInterval(timerRef.current);
      callbacks?.onEnd?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (timerRef.current) clearInterval(timerRef.current);
      callbacks?.onError?.('Speech synthesis error');
    };

    // Set language to Chinese
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Select female voice
    const voices = synth.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.lang.startsWith('zh') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      voice.lang.startsWith('zh') && (voice.name.toLowerCase().includes('xiaoxiao') || voice.name.toLowerCase().includes('nami'))
    ) || voices.find(voice => voice.lang.startsWith('zh'));
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    synth.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth && synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    elapsedTime,
  };
};
