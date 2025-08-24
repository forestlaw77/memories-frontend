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

import React, { createContext, JSX, useContext, useMemo } from "react";

/**
 * Type definition for the values provided by FetcherParamsContext.
 *
 * This context supplies authentication tokens and cache control flags
 * to components that perform data fetching.
 */
interface FetcherParams {
  /** Access token used for authenticated API requests */
  accessToken: string | null | undefined;

  /** Auth token (e.g., ID token) used for server-side verification */
  authToken: string | null | undefined;

  /** Flag indicating whether caching is enabled for fetch operations */
  enableCache: boolean;
}

/**
 * React context for providing fetcher parameters such as tokens and cache settings.
 *
 * The default value is `undefined`, and must be explicitly provided via the context provider.
 */
const FetcherParamsContext = createContext<FetcherParams | undefined>(
  undefined
);

/**
 * Provider component for FetcherParamsContext.
 *
 * Wraps a subtree of the application and supplies accessToken, authToken,
 * and enableCache values to descendant components.
 *
 * @param props - Props containing children and fetcher parameters.
 * @param props.children - React children to be wrapped by the provider.
 * @param props.accessToken - Access token for API authentication.
 * @param props.authToken - Auth token (e.g., ID token) for server-side validation.
 * @param props.enableCache - Boolean flag to enable or disable caching.
 * @returns A JSX element wrapping children with FetcherParamsContext.
 */
export const FetcherParamsProvider = ({
  children,
  accessToken,
  authToken,
  enableCache,
}: React.PropsWithChildren<FetcherParams>): JSX.Element => {
  const value = useMemo(
    () => ({
      accessToken,
      authToken,
      enableCache,
    }),
    [accessToken, authToken, enableCache]
  );

  return (
    <FetcherParamsContext.Provider value={value}>
      {children}
    </FetcherParamsContext.Provider>
  );
};

/**
 * Custom hook to access fetcher parameters from FetcherParamsContext.
 *
 * This hook retrieves accessToken, authToken, and enableCache values.
 * If used outside of a FetcherParamsProvider, it throws an error.
 *
 * @returns An object containing accessToken, authToken, and enableCache.
 * @throws Error if called outside of a FetcherParamsProvider.
 */
export const useFetcherParams = (): FetcherParams => {
  const context = useContext(FetcherParamsContext);
  if (context === undefined) {
    throw new Error(
      "useFetcherParams must be used within a FetcherParamsProvider"
    );
  }
  return context;
};
