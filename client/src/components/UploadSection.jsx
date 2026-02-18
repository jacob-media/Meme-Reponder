import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, Image } from "lucide-react";

export default function UploadSection({ onUpload, loading }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: loading,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={`
          glass rounded-3xl p-12 text-center cursor-pointer
          transition-all duration-300 hover:border-brand-500/50
          ${isDragActive ? "dropzone-active border-brand-500" : "border-dashed border-2 border-gray-700"}
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-brand-600/20 flex items-center justify-center">
            {isDragActive ? (
              <Image className="w-10 h-10 text-brand-400 animate-bounce" />
            ) : (
              <Upload className="w-10 h-10 text-brand-400" />
            )}
          </div>

          <div>
            <p className="text-xl font-semibold text-white">
              {isDragActive ? "Drop your screenshot here" : "Drop a screenshot or click to upload"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Works with iMessage, WhatsApp, Instagram DMs, Messenger, Telegram, Discord — any messaging app
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, WEBP up to 10MB
          </p>
        </div>
      </div>
    </motion.div>
  );
}
