"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeId = "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  bgPage: string;
  bgCard: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  accentPrimary: string;
  accentSecondary: string;
  accentBtnText: string;
  fontDisplay: string;
  fontBody: string;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  "theme-1": {
    id: "theme-1",
    name: "SecuNet Cyber Grid",
    subtitle: "Dark Grid Canvas & Cyber Lime",
    bgPage: "#070809",
    bgCard: "rgba(18, 20, 26, 0.75)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    textPrimary: "#FFFFFF",
    textSecondary: "#94A3B8",
    accentPrimary: "#42e425", // Cyber Lime
    accentSecondary: "#38cb1e",
    accentBtnText: "#050805",
    fontDisplay: "Plus Jakarta Sans",
    fontBody: "Plus Jakarta Sans",
  },
  "theme-2": {
    id: "theme-2",
    name: "Cyber Lime Glassmorphism",
    subtitle: "Deep Emerald Canvas & Volt Lime",
    bgPage: "#050806",
    bgCard: "rgba(10, 22, 16, 0.75)",
    borderColor: "rgba(212, 255, 50, 0.15)",
    textPrimary: "#FFFFFF",
    textSecondary: "#8E968F",
    accentPrimary: "#D4FF32", // Volt Lime
    accentSecondary: "#A3E635",
    accentBtnText: "#080A09",
    fontDisplay: "Syne",
    fontBody: "Plus Jakarta Sans",
  },
  "theme-3": {
    id: "theme-3",
    name: "Retro Monochrome Matrix",
    subtitle: "Pitch Obsidian & Terminal Green",
    bgPage: "#040504",
    bgCard: "rgba(5, 15, 8, 0.85)",
    borderColor: "rgba(0, 255, 102, 0.2)",
    textPrimary: "#FFFFFF",
    textSecondary: "#00FF66",
    accentPrimary: "#00FF66", // Terminal Green
    accentSecondary: "#00CC52",
    accentBtnText: "#050505",
    fontDisplay: "Silkscreen",
    fontBody: "JetBrains Mono",
  },
  "theme-4": {
    id: "theme-4",
    name: "Pop Neo-Brutalism",
    subtitle: "High Contrast & Canary Yellow",
    bgPage: "#0A0A0B",
    bgCard: "rgba(22, 22, 26, 0.80)",
    borderColor: "rgba(255, 209, 71, 0.2)",
    textPrimary: "#FFFFFF",
    textSecondary: "#FFD147",
    accentPrimary: "#FFD147", // Canary Yellow
    accentSecondary: "#FF9900",
    accentBtnText: "#000000",
    fontDisplay: "Bebas Neue",
    fontBody: "Poppins",
  },
  "theme-5": {
    id: "theme-5",
    name: "Gen-Z Sunset Neo-Grotesk",
    subtitle: "Deep Charcoal & Peach Coral",
    bgPage: "#0f0e13",
    bgCard: "rgba(26, 20, 28, 0.80)",
    borderColor: "rgba(248, 113, 113, 0.2)",
    textPrimary: "#FFFFFF",
    textSecondary: "#FCA5A5",
    accentPrimary: "#F87171", // Peach Coral
    accentSecondary: "#FB923C",
    accentBtnText: "#FFFFFF",
    fontDisplay: "Plus Jakarta Sans",
    fontBody: "Inter",
  },
};

interface ThemeContextType {
  currentThemeId: ThemeId;
  currentTheme: ThemeDefinition;
  setTheme: (id: ThemeId) => void;
  themes: ThemeDefinition[];
}

const THEME_STORAGE_KEY = "focusforge-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeVariables(theme: ThemeDefinition) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme.id);
  document.body.setAttribute("data-theme", theme.id);

  root.style.setProperty("--bg-page", theme.bgPage);
  root.style.setProperty("--bg-card", theme.bgCard);
  root.style.setProperty("--border-card-color", theme.borderColor);
  root.style.setProperty("--text-primary", theme.textPrimary);
  root.style.setProperty("--text-secondary", theme.textSecondary);
  root.style.setProperty("--accent-primary", theme.accentPrimary);
  root.style.setProperty("--accent-color", theme.accentPrimary);
  root.style.setProperty("--accent-secondary", theme.accentSecondary);
  root.style.setProperty("--accent-btn-text", theme.accentBtnText);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>("theme-1");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      const initialId = savedTheme && THEMES[savedTheme] ? savedTheme : "theme-1";
      setCurrentThemeId(initialId);
      applyThemeVariables(THEMES[initialId]);
    } catch (e) {
      console.error("Failed to read theme from localStorage", e);
      applyThemeVariables(THEMES["theme-1"]);
    }
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    if (!THEMES[id]) return;
    setCurrentThemeId(id);
    applyThemeVariables(THEMES[id]);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  }, []);

  const currentTheme = THEMES[currentThemeId] || THEMES["theme-1"];
  const themes = Object.values(THEMES);

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        setTheme,
        themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

