import { motion } from "framer-motion";
import {
  MessageSquare,
  Heart,
  Zap,
  TrendingUp,
  Hash,
  Smile,
} from "lucide-react";

const EMOTION_COLORS = {
  joy: "#fbbf24",
  anger: "#ef4444",
  sadness: "#3b82f6",
  fear: "#8b5cf6",
  surprise: "#f97316",
  disgust: "#22c55e",
  sarcasm: "#ec4899",
  affection: "#f43f5e",
  neutral: "#6b7280",
};

const EMOTION_EMOJI = {
  joy: "😄",
  anger: "😡",
  sadness: "😢",
  fear: "😰",
  surprise: "😲",
  disgust: "🤢",
  sarcasm: "🙄",
  affection: "🥰",
  neutral: "😐",
};

export default function AnalysisResults({ analysis, ocr, preview }) {
  const { sentiment, emotions, tone, themes, textingStyle, inflection, summary } = analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Zap className="w-6 h-6 text-brand-400" />
        Conversation Analysis
      </h2>

      {/* Summary Banner */}
      <div className="glass rounded-2xl p-6 mb-6">
        <p className="text-gray-300 leading-relaxed">{summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Extracted Text */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Extracted Text</h3>
          </div>
          {preview && (
            <img
              src={preview}
              alt="Uploaded screenshot"
              className="w-full rounded-xl mb-3 max-h-40 object-cover"
            />
          )}
          <div className="bg-gray-900/50 rounded-xl p-4 max-h-48 overflow-y-auto">
            {ocr.messages.map((msg, i) => (
              <p key={i} className="text-sm text-gray-300 mb-1.5">
                {msg.text}
              </p>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {ocr.messageCount} messages detected • {Math.round(ocr.confidence)}% confidence
          </p>
        </div>

        {/* Sentiment */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Sentiment</h3>
          </div>
          <div className="text-center py-4">
            <div className="text-5xl mb-3">
              {sentiment.label === "very positive" && "😍"}
              {sentiment.label === "positive" && "😊"}
              {sentiment.label === "neutral" && "😐"}
              {sentiment.label === "negative" && "😕"}
              {sentiment.label === "very negative" && "😡"}
            </div>
            <p className="text-lg font-semibold text-white capitalize">{sentiment.label}</p>
            <p className="text-sm text-gray-400 mt-1">
              Score: {sentiment.score} ({sentiment.comparative > 0 ? "+" : ""}
              {sentiment.comparative.toFixed(3)})
            </p>
          </div>
          {sentiment.positive.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-green-400 mb-1">Positive words:</p>
              <div className="flex flex-wrap gap-1">
                {sentiment.positive.map((w, i) => (
                  <span key={i} className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sentiment.negative.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-red-400 mb-1">Negative words:</p>
              <div className="flex flex-wrap gap-1">
                {sentiment.negative.map((w, i) => (
                  <span key={i} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emotions */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Emotions</h3>
          </div>
          <div className="text-center mb-4">
            <span className="text-4xl">{EMOTION_EMOJI[emotions.dominant] || "😐"}</span>
            <p className="text-sm text-gray-400 mt-1">
              Dominant: <span className="text-white font-medium capitalize">{emotions.dominant}</span>
            </p>
          </div>
          <div className="space-y-2">
            {Object.entries(emotions.scores)
              .filter(([, score]) => score > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, score]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-xs w-16 text-gray-400 capitalize">{emotion}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="emotion-bar h-full rounded-full"
                      style={{
                        width: `${score}%`,
                        backgroundColor: EMOTION_COLORS[emotion] || "#6b7280",
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{score}%</span>
                </div>
              ))}
          </div>
        </div>

        {/* Tone */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Tone & Inflection</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {tone.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-brand-600/20 text-brand-300 text-sm rounded-full font-medium"
              >
                {t}
              </span>
            ))}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Inflection:</p>
            <div className="flex flex-wrap gap-1.5">
              {inflection.map((inf, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg"
                >
                  {inf}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Themes */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Themes & Topics</h3>
          </div>
          {themes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {themes.map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-orange-500/10 text-orange-300 text-sm rounded-full"
                >
                  # {theme}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No specific themes detected</p>
          )}
        </div>

        {/* Texting Style */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Texting Style</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Style</span>
              <span className="text-sm text-white font-medium capitalize">{textingStyle.style}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Avg Length</span>
              <span className="text-sm text-white">{textingStyle.averageMessageLength} chars</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Energy</span>
              <span className="text-sm text-white capitalize">{textingStyle.energy}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {textingStyle.usesEmojis && (
                <span className="text-xs bg-yellow-500/10 text-yellow-300 px-2 py-1 rounded-lg">Emojis</span>
              )}
              {textingStyle.usesSlang && (
                <span className="text-xs bg-pink-500/10 text-pink-300 px-2 py-1 rounded-lg">Slang</span>
              )}
              {textingStyle.usesCaps && (
                <span className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded-lg">ALL CAPS</span>
              )}
              {textingStyle.usesExclamation && (
                <span className="text-xs bg-orange-500/10 text-orange-300 px-2 py-1 rounded-lg">Exclamations!</span>
              )}
              {textingStyle.usesQuestionMarks && (
                <span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded-lg">Questions?</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
