import { useState, useMemo, type ReactNode } from 'react'
import Player from '@/components/Player'
import Presentation from '@/presentation/Presentation'
import { useScriptData } from '@/hooks/useScriptData'
import { useScriptsList } from '@/hooks/useScriptsList'

function App() {
  const [selectedFile, setSelectedFile] = useState<string>('')
  const { scripts: scriptsList, loading: listLoading, error: listError } = useScriptsList()
  const { data: scriptData, loading: dataLoading, error: dataError } = useScriptData(
    selectedFile ? `/scripts/${selectedFile}` : ''
  )

  const { pages, subtitleTexts, pageLayouts } = useMemo(() => {
    if (!scriptData) return { pages: [], subtitleTexts: [], pageLayouts: [] }

    const pagesArr = [] as ReactNode[]
    const subtitleArr = [] as string[]
    const layoutsArr = [] as string[]

    for (let i = 0; i < scriptData.sections.length; i++) {
      const section = scriptData.sections[i]
      pagesArr.push(
        <Presentation 
          key={section.id} 
          section={section} 
          index={i} 
          total={scriptData.sections.length} 
        />
      )
      // Extract reading text from content array's read_srt field
      // Filter out empty strings and join with space
      const readTexts = section.content
        ?.map(item => item.read_srt)
        .filter(text => text && text.trim().length > 0) || []
      
      subtitleArr.push(readTexts.join(' '))
      
      // Extract layout type
      layoutsArr.push(section.layout || '')
    }

    return { pages: pagesArr, subtitleTexts: subtitleArr, pageLayouts: layoutsArr }
  }, [scriptData])

  // Show loading state
  if (listLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Show error
  if (listError || dataError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
        <div className="text-xl text-red-500">Error: {(listError || dataError)?.message}</div>
      </div>
    )
  }

  return (
    <Player 
      pages={pages} 
      subtitleTexts={subtitleTexts}
      pageLayouts={pageLayouts}
      scriptFiles={scriptsList?.files || []}
      currentScript={selectedFile}
      onScriptChange={setSelectedFile}
      defaultLanguage={scriptData?.language || 'zh-CN'}
    />
  )
}

export default App
