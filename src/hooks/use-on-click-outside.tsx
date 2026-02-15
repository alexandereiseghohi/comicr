// Removed unused imports
import * as React from "react";

// ============================================================================

type EventType = "focusin" | "focusout" | "mousedown" | "mouseup" | "touchend" | "touchstart";

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<null | T> | React.RefObject<null | T>[],
  handler: (event: FocusEvent | MouseEvent | TouchEvent) => void,
  eventType: EventType = "mousedown",
  eventListenerOptions: AddEventListenerOptions = {}
): void {
  const savedHandler = React.useRef(handler);

  React.useLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  React.useEffect(() => {
    const listener = (event: FocusEvent | MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Do nothing if the target is not connected element with document
      if (!target?.isConnected) {
        return;
      }

      const isOutside = Array.isArray(ref)
        ? ref.filter((r) => Boolean(r.current)).every((r) => r.current && !r.current.contains(target))
        : ref.current && !ref.current.contains(target);

      if (isOutside) {
        savedHandler.current(event);
      }
    };

    document.addEventListener(eventType, listener as EventListener, eventListenerOptions);

    return () => {
      document.removeEventListener(eventType, listener as EventListener, eventListenerOptions);
    };
  }, [ref, eventType, eventListenerOptions]);
}

export type { EventType };

// ============================================================================
