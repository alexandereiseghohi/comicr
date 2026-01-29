// Zustand store for global UI state (Next.js 16+, DRY, Sentry logging)
import * as Sentry from "@sentry/nextjs";
import { create } from "zustand";

interface UIState {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  setModalOpen: (open) => {
    console.info(JSON.stringify({ event: "ui_modal_toggle", open }));
    Sentry.addBreadcrumb({ category: "ui", message: `Modal toggled: ${open}`, level: "info" });
    set({ isModalOpen: open });
  },
  theme: "light",
  setTheme: (theme) => {
    console.info(JSON.stringify({ event: "ui_theme_change", theme }));
    Sentry.addBreadcrumb({ category: "ui", message: `Theme changed: ${theme}`, level: "info" });
    set({ theme });
  },
}));
