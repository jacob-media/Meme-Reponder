import { useState, useRef, useEffect } from 'react'
import { generateResponseSuggestions } from '../utils/AnalysisLogic'
import { MEME_TEMPLATES } from '../utils/MemeService'

function MemeGenerator({ meme, analysis, onBack }) {
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(meme.isTemplate ? MEME_TEMPLATES[0] : null)
  const [fontSize, setFontSize] = useState(32)
  const [textColor, setTextColor] = useState('#ffffff')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const canvasRef = useRef(null)
  
  const suggestions = analysis ? generateResponseSuggestions(analysis) : []
  
  const currentImageUrl = meme.isTemplate 
    ? selectedTemplate?.url 
    : meme.originalUrl || meme.url

  // Draw meme on canvas
  useEffect(() => {
    if (!currentImageUrl || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image
      ctx.drawImage(img, 0, 0)
      
      // Text styling
      ctx.fillStyle = textColor
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = fontSize / 10
      ctx.textAlign = 'center'
      ctx.font = `bold ${fontSize}px Impact, sans-serif`
      
      // Draw top text
      if (topText) {
        const topY = fontSize + 10
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY)
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY)
      }
      
      // Draw bottom text
      if (bottomText) {
        const bottomY = canvas.height - 20
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY)
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY)
      }
    }
    
    img.src = currentImageUrl
  }, [currentImageUrl, topText, bottomText, fontSize, textColor])

  const handleDownload = () => {
    if (!canvasRef.current) return
    
    const link = document.createElement('a')
    link.download = 'meme-response.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return
    
    try {
      const blob = await new Promise(resolve => 
        canvasRef.current.toBlob(resolve, 'image/png')
      )
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('Meme copied to clipboard! 🎉')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Could not copy. Try downloading instead!')
    }
  }

  const useSuggestion = (text) => {
    if (!topText) {
      setTopText(text)
    } else if (!bottomText) {
      setBottomText(text)
    } else {
      setBottomText(text)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <span>←</span> Back to Results
      </button>

      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
        🎨 Customize Your Meme
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-400 mb-4">Preview</h3>
          <div className="bg-dark-bg rounded-xl p-4 flex items-center justify-center min-h-[300px]">
            {currentImageUrl ? (
              <canvas 
                ref={canvasRef}
                className="max-w-full max-h-[400px] rounded-lg"
              />
            ) : (
              <p className="text-gray-500">Select a template to start</p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="flex-1 bg-neon-blue text-dark-bg font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform"
            >
              📥 Download
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 bg-neon-pink text-dark-bg font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform"
            >
              📋 Copy
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Template Selection (if custom) */}
          {meme.isTemplate && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-400 mb-3">🖼️ Choose Template</h3>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {MEME_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedTemplate?.id === template.id 
                        ? 'border-neon-pink scale-105' 
                        : 'border-transparent hover:border-neon-blue'
                    }`}
                  >
                    <img 
                      src={template.url} 
                      alt={template.name}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Inputs */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-400 mb-3">✏️ Add Text</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Top Text</label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="When you realize..."
                  className="w-full bg-dark-bg border-2 border-neon-blue/30 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Bottom Text</label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="...it's Monday tomorrow"
                  className="w-full bg-dark-bg border-2 border-neon-pink/30 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-neon-pink focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Style Options */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-400 mb-3">🎨 Style</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 flex justify-between">
                  <span>Font Size</span>
                  <span>{fontSize}px</span>
                </label>
                <input
                  type="range"
                  min="16"
                  max="64"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-neon-pink"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Text Color</label>
                <div className="flex gap-2 mt-2">
                  {['#ffffff', '#ffff00', '#00ff00', '#ff69b4', '#00ffff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        textColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && showSuggestions && (
            <div className="card bg-gradient-to-r from-neon-purple/20 to-neon-pink/20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-400">💡 Suggestions</h3>
                <button 
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-500 text-sm"
                >
                  Hide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => useSuggestion(suggestion)}
                    className="bg-neon-purple/30 px-3 py-1 rounded-full text-sm text-white hover:bg-neon-purple/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click to add as top/bottom text
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MemeGenerator
