
import React from 'react';


import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import  useUserStore  from "./store/useUserStore";
import { userAuth } from "./services/user.service";
import Spinner from "./utils/Spinner"; 


export const PublicRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async function( ) {
      try {
        const result = await userAuth();
        if (result?.isAuthenticated) setUser(result.user);
        else clearUser();
      } catch (err) {
        clearUser();
      } finally { 
        setIsChecking(false);
      }
    };
    checkAuth()
  }, [setUser, clearUser]);



 if (isChecking) {
  return    <div id="loader">
    <div class="spinner"></div>
    <p>Loading WhisperNet...</p>
  </div>
 }
 if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  
  const {isAuthenticated} = useUserStore();

  console.log(isAuthenticated)
  if (isAuthenticated) {
   return <Outlet />;
  }
    else {
  return <Navigate to="/user-login"  replace />;
}
  
};