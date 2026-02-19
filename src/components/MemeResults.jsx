import { useState } from 'react'

function MemeResults({ analysis, memes, onMemeSelect, onReset }) {
  const [showFullText, setShowFullText] = useState(false)

  const getSentimentColor = (score) => {
    if (score > 2) return 'from-green-400 to-emerald-500'
    if (score > 0) return 'from-green-300 to-lime-400'
    if (score < -2) return 'from-red-500 to-rose-600'
    if (score < 0) return 'from-orange-400 to-red-400'
    return 'from-gray-400 to-gray-500'
  }

  const getToneColor = (percentage) => {
    if (percentage > 60) return 'text-neon-pink'
    if (percentage > 30) return 'text-neon-yellow'
    return 'text-neon-blue'
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <span>←</span> Start Over
      </button>

      {/* Analysis Results */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Sentiment Card */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-400 mb-3">😊 Sentiment</h3>
          <div className="text-center">
            <div className="text-5xl mb-2">{analysis.sentiment.emoji}</div>
            <p className="text-xl font-bold text-white">{analysis.sentiment.label}</p>
            
            {/* Sentiment Bar */}
            <div className="mt-4 bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getSentimentColor(analysis.sentiment.score)} transition-all duration-500`}
                style={{ width: `${analysis.sentiment.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>
          
          {/* Positive/Negative Words */}
          {(analysis.sentiment.positiveWords.length > 0 || analysis.sentiment.negativeWords.length > 0) && (
            <div className="mt-4 text-sm">
              {analysis.sentiment.positiveWords.length > 0 && (
                <p className="text-green-400">
                  <span className="text-gray-500">Good vibes:</span> {analysis.sentiment.positiveWords.slice(0, 3).join(', ')}
                </p>
              )}
              {analysis.sentiment.negativeWords.length > 0 && (
                <p className="text-red-400 mt-1">
                  <span className="text-gray-500">Bad vibes:</span> {analysis.sentiment.negativeWords.slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tone Card */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-400 mb-3">🎭 Vibe Check</h3>
          <div className="text-center">
            <p className={`text-3xl font-bold ${getToneColor(analysis.tone.slangPercentage)}`}>
              {analysis.tone.tone}
            </p>
            <p className="text-gray-400 mt-1">{analysis.tone.description}</p>
            
            {/* Slang Meter */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Formal</span>
                <span>Slang Level: {Math.round(analysis.tone.slangPercentage)}%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink transition-all duration-500"
                  style={{ width: `${analysis.tone.slangPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Found Slang */}
          {analysis.tone.foundSlang.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Slang detected:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.tone.foundSlang.map((slang, i) => (
                  <span key={i} className="bg-neon-purple/30 px-2 py-1 rounded-full text-xs text-neon-purple">
                    {slang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Context Card */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-400 mb-3">🎯 Topic</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-neon-yellow">
              {analysis.context.primaryLabel}
            </p>
            <p className="text-gray-400 mt-1 capitalize">
              Confidence: {analysis.context.confidence}
            </p>
          </div>
          
          {/* Secondary Topics */}
          {analysis.context.secondary.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Also about:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.context.secondary.map((topic, i) => (
                  <span key={i} className="bg-neon-yellow/20 px-2 py-1 rounded-full text-xs text-neon-yellow">
                    {topic.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Keywords */}
          {analysis.context.matchedKeywords && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Keywords:</p>
              <p className="text-sm text-gray-300 mt-1">
                {analysis.context.matchedKeywords.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Original Text Preview */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-400">📝 Analyzed Text</h3>
          <button
            onClick={() => setShowFullText(!showFullText)}
            className="text-neon-blue text-sm hover:underline"
          >
            {showFullText ? 'Show Less' : 'Show More'}
          </button>
        </div>
        <div className={`bg-dark-bg/50 rounded-xl p-4 ${showFullText ? '' : 'max-h-24 overflow-hidden'}`}>
          <p className="text-gray-300 whitespace-pre-wrap text-sm">
            {analysis.originalText}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {analysis.wordCount} words • {analysis.messageCount} messages detected
        </p>
      </div>

      {/* Meme Results */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🔥</span> 
          <span className="bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
            Perfect Meme Responses
          </span>
        </h2>
        <p className="text-gray-400 mb-6">
          Click a meme to customize it with your own text!
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memes.map((meme) => (
            <div
              key={meme.id}
              className="meme-card group"
              onClick={() => onMemeSelect(meme)}
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={meme.url} 
                  alt={meme.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-300 truncate">{meme.title}</p>
                <p className="text-xs text-neon-blue mt-1">Click to customize →</p>
              </div>
            </div>
          ))}
        </div>
        
        {memes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">😅</p>
            <p>No memes found. Try with different text!</p>
          </div>
        )}
      </div>

      {/* Custom Meme Button */}
      <div className="text-center">
        <button
          onClick={() => onMemeSelect({ 
            id: 'custom', 
            title: 'Custom Template',
            url: null,
            isTemplate: true 
          })}
          className="bg-gradient-to-r from-neon-yellow to-neon-pink text-dark-bg font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
        >
          🎨 Create Custom Meme Instead
        </button>
      </div>
    </div>
  )
}

export default MemeResults
