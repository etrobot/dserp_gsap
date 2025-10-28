import { useMemo } from 'react'
import Player from '@/components/Player'
import Page1 from '@/pages/Page1'
import Page2 from '@/pages/Page2'
import Page3 from '@/pages/Page3'

function App() {
  const pages = useMemo(() => [
    <Page1 key="page1" />,
    <Page2 key="page2" />,
    <Page3 key="page3" />
  ], [])

  return <Player pages={pages} />
}

export default App
