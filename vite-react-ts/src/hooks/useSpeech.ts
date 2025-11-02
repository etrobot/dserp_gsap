import { useCallback, useRef, useState, useEffect } from 'react';

export interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const speak = useCallback(async (
    text: string,
    callbacks?: SpeechCallbacks,
    options?: SpeechOptions
  ) => {
    const synth = window.speechSynthesis;
    
    if (!synth) {
      callbacks?.onError?.('Speech Synthesis not supported');
      return;
    }

    // Stop current speech if any
    if (synth.speaking) {
      console.log('[useSpeech] Canceling previous speech');
      synth.cancel();
      // Wait a bit for cancellation to complete
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('[useSpeech] Starting speech:', text.substring(0, 50) + '...', 'lang:', options?.lang || 'zh-CN');
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
      console.log('[useSpeech] Speech ended');
      setIsSpeaking(false);
      if (timerRef.current) clearInterval(timerRef.current);
      callbacks?.onEnd?.();
      console.log('[useSpeech] onEnd callback executed');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (timerRef.current) clearInterval(timerRef.current);
      callbacks?.onError?.('Speech synthesis error');
    };

    // Set language
    const lang = options?.lang || 'zh-CN';
    utterance.lang = lang;
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;

    // Select appropriate voice based on language
    const voices = synth.getVoices();
    let selectedVoice = null;
    
    if (lang.startsWith('zh')) {
      // Chinese voice selection
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('zh') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => 
        voice.lang.startsWith('zh') && (voice.name.toLowerCase().includes('xiaoxiao') || voice.name.toLowerCase().includes('nami'))
      ) || voices.find(voice => voice.lang.startsWith('zh'));
    } else if (lang.startsWith('en')) {
      // English voice selection
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.startsWith('en'));
    } else {
      // Generic language matching
      selectedVoice = voices.find(voice => voice.lang.startsWith(lang.substring(0, 2)));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('[useSpeech] Selected voice:', selectedVoice.name, selectedVoice.lang);
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
