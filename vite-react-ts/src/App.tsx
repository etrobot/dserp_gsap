import { useState, useMemo, type ReactNode } from 'react'
import Player from '@/components/Player'
import Presentation from '@/components/Presentation'
import { useScriptData } from '@/hooks/useScriptData'
import { useScriptsList } from '@/hooks/useScriptsList'

function AppContent() {
  // Read script from URL parameter
  const getInitialScript = () => {
    const params = new URLSearchParams(window.location.search)
    const scriptParam = params.get('script')
    return scriptParam ? `${scriptParam}.json` : ''
  }

  const [selectedFile, setSelectedFile] = useState<string>(getInitialScript())
  
  // Check if autoplay is enabled
  const shouldAutoplay = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('autoplay') === 'true'
  }, [])
  const { scripts: scriptsList, loading: listLoading, error: listError } = useScriptsList()
  const { data: scriptData, loading: dataLoading, error: dataError } = useScriptData(
    selectedFile ? `/scripts/${selectedFile}` : ''
  )

  const { pages, subtitleTexts, pageLayouts, pageDurations } = useMemo(() => {
    if (!scriptData) return { pages: [], subtitleTexts: [], pageLayouts: [], pageDurations: [] }

    const pagesArr = [] as ReactNode[]
    const subtitleArr = [] as string[]
    const layoutsArr = [] as string[]
    const durationsArr: Array<{ sectionId: string; duration?: number }> = []

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

      // Extract section duration - use section.duration if available,
      // otherwise calculate from content array's showtime field (supports showtime per content item)
      let sectionDuration = section.duration;

      if (!sectionDuration || sectionDuration <= 0) {
        // Calculate duration from content showtime values
        // This allows different showtime per content item (for animations, transitions, etc.)
        const showtimeSum = section.content?.reduce((sum, item) => {
          return sum + (item.showtime || 0);
        }, 0) || 0;

        if (showtimeSum > 0) {
          sectionDuration = showtimeSum;
        }
      }

      durationsArr.push({
        sectionId: section.id,
        duration: sectionDuration,
      })
    }

    return { pages: pagesArr, subtitleTexts: subtitleArr, pageLayouts: layoutsArr, pageDurations: durationsArr }
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
      pageDurations={pageDurations}
      scriptFiles={scriptsList?.files || []}
      currentScript={selectedFile}
      onScriptChange={setSelectedFile}
      defaultLanguage={scriptData?.language || 'zh-CN'}
      scriptName={selectedFile?.replace('.json', '') || ''}
      autoplay={shouldAutoplay}
    />
  )
}

function App() {
  return <AppContent />
}

export default App
