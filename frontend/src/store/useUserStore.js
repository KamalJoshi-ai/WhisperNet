import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      userPhoneData: null,

      setUser: (userData) =>
        set({
          user: userData,
          isAuthenticated: true,
        }),

      setUserPhoneData: (phoneData) =>
        set({
          userPhoneData: phoneData,
        }),

      clearUser: () =>
        set({
          user: null,
          userPhoneData: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "user-storage", 
      storage: createJSONStorage(() => localStorage),

   
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        userPhoneData: state.userPhoneData,
      }),
    }
  )
);

export default useUserStore;