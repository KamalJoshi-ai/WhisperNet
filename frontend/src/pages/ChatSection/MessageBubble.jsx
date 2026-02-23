import React, { useState, useRef, useCallback } from "react";
import EmojiPicker from "emoji-picker-react";
import { format, isValid } from "date-fns";
import useOutsideClick from "../../hooks/useOutsideClick";
import {
  FaCheckDouble,
  FaRegCopy,
  FaSmile,
  FaTrash,
  FaPlus,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { HiDotsVertical } from "react-icons/hi";

// ===== CONSTANTS =====
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const BUBBLE_CLASSES_USER =
  "bg-[#d9fdd3] text-black rounded-2xl rounded-tr-none";
const BUBBLE_CLASSES_OTHER = "bg-white text-black rounded-2xl rounded-tl-none";

// ===== MESSAGE BUBBLE COMPONENT =====
const MessageBubble = ({
  message,
  theme,
  onReact,
  currentUser,
  deleteMessage,
  removeReaction = null,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const emojiPickerRef = useRef(null);
  const reactionsMenuRef = useRef(null);
  const optionRef = useRef(null);

  // ===== DERIVED STATE =====
  const isUserMessage = message?.sender?._id === currentUser?._id;
  const bubbleClasses = isUserMessage ? BUBBLE_CLASSES_USER : BUBBLE_CLASSES_OTHER;

  // ===== OUTSIDE CLICK HANDLERS =====
  useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false));
  useOutsideClick(reactionsMenuRef, () => setShowReactions(false));
  useOutsideClick(optionRef, () => setShowOptions(false));

  // ===== MEMOIZED CALLBACKS =====
  const handleReact = useCallback(
    (emoji) => {
      setShowReactions(false);
      setShowEmojiPicker(false);
      onReact(message._id, emoji);
    },
    [message._id, onReact],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setShowOptions(false);
  }, [message.content]);

  const handleDelete = useCallback(() => {
    deleteMessage(message._id);
    setShowOptions(false);
  }, [message._id, deleteMessage]);

  const handleToggleReactions = useCallback(() => {
    setShowReactions((prev) => !prev);
  }, []);

  const handleToggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  const handleToggleOptions = useCallback(() => {
    setShowOptions((prev) => !prev);
  }, []);

  const handleRemoveReaction = useCallback(
    (emoji) => {
      if (removeReaction) {
        removeReaction(message._id, emoji);
      }
      setHoveredReaction(null);
    },
    [message._id, removeReaction],
  );

  // ===== EARLY RETURN =====
  if (!message) return null;

  // ===== SAFE DATE FORMATTING =====
  const formattedTime = isValid(new Date(message.createdAt))
    ? format(new Date(message.createdAt), "HH:mm")
    : "Invalid date";

  return (
    <div className="flex w-full flex-col mb-10">
      <div
        className={`flex w-full ${isUserMessage ? "justify-end" : "justify-start"}`}
      >
        <div className="relative group">
          {/* ===== MESSAGE BUBBLE ===== */}
          <div className={`${bubbleClasses} px-3 py-2 shadow-md`}>
            {/* TEXT CONTENT */}
            {message.contentType === "text" && (
              <p className="text-sm break-words max-w-xs">{message.content}</p>
            )}

            {/* IMAGE CONTENT */}
            {message.contentType === "image" && (
              <div className="flex flex-col">
                <img
                  src={message.imageOrVideoUrl}
                  alt="Shared image"
                  className="rounded-lg max-w-[200px] mb-2 object-cover"
                />
                {message.content && <p className="text-sm">{message.content}</p>}
              </div>
            )}

            {/* VIDEO CONTENT */}
            {message.contentType === "video" && (
              <div className="flex flex-col">
                <video
                  src={message.imageOrVideoUrl}
                  controls
                  title="Shared video"
                  className="rounded-lg max-w-[200px] mb-1 bg-black"
                />
                {message.content && <p className="text-sm">{message.content}</p>}
              </div>
            )}

            {message.contentType === "file" && message.fileType === "pdf" && (
  <div className="flex flex-col bg-gray-100 p-3 rounded-lg max-w-[250px]">
    
    {/* PDF Icon + Name */}
    <div className="flex items-center gap-2 mb-2">
      <span className="text-red-500 text-2xl">📄</span>
      <span className="text-sm truncate">
        {message.fileName || "Document.pdf"}
      </span>
    </div>

    {/* Buttons */}
    <div className="flex gap-2">
      <a
        href={message.imageOrVideoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 text-sm underline"
      >
        Open
      </a>

      <a
        href={message.imageOrVideoUrl}
        download
        className="text-green-600 text-sm underline"
      >
        Download
      </a>
    </div>

    {message.content && (
      <p className="text-sm mt-2">{message.content}</p>
    )}
  </div>
)}
          </div>

          {/* ===== OPTIONS BUTTON (Hover) ===== */}
          <button
            onClick={handleToggleOptions}
            aria-label="Message options"
            aria-expanded={showOptions}
            className="absolute top-1 -left-7 opacity-0 group-hover:opacity-100 transition hover:bg-gray-100 rounded p-1"
          >
            <HiDotsVertical size={16} className="text-gray-500" />
          </button>

          {/* ===== REACTIONS BUTTON (Hover) - ONLY FOR OTHER USERS' MESSAGES ===== */}
          {!isUserMessage && (
            <button
              onClick={handleToggleReactions}
              aria-label="Add reaction"
              aria-expanded={showReactions}
              className={`absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition bg-white rounded-full p-1 shadow hover:shadow-md`}
            >
              <FaSmile className="text-gray-500" size={14} />
            </button>
          )}

          {/* ===== QUICK REACTIONS POPUP ===== */}
          {showReactions && !isUserMessage && (
            <div
              ref={reactionsMenuRef}
              className={`absolute z-50 -left-2 -top-10 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-lg flex gap-1`}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="hover:scale-125 transition hover:bg-gray-100 rounded p-1"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={handleToggleEmojiPicker}
                className="px-1 hover:bg-gray-200 rounded-full transition"
                title="More reactions"
              >
                <FaPlus size={12} className="text-gray-500" />
              </button>
            </div>
          )}

          {/* ===== EMOJI PICKER ===== */}
          {showEmojiPicker && !isUserMessage && (
            <div
              ref={emojiPickerRef}
              className={`absolute z-50 left-0 top-10`}
            >
              <div className="relative">
                <EmojiPicker
                  onEmojiClick={(emojiObject) =>
                    handleReact(emojiObject.emoji)
                  }
                  theme={theme}
                />
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  aria-label="Close emoji picker"
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition p-1"
                >
                  <RxCross2 size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ===== DISPLAYED REACTIONS (TRANSPARENT BACKGROUND) ===== */}
          {message.reactions?.length > 0 && (
            <div
              className={`absolute z-40 ${
                isUserMessage ? "right-0 -top-6" : "left-4 -top-6"
              } bg-transparent flex gap-1 rounded-full px-1 py-0.5`}
              title="Message reactions"
            >
              {message.reactions.map((reaction, i) => {
                const isUserReaction = reaction.userId === currentUser?._id;
                const isHovered = hoveredReaction === `${i}-${reaction.emoji}`;

                return (
                  <div
                    key={`${i}-${reaction.emoji}`}
                    className="relative flex items-center"
                    onMouseEnter={() =>
                      isUserReaction &&
                      setHoveredReaction(`${i}-${reaction.emoji}`)
                    }
                    onMouseLeave={() => setHoveredReaction(null)}
                  >
                    <div className="bg-transparent backdrop-blur-sm border border-none rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-1">
                      <span
                        className={`text-lg cursor-pointer transition ${
                          isUserReaction && isHovered ? "scale-125" : "scale-100"
                        }`}
                        role="img"
                        aria-label={reaction.emoji}
                      >
                        {reaction.emoji}
                      </span>

                      {/* ===== REMOVE BUTTON (Only for user's own reactions) ===== */}
                      {isUserReaction && isHovered && removeReaction && (
                        <button
                          onClick={() => handleRemoveReaction(reaction.emoji)}
                          className="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition shadow-sm ml-0.5"
                          aria-label={`Remove ${reaction.emoji} reaction`}
                          title="Remove reaction"
                        >
                          <FaTimes size={8} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== OPTIONS MENU ===== */}
          {showOptions && (
            <div
              ref={optionRef}
              className="absolute z-50 top-6 right-14 w-40 bg-white shadow-lg rounded-md text-sm"
              role="menu"
            >
              {/* COPY BUTTON - Only for text */}
              {message?.contentType === "text" && (
                <button
                  onClick={handleCopy}
                  className="flex items-center w-full px-3 py-2 hover:bg-gray-100 transition text-gray-800"
                  role="menuitem"
                  title="Copy message text"
                >
                  <FaRegCopy size={12} className="mr-2" />
                  Copy
                </button>
              )}

              {/* DELETE BUTTON - Only for own messages */}
              {isUserMessage && (
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-3 py-2 hover:bg-red-50 transition text-red-600"
                  role="menuitem"
                  title="Delete this message"
                >
                  <FaTrash size={12} className="mr-2" />
                  Delete
                </button>
              )}

              {/* EMPTY STATE */}
              {message?.contentType !== "text" && !isUserMessage && (
                <div className="px-3 py-2 text-gray-500 text-xs">
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== TIMESTAMP & MESSAGE STATUS (OUTSIDE BUBBLE) ===== */}
      <div
        className={`flex items-center gap-1 text-[11px] text-gray-500 mt-1 ${
          isUserMessage ? "justify-end pr-2" : "justify-start pl-2"
        }`}
      >
        {!isUserMessage && <span>{formattedTime}</span>}
        
        {isUserMessage && (
          <>
            {message.messageStatus === "sent" && (
              <FaCheck size={10} className="text-gray-400" />
            )}
            {message.messageStatus === "delivered" && (
              <FaCheckDouble size={10} className="text-gray-400" />
            )}
            {message.messageStatus === "read" && (
              <FaCheckDouble size={10} className="text-blue-500" />
            )}
            <span>{formattedTime}</span>
          </>
        )}
      </div>
    </div>
  );
};

// ===== MEMOIZE COMPONENT =====
export default React.memo(MessageBubble);