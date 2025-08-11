// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { MAX_AGE } from "@/config/settings";
import logger from "@/libs/logger";
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

const MILLISECONDS_PER_SECOND = 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: MAX_AGE,
    updateAge: 5 * 60,
  },
  callbacks: {
    async jwt({ token, account }) {
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

      // どちらかのトークンが期限切れ、または期限が迫っている場合はリフレッシュを試みる
      // (NextAuthのupdateAge設定により、getSession()が呼ばれたときにここに来る)
      logger.debug("[JWT Callback] Token refresh needed.");
      return refreshAccessToken(token);
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.authToken = token.idToken as string | undefined;
      logger.log("authToken:", token.idToken);
      return session;
    },
    async signIn({ user, account }) {
      const accessToken = account?.access_token;

      if (!accessToken) {
        logger.error("Google OAuth: Missing access token");
        return false;
      }

      const backendApiUrl = process.env.BACKEND_API_URL;
      if (!backendApiUrl) {
        logger.error("BACKEND_API_URL environment variable is not set.");
        return false; // またはエラーをスロー
      }

      const authHeader = `Bearer ${accessToken}`;

      try {
        const response = await fetch(`${backendApiUrl}/v1/users/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ email: user.email }),
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
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              avatar: user.image,
            }),
          });
        }
        return true;
      } catch (error) {
        logger.error("🚨 Fetch request failed:", error);
        return false;
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

async function refreshAccessToken(token: JWT) {
  try {
    const url = `https://oauth2.googleapis.com/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
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
      idToken: newIdToken ?? token.idToken, // ← fallback
      expiresAt:
        Date.now() + refreshedTokens.expires_in * MILLISECONDS_PER_SECOND,
      idTokenExpiresAt: newIdTokenExpiresAt,
    };
  } catch (error) {
    logger.error("🚨 Refresh Token Error:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

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
