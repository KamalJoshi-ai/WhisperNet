import React, { useState } from "react";
import useThemeStore from "../../store/themeStore";
import { logoutUser } from "../../services/user.service";
import useUserStore from "../../store/useUserStore";
import { toast } from "react-hot-toast";
import Layout from "../../pages/components2/Layout";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaUser, FaComment, FaQuestionCircle,
  FaSignOutAlt, FaChevronRight, FaTimes,
} from "react-icons/fa";

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme } = useThemeStore();
  const { user, clearUser } = useUserStore();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      clearUser();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Failed to logout", error);
      toast.error("Failed to logout");
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const menuItems = [
    {
      icon: FaUser,
      label: "Account",
      description: "Privacy, security, change number",
      href: "/user-profile",
      iconBg: "bg-blue-500",
    },
    {
      icon: FaComment,
      label: "Chats",
      description: "Theme, wallpapers, chat history",
      href: "/",
      iconBg: "bg-green-500",
    },
    {
      icon: FaQuestionCircle,
      label: "Help",
      description: "FAQ, contact us, privacy policy",
      href: "/help",
      iconBg: "bg-yellow-500",
    },
  ];

  const filtered = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col h-screen border-r overflow-hidden ${
          isDark
            ? "bg-[rgb(17,27,33)] border-gray-700 text-white"
            : "bg-gray-100 border-gray-200 text-gray-900"
        }`}
      >
        {/* ── STICKY HEADER ── */}
        <div
          className={`sticky top-0 z-10 px-5 pt-5 pb-3 backdrop-blur-md border-b ${
            isDark
              ? "bg-[rgb(17,27,33)]/90 border-gray-700"
              : "bg-gray-100/90 border-gray-200"
          }`}
        >
          <h1 className="font-bold text-xl tracking-tight mb-4">Settings</h1>

          {/* Search */}
          <div className="relative">
            <FaSearch
              size={13}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? "text-gray-400" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search settings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-9 py-2 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-green-500/40 ${
                isDark
                  ? "bg-gray-800 text-white placeholder-gray-500 border border-gray-700"
                  : "bg-white text-gray-900 placeholder-gray-400 border border-gray-200"
              }`}
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <FaTimes size={12} className={isDark ? "text-gray-400" : "text-gray-400"} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Profile Card */}
          <Link to="/user-profile">
            <div
              className={`mx-4 mt-4 mb-2 flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-gray-800/60 border border-gray-700/50 hover:bg-gray-800"
                  : "bg-white border border-gray-100 hover:bg-gray-50 shadow-sm"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user?.ProfilePicture ? (
                  <img
                    src={user.ProfilePicture}
                    alt="pfp"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-green-500/30"
                  />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ring-2 ring-green-500/30 ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <FaUser size={22} className={isDark ? "text-gray-400" : "text-gray-500"} />
                  </div>
                )}
                {/* Online dot */}
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate">{user?.username || "Your Name"}</p>
                <p className={`text-sm truncate mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {user?.about || "Hey there! I am using WhatsApp."}
                </p>
              </div>

              <FaChevronRight size={14} className={isDark ? "text-gray-500" : "text-gray-400"} />
            </div>
          </Link>

          {/* ── MENU ITEMS ── */}
          <div className={`mx-4 mt-3 rounded-2xl overflow-hidden border ${
            isDark ? "border-gray-700/50 bg-gray-800/60" : "border-gray-100 bg-white shadow-sm"
          }`}>
            <AnimatePresence>
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15, delay: idx * 0.04 }}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 ${
                        idx !== filtered.length - 1
                          ? `border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`
                          : ""
                      } ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}
                    >
                      {/* Icon badge */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                        <item.icon size={16} className="text-white" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className={`text-xs mt-0.5 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {item.description}
                        </p>
                      </div>

                      <FaChevronRight size={12} className={isDark ? "text-gray-500" : "text-gray-400"} />
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`py-10 text-center text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  No settings found for "{searchQuery}"
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── LOGOUT BUTTON ── */}
          <div className={`mx-4 mt-3 mb-6 rounded-2xl overflow-hidden border ${
            isDark ? "border-gray-700/50 bg-gray-800/60" : "border-gray-100 bg-white shadow-sm"
          }`}>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`flex items-center gap-4 px-4 py-3.5 w-full transition-colors duration-150 ${
                isDark ? "hover:bg-gray-700/50" : "hover:bg-red-50"
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500">
                <FaSignOutAlt size={16} className="text-white" />
              </div>
              <span className={`font-medium text-sm ${isDark ? "text-red-400" : "text-red-500"}`}>
                Log Out
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── LOGOUT CONFIRM MODAL ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => !loggingOut && setShowLogoutConfirm(false)}
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 rounded-2xl shadow-2xl p-6 ${
                isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <FaSignOutAlt size={24} className="text-red-500" />
                </div>
              </div>

              <h3 className="font-bold text-lg text-center mb-1">Log Out?</h3>
              <p className={`text-sm text-center mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Are you sure you want to log out of your account?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={loggingOut}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  } disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
                >
                  {loggingOut ? "Logging out..." : "Log Out"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Settings;