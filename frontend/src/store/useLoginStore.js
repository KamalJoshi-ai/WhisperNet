// store/useLoginStore.jsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLoginStore = create(
  persist(
    (set) => ({
      step: 1,
      userPhoneData: null,
      
      file: null,
      profile: { username: "", file: null  ,selectedAvatar: null, },

      agreedTerms: false,
      loading: false,
      selectedCountry: { name: "India", dialCode: "+91" },
      // actions
      setStep: (step) => set({ step }),
      setUserPhoneData: (data) => set({ userPhoneData: data }),
     

      setProfile: (data) =>set(function(state){ 

        return {profile: { ...state.profile, ...data },
        }
      
      }),

      setAgreedTerms: (value) => set({ agreedTerms: value }),
      setLoading: (value) => set({ loading: value }),
      setSelectedCountry: (country) => set({ selectedCountry: country }), //
      resetLoginState: () =>
        set({
          step: 1,
          userPhoneData: null,
         
          profile: { username: "", file: null },
          file: null,
          agreedTerms: false,
          loading: false,
        }),
    }),
    {
      name: "login-storage",
      partialize: (state) => ({
        step: state.step,
        userPhoneData: state.userPhoneData,
        loading:state.loading,
        profile: state.profile,
        agreedTerms: state.agreedTerms,
        selectedCountry: state.selectedCountry,
      }),
    }
  )
);

export default useLoginStore;
