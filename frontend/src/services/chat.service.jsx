// socket.js
import { io } from "socket.io-client";

let socket = null;

export const initailizeSocket = (user) => {
  if (socket) return socket;

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // connect hone ke baad user emit karo
  
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    if (user?._id) {
      socket.emit("user_connected", user._id);
    }
  });

  //  ye listener connect ke andar nahi hona chahiye
  socket.on("user_status", (data) => {
    console.log("User status update:", data);
    console.log("From socket id:", socket.id);
    // yaha tum apna state (Zustand/Redux/React) update kar sakte ho
  });

  // optional: error/debug logs
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.warn("Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn("Socket not initialized yet!");
    return null;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    // socket.disconnect();
    // socket = null;
  }
};
