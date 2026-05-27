const FilePreview = ({ file, preview, theme, onClose }) => {
  const fileLabel = file.type.startsWith("image/")
    ? "Image"
    : file.type.startsWith("video/")
    ? "Video"
    : "PDF document";

  return (
    <div
      className={`flex-1 flex flex-col ${
        theme === "dark" ? "bg-[#0b141a] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-white/10">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl focus:outline-none"
          aria-label="Close preview"
        >
          ✕
        </button>
        <div>
          <p className="text-sm font-medium truncate max-w-[260px]">{file.name}</p>
          <p className="text-xs text-gray-400">{fileLabel}</p>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-grow min-h-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
        <div className="relative w-full h-full flex items-center justify-center overflow-auto">
          {file.type.startsWith("image/") && (
            <img
              src={preview}
              alt="preview"
              className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain"
            />
          )}
          {file.type.startsWith("video/") && (
            <video
              src={preview}
              controls
              className="max-h-full max-w-full rounded-2xl shadow-2xl bg-black"
            />
          )}
          {file.type === "application/pdf" && (
            <iframe
              src={preview}
              title="PDF Preview"
              className="h-full w-full max-h-full rounded-2xl shadow-2xl bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;