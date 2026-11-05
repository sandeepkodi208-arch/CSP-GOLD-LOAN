import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isLoggedIn, seedIfEmpty } from "@/lib/storage";

/**
 * Client-side gate + LocalStorage readiness.
 * `version` bumps whenever the caller mutates storage via `refresh()`.
 */
export function useAppData() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    seedIfEmpty();
    if (!isLoggedIn()) {
      navigate({ to: "/" });
      return;
    }
    setReady(true);
  }, [navigate]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { ready, version, refresh };
}
