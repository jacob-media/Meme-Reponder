import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Image, Globe, Download, RefreshCw } from "lucide-react";
import { renderMeme, downloadMeme } from "../services/memeRenderer";
import { generateMeme as generateNewMeme } from "../services/memeEngine";

export default function MemeResults({ meme, gifs, webMemes, analysisContext }) {
  const [activeTab, setActiveTab] = useState("generated");
  const [renderedMemeUrl, setRenderedMemeUrl] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [currentMeme, setCurrentMeme] = useState(meme);

  const tabs = [
    { id: "generated", label: "Generated Meme", icon: Sparkles },
    { id: "trending",  label: "Trending Memes",  icon: Globe },
  ];

  // Automatically render the meme with captions baked into the image
  useEffect(() => {
    if (!currentMeme?.meme) return;
    let cancelled = false;

    async function render() {
      setRendering(true);
      setRenderedMemeUrl(null);
      try {
        const { imageUrl, captions } = currentMeme.meme;
        const dataUrl = await renderMeme(imageUrl, captions.top, captions.bottom);
        if (!cancelled) setRenderedMemeUrl(dataUrl);
      } catch (err) {
        console.error("Meme render failed:", err);
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [currentMeme]);

  const handleRegenerate = async () => {
    if (!analysisContext) return;
    const newMeme = await generateNewMeme(analysisContext.memeContext, analysisContext.conversationText);
    setCurrentMeme(newMeme);
  };

  const handleDownload = () => {
    if (renderedMemeUrl) {
      downloadMeme(renderedMemeUrl, `meme-${currentMeme.meme?.template?.name?.replace(/\s+/g, "-") || "response"}.png`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-brand-400" />
        Your Meme Responses
      </h2>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                : "glass text-gray-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Generated Meme */}
      {activeTab === "generated" && currentMeme && (
        <div className="glass rounded-2xl p-6">
          <div className="text-center">
            {rendering ? (
              <div className="py-12">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Rendering your meme...</p>
              </div>
            ) : renderedMemeUrl ? (
              <>
                <div className="inline-block rounded-2xl overflow-hidden shadow-2xl shadow-brand-900/30 max-w-lg">
                  <img
                    src={renderedMemeUrl}
                    alt={currentMeme.meme?.template?.name || "Generated meme"}
                    className="w-full"
                  />
                </div>
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-400">
                    Template: <span className="text-white">{currentMeme.meme?.template?.name}</span>
                    {" • "}
                    Mood: <span className="text-brand-300 capitalize">{currentMeme.meme?.mood}</span>
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-full text-sm font-semibold transition-all shadow-lg shadow-brand-600/30"
                    >
                      <Download className="w-4 h-4" /> Download Meme
                    </button>
                    <button
                      onClick={handleRegenerate}
                      className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-sm font-medium text-gray-300 hover:text-white transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> New Meme
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12">
                <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Could not render meme. Try generating a new one.</p>
                <button
                  onClick={handleRegenerate}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-full text-sm font-semibold transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Web / Trending Memes */}
      {activeTab === "trending" && (
        <div className="glass rounded-2xl p-6">
          {webMemes?.memes?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {webMemes.memes
                .filter((m) => !m.nsfw)
                .map((memeItem, i) => (
                  <a
                    key={i}
                    href={memeItem.postLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glass rounded-xl overflow-hidden hover:border-brand-500/30 transition-all"
                  >
                    <img
                      src={memeItem.url}
                      alt={memeItem.title}
                      className="w-full h-56 object-contain bg-gray-900"
                      loading="lazy"
                    />
                    <div className="p-3">
                      <p className="text-sm text-white line-clamp-2 group-hover:text-brand-300 transition-colors">
                        {memeItem.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">r/{memeItem.subreddit}</p>
                    </div>
                  </a>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Could not fetch trending memes</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
