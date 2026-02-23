
import React from 'react';


import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import  useUserStore  from "./store/useUserStore";
import { userAuth } from "./services/user.service";
import Spinner from "./utils/Spinner"; 


export const ProtectedRoute = () => {
  const location = useLocation();
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

 if (isChecking) return <Spinner />;

  if (!isAuthenticated)
    return <Navigate to="/user-login" state={{ from: location }} replace />;
//use Navigate when redirect, condition and no event     while     use navigate function
//of useNavigate() while dealing with events 
  return <Outlet />;
};

export const PublicRoute = () => {
  const {isAuthenticated} = useUserStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};