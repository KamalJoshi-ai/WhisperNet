import React, { useEffect, useState } from "react";
import useLayoutStore from "../../store/layoutStore";
import useUserStore from "../../store/useUserStore";
import { useLocation, Link } from "react-router-dom";
import useThemeStore from "../../store/themeStore";
import { AnimatePresence, motion } from "framer-motion";
import { IoRadioButtonOn } from "react-icons/io5";
import { FaCog, FaUser, FaSun, FaMoon, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiFillLayout } from "react-icons/ai";

const NAV_ITEMS = [
  { tab: "chats",   icon: <AiFillLayout size={20} />,     label: "Chats",    to: "/" },
  { tab: "status",  icon: <IoRadioButtonOn size={20} />,  label: "Status",   to: "/status" },
  { tab: "profile", icon: <FaUser size={20} />,           label: "Profile",  to: "/user-profile" },
  { tab: "setting", icon: <FaCog size={20} />,            label: "Settings", to: "/setting" },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { theme, setTheme } = useThemeStore();
  const { activeTab, setActiveTab, selectedContact } = useLayoutStore();
  const { user } = useUserStore();
  const isDark = theme === "dark";

  // Track viewport width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync active tab with route
  useEffect(() => {
    const routeMap = {
      "/":             "chats",
      "/status":       "status",
      "/user-profile": "profile",
      "/setting":      "setting",
    };
    const tab = routeMap[location.pathname];
    if (tab) setActiveTab(tab);
  }, [location.pathname, setActiveTab]);

  // Hide sidebar on mobile when a contact is open
  if (isMobile && selectedContact) return null;

  const labelAnimation = {
    initial:  { opacity: 0, x: -8 },
    animate:  { opacity: 1, x: 0 },
    exit:     { opacity: 0, x: -8 },
    transition: { duration: 0.15 },
  };

  return (
    <div className="relative flex-shrink-0 h-full" style={{ zIndex: 40 }}>
      <motion.div
        animate={{ width: isCollapsed ? 64 : 240 }}
        initial={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`flex flex-col h-full overflow-hidden border-r ${
          isDark
            ? "bg-gray-900 text-white border-gray-700"
            : "bg-white text-gray-800 border-gray-200"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center px-4 py-5 flex-shrink-0 gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <AiFillLayout
            size={26}
            className={isDark ? "text-green-400" : "text-green-600"}
            style={{ flexShrink: 0 }}
          />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span key="logo-text" {...labelAnimation} className="font-bold text-lg whitespace-nowrap">
                WhisperNet
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 px-2 flex-1 mt-1 overflow-y-auto">
          {NAV_ITEMS.map(({ tab, icon, label, to }) => (
            <Link key={tab} to={to} title={isCollapsed ? label : ""} onClick={() => setActiveTab(tab)}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  activeTab === tab
                    ? isDark ? "bg-green-600 text-white" : "bg-green-100 text-green-700"
                    : isDark ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                             : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span key={`label-${tab}`} {...labelAnimation} className="text-sm font-medium whitespace-nowrap">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom: Theme Toggle + User Avatar */}
        <div className="flex flex-col gap-2 px-2 pb-5 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isCollapsed ? (isDark ? "Light mode" : "Dark mode") : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors duration-200 ${
              isCollapsed ? "justify-center" : ""
            } ${
              isDark
                ? "text-gray-400 hover:bg-gray-800 hover:text-yellow-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-orange-500"
            }`}
          >
            <span style={{ flexShrink: 0 }}>
              {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
            </span>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span key="theme-label" {...labelAnimation} className="text-sm font-medium whitespace-nowrap">
                  {isDark ? "Light Mode" : "Dark Mode"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User Avatar */}
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
              isCollapsed ? "justify-center" : ""
            } ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            {user?.ProfilePicture ? (
              <img
                src={user.ProfilePicture}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-green-500"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ${
                  isDark ? "bg-gray-700 text-gray-300 ring-gray-600" : "bg-gray-200 text-gray-600 ring-gray-300"
                }`}
              >
                <FaUser size={14} />
              </div>
            )}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div key="user-info" {...labelAnimation} className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {user?.name || "My Account"}
                  </span>
                  {user?.email && (
                    <span className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {user.email}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-5 -right-3 z-50 flex items-center justify-center w-6 h-6 rounded-full border shadow-md transition-colors ${
            isDark
              ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          {isCollapsed ? <FaChevronRight size={9} /> : <FaChevronLeft size={9} />}
        </button>
      )}
    </div>
  );
};

export default Sidebar;