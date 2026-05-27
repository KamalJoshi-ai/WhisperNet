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

// ── Custom scrollbar that shows exact drag position ───────────────────────────
const CustomScrollbar = ({ scrollEl, theme }) => {
  const trackRef = useRef();
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef();

  const compute = useCallback(() => {
    const el = scrollEl.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const trackH = track.clientHeight;
    const ratio = el.clientHeight / el.scrollHeight;
    const thumb = Math.max(trackH * ratio, 32); // min 32px thumb
    const maxTop = trackH - thumb;
    const top = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * maxTop;

    setThumbHeight(thumb);
    setThumbTop(Math.min(top, maxTop));
  }, [scrollEl]);

  const showBriefly = useCallback(() => {
    setVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 1200);
  }, []);

  useEffect(() => {
    const el = scrollEl.current;
    if (!el) return;

    const onScroll = () => { compute(); showBriefly(); };
    const onResize = () => compute();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    compute(); // initial

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(hideTimer.current);
    };
  }, [scrollEl, compute, showBriefly]);

  // ── Drag to scroll ──────────────────────────────────────────────────────
  const onThumbMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartTop.current = thumbTop;
    setVisible(true);

    const onMove = (e) => {
      if (!isDragging.current) return;
      const el = scrollEl.current;
      const track = trackRef.current;
      if (!el || !track) return;

      const delta = e.clientY - dragStartY.current;
      const trackH = track.clientHeight;
      const maxTop = trackH - thumbHeight;
      const newTop = Math.min(Math.max(dragStartTop.current + delta, 0), maxTop);
      const scrollRatio = newTop / maxTop;
      el.scrollTop = scrollRatio * (el.scrollHeight - el.clientHeight);
    };

    const onUp = () => {
      isDragging.current = false;
      showBriefly();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ── Click on track to jump ──────────────────────────────────────────────
  const onTrackClick = (e) => {
    if (e.target !== trackRef.current) return;
    const el = scrollEl.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const trackRect = track.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const maxTop = track.clientHeight - thumbHeight;
    const newTop = Math.min(Math.max(clickY - thumbHeight / 2, 0), maxTop);
    const scrollRatio = newTop / maxTop;
    el.scrollTop = scrollRatio * (el.scrollHeight - el.clientHeight);
  };

  const thumbBg = theme === "dark"
    ? "rgba(255,255,255,0.25)"
    : "rgba(0,0,0,0.28)";
  const thumbHover = theme === "dark"
    ? "rgba(255,255,255,0.45)"
    : "rgba(0,0,0,0.45)";

  return (
    <div
      ref={trackRef}
      onClick={onTrackClick}
      style={{
        position: "absolute",
        right: 2,
        top: 4,
        bottom: 4,
        width: 6,
        borderRadius: 4,
        cursor: "pointer",
        opacity: visible || isDragging.current ? 1 : 0,
        transition: "opacity 0.3s ease",
        zIndex: 10,
      }}
    >
      <div
        onMouseDown={onThumbMouseDown}
        style={{
          position: "absolute",
          top: thumbTop,
          width: "100%",
          height: thumbHeight,
          borderRadius: 4,
          background: thumbBg,
          cursor: "grab",
          transition: isDragging.current ? "none" : "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = thumbHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = thumbBg)}
      />
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
  const scrollRef = useRef();

  return (
    // relative wrapper so custom scrollbar can be absolutely positioned
    <div className="flex-1 min-h-0 relative">
      {/* Hide native scrollbar, use custom one */}
      <style>{`
        .msg-scroll::-webkit-scrollbar { display: none; }
        .msg-scroll { scrollbar-width: none; }
      `}</style>

      <div
        ref={scrollRef}
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

      <CustomScrollbar scrollEl={scrollRef} theme={theme} />
    </div>
  );
};

export default MessageList;