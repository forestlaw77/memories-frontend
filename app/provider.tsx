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

import AuthWrapper from "@/components/AuthWrapper";
import { Toaster } from "@/components/common/toaster";
import { GlobalSettingsProvider } from "@/contexts/GlobalSettingsContext";
import { ResourceProvider } from "@/contexts/ResourceContext";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DynamicLeafletInitializer = dynamic(
  () => import("@/components/map/LeafletInitializer"),
  { ssr: false }
);

/**
 * Provider component
 *
 * This component sets up the context providers for the application.
 * It includes the QueryClientProvider for React Query, ChakraProvider for Chakra UI,
 * and ThemeProvider for theme management.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child components to be rendered within the providers.
 * @returns {JSX.Element} The rendered provider component.
 */
export default function Provider({ children }: { children: React.ReactNode }) {
  // Initialize the QueryClient for React Query
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5分間はデータをstaleと見なさない
            refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再フェッチを無効化（NextAuth.js と同様の調整）
            // ... その他のグローバルな設定
          },
        },
      })
  );
  // Hydration エラー回避のための mounted ステート (next-themes などで有効)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        {mounted ? (
          <ThemeProvider attribute="class" disableTransitionOnChange>
            <SessionProvider
              refetchOnWindowFocus={false}
              refetchInterval={60 * 10}
            >
              <GlobalSettingsProvider>
                <ResourceProvider>
                  <DynamicLeafletInitializer />
                  <AuthWrapper>{children}</AuthWrapper>
                  <Toaster />
                  {process.env.NODE_ENV === "development" && (
                    <ReactQueryDevtools initialIsOpen={false} />
                  )}
                </ResourceProvider>
              </GlobalSettingsProvider>
            </SessionProvider>
          </ThemeProvider>
        ) : null}
      </ChakraProvider>
    </QueryClientProvider>
  );
}
