const FilePreview = ({
  file,
  preview,
  theme,
  onClose,
  fileCleared,
}) => {
  if (!file) return null;

  const isImage = file.type?.startsWith("image/");
  const isVideo = file.type?.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  const fileLabel = isImage
    ? "Image"
    : isVideo
    ? "Video"
    : isPdf
    ? "PDF document"
    : "File";

  return (
    <div
      className={`h-full flex flex-col ${
        theme === "dark"
          ? "bg-[#0b141a] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      {/* Header */}
      <div className="h-18 p-8 flex items-center gap-3 border-b border-gray-300 dark:border-white/10 shrink-0">
        <button
          onClick={onClose}
          disabled={fileCleared}
          className="w-8 h-8 flex mt-4 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
          aria-label="Close preview"
        >
          ✕
        </button>

        <div className="min-w-0 mt-4">
          <p className="text-sm font-medium truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {fileLabel}
          </p>
        </div>
      </div>

      {/* Preview */}
     <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
  <div className="w-full max-w-4xl h-[60vh] flex items-center justify-center">
    {isImage && (
      <img
        src={preview}
        alt="preview"
        className="max-w-full max-h-full object-contain rounded-xl shadow-xl"
      />
    )}

    {isVideo && (
      <video
        src={preview}
        controls
        className="max-w-full max-h-full rounded-xl shadow-xl bg-black"
      />
    )}

    {isPdf && (
      <iframe
        src={preview}
        title="PDF Preview"
        className="w-full h-full rounded-xl shadow-xl bg-white"
      />
    )}

    {!isImage && !isVideo && !isPdf && (
      <div className="text-center text-gray-400">
        <p className="text-lg font-medium">
          Preview not available
        </p>
        <p className="text-sm mt-2">{file.name}</p>
      </div>
    )}
  </div>
</div>
    </div>
  );
};

export default FilePreview;