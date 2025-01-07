import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import LoadingIndicator from "../UI/LoadingIndicator";

interface ProtectedRouterProps {
  children: React.ReactNode;
}

export const ProtectedRouter: React.FC<ProtectedRouterProps> = ({ children }) => {
  const { isLogin } = useContext(UserContext);

  //add a fallback for when the context is still initializing
  const isContextInitialized = isLogin !== undefined;

  //show the LoadingIndicator while waiting for context initialization
  if (!isContextInitialized) {
    return <LoadingIndicator message="Checking your access..." />;
  }

  //redirect to login if the user is not logged in
  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  //render protected content if the user is logged in
  return <>{children}</>;
};
