import React from "react";

const ProgressBar = ({ step, theme }) => (
  <div
    className={`w-full ${
      theme === "dark" ? "bg-gray-700" : "bg-gray-400"
    } rounded-full h-2.5 mx-auto m-6 overflow-hidden `}
  >
    <div
      className="transition-all bg-green-500 h-2.5 duration-500 ease-in-out rounded-full "
     
      style={{ width: `${(step / 3) * 100}%` }}
    ></div>
  </div>
);

export default ProgressBar;
