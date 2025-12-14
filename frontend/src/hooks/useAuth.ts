import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

/**
 * Hook wrapper around AuthContext.
 * Use this instead of importing AuthContext directly where possible.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
