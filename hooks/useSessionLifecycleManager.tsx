/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { clientEnv } from "@/libs/config/env.client";
import { fallbackSession } from "@/libs/session/fallback";
import { getSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  logoutAfterMinutes: number;
  warningBeforeMinutes: number;
};

export function useSessionLifecycleManager({
  logoutAfterMinutes,
  warningBeforeMinutes,
}: Props) {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [idleDeadline, setIdleDeadline] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  const isSkipAuth = clientEnv.NEXT_PUBLIC_SKIP_AUTH === "true";

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    const now = Date.now();
    const newDeadline = now + logoutAfterMinutes * 60 * 1000;
    setIdleDeadline(newDeadline);

    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      console.debug("[IdleLogout] Timeout reached");
      signOut({ redirect: true });
    }, logoutAfterMinutes * 60 * 1000);
  }, [logoutAfterMinutes]);

  // 初期セッション取得（expiresAt）
  useEffect(() => {
    if (isSkipAuth) {
      setExpiresAt(new Date(fallbackSession.expires).getTime());
    } else {
      getSession().then((session) => {
        if (session?.expires) {
          setExpiresAt(new Date(session.expires).getTime());
        }
      });
    }

    resetIdleTimer(); // 初回アクティビティセット
  }, [resetIdleTimer]);

  // アクティビティ監視 → idleDeadline & expiresAt を更新
  const handleActivity = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      resetIdleTimer();
      if (isSkipAuth) {
        setExpiresAt(new Date(fallbackSession.expires).getTime());
      } else {
        const session = await getSession();
        if (session?.expires) {
          setExpiresAt(new Date(session.expires).getTime());
          console.debug("[KeepAlive] Session updated from activity.");
        }
      }
    }, 3000); // debounce delay
  }, [resetIdleTimer]);

  useEffect(() => {
    const events = ["mousemove", "click", "keydown", "scroll"];
    events.forEach((event) => window.addEventListener(event, handleActivity));
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [handleActivity]);

  // 両方の残り時間を監視して警告判断
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expDiff = expiresAt
        ? Math.floor((expiresAt - now) / 1000 / 60)
        : null;
      const idleDiff = idleDeadline
        ? Math.floor((idleDeadline - now) / 1000 / 60)
        : null;

      const minRemaining = [expDiff, idleDiff]
        .filter((val): val is number => val !== null)
        .reduce((a, b) => Math.min(a, b), Infinity);
      setRemainingMinutes(minRemaining);

      if (minRemaining <= warningBeforeMinutes) {
        setShowWarning(true);
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [expiresAt, idleDeadline, warningBeforeMinutes]);

  return {
    showWarning,
    remainingMinutes,
    extendSession: async () => {
      resetIdleTimer();
      if (isSkipAuth) {
        setExpiresAt(new Date(fallbackSession.expires).getTime());
      } else {
        const session = await getSession();
        if (session?.expires) setExpiresAt(new Date(session.expires).getTime());
      }

      setShowWarning(false);
    },
    logout: async () => {
      if (isSkipAuth) {
        window.location.href = "/login";
      } else {
        await signOut({ redirect: true });
      }
    },
    dismissWarning: () => setShowWarning(false),
  };
}
