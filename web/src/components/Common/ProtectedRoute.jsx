import { Navigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { data, isLoading } = useAuth();

  if (isLoading) return null;
  if (!data || !data.ok) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
