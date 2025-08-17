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
