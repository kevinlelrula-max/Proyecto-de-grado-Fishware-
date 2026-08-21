import { Navigate } from "react-router-dom";
import { decodeToken, tokenVigente } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token || !tokenVigente(token)) return <Navigate to="/empresa/login" replace />;

  const payload = decodeToken(token);
  if (!payload || payload.rol_id === 4) return <Navigate to="/empresa/login" replace />;

  return children;
}
