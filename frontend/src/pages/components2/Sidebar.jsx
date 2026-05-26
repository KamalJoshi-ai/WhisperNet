import React, { useEffect, useState } from "react";
import useLayoutStore from "../../store/layoutStore";
import useUserStore from '../../store/useUserStore';
import { useLocation, Link } from "react-router-dom";
import useThemeStore from "../../store/themeStore";
import { AnimatePresence, motion } from "framer-motion";
import { IoRadioButtonOn } from "react-icons/io5";
import { FaCog, FaUser, FaWhatsapp, FaSun, FaMoon, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { AiFillLayout } from "react-icons/ai";

const Sidebar = ({
  isCollapsed: isCollapsedProp,
  setIsCollapsed: setIsCollapsedProp,
  isMobileDrawer = false,
  onClose,
}) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // If controlled from outside (Layout), use prop; otherwise manage internally
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = isMobileDrawer
    ? false
    : isCollapsedProp !== undefined
    ? isCollapsedProp
    : internalCollapsed;
  const setIsCollapsed =
    setIsCollapsedProp !== undefined ? setIsCollapsedProp : setInternalCollapsed;

  const { theme, setTheme } = useThemeStore();
  const { activeTab, setActiveTab, selectedContact } = useLayoutStore();
  const { user } = useUserStore();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') setActiveTab("chats");
    else if (location.pathname === '/status') setActiveTab('status');
    else if (location.pathname === '/user-profile') setActiveTab('profile');
    else if (location.pathname === '/setting') setActiveTab('setting');
  }, [location, setActiveTab]);

  // On non-drawer mobile, hide if a contact is selected
  if (!isMobileDrawer && isMobile && selectedContact) return null;

  const navItems = [
    { tab: "chats",   icon: <AiFillLayout size={20} />,     label: "Chats",    to: "/" },
    { tab: "status",  icon: <IoRadioButtonOn size={20} />, label: "Status",   to: "/status" },
    { tab: "profile", icon: <FaUser size={20} />,          label: "Profile",  to: "/user-profile" },
    { tab: "setting", icon: <FaCog size={20} />,           label: "Settings", to: "/setting" },
  ];

  return (
    // Outer wrapper keeps toggle button from being clipped
    <div className="relative flex-shrink-0 h-full" style={{ zIndex: 40 }}>
    




    
      <motion.div
        animate={{ width: isCollapsed ? 64 : 240 }}
        initial={{ width: isMobileDrawer ? 240 : isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`flex flex-col h-full overflow-hidden ${
          isDark
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-800"
        } ${isMobileDrawer ? "shadow-2xl" : "border-r " + (isDark ? "border-gray-700" : "border-gray-200")}`}
      >

        {/* ── HEADER ── */}
        <div
          className={`flex items-center px-4 py-5 flex-shrink-0 ${
            isCollapsed ? "justify-center" : "gap-3"
          } ${isMobileDrawer ? "pr-10" : ""}`}
        >
          <AiFillLayout
            size={26}
            className={isDark ? "text-green-400" : "text-green-600"}
            style={{ flexShrink: 0 }}
          />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                key="logo-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg whitespace-nowrap overflow-hidden"
              >
                WhisperNet
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── NAV ITEMS ── */}
        <nav className="flex flex-col gap-1 px-2 flex-1 mt-1 overflow-y-auto">
          {navItems.map(({ tab, icon, label, to }) => (
            <Link
              to={to}
              key={tab}
              title={isCollapsed ? label : ""}
              onClick={() => {
                setActiveTab(tab);
                if (isMobileDrawer && onClose) onClose();
              }}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  activeTab === tab
                    ? isDark
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-700"
                    : isDark
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key={`label-${tab}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          ))}
        </nav>

        {/* ── BOTTOM: THEME + AVATAR ── */}
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
                <motion.span
                  key="theme-label"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {isDark ? "Light Mode" : "Dark Mode"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User Avatar Row */}
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
                  isDark
                    ? "bg-gray-700 text-gray-300 ring-gray-600"
                    : "bg-gray-200 text-gray-600 ring-gray-300"
                }`}
              >
                <FaUser size={14} />
              </div>
            )}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {user?.name || "My Account"}
                  </span>
                  {user?.email && (
                    <span
                      className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {user.email}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── DESKTOP COLLAPSE TOGGLE ── */}
      {!isMobile && !isMobileDrawer && (
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

      {/* ── MOBILE DRAWER CLOSE BUTTON ── */}
      {isMobileDrawer && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-3 z-50 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            isDark
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          <FaTimes size={12} />
        </button>
      )}



      
    </div>
  );
};

export default Sidebar;