import TextType from '@/components/TextType';
import StarBorder from '@/components/StarBorder';
import FadeContent from '@/components/FadeContent';
import type { ScriptSection } from '@/content/alphaArenaScript';

const SectionPage = ({ section, index, total }: { section: ScriptSection; index: number; total: number }) => {
  const layout = section.layout || 'default';

  // Hero layout - big emoji, centered dramatic presentation
  if (layout === 'hero') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative px-8">
        <div className="absolute top-6 right-6 text-gray-500 text-sm">
          {index + 1}/{total} · {section.duration}
        </div>
        
        <FadeContent duration={400}>
          <div className="text-8xl mb-8">{section.emoji}</div>
        </FadeContent>
        
        <FadeContent duration={600} delay={200}>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-12 text-center">
            {section.name}
          </h1>
        </FadeContent>

        <div className="w-full max-w-4xl space-y-6">
          {section.content_parts.map((line, i) => (
            <FadeContent key={i} duration={700} delay={400 + i * 150}>
              <StarBorder as="div" color="#f59e0b" speed={`${3 + i * 0.5}s`} thickness={2}>
                <p className="text-white text-xl md:text-2xl leading-relaxed text-center font-medium">
                  {line}
                </p>
              </StarBorder>
            </FadeContent>
          ))}
        </div>
      </div>
    );
  }

  // Center layout - emoji + clean centered text
  if (layout === 'center') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative px-8">
        <div className="absolute top-6 left-6 text-gray-400 text-sm flex items-center gap-2">
          <span>{index + 1}/{total}</span>
          <span>·</span>
          <span>{section.duration}</span>
        </div>

        <div className="w-full max-w-3xl text-center space-y-8">
          <FadeContent duration={500}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-6xl">{section.emoji}</div>
              <TextType
                text={section.name}
                as="h1"
                className="text-4xl md:text-5xl font-bold text-white"
                showCursor={false}
                typingSpeed={30}
                startOnVisible={true}
              />
            </div>
          </FadeContent>

          {section.content_parts.map((line, i) => (
            <FadeContent key={i} duration={600} delay={200 + i * 100}>
              <p className="text-white text-xl md:text-2xl leading-relaxed">
                {line}
              </p>
            </FadeContent>
          ))}
        </div>
      </div>
    );
  }

  // Split layout - emoji on left, content on right
  if (layout === 'split') {
    return (
      <div className="w-full h-full flex items-center relative px-12">
        <div className="absolute top-6 right-6 text-gray-500 text-sm">
          {index + 1}/{total} · {section.duration}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl mx-auto items-center">
          <FadeContent duration={600}>
            <div className="flex flex-col items-center justify-center">
              <div className="text-9xl mb-6">{section.emoji}</div>
              <h1 className="text-4xl md:text-5xl font-black text-white text-center">
                {section.name}
              </h1>
            </div>
          </FadeContent>

          <div className="space-y-5">
            {section.content_parts.map((line, i) => (
              <FadeContent key={i} duration={600} delay={300 + i * 120}>
                <StarBorder as="div" color="#8b5cf6" speed={`${4 + i}s`} thickness={1}>
                  <p className="text-white text-lg leading-relaxed">{line}</p>
                </StarBorder>
              </FadeContent>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Cards layout - grid of content cards
  if (layout === 'cards') {
    return (
      <div className="w-full h-full flex flex-col relative px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{section.emoji}</span>
            <TextType
              text={section.name}
              as="h1"
              className="text-3xl md:text-4xl font-bold text-white"
              showCursor={false}
              typingSpeed={30}
              startOnVisible={true}
            />
          </div>
          <span className="text-gray-400 text-sm">
            {index + 1}/{total} · {section.duration}
          </span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-center">
          {section.content_parts.map((line, i) => (
            <FadeContent key={i} duration={500} delay={100 + i * 80}>
              <StarBorder 
                as="div" 
                color={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#3b82f6" : "#ec4899"} 
                speed={`${3 + i * 0.3}s`} 
                thickness={1}
              >
                <div className="h-full flex items-center">
                  <p className="text-white text-base md:text-lg leading-relaxed">{line}</p>
                </div>
              </StarBorder>
            </FadeContent>
          ))}
        </div>
      </div>
    );
  }

  // Default layout - classic list with emoji header
  return (
    <div className="w-full h-full flex flex-col relative px-8">
      <div className="pt-8 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-5xl">{section.emoji}</span>
          <TextType
            text={section.name}
            as="h1"
            className="text-3xl md:text-4xl font-bold text-white"
            showCursor={false}
            typingSpeed={30}
            startOnVisible={true}
          />
        </div>
        <div className="text-gray-400 text-sm ml-[4.5rem]">
          {index + 1}/{total} · {section.duration}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-4">
          {section.content_parts.map((line, i) => (
            <FadeContent key={i} duration={600} delay={150 + i * 100}>
              <StarBorder as="div" color="#60a5fa" speed={`${4 + i}s`} thickness={1}>
                <p className="text-white text-lg leading-relaxed">{line}</p>
              </StarBorder>
            </FadeContent>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionPage;
