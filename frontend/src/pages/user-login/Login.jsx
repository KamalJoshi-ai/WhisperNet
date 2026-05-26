import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import useLoginStore from "../../store/useLoginStore";

import {
  loginValidationSchema,
  otpValidationSchema,
  profileValidationSchema,
} from "./loginSchemas";

import WhatsAppIcon from "../components/WhatsAppIcon";
import ProgressBar from "../components/ProgressBar";
import Step1Login from "../components/Step1";
import Step2OTP from "../components/Step2";
import Step3Profile from "../components/Step3";

import {
  sendOtp,
  verifyOtp,
  updateUserProfile,
} from "../../services/user.service";

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { setUser } = useUserStore();

  const {
    step,
    setStep,
    userPhoneData,
    setUserPhoneData,
    profile,
    setProfile,
    agreedTerms,
    setAgreedTerms,
    loading,
    setLoading,
    selectedCountry,
    resetLoginState,
  } = useLoginStore();

  const [profilePreview, setProfilePreview] = useState(null);

  const loginForm = useForm({
    resolver: yupResolver(loginValidationSchema),
  });
 

  const otpForm = useForm({
    resolver: yupResolver(otpValidationSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const profileForm = useForm({
    resolver: yupResolver(profileValidationSchema),
  });

  const showErrorToast = (msg) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg`}
      >
        {msg}
      </div>
    ));
  };

  const onLoginSubmit = async (data) => {
    try {
      setLoading(true);

      let response;
      if (data.email) {
        response = await sendOtp(null, null, data.email);
        if (response.status === "success") {
          toast.success("OTP sent to your email");
        }
      } else if (data.phoneNumber) {
        response = await sendOtp(
          data.phoneNumber,
          selectedCountry?.dialCode,
          null
        );
        if (response.status === "success") {
          toast.success("OTP sent to your phone");
        }
      }

      setUserPhoneData({
        ...data,
        dialCode: selectedCountry?.dialCode || null,
      });
 
      setStep(2);
    } catch (err) {
      console.error(err);
      showErrorToast("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmitHandler = async (data) => {
    try {
      setLoading(true);
      let response;

      if (userPhoneData?.email) {
        response = await verifyOtp(null, null, data.otp, userPhoneData.email);
      } else {
        response = await verifyOtp(
          userPhoneData.phoneNumber,
          userPhoneData.dialCode,
          data.otp,
          null
        );
      }

      if (response.status === "success") {
        toast.success("OTP verified");

        const user = response.data?.user;
        
        if (user?.username && user?.ProfilePicture) {
          setUser(user);
          toast.success("Welcome back to Talkio");
          navigate("/");
          resetLoginState();
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmitHandler = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("agreed", data.agreed);

      if (profile?.file) {
        formData.append("media", profile.file);
      } else if (profile?.selectedAvatar) {
        formData.append("ProfilePicture", profile.selectedAvatar);
      }

      await updateUserProfile(formData);

      toast.success("Welcome to Talkio");
      navigate("/");
      resetLoginState();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-6
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0px 10px 40px rgba(0,0,0,0.3)",
        }}
        className={`
          ${
            theme === "dark"
              ? "bg-gray-900/90 backdrop-blur-xl text-gray-100 border border-gray-700"
              : "bg-white/90 backdrop-blur-xl text-gray-900 border border-gray-200"
          }
          p-8 md:p-10 rounded-3xl shadow-2xl
          w-full ${step < 3 ? "max-w-md" : "max-w-2xl"}
          relative z-10
          transition-all duration-300 ease-in-out
          ${loading ? " pointer-events-none" : ""}
        `}
      >
        <WhatsAppIcon />

        <h1 className="text-2xl font-semibold text-center mb-4 tracking-wide">
          Talkio Login
        </h1>

        <ProgressBar step={step} theme={theme} />

        {step === 1 && (
          <Step1Login
            theme={theme}
            loginRegister={loginForm.register}
            loginErrors={loginForm.formState.errors}
            loading={loading}
            onLoginSubmit={loginForm.handleSubmit(onLoginSubmit)}
          />
        )}

        {step === 2 && (
          <Step2OTP
            theme={theme}
            loginForm={loginForm}
            setLoading={setLoading}
            onLoginSubmit={onLoginSubmit}
            userPhoneData={userPhoneData}
            selectedCountry={selectedCountry}
            setUserPhoneData={setUserPhoneData}
            otpRegister={otpForm.register}
            otpErrors={otpForm.formState.errors}
            loading={loading}
            onOtpSubmitHandler={otpForm.handleSubmit(onOtpSubmitHandler)}
          />
        )}

        {step === 3 && (
          <Step3Profile
            theme={theme}
            profile={profile}
            setProfile={setProfile}
            profilePreview={profilePreview}
            setProfilePreview={setProfilePreview}
            agreedTerms={agreedTerms}
            setAgreedTerms={setAgreedTerms}
            profileRegister={profileForm.register}
            profileErrors={profileForm.formState.errors}
            loading={loading}
            onProfileSubmitHandler={profileForm.handleSubmit(
              onProfileSubmitHandler
            )}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Login;
