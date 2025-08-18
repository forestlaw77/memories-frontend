/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { ReactNode, createContext, useContext, useReducer } from "react";
import {
  GlobalSettingsAction,
  GlobalSettingsContextProps,
  GlobalSettingsState,
} from "./globalSettingsTypes";
import {
  defaultInitialSettings,
  loadSettingsFromLocalStorage,
  persistSetting,
} from "./globalSettingsUtils";

/**
 * React context for managing global application settings.
 * Provides access to the current settings and a dispatch function to update them.
 */
export const GlobalSettingsContext = createContext<
  GlobalSettingsContextProps | undefined
>(undefined);

/**
 * Custom hook for accessing the global settings context.
 * Returns the current settings, dispatch function, and a helper to update individual settings.
 *
 * @returns An object containing:
 * - `settings`: The current global settings state
 * - `dispatch`: The reducer dispatch function
 * - `updateSetting`: A helper to update a single setting key
 *
 * @throws Will throw an error if used outside of `GlobalSettingsProvider`.
 */
export const useGlobalSettings = () => {
  const context = useContext(GlobalSettingsContext);
  if (!context) {
    throw new Error(
      "useGlobalSettings must be used within a GlobalSettingsProvider"
    );
  }

  const { settings, dispatch } = context;

  /**
   * Updates a single key-value pair in the global settings.
   *
   * @param key - The key of the setting to update
   * @param value - The new value to assign
   */
  function updateSetting<K extends keyof GlobalSettingsState>(
    key: K,
    value: GlobalSettingsState[K]
  ) {
    dispatch({ type: key, value } as GlobalSettingsAction);
  }

  return { settings, dispatch, updateSetting };
};

/**
 * Reducer function for updating global settings.
 * Applies the dispatched action and persists the change to localStorage on the client.
 *
 * @param state - The current settings state
 * @param action - The dispatched action containing the key and new value
 * @returns The updated settings state
 */
const settingsReducer = (
  state: GlobalSettingsState,
  action: GlobalSettingsAction
): GlobalSettingsState => {
  if (action === null || action === undefined) {
    if (process.env.NODE_ENV === "development") {
      console.error("Reducer received an undefined or null action.");
    }
    return state;
  }

  const updatedState = { ...state, [action.type]: action.value };

  if (typeof window !== "undefined") {
    try {
      persistSetting(action.type, action.value);
    } catch (e) {
      console.warn(`Failed to persist setting [${action.type}]`, e);
    }
  }

  return updatedState;
};

/**
 * React provider component for global settings.
 * Initializes the settings state from localStorage on the client,
 * or falls back to default values during server-side rendering.
 *
 * @param props - Component props
 * @param props.children - React children to render within the provider
 * @returns A context provider wrapping the application
 */
export const GlobalSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, () => {
    if (typeof window === "undefined") {
      return defaultInitialSettings;
    }
    return loadSettingsFromLocalStorage();
  });

  return (
    <GlobalSettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};
