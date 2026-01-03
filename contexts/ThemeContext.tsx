import React, { createContext, useContext, ReactNode } from "react";
import { StatusBar } from "expo-status-bar";

export interface Theme {
  primary: string;
  background: string;
  text: string;
  card: string;
  surface: string;
  error: string;
  success: string;
  border: string;
  textSecondary: string;
  textTertiary: string;
  placeholder: string;
}

const lightTheme: Theme = {
  primary: "#024974",
  background: "#FFFFFF",
  text: "#1F2937",
  card: "#FFFFFF",
  surface: "#F9FAFB",
  error: "#EF4444",
  success: "#10B981",
  border: "#E5E7EB",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  placeholder: "#9CA3AF",
};

const darkTheme: Theme = {
  primary: "#3B82F6",
  background: "#111827",
  text: "#F9FAFB",
  card: "#1F2937",
  surface: "#374151",
  error: "#EF4444",
  success: "#10B981",
  border: "#374151",
  textSecondary: "#D1D5DB",
  textTertiary: "#9CA3AF",
  placeholder: "#9CA3AF",
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme?: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = React.useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="transparent"
        translucent={true}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
