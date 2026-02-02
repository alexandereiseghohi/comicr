import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: toast,
  };
};

// Re-export toast for direct usage
// Removed unused import and undefined variable
