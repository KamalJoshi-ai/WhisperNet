import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { motion } from "framer-motion";
import ChatList from "../ChatSection/ChatList";
import { getAllUsers } from "../../services/user.service";
import useThemeStore from "../../store/themeStore";
import useChatStore from "../../store/chatStore";
const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const { allUsers, setAllUsers } = useChatStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const getAllUser = async () => {
    try {
      setLoading(true);

      const result = await getAllUsers();

      if (result.status === "success") {
        setAllUsers(result.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Banner at full width top */}
      <div
        className={`w-screen px-4 py-2 border-b ${
          isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
        } flex justify-center`}
      >
        <span
          className={`text-base font-semibold tracking-wide ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          WhisperNet — Fast & Secure Chat
        </span>
      </div>

      <Layout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          {loading ? (
            <div className="h-full overflow-hidden p-4">
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700 animate-pulse mb-2" />
                      <div className="h-3 w-20 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ChatList contacts={allUsers} />
          )}
        </motion.div>
      </Layout>
    </div>
  );
};
export default HomePage;
