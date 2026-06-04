import React, { useRef, useState, useEffect, useCallback } from "react";
import { format, isToday, isYesterday, isValid } from "date-fns";
import MessageBubble from "./MessageBubble";

const MemoizedMessageBubble = React.memo(MessageBubble);

const DateSeparator = ({ date, theme }) => {
  if (!isValid(date) || isNaN(date.getTime())) return null;

  const label = isToday(date)
    ? "Today"
    : isYesterday(date)
    ? "Yesterday"
    : format(date, "EEEE, MMMM d");

  return (
    <div className="flex justify-center my-4">
      <span
        className={`px-4 py-2 rounded-full text-sm ${
          theme === "dark"
            ? "bg-gray-700 text-gray-300"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
};



// ── Main component ────────────────────────────────────────────────────────────
const MessageList = ({
  groupedMessages,
  selectedContact,
  theme,
  user,
  messageEndRef,
  onReact,
  onDelete,
}) => {

  return (
    // relative wrapper so custom scrollbar can be absolutely positioned
    <div className="flex-1 min-h-0 relative">
      <div
              className={`msg-scroll h-full p-2 overflow-y-auto ${
          theme === "dark" ? "bg-[#191a1a]" : "bg-[rgb(241,236,229)]"
        }`}
      >
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <DateSeparator date={new Date(date)} theme={theme} />
              {msgs
                .filter((msg) => msg.conversation === selectedContact?.conversation?._id)
                .map((msg) => (
                  <MemoizedMessageBubble
                    key={msg._id || msg._tmpId}
                    message={msg}
                    theme={theme}
                    currentUser={user}
                    onReact={onReact}
                    deleteMessage={onDelete}
                  />
                ))}
            </React.Fragment>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

  
    </div>
  );
};

export default MessageList;