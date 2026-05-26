import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import Spinner from "../../utils/Spinner";
import toast from "react-hot-toast";
import {
  sendOtp,

} from "../../services/user.service";
import useLoginStore from "../../store/useLoginStore";
const Step2OTP = ({
  theme,
  loginForm,
  userPhoneData,
  selectedCountry,
  otpRegister,
  otpErrors,
  loading,
  onOtpSubmitHandler,
}) => {
  const [resendLoading, setResendLoading] = useState(false);
  const { resetLoginState,setStep } = useLoginStore();

  const handleResendOtp = async () => {
    setResendLoading(true);
    const data = userPhoneData;
    try {
      if (data.email) {
        let response = await sendOtp(null, null, data.email);
        if (response.status === "success") {
          toast.success("OTP sent to your email", {
            style: { borderRadius: "8px", background: "#333", color: "#fff" },
          });
        }
      } else if (data.phoneNumber) {
        response = await sendOtp(
          data.phoneNumber,
          selectedCountry?.dialCode,
          null
        );
        if (response.status === "success") {
          toast("OTP sent to your phone number");
        }
      }
    
    } catch (error) {
      console.log(error);
      toast.error("error sending otp");
    } finally {
      setResendLoading(false);
    }
  };
  return (
    <motion.form
      onSubmit={onOtpSubmitHandler}
      className="space-y-4 mb-4"
     
    >
      <p
        className={`text-center ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Enter the 6-digit OTP sent to your number/email
      </p>

      <input
        type="text"
        {...otpRegister("otp")}
        placeholder="Enter OTP"
        className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${
          otpErrors.otp ? "border-red-500" : ""
        } ${
          theme === "dark"
            ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
            : "bg-white border border-gray-300 text-black placeholder-gray-500"
        }`}
      />
      {otpErrors.otp && (
        <p className="text-red-400 text-sm">{otpErrors.otp.message}</p>
      )}

      <button
        type="button"
        onClick={() => {
          resetLoginState(); // previous data clear
          loginForm.reset(); // form reset
          setStep(1); // go back to step 1
        }}
        className="mb-2 text-sm text-gray-400 hover:underline hover:text-blue-400 cursor-pointer "
      >
        Change Email / Phone
      </button>
     

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
        {/* Submit / Verify OTP button */}
        <button
          type="submit"
          className="flex-1 w-full bg-green-700 text-white font-semibold py-2 rounded-lg shadow hover:bg-green-800 transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? <Spinner /> : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendLoading}
          className="flex-1 border-2 w-full border-green-600 text-green-800 font-semibold py-2 rounded-lg hover:cursor-pointer hover:border-green-500 hover:text-green-600 transition-colors duration-200 flex items-center justify-center"
        >
          {resendLoading ? <Spinner /> : "Resend OTP"}
        </button>
        
      </div>
    </motion.form>
  );
};

export default Step2OTP;
