import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../lib/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    retry: false,
  });
  return <AuthContext.Provider value={query}>{children}</AuthContext.Provider>;
}
