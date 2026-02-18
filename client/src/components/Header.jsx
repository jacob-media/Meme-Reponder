import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="text-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          Meme Responder
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Upload a screenshot from any messaging app. We'll analyze the vibe, emotion,
          and tone — then find the perfect meme response.
        </p>
      </motion.div>
    </header>
  );
}
