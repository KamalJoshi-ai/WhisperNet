import { FaUser } from "react-icons/fa";
import React from "react";

function EmailInput({ theme, loginRegister, loginErrors }) {
  return (
    <>
      <div
        className={`flex items-center overflow-hidden border rounded-md px-3 py-2 relative ${
          theme === "dark"
            ? "bg-gray-700 border-gray-600"
            : "bg-white border-gray-300"
        }`}
      >
        
        <FaUser
          className={` absolute  ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        />

       
        <input
          type="email"
          {...loginRegister("email")}
          placeholder="Email (optional)"
          className={`left-6 relative w-full bg-transparent focus:outline-none 
            ${
              theme === "dark"
                ? "bg-gray-700 text-white placeholder-gray-400"
                : "bg-white text-black placeholder-gray-500"
            }
            ${loginErrors.email ? "border-red-500" : ""}
          `}
        />
      </div>

   
      {loginErrors.email && (
        <p className="text-red-400 text-sm mt-1">{loginErrors.email.message}</p>
      )}
    </>
  );
}

export default EmailInput;
