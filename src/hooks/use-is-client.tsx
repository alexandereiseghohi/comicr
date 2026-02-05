import { Monitor, Server } from "lucide-react";
import * as React from "react";

// ============================================================================

export function useIsClient(): boolean {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// ============================================================================
