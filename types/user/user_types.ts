// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { RESOURCE_TYPE } from "../client/client_model";

export type UserMeta = {
  resources: Record<RESOURCE_TYPE, { updated_at: string }>;
};
