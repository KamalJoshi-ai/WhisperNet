import { motion } from "framer-motion";
import EmailInput from "../user-login/EmailInput";
import Spinner from "../../utils/Spinner";
import CountrySelect from "../user-login/dropdown";

const Step1Login = ({
  theme,
  loginRegister,
  loginErrors,
  loading,
  onLoginSubmit,
}) => {
  return (
    <motion.form onSubmit={onLoginSubmit} className="space-y-4 mb-4">
      <p
        className={`text-center ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Enter your phone number or email to continue
      </p>

      <div className="flex h-12 gap-2">
        <CountrySelect theme={theme} />

        <input
          type="tel"
          disabled
          {...loginRegister("phoneNumber")}
          placeholder=" (disabled) Enter phone number"
          className={`w-2/3 px-4 py-2 rounded-lg focus:ring-1 focus:ring-green-500 focus:outline-none ${
            loginErrors.phoneNumber ? "border-red-500" : ""
          } ${
            theme === "dark"
              ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
              : "bg-white border border-gray-300 text-black placeholder-gray-500"
          }`}
        />
      </div>

      {loginErrors.phoneNumber && (
        <p className="text-red-400 text-sm ">
          {loginErrors.phoneNumber.message}
        </p>
      )}

      <div className="flex items-center my-6">
        <hr
          className={`flex-grow ${
            theme === "dark" ? "border-gray-600" : "border-gray-700"
          }`}
        />
        <span
          className={`mx-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          OR
        </span>
        <hr
          className={`flex-grow ${
            theme === "dark" ? "border-gray-600" : "border-gray-700"
          }`}
        />
      </div>


      <EmailInput
        theme={theme}
        loginRegister={loginRegister}
        loginErrors={loginErrors}
      />

      <button
        type="submit"
        className="w-full bg-green-700 text-white rounded-md py-2 hover:bg-green-800 transition flex   justify-center cursor-pointer"
      >
        {loading ? <Spinner /> : "Send OTP"}
      </button>
    </motion.form>
  );
};

export default Step1Login;
