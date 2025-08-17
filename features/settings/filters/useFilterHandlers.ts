/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";

export function useFilterHandlers(setPage?: (page: number) => void) {
  const { settings, updateSetting } = useGlobalSettings();

  const handleUpdate = (key: keyof typeof settings, value: any) => {
    updateSetting(key, value);
    if (setPage) setPage(1);
  };

  return {
    settings,
    handleUpdate,
  };
}
