import { create } from "zustand";
import axiosInstance from "../services/url.service";
import { getAllUsers } from "../services/user.service";
import useLayoutStore from "./layoutStore";
// ===== CONSTANTS =====
const SOCKET_EVENTS = {
  RECEIVE_MESSAGE: "receive_message",
  MESSAGE_SEND: "message_send",
  REACTION_UPDATE: "reaction_update",
  MESSAGE_DELETED: "message_deleted",
  MESSAGE_ERROR: "message_error",
  USER_TYPING: "user_typing",
  MESSAGE_READ: "message-read",
  USER_STATUS: "user_status",
  OFFLINE: "Offline",
  ONLINE_USERS: "online_users",
};

  // const { selectedContact } = useLayoutStore();

// ===== ZUSTAND STORE =====
const useChatStore = create((set, get) => {
    // Flag to prevent duplicate initialization

  return {
    // ===== STATE =====
    conversations: { data: [] },
    allUsers:[],
    currentUser: null,
    socketListenersInitialized : false,
    currentConversation: null,
    messages: [],
    loading: false,
    contact: null, // Fixed: was "Contact" (PascalCase)
    error: null,
    onlineUsers: new Map(),
    newUsers: new Map(),
    typingUsers: new Map(),
    socket: null,
    socket: null,
     
    messageCache: new Map(), // Track all received messages globally

    // ===== SETTERS =====
    setAllUsers:(data)=>set({allUsers:data}),
    setContact: (user) => set({ contact: user }),
    setCurrentUser: (user) => set({ currentUser: user }),
    setCurrentConversation: (id) => set({ currentConversation: id }),
    setSocket: (s) => set({ socket: s }),
    clearSocket: () => set({ socket: null }),
    // ===== SOCKET INITIALIZATION =====
    initsocketListeners: () => {
      const socketListenersInitialized=get().socketListenersInitialized
      // Prevent duplicate listener initialization
      if (socketListenersInitialized) return;

      const socket = get().socket;

      if (!socket) return;

      set({ socket });

       set({ socketListenersInitialized: true }); 

      // ===== ONLINE USERS =====
      socket.on(SOCKET_EVENTS.ONLINE_USERS, (users) => {
        set({ onlineUsers: new Map(users) });
      });

      // ===== RECEIVE MESSAGE =====
      socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message) => {
        try {
          get().receiveMessage(message);
        } catch (error) {
          console.error("Error processing received message:", error);
          set({ error: error?.message || "Failed to receive message" });
        }
      });

      // ===== MESSAGE SEND CONFIRMATION =====
      socket.on(SOCKET_EVENTS.MESSAGE_SEND, (message) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === message._id
              ? { ...msg, messageStatus: "delivered" }
              : msg
          ),
        }));
      });

      // ===== REACTION UPDATE =====
      socket.on(
        SOCKET_EVENTS.REACTION_UPDATE,
        ({ messageId, reactions }) => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === messageId ? { ...msg, reactions } : msg
            ),
          }));
        }
      );

      // ===== MESSAGE DELETED =====
      socket.on(SOCKET_EVENTS.MESSAGE_DELETED, (deletedMessageId) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
        }));
      });

      // ===== MESSAGE ERROR =====
      socket.on(SOCKET_EVENTS.MESSAGE_ERROR, (error) => {
        console.error("Message error:", error);
        set({ error });
      });

      // ===== USER TYPING =====
      socket.on(
        SOCKET_EVENTS.USER_TYPING,
        ({ userId, conversationId, isTyping }) => {
          set((state) => {
            const newTypingUsers = new Map(state.typingUsers);

            if (!newTypingUsers.has(conversationId)) {
              newTypingUsers.set(conversationId, new Set());
            }

            const typingSet = newTypingUsers.get(conversationId);

            if (isTyping) {
              typingSet.add(userId);
            } else {
              typingSet.delete(userId);
            }

            return { typingUsers: newTypingUsers };
          });
        }
      );

      // ===== MESSAGE READ =====
      socket.on(SOCKET_EVENTS.MESSAGE_READ, (updateMessage) => {
        set((state) => {
          const updatedMessages = state.messages.map((msg) =>
            msg._id === updateMessage._id
              ? { ...msg, messageStatus: updateMessage.messageStatus }
              : msg
          );

          return { messages: updatedMessages };
        });
      });

      // ===== USER STATUS (ONLINE/OFFLINE) =====
      socket.on(
        SOCKET_EVENTS.USER_STATUS,
        ({ userId, isOnline, lastSeen }) => {
          try {
            set((state) => {
              const newOnlineUsers = new Map(state.onlineUsers);
              newOnlineUsers.set(userId, { isOnline, lastSeen });
              return { onlineUsers: newOnlineUsers };
            });
          } catch (error) {
            console.error("Error updating user status:", error);
          }
        }
      );

      // ===== OFFLINE EVENT - Fixed: now updates ANY user =====
      socket.on(SOCKET_EVENTS.OFFLINE, ({ userId, isOnline, lastSeen }) => {
        try {
          set((state) => {
            const updated = new Map(state.onlineUsers); // Fixed: was set.onlineUsers
            updated.set(userId, { isOnline, lastSeen });
            return { onlineUsers: updated };
          });
        } catch (error) {
          console.error("Error handling offline event:", error);
        }
      });

      // ===== GET USER STATUS FOR ALL CONTACTS =====
      const conversations = get().conversations;

      if (conversations?.data?.length > 0) {
        conversations.data.forEach((conv) => {
          const otherUser = conv.participants.find(
            (p) => p._id !== get().currentUser?._id
          );

          if (otherUser?._id) {
            socket.emit("get_user_status", otherUser._id, (status) => {
              try {
                set((state) => {
                  const newOnlineUsers = new Map(state.onlineUsers);
                  newOnlineUsers.set(otherUser._id, {
                    isOnline: status.isOnline,
                    lastSeen: status.lastSeen,
                  });
                  return { onlineUsers: newOnlineUsers };
                });
              } catch (error) {
                console.error("Error setting user status:", error);
              }
            });
          }
        });
      }
    },

    // ===== FETCH ONLINE USERS =====
    fetchOnlineUsers: () => {
      const socket = get().socket;
      if (socket) {
        socket.emit("get_online_users");
      }
    },


    updateUnreadCount: async(conversationId) =>
   {
    const users = get().allUsers.map((user) =>
          user._id === conversationId
            ? {
                ...user,
                conversation: {
                  ...user.conversation,
                  unreadCount: 0,
                  
                },
              }
            : user
        )
  try {
    await axiosInstance.put("/chat/updateContacts", {
      conversationId,
    });
    
          set({allUsers:users})
  } catch (error) {
    console.error(error);
  }
        console.log(users,conversationId)
      },
    
    // ===== FETCH CONVERSATIONS =====
    fetchConversations: async () => {
      set({ loading: true, error: null });
      try {
        const { data } = await axiosInstance.get("/chat/conversations");

        // Normalize data structure
        const normalizedConversations = {
          data: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
        };

        set({
          conversations: normalizedConversations,
          loading: false,
        });

        // Initialize socket listeners once
        get().initsocketListeners();

        return normalizedConversations;
      } catch (error) {
        set({
          error: error?.response?.data?.message || error?.message,
          loading: false,
        });

        return { data: [] };
      }
    },

    // ===== FETCH MESSAGES =====
    fetchMessages: async (conversationId) => {
      if (!conversationId) return [];

      set({ loading: true, error: null });
      try {
        const { data } = await axiosInstance.get(
          `/chat/conversations/${conversationId}/messages`
        );

        const messageArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

        set({
          messages: messageArray,
          currentConversation: conversationId,
          loading: false,
        });

        // Mark messages as read
        get().markMessageAsRead();

        return messageArray;
      } catch (error) {
        set({
          error: error?.response?.data?.message || error?.message,
          loading: false,
        });

        return [];
      }
    },

    // ===== SEND MESSAGE - Fixed: Added optimistic update with tempId =====
    sendMessage: async (formData) => {
      const senderId = formData.get("senderId");
      const receiverId = formData.get("receiverId");
      const content = formData.get("content");
      const messageStatus = formData.get("messageStatus");
      const { conversations } = get();

      // Find conversation ID
      let conversationId = null;
      if (conversations?.data?.length > 0) {
        const conversation = conversations.data.find(
          (conv) =>
            conv.participants.some((p) => String(p._id) === String(senderId)) &&
            conv.participants.some((p) => String(p._id) === String(receiverId))
        );

        if (conversation) {
          conversationId = conversation._id;
          set({ currentConversation: conversationId });
        }
      }

      // Generate temporary ID for optimistic update
      const tempId = `temp_${Date.now()}_${Math.random()}`;

      // Create optimistic message
      const optimisticMessage = {
        _id: tempId,
        content,
        sender: { _id: senderId },
        receiver: { _id: receiverId },
        conversation: conversationId,
        messageStatus: "sending",
        createdAt: new Date(),
        contentType: "text",
      };

      // Add optimistic message to UI immediately
      set((state) => ({
        messages: [...state.messages, optimisticMessage],
      }));

      try {
        const { data } = await axiosInstance.post(
          "/chat/send-message",
          formData
        );

        const messageData = data.data || null;

        if (!messageData) {
          throw new Error("Invalid response from server");
        }

        // Replace optimistic message with real one
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === tempId ? messageData : msg
          ),
        }));

        // Add to cache
        get().messageCache.set(messageData._id, true);

        return messageData;
      } catch (error) {
        console.error("Error sending message:", error);

        // Mark optimistic message as failed
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === tempId
              ? { ...msg, messageStatus: "failed" }
              : msg
          ),
          error: error?.response?.data?.message || error?.message,
        }));

        throw error;
      }
    },

    // ===== RECEIVE MESSAGE - Fixed: Better logic =====
    receiveMessage: async (message) => {
      if (!message) return;
      const { currentConversation, currentUser } = get();

      // Check global cache to prevent duplicates
      if (get().messageCache.has(message._id)) return;

      // Add to cache
      get().messageCache.set(message._id, true);

      // If this is the current conversation, add to messages
      if (message.conversation === currentConversation) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      
        // If current user is receiver, mark as read immediately
        if (message.receiver?._id === currentUser?._id) {
          get().markMessageAsRead(currentConversation);
        }
      }
        
  try {
      const result = await getAllUsers();

      if (result.status === "success") {
        get().setAllUsers(result.data);
      }
       } catch (error) {
      console.log(error);
    }
    

    const isSelected = useLayoutStore.getState().selectedContact
    console.log("isSelected",isSelected)
    if(isSelected){
      get().updateUnreadCount(isSelected._id)
    }
         set((state) => {
        const updatedConversations = state.conversations?.data?.map((conv) => {
          if (conv._id === message.conversation) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount:
                message?.receiver?._id === currentUser?._id &&
                message.conversation !== currentConversation
                  ? (conv.unreadCount || 0) + 1
                  : conv.unreadCount || 0,
            };
          }
          return conv;
        });

        return {
          conversations: {
            ...state.conversations,
            data: updatedConversations,
          },
        };
      });
    },

    // ===== MARK MESSAGES AS READ =====
    markMessageAsRead: async () => {
      const { messages, currentUser, currentConversation } = get();

      if (!messages?.length || !currentUser || !currentConversation) return;

      const unreadIds = messages
        .filter(
          (msg) =>
            msg.messageStatus !== "read" &&
            msg.receiver?._id === currentUser._id &&
            msg.conversation === currentConversation
        )
        .map((msg) => msg._id);

      if (unreadIds.length === 0) return;

      try {
        // Optimistically update UI
        set((state) => ({
          messages: state.messages.map((msg) =>
            unreadIds.includes(msg._id)
              ? { ...msg, messageStatus: "read" }
              : msg
          ),
        }));

        // Send to server
        await axiosInstance.put("/chat/messages/read", {
          messageIds: unreadIds,
        });
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
        set({ error: error?.response?.data?.message || error?.message });
      }
    },

    // ===== DELETE MESSAGE =====
    deleteMessage: async (messageId) => {
      try {
        await axiosInstance.delete(`/chat/messages/${messageId}`, {
          data: { messageId },
        });

        set((state) => ({
          messages: state.messages?.filter((msg) => msg?._id !== messageId),
        }));

        // Remove from cache
        get().messageCache.delete(messageId);

        return true;
      } catch (error) {
        console.error("Error deleting message:", error);
        set({ error: error?.response?.data?.message || error?.message });
        return false;
      }
    },

    // ===== ADD REACTION =====
    addReaction: async (messageId, emoji) => {
      const socket = get().socket
      const { currentUser } = get();

      if (socket && currentUser) {
        socket.emit("add_reaction", {
          messageId,
          emoji,
          reactionUserId: currentUser?._id,
        });
      }
    },

    // ===== START TYPING =====
    startTyping: (receiverId) => {
      const { currentConversation } = get();
      const socket = get().socket

      if (socket && currentConversation && receiverId) {
        socket.emit("typing_start", {
          conversationId: currentConversation,
          receiverId,
        });
      }
    },

    // ===== STOP TYPING =====
    stopTyping: (receiverId) => {
      const { currentConversation } = get();
      const socket = get().socket

      if (socket && currentConversation && receiverId) {
        socket.emit("typing_stop", {
          conversationId: currentConversation,
          receiverId,
        });
      }
    },

    // ===== CHECK IF USER IS TYPING =====
    isUserTyping: (userId) => {
      const { typingUsers, currentConversation } = get();

      if (!currentConversation || !typingUsers.has(currentConversation) || !userId) {
        return false;
      }

      return typingUsers.get(currentConversation).has(userId);
    },

    // ===== CHECK IF USER IS ONLINE =====
    isUserOnline: (userId) => {
      if (!userId) return false;

      const { onlineUsers } = get();
      return onlineUsers.get(userId)?.isOnline || false;
    },

    // ===== GET USER LAST SEEN =====
    getUserLastSeen: (userId) => {
      if (!userId) return null;

      const { onlineUsers } = get();
      return onlineUsers.get(userId)?.lastSeen || null;
    },

    // ===== CLEANUP (e.g., on logout) =====
    cleanup: () => {
       set({ socketListenersInitialized: false }); 
      set({
        conversations: { data: [] },
        currentConversation: null,
        messages: [],
        onlineUsers: new Map(),
        typingUsers: new Map(),
        currentUser: null,
        contact: null,
        error: null,
      });
    },
  };
});

export default useChatStore;




