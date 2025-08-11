// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import Login from "@/components/layout/Login";
import { FetcherParamsProvider } from "@/contexts/FetcherParamsContext";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
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

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      signIn("credentials", {
        callbackUrl: pathname,
      });
    }
  }, [sessionStatus, pathname]);

  if (sessionStatus === "loading") {
    return <Spinner size="xl" display="block" mx="auto" my={20} />;
  }

  if (sessionStatus === "unauthenticated") {
    // 遷移先に行く前に unauthenticated が検知されたケース
    return <Login />;
  }

  return (
    <FetcherParamsProvider
      accessToken={session?.accessToken}
      authToken={session?.authToken}
      enableCache={settings.enableCache}
    >
      {children}
    </FetcherParamsProvider>
  );
}

export default AuthWrapper;
