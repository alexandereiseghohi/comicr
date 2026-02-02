import * as Sentry from "@sentry/nextjs";
import { create } from "zustand";

// Consolidated Zustand store for global app state (Next.js 16+, Sentry logging)

interface AppState {
  clearSearch: () => void;
  closeModal: () => void;
  // Loading state
  isLoading: boolean;

  // Modal state
  isModalOpen: boolean;
  // Sidebar state
  isSidebarOpen: boolean;
  modalContent: null | React.ReactNode;
  openModal: (content?: React.ReactNode) => void;
  // Search state
  searchQuery: string;

  setLoading: (loading: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;

  // Theme state
  theme: "dark" | "light";
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: "light",
  setTheme: (theme) => {
    Sentry.addBreadcrumb({ category: "ui", message: `Theme changed: ${theme}`, level: "info" });
    set({ theme });
  },
  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    Sentry.addBreadcrumb({
      category: "ui",
      message: `Theme toggled: ${newTheme}`,
      level: "info",
    });
    set({ theme: newTheme });
  },

  // Modal
  isModalOpen: false,
  modalContent: null,
  setModalOpen: (open) => {
    Sentry.addBreadcrumb({ category: "ui", message: `Modal toggled: ${open}`, level: "info" });
    set({ isModalOpen: open, modalContent: open ? get().modalContent : null });
  },
  openModal: (content) => {
    Sentry.addBreadcrumb({ category: "ui", message: "Modal opened", level: "info" });
    set({ isModalOpen: true, modalContent: content ?? null });
  },
  closeModal: () => {
    Sentry.addBreadcrumb({ category: "ui", message: "Modal closed", level: "info" });
    set({ isModalOpen: false, modalContent: null });
  },

  // Sidebar
  isSidebarOpen: false,
  setSidebarOpen: (open) => {
    Sentry.addBreadcrumb({ category: "ui", message: `Sidebar toggled: ${open}`, level: "info" });
    set({ isSidebarOpen: open });
  },
  toggleSidebar: () => {
    const newState = !get().isSidebarOpen;
    Sentry.addBreadcrumb({
      category: "ui",
      message: `Sidebar toggled: ${newState}`,
      level: "info",
    });
    set({ isSidebarOpen: newState });
  },

  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Search
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: "" }),
}));

// Re-export for backward compatibility with useUIStore
export const useUIStore = useAppStore;
