/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { GlobalSettingsContext } from "@/contexts/GlobalSettingsContext";
import { GlobalSettingsContextType } from "@/contexts/globalSettingsTypes";
import { createMockGlobalSettingsValue } from "@/mocks/factories/createMockGlobalSettingsValue";

// Utility type to make all properties in T optional, recursively
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type Props = {
  children: React.ReactNode;
  override?: DeepPartial<GlobalSettingsContextType>;
};

export const MockGlobalSettingsProvider = ({ children, override }: Props) => {
  const value = createMockGlobalSettingsValue(override);

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};
