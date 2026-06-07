import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import useChatStore from "../../store/chatStore";
import useUserStore from "../../store/useUserStore";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function useChatWindow(selectedContact) {
  const {
    messages, sendMessage, fetchMessages, fetchConversations, conversations,
    isUserTyping, startTyping, deleteMessage, getUserLastSeen, isUserOnline,
    addReaction, fetchOnlineUsers, setContact, setCurrentConversation,
  } = useChatStore();

  const { user } = useUserStore();
  
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  
  const messageEndRef = useRef();
  const emojiPickerRef = useRef();
  const fileInputRef = useRef();
  const [fileCleared, setFileClearedButton] = useState(false);
  const online = isUserOnline(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);
  const isTyping = isUserTyping(selectedContact?._id);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOnlineUsers();
    fetchConversations();
    setContact(selectedContact?._id);
  }, []);

  // ── Fetch messages when contact or conversations change ───────────────────
  useEffect(() => {
    if (!selectedContact?._id || !conversations?.data?.length) return;

    const conversation = conversations.data.find((conv) =>
      conv.participants.some((p) => p._id === selectedContact._id)
    );
    if (conversation?._id) fetchMessages(conversation._id);
  }, [selectedContact?._id, conversations?.data?.length]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  useEffect(() => {
    if (message && selectedContact) startTyping(selectedContact._id);
  }, [message, selectedContact, startTyping]);

   // ── Cleanup file preview on unmount ──────────────────────────────────────
  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, []);

  // ── Grouped messages ──────────────────────────────────────────────────────
  const groupedMessages = useMemo(() => {
    if (!Array.isArray(messages)) return {};
    return messages.reduce((acc, msg) => {
      if (!msg.createdAt) return acc;
      const date = new Date(msg.createdAt);
      if (!isNaN(date.getTime())) {
        const key = format(date, "yyyy-MM-dd");
        (acc[key] = acc[key] || []).push(msg);
      }
      return acc;
    }, {});
  }, [messages]);

  // ── File handlers ─────────────────────────────────────────────────────────
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);

    const previewable = file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type === "application/pdf";

    setFilePreview(previewable ? URL.createObjectURL(file) : null);
    setShowFileMenu(false);
  }, [filePreview]);

  const handleClearFile = useCallback(() => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
     
  }, [filePreview]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!selectedContact || !user?._id) return;
    if (!message.trim() && !selectedFile) return;

    setSending(true);
    try {
            setFileClearedButton(true);
      const formData = new FormData();
      formData.append("senderId", user._id);
      formData.append("receiverId", selectedContact._id);
      if (message.trim()) formData.append("content", message.trim());
      if (selectedFile) formData.append("media", selectedFile, selectedFile.name);

      await sendMessage(formData);
      setMessage("");
      handleClearFile();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }, [selectedContact, user._id, message, selectedFile, online, sendMessage, handleClearFile]);

  const handleReaction =(messageId, reaction) => addReaction(messageId, reaction);
  const handleDeleteMessage = (messageId) => deleteMessage(messageId);

  return {
    // state
    message, setMessage,
    showEmojiPicker, setShowEmojiPicker,
    showFileMenu, setShowFileMenu,
    filePreview, selectedFile,
    sending,
    // refs
    messageEndRef, emojiPickerRef, fileInputRef,
    // derived
    online, lastSeen, isTyping, groupedMessages, user,
    // actions
    handleFileChange, handleClearFile, handleSendMessage,
    handleReaction, handleDeleteMessage,fileCleared,
    setCurrentConversation,
  };
}