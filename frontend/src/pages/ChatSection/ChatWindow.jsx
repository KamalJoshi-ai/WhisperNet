import React, { useEffect, useRef, useState, useCallback } from "react";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import useOutsideClick from "../../hooks/useOutsideClick";
import {
  FaArrowLeft,
  FaLock,
  FaSmile,
  FaPaperclip,
  FaImage,
  FaFile,
  FaPaperPlane,
} from "react-icons/fa";
import useChatStore from "../../store/chatStore";
import WhatsappImage from "../../images/WhatsappImage.png";
import { isToday, isYesterday, format, isValid } from "date-fns";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";
import { useMemo } from "react";

// ===== CONSTANTS =====
const TYPING_TIMEOUT = 2000; // 2 seconds
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_ACCEPT = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";

// ===== MEMOIZED COMPONENTS =====
const MemoizedMessageBubble = React.memo(MessageBubble);

const ChatWindow = ({ selectedContact, setSelectedContact }) => {
  const {
    messages,
    sendMessage,
    fetchMessages,
    fetchConversations,
    conversations,
    isUserTyping,
    startTyping,
    deleteMessage,
    stopTyping,
    getUserLastSeen,
    isUserOnline,
    addReaction,
    fetchOnlineUsers,
    setContact,
    setCurrentConversation,
  } = useChatStore();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);

  const messageEndRef = useRef();
  const emojiPickerRef = useRef();
  const fileInputRef = useRef();

  const { theme } = useThemeStore();
  const { user } = useUserStore();

  // Online status & last seen
  const online = isUserOnline(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);
  const isTyping = isUserTyping(selectedContact?._id);
  const groupedMessage = useGroupedMessages(messages);
  useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false));

  // ===== INITIALIZATION =====
  useEffect(() => {
    fetchOnlineUsers();
    fetchConversations();
    setContact(selectedContact?._id);
  }, []);

  // ===== FETCH MESSAGES - ONLY when contact changes =====
  useEffect(() => {
    if (selectedContact?._id && conversations?.data?.length > 0) {
      const conversation = conversations?.data?.find((conv) =>
        conv.participants.some(
          (participant) => participant._id === selectedContact?._id,
        ),
      );
      if (conversation?._id) {
        fetchMessages(conversation._id);
      }
    }
  }, [selectedContact?._id, conversations?.data?.length]);

  // ===== TYPING INDICATOR - Fixed: Now stops after timeout =====
  useEffect(() => {
    if (message && selectedContact) {
      startTyping(selectedContact._id);
    }
  }, [message, selectedContact, startTyping, stopTyping]);

  // ===== CLEANUP FILE PREVIEW ON UNMOUNT =====
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, []);

  // ===== MEMOIZED CALLBACKS =====
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
      }

      // Cleanup previous preview
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }

      setSelectedFile(file);

      // Create preview for supported types
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type === "application/pdf"
      ) {
        const preview = URL.createObjectURL(file);
        setFilePreview(preview);
      }

      setShowFileMenu(false);
    },
    [filePreview],
  );

  const handleClearFile = useCallback(() => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
  }, [filePreview]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedContact || !user?._id) return;
    if (!message.trim() && !selectedFile) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("senderId", user._id);
      formData.append("receiverId", selectedContact._id);
      formData.append("messageStatus", online ? "delivered" : "sent");

      if (message.trim()) {
        formData.append("content", message.trim());
      }

      if (selectedFile) {
        formData.append("media", selectedFile, selectedFile.name);
      }

      await sendMessage(formData);

      setMessage("");
      handleClearFile();
      // stopTyping(selectedContact._id);
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show toast error to user
      // toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }, [
    selectedContact,
    user._id,
    message,
    selectedFile,
    online,
    sendMessage,
    handleClearFile,
    stopTyping,
  ]);

  const handleReaction = useCallback(
    (messageId, reaction) => {
      addReaction(messageId, reaction);
    },
    [addReaction],
  );

  const handleDeleteMessage = useCallback(
    (messageId) => {
      deleteMessage(messageId);
    },
    [deleteMessage],
  );

  // ===== RENDER DATE SEPARATOR =====
  const renderDateSeparator = (date) => {
    if (!isValid(date) || isNaN(date.getTime())) return null;

    let dateString;
    if (isToday(date)) {
      dateString = "Today";
    } else if (isYesterday(date)) {
      dateString = "Yesterday";
    } else {
      dateString = format(date, "EEEE, MMMM d");
    }

    return (
      <div className="flex justify-center my-4">
        <span
          className={`px-4 py-2 rounded-full text-sm ${
            theme === "dark"
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {dateString}
        </span>
      </div>
    );
  };

  // ===== GROUP MESSAGES BY DATE =====
  function useGroupedMessages(messages) {
    return useMemo(() => {
      if (!Array.isArray(messages)) return {};

      return messages.reduce((acc, msg) => {
        if (!msg.createdAt) return acc;

        const date = new Date(msg.createdAt);
        if (!isNaN(date.getTime())) {
          const dateString = format(date, "yyyy-MM-dd");
          if (!acc[dateString]) acc[dateString] = [];
          acc[dateString].push(msg);
        }

        return acc;
      }, {});
    }, [messages]); // ✅ recompute only when messages change
  }

  // ===== NO CONTACT SELECTED =====
  if (!selectedContact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center mx-auto h-screen text-center">
        <div className="max-w-md">
          <img src={WhatsappImage} alt="chat-app" className="h-auto w-full" />

          <h2
            className={`text-3xl font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Select a conversation to start chatting
          </h2>

          <p
            className={`mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Choose a contact from the list to start messaging
          </p>

          <p
            className={`mt-8 text-sm flex items-center justify-center gap-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <FaLock className="h-4 w-4" />
            Your personal messages are end to end encrypted
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex-1 w-full flex flex-col">
        {/* ===== HEADER ===== */}
        <div
          className={`p-4 sticky z-10 ${
            theme === "dark"
              ? "bg-[#303430] text-white"
              : "bg-[rgb(239,242,245)] text-gray-600"
          } flex items-center`}
        >
          <button
            className="mr-2 focus:outline-none cursor-pointer hover:opacity-70"
            onClick={() => {
              setSelectedContact(null);
              setCurrentConversation(null);
            }}
            aria-label="Go back to chats"
          >
            <FaArrowLeft className="h-6 w-6" />
          </button>

          <img
            src={selectedContact?.ProfilePicture}
            alt={selectedContact?.username}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div className="ml-3 flex-grow">
            <h2 className="font-semibold text-start">
              {selectedContact?.username}
            </h2>

            {isTyping ? (
              <p className="text-green-600 text-sm">typing...</p>
            ) : (
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {online ? (
                  <span
                    className={`${
                      theme === "dark" ? "text-blue-300" : "text-blue-500"
                    }`}
                  >
                    Online
                  </span>
                ) : lastSeen && isValid(new Date(lastSeen)) ? (
                  `Last Seen ${format(new Date(lastSeen), "HH:mm")}`
                ) : (
                  "Offline"
                )}
              </p>
            )}
          </div>
        </div>

        {/* ===== MESSAGES AREA ===== */}
        <div
          className={`flex-1 p-2 overflow-y-auto ${
            theme === "dark" ? "bg-[#191a1a]" : "bg-[rgb(241,236,229)]"
          }`}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p
                className={theme === "dark" ? "text-gray-500" : "text-gray-400"}
              >
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            Object.entries(groupedMessage).map(([date, msgs]) => (
              <React.Fragment key={date}>
                {renderDateSeparator(new Date(date))}

                {msgs
                  .filter(
                    (msg) =>
                      msg.conversation === selectedContact?.conversation?._id,
                  )
                  .map((msg) => (
                    <MemoizedMessageBubble
                      key={msg._id || msg._tmpId}
                      message={msg}
                      theme={theme}
                      currentUser={user}
                      onReact={handleReaction}
                      deleteMessage={handleDeleteMessage}
                    />
                  ))}
              </React.Fragment>
            ))
          )}

          <div ref={messageEndRef} />
        </div>

        {/* ===== FILE PREVIEW ===== */}
        {filePreview && selectedFile && (
          <div
            className={`flex-1 flex flex-col ${
              theme === "dark"
                ? "bg-[#0b141a] text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleClearFile();
                    setSending(false);
                  }}
                  className="text-gray-400 hover:text-white text-xl focus:outline-none"
                  aria-label="Close preview"
                >
                  ✕
                </button>

                <div>
                  <p className="text-sm font-medium truncate max-w-[260px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedFile.type.startsWith("image/")
                      ? "Image"
                      : selectedFile.type.startsWith("video/")
                        ? "Video"
                        : "PDF document"}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== PREVIEW CONTENT ===== */}
            <div className="flex-grow min-h-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
              <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                {/* Image Preview */}
                {selectedFile.type.startsWith("image/") && (
                  <img
                    src={filePreview}
                    alt="preview"
                    className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain transition-all duration-300"
                  />
                )}

                {/* Video Preview */}
                {selectedFile.type.startsWith("video/") && (
                  <video
                    src={filePreview}
                    controls
                    className="max-h-full max-w-full rounded-2xl shadow-2xl bg-black transition-all duration-300"
                  />
                )}

                {/* PDF Preview */}
                {selectedFile.type === "application/pdf" && (
                  <iframe
                    src={filePreview}
                    title="PDF Preview"
                    className="h-full w-full max-h-full rounded-2xl shadow-2xl bg-white"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== INPUT AREA ===== */}
        <div
          className={`p-4 relative ${
            theme === "dark" ? "bg-[#303430]" : "bg-white"
          } flex items-center space-x-3`}
        >
          {/* EMOJI BUTTON */}
          <button
            className="focus:outline-none hover:opacity-70"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Add emoji"
          >
            <FaSmile
              className={`h-6 w-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              } cursor-pointer hover:text-yellow-200/80`}
            />
          </button>

          {/* EMOJI PICKER */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute left-1 bottom-16 z-50"
            >
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setMessage((prev) => prev + emojiObject.emoji);
                  setShowEmojiPicker(false);
                }}
                theme={theme === "dark" ? "dark" : "light"}
              />
            </div>
          )}

          {/* ATTACH BUTTON */}
          <div className="relative">
            <button
              className="focus:outline-none hover:opacity-70"
              onClick={() => setShowFileMenu(!showFileMenu)}
              aria-label="Attach file"
            >
              <FaPaperclip
                className={`h-6 w-6 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } cursor-pointer hover:text-blue-200`}
              />
            </button>

            {/* FILE MENU */}
            {showFileMenu && (
              <div
                className={`absolute bottom-full left-0 mb-2 rounded-lg shadow-lg ${
                  theme === "dark" ? "bg-gray-700" : "bg-white"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={ALLOWED_FILE_ACCEPT}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center px-4 py-2 w-full transition-colors focus:outline-none ${
                    theme === "dark"
                      ? "hover:bg-gray-500 text-gray-300"
                      : "hover:bg-gray-200 text-gray-500"
                  }`}
                >
                  <FaImage className="mr-2" />
                  Image/Video
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center px-4 py-2 w-full transition-colors focus:outline-none ${
                    theme === "dark"
                      ? "hover:bg-gray-500 text-gray-300"
                      : "hover:bg-gray-200 text-gray-500"
                  }`}
                >
                  <FaFile className="mr-2" />
                  Documents
                </button>
              </div>
            )}
          </div>

          {/* MESSAGE INPUT */}
          <div className="flex flex-grow items-center">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if ((message.trim() || selectedFile) && !sending) {
                    handleSendMessage();
                  }
                }
              }}
              placeholder="Type a message..."
              disabled={sending}
              className={`h-10 px-4 py-2 w-full focus:outline-none resize-none rounded-lg border transition-colors ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 placeholder-gray-400 caret-gray-300 text-gray-100 focus:border-gray-600"
                  : "bg-white border-gray-300 placeholder-gray-700 caret-gray-900 text-black focus:border-gray-400"
              }`}
            />
          </div>

          {/* SEND BUTTON */}
          <button
            disabled={!((message.trim() || selectedFile) && !sending)}
            onClick={handleSendMessage}
            className="focus:outline-none flex items-center justify-center hover:opacity-70 disabled:opacity-50"
            aria-label="Send message"
          >
            {sending ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
            ) : (
              <FaPaperPlane
                className={`text-xl ${
                  (message.trim() || selectedFile) && !sending
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
