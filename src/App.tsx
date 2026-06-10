import { useState } from 'react'
import Preloader from './components/Preloader'
import MainApp from './components/MainApp'

export default function App() {
  const [preloadDone, setPreloadDone] = useState(false)

  return (
    <div data-theme="dark">
      {!preloadDone ? (
        <Preloader onComplete={() => setPreloadDone(true)} />
      ) : (
        <MainApp />
      )}
    </div>
  )
}