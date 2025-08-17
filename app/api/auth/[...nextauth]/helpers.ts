/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { env } from "@/libs/config/env.server";
import logger from "@/libs/logger";
import { JWT } from "next-auth/jwt";

const MILLISECONDS_PER_SECOND = 1000;

/**
 * Decodes a JWT token payload from a base64-encoded string.
 *
 * This function extracts the payload portion of a JWT and parses it into a JSON object.
 * If decoding fails, it logs the error and returns `null`.
 *
 * @param token - A JWT string in the format `header.payload.signature`.
 * @returns The decoded payload as a plain object, or `null` if decoding fails.
 */
export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    logger.error("🚨 Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Refreshes the access token using the provided refresh token.
 *
 * This function sends a POST request to Google's OAuth2 token endpoint
 * to obtain a new access token and ID token. If successful, it updates
 * the token object with new expiration timestamps and tokens.
 *
 * If the refresh fails, it logs the error and returns the original token
 * with an `error` field set to `"RefreshAccessTokenError"`.
 *
 * @param token - The current JWT token object containing a `refreshToken`.
 * @returns A new token object with refreshed credentials, or the original token with an error.
 *
 * @see https://developers.google.com/identity/protocols/oauth2/web-server#offline
 */
export async function refreshAccessToken(token: JWT) {
  try {
    const url = `https://oauth2.googleapis.com/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        refresh_token: token.refreshToken as string,
        grant_type: "refresh_token",
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    let newIdTokenExpiresAt: number | undefined;
    const newIdToken = refreshedTokens.id_token;
    if (newIdToken) {
      const payload = decodeJwt(newIdToken);
      newIdTokenExpiresAt = payload?.exp * MILLISECONDS_PER_SECOND;
    }

    if (!newIdToken) {
      logger.warn(
        "⚠️ No ID token returned during refresh. Falling back to existing token."
      );
    } else {
      logger.debug("✅ Refreshed ID token retrieved.");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: newIdToken ?? token.idToken,
      expiresAt:
        Date.now() + refreshedTokens.expires_in * MILLISECONDS_PER_SECOND,
      idTokenExpiresAt: newIdTokenExpiresAt,
    };
  } catch (error) {
    logger.error("🚨 Refresh Token Error:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
