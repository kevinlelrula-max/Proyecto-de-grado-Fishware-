import { Navigate } from "react-router-dom";

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/empresa/login" replace />;

  const payload = decodeToken(token);
  if (!payload || payload.rol_id === 4) return <Navigate to="/empresa/login" replace />;

  return children;
}
