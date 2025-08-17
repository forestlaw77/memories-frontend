/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string; // アクセストークンをセッションに追加
    authToken?: string;
    user: {
      id?: string; // ユーザーIDをユーザーオブジェクトに追加
    } & DefaultSession["user"];
  }

  /**
   * Returned by `jwt` callback
   */
  interface JWT extends NextAuthJWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    idTokenExpiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}
