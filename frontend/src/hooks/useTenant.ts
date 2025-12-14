import { useContext } from "react";
import { TenantContext } from "../contexts/TenantContext";

/**
 * Hook wrapper around TenantContext.
 */
export const useTenant = () => {
  return useContext(TenantContext);
};

export default useTenant;
