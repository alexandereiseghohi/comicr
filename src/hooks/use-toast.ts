/**
 * Toast notification hook using Sonner
 *
 * @example
 * ```tsx
 * import { useToast } from "@/hooks/use-toast";
 *
 * function Component() {
 *   const { toast } = useToast();
 *
 *   const handleClick = () => {
 *     toast.success("Operation successful!");
 *   };
 * }
 * ```
 */
import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  return {
    toast: sonnerToast,
  };
};

// Re-export toast for direct usage
export { toast } from "sonner";
