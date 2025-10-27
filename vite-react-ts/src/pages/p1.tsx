import { useState } from 'react';
import type { Feature } from '@/components/slides/n-col-features';
import NColFeatures from '@/components/slides/n-col-features';
import { useAzureSpeech, type AzureSpeechConfig } from '@/hooks/useAzureSpeech';
import { getLLMContent, type StructuredLLMResponse } from '@/services/llmService';

const demoFeatures: Feature[] = [
  {
    title: 'React',
    description: 'Build interactive UIs with the power of components',
    icon: '⚛️',
  },
  {
    title: 'Vite',
    description: 'Next generation frontend tooling',
    icon: '⚡',
  },
  {
    title: 'TypeScript',
    description: 'JavaScript with syntax for types',
    icon: '📘',
  },
  {
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    icon: '🎨',
  },
  {
    title: 'GSAP',
    description: 'Professional-grade JavaScript animations',
    icon: '✨',
  },
  {
    title: 'Responsive',
    description: 'Works seamlessly on all devices',
    icon: '📱',
  },
];

interface SentenceWithTiming {
  id: string;
  sentence: string;
  icon: string;
  label: string;
  duration: number;
  startTime: number;
}

export default function P1() {
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [useSpeechControl, setUseSpeechControl] = useState(false);
  const [llmContent, setLLMContent] = useState<StructuredLLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sentences, setSentences] = useState<SentenceWithTiming[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  
  // Configure your Azure Speech credentials here
  const azureConfig: AzureSpeechConfig = {
    subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
    region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus',
  };

  const { speak, stop, isSpeaking } = useAzureSpeech(azureConfig);

  // Estimate word duration (approximately 500ms per word for natural speech)
  const estimateWordDuration = (text: string): number => {
    const wordCount = text.split(/\s+/).length;
    return Math.max(2000, wordCount * 500);
  };

  const prepareSentencesWithTiming = (content: StructuredLLMResponse): SentenceWithTiming[] => {
    const sentenceArray: SentenceWithTiming[] = [];
    let currentStartTime = 0;

    Object.entries(content).forEach(([id, data]) => {
      const duration = estimateWordDuration(data.Sentence);
      sentenceArray.push({
        id,
        sentence: data.Sentence,
        icon: data.icon,
        label: data.Label,
        duration,
        startTime: currentStartTime,
      });
      currentStartTime += duration;
    });

    return sentenceArray;
  };

  const handleStartLLMSpeech = async () => {
    try {
      setIsLoading(true);
      const apiKey = import.meta.env.VITE_LLM_API_KEY || '';
      const apiUrl = import.meta.env.VITE_LLM_API_URL || undefined;

      if (!apiKey) {
        alert('Please configure VITE_LLM_API_KEY in .env file');
        return;
      }

      const prompt = 'Generate a professional introduction to a modern tech stack with 5-6 key technologies. Include their benefits and why they matter.';
      const content = await getLLMContent(prompt, { apiKey, baseUrl: apiUrl });

      if (Object.keys(content).length === 0) {
        throw new Error('No content received from LLM');
      }

      setLLMContent(content);
      const sentencesWithTiming = prepareSentencesWithTiming(content);
      setSentences(sentencesWithTiming);
      setVisibleIndices([]);
      setCurrentSentenceIndex(-1);
      setUseSpeechControl(true);

      // Combine all sentences for speech
      const fullText = sentencesWithTiming.map(s => s.sentence).join(' ');

      speak(fullText, {
        onWordBoundary: (word) => {
          console.log(`Word: ${word.text}`);
          // Find which sentence we're in based on timing
          const currentTime = word.offset;
          const sentenceIndex = sentencesWithTiming.findIndex(
            s => currentTime >= s.startTime && currentTime < s.startTime + s.duration
          );

          if (sentenceIndex !== currentSentenceIndex && sentenceIndex >= 0) {
            setCurrentSentenceIndex(sentenceIndex);
            setVisibleIndices((prev) => {
              if (!prev.includes(sentenceIndex)) {
                return [...prev, sentenceIndex];
              }
              return prev;
            });
          }
        },
        onSynthesisEnd: () => {
          console.log('Speech ended');
        },
        onError: (error) => {
          console.error('Speech error:', error);
          alert(`Speech Error: ${error}`);
        },
      });
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    stop();
    setVisibleIndices([]);
    setCurrentSentenceIndex(-1);
    setUseSpeechControl(false);
  };

  const handleShowAll = () => {
    stop();
    setUseSpeechControl(false);
    if (sentences.length > 0) {
      setVisibleIndices(sentences.map((_, idx) => idx));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-8 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto">
        {/* Control Panel */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={handleStartLLMSpeech}
            disabled={isSpeaking || isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : isSpeaking ? 'Speaking...' : 'Start LLM Speech'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleShowAll}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Show All
          </button>
        </div>

        {/* LLM Content Display */}
        {llmContent && Object.keys(llmContent).length > 0 && (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-bold mb-4">Generated Content:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentences.map((sentence, idx) => (
                <div
                  key={sentence.id}
                  className={`p-3 rounded bg-gray-700 text-white transition-opacity ${
                    visibleIndices.includes(idx) ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="text-sm font-semibold">{sentence.label}</div>
                  <div className="text-xs text-gray-300 mt-1">{sentence.sentence}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <NColFeatures
          title="Welcome to Slides App"
          features={demoFeatures}
          columns={3}
          className="py-12"
          fadeDuration={800}
          staggerDelay={100}
          fadeBlur={true}
          starBorderColor="#60a5fa"
          starBorderSpeed="8s"
          controlledAppearance={useSpeechControl}
          visibleIndices={visibleIndices}
        />
      </div>
    </div>
  );
}
