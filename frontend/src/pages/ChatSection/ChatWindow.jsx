import { FaLock } from "react-icons/fa";
import useThemeStore from "../../store/themeStore";
import useOutsideClick from "../../hooks/useOutsideClick";
import WhatsappImage from "../../images/WhatsappImage.png";

import { useChatWindow } from "./useChatWindow";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import FilePreview from "./FilePreview";
import MessageInput from "./MessageInput";

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
    setCurrentConversation,
  } = useChatWindow(selectedContact);

  useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false));
  
  // ── Empty state ────────────────────────────────────────────────────────────
  //this selecetedConact cant be put before hooks before it disrupts the hook order of react
  if (!selectedContact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center mx-auto h-screen text-center">
        <div className="max-w-md">
          <img src={WhatsappImage} alt="chat-app" className="h-auto w-full" />
          <h2 className={`text-3xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Select a conversation to start chatting
          </h2>
          <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Choose a contact from the list to start messaging
          </p>
          <p className={`mt-8 text-sm flex items-center justify-center gap-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            <FaLock className="h-4 w-4" />
            Your personal messages are end to end encrypted
          </p>
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

