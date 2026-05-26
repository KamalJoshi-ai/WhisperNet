import React, { useEffect, useState } from "react";
import useLayoutStore from "../../store/layoutStore";
import useThemeStore from "../../store/themeStore";
import { AnimatePresence, motion } from "framer-motion";
import ChatWindow from "../ChatSection/ChatWindow";
import Sidebar from "../components2/Sidebar";
import { FaBars, FaTimes } from "react-icons/fa";

const Layout = ({ children }) => {
  const { setSelectedContact, selectedContact } = useLayoutStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  return (
    <div
      className={`h-screen w-screen flex overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gray-100"
      }`}
    >
      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      )}

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <AnimatePresence>
        {isMobile && isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.28 }}
              className="fixed top-0 left-0 h-full z-50"
            >
              <Sidebar
                isCollapsed={false}
                setIsCollapsed={() => {}}
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </motion.div>

          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 overflow-hidden relative">
        <AnimatePresence initial={false}>

          {/* Chat List */}
          {(!selectedContact || !isMobile) && (
            <motion.div
              key="chatlist"
              initial={{ x: isMobile ? "-100%" : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.28 }}
              className={`
                h-full overflow-hidden flex flex-col
                ${isMobile
                  ? "w-full absolute inset-0 z-10"
                  : `flex-shrink-0 border-r ${isDark ? "border-gray-700" : "border-gray-200"}`
                }
                ${isDark ? "bg-gray-900" : "bg-white"}
                ${!isMobile ? "w-80" : ""}
              `}
            >
              {/* Mobile top bar with hamburger */}
              {isMobile && (
                <div
                  className={`flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 ${
                    isDark
                      ? "border-gray-700 bg-gray-900"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaBars size={18} />
                  </button>
                  <span
                    className={`font-bold text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    WhisperNet
                  </span>
                </div>
              )}

              <div className={`flex-1 overflow-y-auto ${isMobile ? "pb-4" : ""}`}>
                {children}
              </div>
            </motion.div>
          )}

          {/* Chat Window */}
          {(selectedContact || !isMobile) && (
            <motion.div
              key="chatWindow"
              initial={{ x: isMobile ? "100%" : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.28 }}
              className={`
                flex-1 h-full overflow-hidden
                ${isMobile ? "absolute inset-0 z-20" : ""}
                ${isDark ? "bg-gray-800" : "bg-gray-50"}
              `}
            >
              {selectedContact ? (
                <ChatWindow
                  selectedContact={selectedContact}
                  setSelectedContact={setSelectedContact}
                  isMobile={isMobile}
                />
              ) : (
                /* Empty state — desktop only when no chat selected */
                <div
                  className={`h-full flex flex-col items-center justify-center gap-4 select-none ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Select a chat to start messaging</p>
                  <p className="text-sm opacity-60">Choose from your existing conversations</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      
    </div>
  );
};

export default Layout;