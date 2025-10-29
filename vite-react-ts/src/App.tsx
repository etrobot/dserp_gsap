import { useMemo, type ReactNode } from 'react'
import Player from '@/components/Player'
import TextType from '@/components/TextType'
import StarBorder from '@/components/StarBorder'
import FadeContent from '@/components/FadeContent'
import SectionPage from '@/pages/SectionPage'
import { alphaArenaScript } from '@/content/alphaArenaScript'

function App() {
  const pages = useMemo(() => {
    const pagesArr = [] as ReactNode[]

    // Cover page
    pagesArr.push(
      <div key="cover" className="w-full h-full flex flex-col items-center justify-center text-center gap-8 px-8">
        <FadeContent duration={600}>
          <div className="text-8xl mb-4">🤖💰🔥</div>
        </FadeContent>
        
        <FadeContent duration={800} delay={200}>
          <TextType
            text={alphaArenaScript.title}
            as="h1"
            className="text-4xl md:text-6xl font-black text-white leading-tight max-w-5xl"
            showCursor={false}
            typingSpeed={20}
            startOnVisible={true}
          />
        </FadeContent>
        
        <FadeContent duration={800} delay={400}>
          <StarBorder as="div" color="#34d399" speed="4s" thickness={2}>
            <p className="text-gray-300 text-lg md:text-xl italic px-6 py-2">
              {alphaArenaScript.style}
            </p>
          </StarBorder>
        </FadeContent>
        
        <FadeContent duration={800} delay={600}>
          <div className="text-gray-400 text-sm flex items-center gap-3 mt-4">
            <span>📊 Real Money</span>
            <span>•</span>
            <span>🧠 AI vs Market</span>
            <span>•</span>
            <span>⚡ No Human Control</span>
          </div>
        </FadeContent>
      </div>
    )

    // Section pages
    for (let i = 0; i < alphaArenaScript.sections.length; i++) {
      const section = alphaArenaScript.sections[i]
      pagesArr.push(<SectionPage key={section.id} section={section} index={i} total={alphaArenaScript.sections.length} />)
    }

    return pagesArr
  }, [])

  return <Player pages={pages} />
}

export default App
