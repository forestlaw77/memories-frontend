/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { GlobalSettingsContextType } from "@/contexts/globalSettingsTypes";
import { mockGlobalSettingsValue } from "@/mocks/contexts/mockGlobalSettingsValue";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const createMockGlobalSettingsValue = (
  override?: DeepPartial<GlobalSettingsContextType>
): GlobalSettingsContextType => {
  return {
    ...mockGlobalSettingsValue,
    ...override,
    settings: {
      ...mockGlobalSettingsValue?.settings,
      ...override?.settings,
    },
  };
};
