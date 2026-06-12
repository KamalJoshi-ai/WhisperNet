import { FaSmile, FaPaperclip, FaImage, FaFile, FaPaperPlane } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const ALLOWED_FILE_ACCEPT = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";

const MessageInput = ({
  message, setMessage,
  sending,
  showEmojiPicker, setShowEmojiPicker,
  showFileMenu, setShowFileMenu,
  emojiPickerRef, fileInputRef,
  theme,
  onSend,
  onFileChange,
  selectedFile,
}) => {
  const canSend = (message.trim() || selectedFile) && !sending;

  return (
    <div
      className={`p-4 relative flex items-center space-x-3 ${
        theme === "dark" ? "bg-[#303430]" : "bg-white"
      }`}
    >
      {/* Emoji button */}
      <button
        className="focus:outline-none hover:opacity-70"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        aria-label="Add emoji"
      >
        <FaSmile
          className={`h-6 w-6 cursor-pointer hover:text-yellow-200/80 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        />
      </button>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute left-1 bottom-16 z-50">
          <EmojiPicker
            onEmojiClick={(obj) => {
              setMessage((prev) => prev + obj.emoji);
            }}
            theme={theme === "dark" ? "dark" : "light"}
          />
        </div>
      )}

      {/* Attach button + file menu */}
      <div className="relative">
        <button
          className="focus:outline-none hover:opacity-70"
          onClick={() => setShowFileMenu(!showFileMenu)}
          aria-label="Attach file"
        >
          <FaPaperclip
            className={`h-6 w-6 cursor-pointer hover:text-blue-200 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </button>

        {showFileMenu && (
          <div
            className={`absolute bottom-full left-0 mb-2 rounded-lg shadow-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-white"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
                multiple={false}
              onChange={onFileChange}
              accept={ALLOWED_FILE_ACCEPT}
              className="hidden"
            />
            {[
              { icon: FaImage, label: "Image/Video" },
              { icon: FaFile, label: "Documents" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center px-4 py-2 w-full transition-colors focus:outline-none ${
                  theme === "dark"
                    ? "hover:bg-gray-500 text-gray-300"
                    : "hover:bg-gray-200 text-gray-500"
                }`}
              >
                <Icon className="mr-2" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text input */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && canSend) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Type a message..."
        disabled={sending}
        className={`h-10 px-4 py-2 flex-grow scrollbar-hide focus:outline-none resize-none rounded-lg border transition-colors ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700 placeholder-gray-400 caret-gray-300 text-gray-100 focus:border-gray-600"
            : "bg-white border-gray-300 placeholder-gray-700 caret-gray-900 text-black focus:border-gray-400"
        }`}
      />

      {/* Send button */}
      <button
        disabled={!canSend}
        onClick={onSend}
        className="focus:outline-none flex items-center justify-center hover:opacity-70 disabled:opacity-50"
        aria-label="Send message"
      >
       {sending ? (
  <span className="w-7 h-7 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin" />
) : (
  <FaPaperPlane
    className={`text-2xl transition-colors ${
      canSend
        ? "text-green-500 hover:text-green-600"
        : "text-gray-400"
    }`}
  />
)}
      </button>
    </div>
  );
};

export default MessageInput;