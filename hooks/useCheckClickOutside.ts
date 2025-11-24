import { useEffect } from "react";

export function useCheckClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handleClickOutside: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handleClickOutside(event);
    }

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handleClickOutside]);
}
