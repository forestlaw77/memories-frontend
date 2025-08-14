// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

const rawEnv = {
  NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL!,
  NEXT_PUBLIC_SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH!,
} as const;

type ClientEnv = {
  NEXT_PUBLIC_BACKEND_API_URL: string;
  NEXT_PUBLIC_SKIP_AUTH: string;
};

export const clientEnv: ClientEnv = rawEnv;
