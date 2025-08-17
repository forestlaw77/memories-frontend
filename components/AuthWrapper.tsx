/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import Login from "@/components/layout/Login";
import { FetcherParamsProvider } from "@/contexts/FetcherParamsContext";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { clientEnv } from "@/libs/config/env.client";
import { fallbackSession } from "@/libs/session/fallback";
import { Spinner } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

function AuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const { settings } = useGlobalSettings();
  const isSkipAuth = clientEnv.NEXT_PUBLIC_SKIP_AUTH === "true";
  const effectiveSession = isSkipAuth ? fallbackSession : session;

  useEffect(() => {
    if (!isSkipAuth && sessionStatus === "unauthenticated") {
      signIn("credentials", {
        callbackUrl: pathname,
      });
    }
  }, [sessionStatus, pathname, isSkipAuth]);

  if (sessionStatus === "loading") {
    return <Spinner size="xl" display="block" mx="auto" my={20} />;
  }

  if (!isSkipAuth && sessionStatus === "unauthenticated") {
    // 遷移先に行く前に unauthenticated が検知されたケース
    return <Login />;
  }

  console.log(effectiveSession?.accessToken);

  return (
    <FetcherParamsProvider
      accessToken={effectiveSession?.accessToken}
      authToken={effectiveSession?.authToken}
      enableCache={settings.enableCache}
    >
      {children}
    </FetcherParamsProvider>
  );
}

export default AuthWrapper;
