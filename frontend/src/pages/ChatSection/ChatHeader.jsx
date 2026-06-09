import { format, isValid } from "date-fns";
import { FaArrowLeft } from "react-icons/fa";

const ChatHeader = ({ contact, online, lastSeen, isTyping, theme, onBack }) => (
  <div
    className={`p-4 sticky z-10 flex items-center ${
      theme === "dark"
        ? "bg-[#303430] text-white"
        : "bg-[rgb(239,242,245)] text-gray-600"
    }`}
  >
    <button
      className="mr-2 focus:outline-none cursor-pointer hover:opacity-70"
      onClick={onBack}
      aria-label="Go back to chats"
    >
      <FaArrowLeft className="h-6 w-6" />
    </button>

    <img
      src={contact.ProfilePicture}
      alt={contact.username}
      className="w-10 h-10 rounded-full object-cover"
    />

    <div className="ml-3 flex-grow">
      <h2 className="font-semibold text-start">{contact.username}</h2>

      {isTyping ? (
        <p className="text-green-600 text-sm">typing...</p>
      ) : (
        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          {online ? (
            <span className={theme === "dark" ? "text-blue-300" : "text-blue-500"}>
              Online
            </span>
          ) : lastSeen && isValid(new Date(lastSeen)) ? (
            `Last Seen ${format(new Date(lastSeen), "HH:mm", { timeZone: "Asia/Kolkata" })}`
          ) : (
            "Offline"
          )}
        </p>
      )}
    </div>
  </div>
);

export default ChatHeader;