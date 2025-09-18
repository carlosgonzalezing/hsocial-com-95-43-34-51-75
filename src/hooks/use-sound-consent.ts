
import { useCallback, useEffect, useState } from "react";

const KEY = "reels_sound_consent";

export function useSoundConsent() {
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      setHasConsent(stored === "1");
    } catch {}
  }, []);

  const grantConsent = useCallback(() => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setHasConsent(true);
    // Broadcast so other components could react if needed
    try {
      window.dispatchEvent(new CustomEvent("reels:sound-consent"));
    } catch {}
  }, []);

  const revokeConsent = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setHasConsent(false);
  }, []);

  return { hasConsent, grantConsent, revokeConsent };
}
