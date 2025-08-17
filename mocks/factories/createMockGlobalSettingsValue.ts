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
