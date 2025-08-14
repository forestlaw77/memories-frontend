// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { Session } from "next-auth";

export const fallbackSession: Session & {
  accessToken: string;
  authToken: string;
} = {
  user: {
    id: "local-user",
    name: "Local User",
    email: "local@example.com",
    image: "/default-avatar.png",
  },
  expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h
  accessToken: "local-access-token",
  authToken: "local-id-token",
};
