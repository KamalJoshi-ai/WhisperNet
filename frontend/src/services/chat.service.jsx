import { io } from "socket.io-client";
import  useChatStore  from "../store/chatStore";

export const initailizeSocket = (user) => {
  const { socket, setSocket } = useChatStore.getState();
  if (socket) return socket;

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const newSocket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  newSocket.on("connect", () => {
    console.log("Socket connected:", newSocket.id);
    if (user?._id) {
      newSocket.emit("user_connected", user._id);
    }
  });


  newSocket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  newSocket.on("disconnect", (reason) => {
    console.warn("Socket disconnected:", reason);
  });

  setSocket(newSocket);
  return newSocket;
};



export const disconnectSocket = () => {
  const { socket, clearSocket } = useChatStore.getState();
  if (socket) {
    socket.disconnect();
    clearSocket();
  }
};
