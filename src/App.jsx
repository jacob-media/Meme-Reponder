import { useState } from 'react'
import Dashboard from './components/Dashboard'
import MemeResults from './components/MemeResults'
import MemeGenerator from './components/MemeGenerator'

function App() {
  const [analysis, setAnalysis] = useState(null)
  const [memes, setMemes] = useState([])
  const [selectedMeme, setSelectedMeme] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)

  const handleAnalysisComplete = (analysisResult, memesResult) => {
    setAnalysis(analysisResult)
    setMemes(memesResult)
  }

  const handleMemeSelect = (meme) => {
    setSelectedMeme(meme)
    setShowGenerator(true)
  }

  const handleBack = () => {
    setShowGenerator(false)
    setSelectedMeme(null)
  }

  const handleReset = () => {
    setAnalysis(null)
    setMemes([])
    setSelectedMeme(null)
    setShowGenerator(false)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-blue bg-clip-text text-transparent animate-pulse-glow">
          Meme Responder
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mt-2">
          Drop a screenshot or paste text - we'll find the perfect meme! 
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {showGenerator && selectedMeme ? (
          <MemeGenerator 
            meme={selectedMeme} 
            analysis={analysis}
            onBack={handleBack} 
          />
        ) : !analysis ? (
          <Dashboard 
            onAnalysisComplete={handleAnalysisComplete}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <MemeResults 
            analysis={analysis}
            memes={memes}
            onMemeSelect={handleMemeSelect}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>Made with fun vibes only</p>
      </footer>
    </div>
  )
}

export default App
