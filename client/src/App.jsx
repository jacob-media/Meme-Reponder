import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import AnalysisResults from "./components/AnalysisResults";
import MemeResults from "./components/MemeResults";
import TextInput from "./components/TextInput";
import { extractText } from "./services/ocr";
import { analyzeConversation } from "./services/analyzer";
import { generateMeme, fetchWebMemes } from "./services/memeEngine";

export default function App() {
  const [mode, setMode] = useState("upload"); // "upload" | "text"
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle"); // "idle" | "analyzing" | "generating" | "done"
  const [ocrProgress, setOcrProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [memeResult, setMemeResult] = useState(null);
  const [gifResults, setGifResults] = useState(null);
  const [webMemes, setWebMemes] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const reset = () => {
    setStep("idle");
    setOcrProgress(0);
    setAnalysisResult(null);
    setMemeResult(null);
    setGifResults(null);
    setWebMemes(null);
    setError(null);
    setPreview(null);
  };

  const handleAnalyze = async (fileOrText) => {
    setError(null);
    setLoading(true);
    setStep("analyzing");

    try {
      let ocrResult;

      if (typeof fileOrText === "string") {
        // Direct text input — build synthetic OCR result
        const messages = fileOrText.split("\n").filter(Boolean).map((t) => ({ text: t.trim(), type: "message" }));
        ocrResult = { rawText: fileOrText, confidence: 100, messages, messageCount: messages.length };
      } else {
        // Screenshot upload — run OCR in the browser
        const previewUrl = URL.createObjectURL(fileOrText);
        setPreview(previewUrl);
        ocrResult = await extractText(previewUrl, setOcrProgress);
      }

      if (!ocrResult.rawText) {
        throw new Error("Could not extract any text. Try a clearer screenshot.");
      }

      // Run analysis (all client-side)
      const analysis = analyzeConversation(ocrResult);

      const result = {
        success: true,
        ocr: { text: ocrResult.rawText, confidence: ocrResult.confidence, messageCount: ocrResult.messageCount, messages: ocrResult.messages },
        analysis,
      };

      setAnalysisResult(result);
      setStep("generating");

      // Fetch memes
      const memeContext = analysis.memeContext;
      const conversationText = ocrResult.rawText;

      const meme = generateMeme(memeContext, conversationText);
      setMemeResult(meme);

      try {
        const web = await fetchWebMemes(memeContext);
        setWebMemes(web);
      } catch {
        // Non-critical — meme API may be unavailable
      }

      setStep("done");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 pb-20">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => { setMode("upload"); reset(); }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              mode === "upload"
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                : "glass text-gray-400 hover:text-white"
            }`}
          >
            📸 Upload Screenshot
          </button>
          <button
            onClick={() => { setMode("text"); reset(); }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              mode === "text"
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                : "glass text-gray-400 hover:text-white"
            }`}
          >
            ⌨️ Paste Text
          </button>
        </div>

        {/* Input Section */}
        <AnimatePresence mode="wait">
          {step === "idle" && (
            mode === "upload" ? (
              <UploadSection onUpload={handleAnalyze} loading={loading} />
            ) : (
              <TextInput onSubmit={handleAnalyze} loading={loading} />
            )
          )}
        </AnimatePresence>

        {/* Loading State */}
        {(step === "analyzing" || step === "generating") && (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-4 glass rounded-2xl px-8 py-6">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-lg font-semibold text-white">
                  {step === "analyzing" ? "Analyzing conversation..." : "Generating memes..."}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {step === "analyzing"
                    ? `Extracting text & detecting emotions${ocrProgress > 0 ? ` (${ocrProgress}%)` : ""}`
                    : "Finding the perfect meme response"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-lg mx-auto glass rounded-2xl p-6 border-red-500/30 text-center">
            <p className="text-red-400 font-semibold text-lg mb-2">Oops!</p>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={reset}
              className="mt-4 px-6 py-2 bg-brand-600 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {step === "done" && analysisResult && (
          <div className="space-y-8">
            {/* Analysis Dashboard */}
            <AnalysisResults
              analysis={analysisResult.analysis}
              ocr={analysisResult.ocr}
              preview={preview}
            />

            {/* Meme Results */}
            <MemeResults
              meme={memeResult}
              gifs={gifResults}
              webMemes={webMemes}
            />

            {/* Reset Button */}
            <div className="text-center pt-4">
              <button
                onClick={reset}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-700 rounded-full text-sm font-semibold transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50"
              >
                Analyze Another Screenshot
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
