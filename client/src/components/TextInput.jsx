import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function TextInput({ onSubmit, loading }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="glass rounded-3xl p-8">
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Paste your conversation text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`e.g.\nHey, are you coming tonight?\nIdk, I'm kinda tired\nBruh come on it'll be fun\nFine but I'm leaving early\n😂😂`}
          rows={8}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
          disabled={loading}
        />
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-full text-sm font-semibold transition-all shadow-lg shadow-brand-600/30"
          >
            <Send className="w-4 h-4" />
            Analyze & Get Memes
          </button>
        </div>
      </form>
    </motion.div>
  );
}
