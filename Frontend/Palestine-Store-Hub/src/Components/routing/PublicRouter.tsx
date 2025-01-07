import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import LoadingIndicator from "../UI/LoadingIndicator";

interface PublicRouterProps {
  children: React.ReactNode;
}

export const PublicRouter: React.FC<PublicRouterProps> = ({ children }) => {
  const { isLogin } = useContext(UserContext);

  //add a fallback for when the context is still initializing
  const isContextInitialized = isLogin !== undefined;

  //show the LoadingIndicator while waiting for context initialization
  if (!isContextInitialized) {
    return <LoadingIndicator message="Preparing your access..." />;
  }

  //f the user is logged in, redirect to the homepage
  if (isLogin) {
    return <Navigate to="/" />;
  }

  //if the user is not logged in, render the public content
  return <>{children}</>;
};
