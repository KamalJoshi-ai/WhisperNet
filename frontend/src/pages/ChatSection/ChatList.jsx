import React, { useState, useMemo } from 'react'
import useLayoutStore from '../../store/layoutStore'
import useThemeStore from '../../store/themeStore'
import useUserStore from '../../store/useUserStore'
import { motion } from 'framer-motion'
import { FaPlus, FaSearch } from 'react-icons/fa'
import formatTimestamp from '../../utils/formatTime'

// Memoized contact card component
const ContactCard = React.memo(({ contact, theme, selectedContact, user, onSelectContact }) => (
  <motion.div
    key={contact._id}
    onClick={() => onSelectContact(contact)}
    className={`flex items-center cursor-pointer p-3 ${
      theme === "dark"
        ? selectedContact?._id === contact?._id
          ? "bg-gray-700"
          : "hover:bg-gray-800"
        : selectedContact?._id === contact?._id
        ? "bg-gray-200"
        : "hover:bg-gray-100"
    }`}
  >
    <img
      src={contact?.ProfilePicture}
      alt={`${contact?.username} profile`}
      className="w-12 h-12 rounded-full border-blue-600 border-2"
    />

    <div className="ml-3 flex-1">
      <div className="flex justify-between items-baseline">
        <h2 className={`font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
          {contact?.username}
        </h2>
        {contact?.conversation?.lastMessage?.createdAt && (
          <span
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {formatTimestamp(contact?.conversation?.lastMessage?.createdAt)}
          </span>
        )}
      </div>

      <div className="flex justify-between items-baseline">
        <p
          className={`text-sm truncate ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {contact?.conversation?.lastMessage?.content || "No messages yet"}
        </p>

        {contact?.conversation?.unreadCount > 0 &&
          contact?.conversation?.lastMessage?.receiver === user?._id && (
            <span
              className="text-xs font-semibold flex items-center justify-center rounded-full w-6 h-6 bg-yellow-500 text-gray-800 ml-2 flex-shrink-0"
              aria-label={`${contact?.conversation?.unreadCount} unread messages`}
            >
              {contact?.conversation?.unreadCount}
            </span>
          )}
      </div>
    </div>
  </motion.div>
))

const ChatList = ({ contacts }) => {
  const { setSelectedContact, selectedContact } = useLayoutStore();
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [searchTerms, setSearchTerms] = useState("")
  // Memoize filtered contacts to prevent unnecessary recalculations
  const filteredContacts = useMemo(() => 
    contacts?.filter((contact) =>
      contact?.username?.toLowerCase().includes(searchTerms.toLowerCase())
    ) || [],
    [contacts, searchTerms]
  )

  return (
    <div
      className={`border-r w-full h-screen ${
        theme === "dark"
          ? "bg-[rgb(17,27,33)] border-gray-600"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`px-4 pt-4 flex ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        <h2 className="text-2xl font-medium">Chats</h2>
      </div>

      <div className="p-2">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search or start new Chat"
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                : "bg-gray-100 text-black border-gray-200 placeholder-gray-400"
            }`}
            aria-label="Search contacts"
          />
          <FaSearch
            className={`absolute left-3 pointer-events-none ${
              theme === "dark" ? "text-gray-400" : "text-gray-800"
            }`}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-120px)]">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              theme={theme}
              selectedContact={selectedContact}
              user={user}
              onSelectContact={setSelectedContact}
            />
          ))
        ) : (
          <div className={`p-4 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            No contacts found
          </div>
        )}
      </div>

      
    </div>
  );
}

export default ChatList