/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module auth
 * Authentication configuration and API route handler using NextAuth.
 */

import { SESSION_MAX_AGE_SEC, SESSION_UPDATE_AGE_SEC } from "@/config/time";
import { env } from "@/libs/config/env.server";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { callbacks } from "./callbacks";

/**
 * Configuration object for NextAuth authentication.
 *
 * This setup uses Google OAuth as the authentication provider,
 * unless `SKIP_AUTH` is set to `"true"` in the environment variables.
 *
 * Sessions are managed using JWT strategy with a configurable max age.
 * Custom callbacks are defined in the `./callbacks` module.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  providers:
    env.SKIP_AUTH === "true"
      ? []
      : [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                scope: "openid email profile",
                access_type: "offline",
                prompt: "consent",
              },
            },
          }),
        ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SEC,
    updateAge: SESSION_UPDATE_AGE_SEC,
  },
  callbacks,
};

/**
 * Next.js API route handler for authentication.
 *
 * This handler supports both GET and POST methods
 * and delegates to NextAuth using the configured options.
 *
 * @see https://next-auth.js.org/configuration/nextjs#api-route
 */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
