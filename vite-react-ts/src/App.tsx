import { useState, useMemo, type ReactNode } from 'react'
import Player from '@/components/Player'
import Presentation from '@/components/Presentation'
import { useScriptData } from '@/hooks/useScriptData'
import { useScriptsList } from '@/hooks/useScriptsList'
import { ToastProvider } from '@/contexts/ToastContext'
import { ToastContainer } from '@/components/Toast'

function AppContent() {
  // Read script from URL parameter
  const getInitialScript = () => {
    const params = new URLSearchParams(window.location.search)
    const scriptParam = params.get('script')
    return scriptParam ? `${scriptParam}.json` : ''
  }

  const [selectedFile, setSelectedFile] = useState<string>(getInitialScript())
  const { scripts: scriptsList, loading: listLoading, error: listError } = useScriptsList()
  const { data: scriptData, loading: dataLoading, error: dataError } = useScriptData(
    selectedFile ? `/scripts/${selectedFile}` : ''
  )

  const { pages, subtitleTexts, pageLayouts, pageAudioData } = useMemo(() => {
    if (!scriptData) return { pages: [], subtitleTexts: [], pageLayouts: [], pageAudioData: [] }

    const pagesArr = [] as ReactNode[]
    const subtitleArr = [] as string[]
    const layoutsArr = [] as string[]
    const audioDataArr: Array<{ sectionId: string; contentItems: Array<{ contentIndex: number; duration?: number }> }> = []

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
      
      // Extract all audio files for this section
      const contentItems = (section.content || []).map((item, idx) => ({
        contentIndex: idx,
        duration: item.duration,
      }))
      
      audioDataArr.push({
        sectionId: section.id,
        contentItems,
      })
    }

    return { pages: pagesArr, subtitleTexts: subtitleArr, pageLayouts: layoutsArr, pageAudioData: audioDataArr }
  }, [scriptData])

  // Show loading state
  if (listLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Show error or validation errors
  if (listError || dataError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-8">
        <div className="max-w-2xl w-full">
          <div className="text-xl font-bold text-red-500 mb-4">❌ Error Loading Script</div>
          <div className="bg-gray-900 border border-red-500 rounded p-4">
            <p className="text-white whitespace-pre-wrap">{(listError || dataError)?.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Player 
      pages={pages} 
      subtitleTexts={subtitleTexts}
      pageLayouts={pageLayouts}
      pageAudioData={pageAudioData}
      scriptFiles={scriptsList?.files || []}
      currentScript={selectedFile}
      onScriptChange={setSelectedFile}
      defaultLanguage={scriptData?.language || 'zh-CN'}
      scriptName={selectedFile?.replace('.json', '') || ''}
    />
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer />
    </ToastProvider>
  )
}

export default App
