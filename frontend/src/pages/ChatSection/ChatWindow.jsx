import { FaLock } from "react-icons/fa";
import { AiFillLayout } from "react-icons/ai";
import useThemeStore from "../../store/themeStore";
import useOutsideClick from "../../hooks/useOutsideClick";

import { useChatWindow } from "./useChatWindow";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import FilePreview from "./FilePreview";
import MessageInput from "./MessageInput";
import Spinner from "../../utils/Spinner";

const ChatWindow = ({ selectedContact, setSelectedContact }) => {
  const { theme } = useThemeStore();

  const {
    message, setMessage,
    showEmojiPicker, setShowEmojiPicker,
    showFileMenu, setShowFileMenu,
    filePreview, selectedFile, fileCleared,
    sending,
    messageEndRef, emojiPickerRef, fileInputRef,
    online, lastSeen, isTyping,
    groupedMessages, user,
    handleFileChange, handleClearFile,
    handleSendMessage, handleReaction, handleDeleteMessage,
    setCurrentConversation,loading
  } = useChatWindow(selectedContact);

  useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false));
  
 if (loading) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner />
    </div>
  );
}
  // ── Empty state ────────────────────────────────────────────────────────────
  //this selecetedConact cant be put before hooks before it disrupts the hook order of react
  if (!selectedContact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center mx-auto h-screen text-center px-4">
        <div className="max-w-md">
          <div className="flex justify-center mb-8">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl transition-all ${
              theme === "dark" 
                ? "bg-slate-900/60 border border-slate-800 text-green-400 shadow-green-500/5" 
                : "bg-green-50 border border-green-200 text-green-600 shadow-green-600/5"
            }`}>
              <AiFillLayout size={44} />
            </div>
          </div>
          <h2 className={`text-3xl font-extrabold mb-4 tracking-tight ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>
            WhisperNet — Fast & Secure Chat
          </h2>
          <p className={`mb-8 text-sm leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Select a conversation from the sidebar list or search for friends to start messaging instantly.
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${
            theme === "dark"
              ? "bg-[#00C853]/5 border-[#00C853]/20 text-[#00E676]"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            <FaLock className="h-3.5 w-3.5" />
            <span>End-to-End Encryption Enabled</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat view ──────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ChatHeader
        contact={selectedContact}
        online={online}
        lastSeen={lastSeen}
        isTyping={isTyping}
        theme={theme}
        onBack={() => {
          setSelectedContact(null);
          setCurrentConversation(null);
        }}
      />

      <MessageList
        groupedMessages={groupedMessages}
        selectedContact={selectedContact}
        theme={theme}
        user={user}
        messageEndRef={messageEndRef}
        onReact={handleReaction}
        onDelete={handleDeleteMessage}
      />

      {filePreview && selectedFile && (
        <FilePreview
          file={selectedFile}
          preview={filePreview}
          theme={theme}
          onClose={() => { handleClearFile(); }}
          fileCleared={fileCleared}
        />
      )}

      <MessageInput
        message={message}
        setMessage={setMessage}
        sending={sending}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        showFileMenu={showFileMenu}
        setShowFileMenu={setShowFileMenu}
        emojiPickerRef={emojiPickerRef}
        fileInputRef={fileInputRef}
        theme={theme}
        onSend={handleSendMessage}
        onFileChange={handleFileChange}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default ChatWindow;

