import { useState, useRef, useCallback } from 'react'
import { extractTextFromImage, cleanOCRText } from '../utils/OCRService'
import { analyzeText } from '../utils/AnalysisLogic'
import { searchMemes } from '../utils/MemeService'

function Dashboard({ onAnalysisComplete, loading, setLoading }) {
  const [text, setText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageFile(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleImageFile(files[0])
    }
  }, [])

  const handleImageFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)')
      return
    }

    setError(null)
    
    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)

    // Perform OCR
    setLoading(true)
    setOcrProgress(0)
    
    try {
      const rawText = await extractTextFromImage(file, setOcrProgress)
      const cleanedText = cleanOCRText(rawText)
      setText(cleanedText)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setOcrProgress(0)
    }
  }

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text or upload an image first!')
      return
    }

    setError(null)
    setLoading(true)

    try {
      // Analyze the text
      const analysis = analyzeText(text)
      
      // Search for memes based on analysis
      const memes = await searchMemes(analysis.memeKeywords)
      
      onAnalysisComplete(analysis, memes)
    } catch (err) {
      setError('Something went wrong during analysis. Please try again!')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    setText('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Drop Zone */}
        <div className="card">
          <h2 className="text-2xl font-bold text-neon-blue mb-4 flex items-center gap-2">
            <span className="text-3xl">📸</span> Upload Screenshot
          </h2>
          
          <div
            className={`drop-zone text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-xl"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : loading && ocrProgress > 0 ? (
              <div className="py-8">
                <div className="loader mx-auto mb-4"></div>
                <p className="text-neon-yellow font-bold">Reading image... {ocrProgress}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-neon-pink to-neon-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-xl text-gray-300">
                  Drop your screenshot here
                </p>
                <p className="text-gray-500 mt-2">or click to browse</p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Text Input */}
        <div className="card">
          <h2 className="text-2xl font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="text-3xl">💬</span> Paste Text
          </h2>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your chat messages here...

Example:
John: bruh did you see what she said 😭
Sarah: lmaooo no way that's so funny
John: im actually dead rn 💀"
            className="w-full h-64 bg-dark-bg/50 border-2 border-neon-pink/30 rounded-2xl p-4 text-white placeholder-gray-500 focus:border-neon-pink focus:outline-none resize-none transition-colors"
          />
          
          <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
            <span>{text.length} characters</span>
            <span>{text.split(/\s+/).filter(w => w).length} words</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4 text-center">
          <p className="text-red-300">⚠️ {error}</p>
        </div>
      )}

      {/* Magic Button */}
      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className={`magic-button ${(loading || !text.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              ✨ Magic Generate ✨
            </span>
          )}
        </button>
        
        <p className="text-gray-400 mt-4 text-sm">
          We'll analyze the vibe and find the perfect meme response!
        </p>
      </div>

      {/* Quick Tips */}
      <div className="card bg-gradient-to-r from-neon-purple/20 to-neon-blue/20">
        <h3 className="font-bold text-lg mb-3">💡 Quick Tips</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>📱 Screenshot works best from chat apps like iMessage, WhatsApp, Discord</li>
          <li>✍️ You can edit the extracted text before analyzing</li>
          <li>🎯 Include the full conversation for better context detection</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
