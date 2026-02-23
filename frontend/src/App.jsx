import React, { useEffect } from "react";
import Login from "./pages/user-login/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/components2/HomePage";

import UserDetail from "./pages/components2/UserDetail.jsx";
import Status from "./pages/StatusSection/Status.jsx";
import Settings from "./pages/SettingSection/Settings.jsx";
import { PublicRoute, ProtectedRoute } from "./Protected.jsx";
import useUserStore from "./store/useUserStore.js";
import {
  disconnectSocket,
  initailizeSocket,
} from "./services/chat.service.jsx";
import useChatStore from "./store/chatStore.js";
const App = () => {
  const { user } = useUserStore();
  const { setCurrentUser, initsocketListeners } = useChatStore();

  useEffect(() => {
    if (user?._id) {
      const socket = initailizeSocket(user);

      if (socket) {
        setCurrentUser(user);
        initsocketListeners();
      }
    }

    return () => {
      disconnectSocket();
    };
  }, [user, initsocketListeners]);


  
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/user-login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/user-profile" element={<UserDetail />} />
            <Route path="/status" element={<Status />} />
            <Route path="/setting" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
