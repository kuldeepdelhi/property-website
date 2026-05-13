import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  const portalUser = localStorage.getItem("portalUser");

  if (!user && !portalUser) {
    return <Navigate to="/portal/login" replace />;
  }
  if(!user){
    return <Navigate to="/portal/dashboard" replace />;
  }

  return children;
};