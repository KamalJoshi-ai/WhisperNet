import React from "react";
import { motion } from "framer-motion";
import Spinner from '../../utils/Spinner'
import { useEffect } from "react";
const Step3Profile = ({
  theme,
  profile,
  setProfile,
  profilePreview,
  setProfilePreview,
  agreedTerms,
  setAgreedTerms,
  profileRegister,
  profileErrors,
  loading,
  onProfileSubmitHandler,
}) => {
  const avatars = [
    
    "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi",
    "https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper",
    "https://api.dicebear.com/6.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe",
  ];

useEffect(() => {
  if (!profile?.selectedAvatar && !profile?.file) {
    setProfile({ ...profile, selectedAvatar: avatars[0] });
    setProfilePreview(avatars[0]);
  }

}, []);

  const handleFileChange = (e) => {
    
    const file = e.target.files[0];
    if (file) {
      if (profilePreview) URL.revokeObjectURL(profilePreview); // cleanup old one

      setProfile({ ...profile, file, selectedAvatar: null });
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const selectAvatar = (url) => {
    setProfile({ ...profile, selectedAvatar: url, file: null });
    setProfilePreview(url);
  };

  const safeProfile = profile || {};

  return (
    <motion.form
      onSubmit={onProfileSubmitHandler}
      className="space-y-4 mb-4"
     
    >
      <p
        className={`text-center ${
          theme === "dark" ? "text-gray-300" : "text-gray-400"
        }`}
      >
        Complete your profile
      </p>

      {/* WhatsApp style preview */}
      <div
        className={`flex flex-col py-10 items-center justify-center text-center border rounded-xl ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-100 border-gray-300"
        }`}
      >
      
          <img
            src={profilePreview || avatars[0]}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-green-700"
          />
    

        <h3
          className={`text-lg font-semibold text-center ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {safeProfile.username || "Your Name"}
        </h3>

        <p
          className={`text-sm  ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          This is how it will appear on WhisperNet
        </p>
      </div>

      {/* Username input */}
      <input
        type="text"
        {...profileRegister("username")}
        required
        onChange={(e) =>
          setProfile({ ...safeProfile, username: e.target.value })
        }
        placeholder="Enter username"
        className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${
          profileErrors.username ? "border-red-500" : ""
        } ${
          theme === "dark"
            ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
            : "bg-white border border-gray-300 text-black placeholder-gray-500"
        }`}
      />
      {profileErrors.username && (
        <p className="text-red-400 text-sm">{profileErrors.username.message}</p>
      )}

      {/* Avatar selection */}
      <div className="flex flex-wrap gap-3 justify-center">
        {avatars.map((url) => (
          <img
            key={url}
            src={url}
            alt="avatar"
            className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
              safeProfile.selectedAvatar === url
                ? "border-green-500"
                : "border-transparent"
            }`}
            onClick={() => (selectAvatar(url))}
          />
        ))}
      </div>


      {/* File upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-700 cursor-pointer"
      />

      {/* Terms checkbox */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          {...profileRegister("agreed")}
          checked={agreedTerms}
          onChange={(e) => setAgreedTerms(e.target.checked)}
          className="w-4 h-4"
        />
        <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          I agree to terms and conditions
        </span>
      </label>
      {profileErrors.agreed && (
        <p className="text-red-400 text-sm">{profileErrors.agreed.message}</p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="w-full bg-green-500 text-white rounded-md py-2 hover:bg-green-600 transition flex items-center justify-center cursor-pointer"
      >
        {loading ? <Spinner /> : "Complete Profile"}
      </button>
    </motion.form>
  );
};

export default Step3Profile;
