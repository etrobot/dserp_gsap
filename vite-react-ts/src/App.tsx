import { useMemo, type ReactNode } from 'react'
import Player from '@/components/Player'
import Presentation from '@/presentation/xlinDataInsight'
import { xiaLinScript } from '@/content/xlinDataInsghtScript'

function App() {
  const { pages, readingTexts } = useMemo(() => {
    const pagesArr = [] as ReactNode[]
    const readingArr = [] as string[]

    for (let i = 0; i < xiaLinScript.sections.length; i++) {
      const section = xiaLinScript.sections[i]
      pagesArr.push(<Presentation key={section.id} section={section} index={i} total={xiaLinScript.sections.length} />)
      readingArr.push(section.reading || section.content_parts.join('。'))
    }

    return { pages: pagesArr, readingTexts: readingArr }
  }, [])

  return <Player pages={pages} readingTexts={readingTexts} />
}

export default App
