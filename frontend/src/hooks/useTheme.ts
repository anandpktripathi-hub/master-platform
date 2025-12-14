import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

/**
 * Hook wrapper around ThemeContext.
 */
export const useTheme = () => {
  return useContext(ThemeContext);
};

export default useTheme;
