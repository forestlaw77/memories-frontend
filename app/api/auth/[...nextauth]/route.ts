/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import NextAuth from "next-auth";
import { authOptions } from "./auth";

/**
 * Next.js API route handler for authentication.
 *
 * This route integrates NextAuth with the App Router,
 * enabling both `GET` and `POST` requests for authentication flows.
 *
 * The configuration is delegated to `authOptions`, which defines
 * providers, session strategy, and callbacks.
 *
 * @see https://next-auth.js.org/configuration/nextjs#api-route
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
