import { io } from "socket.io-client";
import  useChatStore  from "../store/chatStore";

export const initailizeSocket = (user) => {
  const { socket, setSocket } = useChatStore.getState();
  if (socket) return socket;

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const newSocket = io(BACKEND_URL, {
    query: { userId: user?._id },
    withCredentials: true,
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnection: true,
    reconnectionDelay: 1000,
  });

  newSocket.on("connect", () => {
    console.log("Socket connected:", newSocket.id);
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
