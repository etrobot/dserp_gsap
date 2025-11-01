import { useMemo, type ReactNode } from 'react'
import Player from '@/components/Player'
import Presentation from '@/presentation/xlinDataInsight'
import { memeCoinScript } from '@/content/memeCoinScript'

function App() {
  const { pages, subtitleTexts } = useMemo(() => {
    const pagesArr = [] as ReactNode[]
    const subtitleArr = [] as string[]

    for (let i = 0; i < memeCoinScript.sections.length; i++) {
      const section = memeCoinScript.sections[i]
      pagesArr.push(<Presentation key={section.id} section={section} index={i} total={memeCoinScript.sections.length} />)
      // Join all non-empty scripts with periods for TTS narration
      subtitleArr.push(section.scripts?.filter(s => s.trim()).join(' ') || section.content_parts?.join('。') || '')
    }

    return { pages: pagesArr, subtitleTexts: subtitleArr }
  }, [])

  return <Player pages={pages} subtitleTexts={subtitleTexts} />
}

export default App
