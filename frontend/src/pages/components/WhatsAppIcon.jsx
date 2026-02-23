import React from "react";
import { motion } from "framer-motion";
import { AiFillLayout } from "react-icons/ai";
import useThemeStore from "../../store/themeStore";
const WhatsAppIcon = () => {
    const { theme } = useThemeStore();
    return (
  <motion.div
   
    className={`w-18 h-18 bg-gray-900 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg 
    ${theme==="dark"?"border-1 border-white":""}`}
  >
    <AiFillLayout className="h-10 w-10 text-white" />
  </motion.div>
)
}
export default WhatsAppIcon;
