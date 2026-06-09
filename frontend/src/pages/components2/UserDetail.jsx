import React, { useState, useEffect, useRef } from "react";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import { updateUserProfile } from "../../services/user.service";
import toast from "react-hot-toast";
import { FaCamera, FaCheck, FaPencilAlt, FaSmile, FaUser } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const UserDetail = () => {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showNameEmoji, setShowNameEmoji] = useState(false);
  const [showAboutEmoji, setShowAboutEmoji] = useState(false);
  const [saving, setIsSaving] = useState(false);

  const nameRef = useRef(null);
  const aboutRef = useRef(null);

  const { user, setUser } = useUserStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setAbout(user.about || "");
    }
  }, [user]);

  // Auto-focus inputs when editing starts
  useEffect(() => {
    if (isEditingName) nameRef.current?.focus();
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingAbout) aboutRef.current?.focus();
  }, [isEditingAbout]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (field) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (field === "name") {
        formData.append("username", name);
        setIsEditingName(false);
        setShowNameEmoji(false);
      } else if (field === "about") {
        formData.append("about", about);
        setIsEditingAbout(false);
        setShowAboutEmoji(false);
      } else if (field === "profile" && profilePicture) {
        formData.append("media", profilePicture);
      }

      const updated = await updateUserProfile(formData);
      setUser(updated?.data);
      setProfilePicture(null);
      setPreview(null);
      toast.success("Profile updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (field) => {
    if (field === "name") {
      setName(user?.username || "");
      setIsEditingName(false);
      setShowNameEmoji(false);
    } else {
      setAbout(user?.about || "");
      setIsEditingAbout(false);
      setShowAboutEmoji(false);
    }
  };

  const handleEmojiSelect = (emoji, field) => {
    if (field === "name") {
      setName((prev) => prev + emoji.emoji);
      setShowNameEmoji(false);
    } else {
      setAbout((prev) => prev + emoji.emoji);
      setShowAboutEmoji(false);
    }
  };

  const cardClass = `rounded-2xl p-5 shadow-sm transition-all duration-200 ${
    isDark ? "bg-gray-800/60 border border-gray-700/50" : "bg-white border border-gray-100"
  }`;

  const inputClass = `w-full px-3 py-2 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-green-500/40 focus:border-green-500 ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`w-full min-h-screen flex flex-col border-r overflow-y-auto ${
          isDark
            ? "bg-[rgb(17,27,33)] border-gray-700 text-white"
            : "bg-gray-100 border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-md ${
            isDark
              ? "bg-[rgb(17,27,33)]/90 border-gray-700"
              : "bg-gray-100/90 border-gray-200"
          }`}
        >
          <h1 className="font-bold text-xl tracking-tight">Profile</h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Manage your profile information
          </p>
        </div>

        <div className="flex-1 p-6 space-y-5 max-w-md mx-auto w-full">

          {/* ── AVATAR CARD ── */}
          <div className={`${cardClass} flex flex-col items-center py-8`}>
            <div className="relative group mb-4">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-green-500/30 shadow-lg">
                {preview || user?.ProfilePicture ? (
                  <img
                    src={preview || user?.ProfilePicture}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <FaUser size={40} className={isDark ? "text-gray-500" : "text-gray-400"} />
                  </div>
                )}
              </div>

              {/* Hover Overlay */}
              <label
                htmlFor="profileUpload"
                className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FaCamera className="text-white mb-1" size={20} />
                <span className="text-white text-xs font-medium">Change</span>
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name & status under avatar */}
            <p className="font-semibold text-base">{user?.username || "Your Name"}</p>
            <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {user?.about || "Hey there! I am using WhisperNet."}
            </p>

            {/* Save picture button */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex gap-2 mt-4"
                >
                  <button
                    onClick={() => {
                      setPreview(null);
                      setProfilePicture(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    Discard
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => handleSave("profile")}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Photo"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── NAME CARD ── */}
          <EditableField
            label="Your Name"
            value={name}
            displayValue={user?.username || name}
            isEditing={isEditingName}
            onEdit={() => setIsEditingName(true)}
            onChange={(e) => setName(e.target.value)}
            onSave={() => handleSave("name")}
            onCancel={() => handleCancel("name")}
            onEmojiToggle={() => {
              setShowNameEmoji(!showNameEmoji);
              setShowAboutEmoji(false);
            }}
            showEmoji={showNameEmoji}
            onEmojiSelect={(e) => handleEmojiSelect(e, "name")}
            inputRef={nameRef}
            saving={saving}
            isDark={isDark}
            inputClass={inputClass}
            cardClass={cardClass}
            hint="This is not your username or pin. This name will be visible to your WhisperNet contacts."
          />

          {/* ── ABOUT CARD ── */}
          <EditableField
            label="About"
            value={about}
            displayValue={user?.about || about || "Hey there! I am using WhisperNet."}
            isEditing={isEditingAbout}
            onEdit={() => setIsEditingAbout(true)}
            onChange={(e) => setAbout(e.target.value)}
            onSave={() => handleSave("about")}
            onCancel={() => handleCancel("about")}
            onEmojiToggle={() => {
              setShowAboutEmoji(!showAboutEmoji);
              setShowNameEmoji(false);
            }}
            showEmoji={showAboutEmoji}
            onEmojiSelect={(e) => handleEmojiSelect(e, "about")}
            inputRef={aboutRef}
            saving={saving}
            isDark={isDark}
            inputClass={inputClass}
            cardClass={cardClass}
            hint="Write something about yourself."
          />

        </div>
      </motion.div>
    </Layout>
  );
};

/* ── REUSABLE EDITABLE FIELD ── */
const EditableField = ({
  label,
  value,
  displayValue,
  isEditing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  onEmojiToggle,
  showEmoji,
  onEmojiSelect,
  inputRef,
  saving,
  isDark,
  inputClass,
  cardClass,
  hint,
}) => (
  <div className={`${cardClass} relative`}>
    <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${
      isDark ? "text-green-400" : "text-green-600"
    }`}>
      {label}
    </label>

    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait" initial={false}>
        {isEditing ? (
          <motion.input
            key="input"
            ref={inputRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            type="text"
            value={value}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
            className={inputClass}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <motion.p
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`flex-1 text-sm py-2 px-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {displayValue}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isEditing ? (
          <>
            <ActionBtn onClick={onSave} disabled={saving} title="Save">
              <FaCheck size={13} className="text-green-500" />
            </ActionBtn>
            <ActionBtn onClick={onEmojiToggle} title="Emoji">
              <FaSmile size={13} className="text-yellow-400" />
            </ActionBtn>
            <ActionBtn onClick={onCancel} title="Cancel">
              <MdCancel size={15} className={isDark ? "text-gray-400" : "text-gray-500"} />
            </ActionBtn>
          </>
        ) : (
          <ActionBtn onClick={onEdit} title={`Edit ${label}`}>
            <FaPencilAlt size={13} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </ActionBtn>
        )}
      </div>
    </div>

    {/* Hint text */}
    {!isEditing && hint && (
      <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{hint}</p>
    )}

    {/* Emoji Picker */}
    <AnimatePresence>
      {showEmoji && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 bottom-full mb-2 left-0"
        >
          <EmojiPicker
            onEmojiClick={onEmojiSelect}
            theme={isDark ? "dark" : "light"}
            height={350}
            width={300}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ── SMALL ICON BUTTON ── */
const ActionBtn = ({ onClick, children, title, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-200/20 disabled:opacity-50"
  >
    {children}
  </button>
);

export default UserDetail;