import { useState } from 'react';
import type { Feature } from '@/components/slides/n-col-features';
import NColFeatures from '@/components/slides/n-col-features';
import { useAzureSpeech, type AzureSpeechConfig } from '@/hooks/useAzureSpeech';

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

// Define which words should trigger which feature indices
const TRIGGER_WORDS_MAP: Record<string, number> = {
  'React': 0,
  'Vite': 1,
  'TypeScript': 2,
  'Tailwind': 3,
  'GSAP': 4,
  'Responsive': 5,
};

export default function P1() {
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [useSpeechControl, setUseSpeechControl] = useState(false);
  
  // Configure your Azure Speech credentials here
  const azureConfig: AzureSpeechConfig = {
    subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
    region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus',
  };

  const { speak, stop, isSpeaking } = useAzureSpeech(azureConfig);

  const handleStartSpeech = () => {
    // Reset visible indices
    setVisibleIndices([]);
    setUseSpeechControl(true);

    const speechText = `Let me introduce you to our amazing tech stack. 
      First, we have React, the powerful UI library. 
      Then Vite, our blazing fast build tool. 
      TypeScript brings type safety to our code. 
      Tailwind CSS makes styling a breeze. 
      GSAP powers our animations. 
      And everything is Responsive across all devices.`;

    speak(speechText, {
      onWordBoundary: (word, wordIndex) => {
        console.log(`Word ${wordIndex}: ${word.text}`);
        
        // Check if this word triggers a feature
        const featureIndex = TRIGGER_WORDS_MAP[word.text];
        if (featureIndex !== undefined) {
          setVisibleIndices((prev) => {
            if (!prev.includes(featureIndex)) {
              return [...prev, featureIndex];
            }
            return prev;
          });
        }
      },
      onSynthesisStart: () => {
        console.log('Speech started');
      },
      onSynthesisEnd: () => {
        console.log('Speech ended');
      },
      onError: (error) => {
        console.error('Speech error:', error);
        alert(`Speech Error: ${error}\n\nPlease configure Azure Speech credentials in .env file:\nVITE_AZURE_SPEECH_KEY=your_key\nVITE_AZURE_SPEECH_REGION=your_region`);
      },
    });
  };

  const handleReset = () => {
    stop();
    setVisibleIndices([]);
    setUseSpeechControl(false);
  };

  const handleShowAll = () => {
    stop();
    setUseSpeechControl(false);
    setVisibleIndices([]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-8 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto">
        {/* Control Panel */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleStartSpeech}
            disabled={isSpeaking}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isSpeaking ? 'Speaking...' : 'Start Speech Demo'}
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
