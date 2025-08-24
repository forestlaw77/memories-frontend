/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { env } from "@/libs/config/env.server";
import logger from "@/libs/logger";
import { fallbackSession } from "@/libs/session/fallback";
import { NextAuthOptions } from "next-auth";
import { decodeJwt, refreshAccessToken } from "./helpers";

/**
 * Callback configuration for NextAuth.
 *
 * These callbacks customize the behavior of JWT handling, session shaping,
 * and sign-in logic. They support both standard OAuth flows and a fallback
 * mode controlled by the `SKIP_AUTH` environment variable.
 *
 * @see https://next-auth.js.org/configuration/callbacks
 */
export const callbacks: NextAuthOptions["callbacks"] = {
  /**
   * Handles JWT token creation and refresh logic.
   *
   * - If `SKIP_AUTH` is enabled, uses fallback credentials and registers the user if needed.
   * - If `account` is present, stores access/refresh tokens and calculates expiration.
   * - If tokens are expired, attempts to refresh them via `refreshAccessToken`.
   *
   * @param token - The current JWT token.
   * @param account - OAuth account details from the provider.
   * @returns Updated token with access and ID tokens.
   */
  async jwt({ token, account }) {
    const isSkipAuth = env.SKIP_AUTH === "true";
    const MILLISECONDS_PER_SECOND = 1000;

    if (isSkipAuth) {
      const backendApiUrl = env.BACKEND_API_URL;
      const accessToken = fallbackSession.accessToken;
      const email = fallbackSession.user.email;
      const name = fallbackSession.user.name;
      const avatar = fallbackSession.user.image;

      try {
        const response = await fetch(`${backendApiUrl}/v1/users/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.exist) {
            await fetch(`${backendApiUrl}/v1/users/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ email, name, avatar }),
            });
          }
        }
      } catch (error) {
        logger.error("🚨 SKIP_AUTH user registration failed:", error);
      }

      return {
        ...token,
        sub: fallbackSession.user.id,
        accessToken: fallbackSession.accessToken,
        idToken: fallbackSession.authToken,
      };
    }

    if (account) {
      token.accessToken = account.access_token;
      token.idToken = account.id_token;
      token.refreshToken = account.refresh_token;
      token.expiresAt =
        Date.now() + (account.expires_in as number) * MILLISECONDS_PER_SECOND;

      if (account.id_token) {
        const payload = decodeJwt(account.id_token);
        token.idTokenExpiresAt = payload?.exp * MILLISECONDS_PER_SECOND;
      }

      return token;
    }

    const now = Date.now();
    const accessTokenValid =
      token.expiresAt && now < (token.expiresAt as number);
    const idTokenValid =
      token.idTokenExpiresAt && now < (token.idTokenExpiresAt as number);

    if (accessTokenValid && idTokenValid) {
      return token;
    }

    logger.debug("[JWT Callback] Token refresh needed.");
    return refreshAccessToken(token);
  },

  /**
   * Shapes the session object returned to the client.
   *
   * - Merges fallback user data if missing.
   * - Injects access and ID tokens into the session.
   *
   * @param session - The current session object.
   * @param token - The JWT token containing user info.
   * @returns Augmented session object.
   */
  async session({ session, token }) {
    const { user: fallbackUser } = fallbackSession;

    session.user = {
      ...session.user,
      id: token.sub ?? fallbackUser.id,
      name: session.user?.name ?? fallbackUser.name,
      email: session.user?.email ?? fallbackUser.email,
      image: session.user?.image ?? fallbackUser.image,
    };

    session.accessToken = token.accessToken as string | undefined;
    session.authToken = token.idToken as string | undefined;

    logger.log("authToken:", token.idToken);
    return session;
  },

  /**
   * Handles sign-in logic and user registration.
   *
   * - Validates presence of backend API URL and access token.
   * - Checks if the user exists in the backend; registers if not.
   * - Supports fallback mode via `SKIP_AUTH`.
   *
   * @param user - The authenticated user object.
   * @param account - OAuth account details.
   * @returns `true` if sign-in is allowed, `false` otherwise.
   */
  async signIn({ user, account }) {
    const { user: fallbackUser, accessToken: fallbackAccessToken } =
      fallbackSession;

    const backendApiUrl = env.BACKEND_API_URL;
    if (!backendApiUrl) {
      logger.error("BACKEND_API_URL environment variable is not set.");
      return false;
    }

    const isSkipAuth = env.SKIP_AUTH === "true";

    const accessToken = isSkipAuth
      ? fallbackAccessToken
      : account?.access_token;
    const email = isSkipAuth ? fallbackUser.email : user.email;
    const name = isSkipAuth ? fallbackUser.name : user.name;
    const avatar = isSkipAuth ? fallbackUser.image : user.image;

    if (!accessToken) {
      logger.error("Google OAuth: Missing access token");
      return false;
    }

    const authHeader = `Bearer ${accessToken}`;

    try {
      const response = await fetch(`${backendApiUrl}/v1/users/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`❌ HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.exist) {
        await fetch(`${backendApiUrl}/v1/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ email, name, avatar }),
        });
      }

      return true;
    } catch (error) {
      logger.error("🚨 Fetch request failed:", error);
      return false;
    }
  },
};
