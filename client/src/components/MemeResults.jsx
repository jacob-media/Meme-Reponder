import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Image, Film, Globe, Download, ExternalLink } from "lucide-react";

export default function MemeResults({ meme, gifs, webMemes }) {
  const [activeTab, setActiveTab] = useState("generated");

  const tabs = [
    { id: "generated", label: "Generated Meme", icon: Sparkles },
    { id: "gifs",      label: "GIF Reactions",  icon: Film },
    { id: "trending",  label: "Trending Memes",  icon: Globe },
  ];

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
      {activeTab === "generated" && meme && (
        <div className="glass rounded-2xl p-6">
          {meme.meme?.url ? (
            <div className="text-center">
              <div className="inline-block rounded-2xl overflow-hidden shadow-2xl shadow-brand-900/30 max-w-lg">
                <img
                  src={meme.meme.url}
                  alt={meme.meme.template?.name || "Generated meme"}
                  className="w-full"
                />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400">
                  Template: <span className="text-white">{meme.meme.template?.name}</span>
                  {" • "}
                  Mood: <span className="text-brand-300 capitalize">{meme.meme.mood}</span>
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href={meme.meme.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                  {meme.meme.pageUrl && (
                    <a
                      href={meme.meme.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" /> View on Imgflip
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">Meme template selected:</p>
              <p className="text-xl font-semibold text-white mb-2">{meme.meme?.template?.name}</p>
              <div className="glass inline-block rounded-xl px-6 py-4 mt-3">
                <p className="text-sm text-gray-300">
                  <span className="text-brand-400 font-medium">Top:</span> {meme.meme?.captions?.top}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-brand-400 font-medium">Bottom:</span> {meme.meme?.captions?.bottom}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Add Imgflip API credentials in <code>.env</code> to auto-generate meme images
              </p>
            </div>
          )}
        </div>
      )}

      {/* GIF Results */}
      {activeTab === "gifs" && (
        <div className="glass rounded-2xl p-6">
          {gifs?.gifs?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gifs.gifs.map((gif) => (
                <a
                  key={gif.id}
                  href={gif.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-xl overflow-hidden bg-gray-800"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-xs text-white line-clamp-2">{gif.title}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{gifs?.message || "No GIFs found"}</p>
              <p className="text-xs text-gray-500 mt-2">
                Add a Giphy API key in <code>.env</code> to enable GIF search
              </p>
            </div>
          )}
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
