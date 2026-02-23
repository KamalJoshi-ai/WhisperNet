import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
    
      isAuthenticated: false,
      user: null,
      userPhoneData: null,

      setUser: (userData) => set({ user: userData, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
   
  ),
);

export default useUserStore;
