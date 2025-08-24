/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  RESOURCE_TYPE,
  ResourceTypeToMetaMap,
} from "@/types/client/client_model";
import { BrowserFetcher } from "./BrowserFetcher";
import { IResourceFetcher } from "./IResourceFetcher";
import { LocalFetcher } from "./LocalFetcher";
import { MockFetcher } from "./MockFetcher";
import { TauriFetcher } from "./TauriFetcher";

type TransportOverride = "tauri" | "browser" | "mock" | "local" | "electron";

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_IPC__" in window;
}

export function isElectronRuntime(): boolean {
  return (
    typeof window !== "undefined" && navigator.userAgent.includes("Electron")
  );
}

import { ElectronFetcher } from "./ElectronFetcher"; // 仮実装でもOK

export function createFetcher<K extends RESOURCE_TYPE>(
  type: K,
  enableCache: boolean,
  authToken: string | null | undefined,
  override?: TransportOverride
): IResourceFetcher<
  K,
  ResourceTypeToMetaMap[K]["content"],
  ResourceTypeToMetaMap[K]["detail"]
> {
  const runtime =
    override ??
    (isTauriRuntime() ? "tauri" : isElectronRuntime() ? "electron" : "browser");

  if (runtime === "mock") {
    return new MockFetcher(type);
  }

  if (runtime === "local") {
    return new LocalFetcher(type);
  }

  if (runtime === "electron") {
    if (!authToken) throw new Error("Authorization token is missing.");
    return new ElectronFetcher(type, enableCache, authToken);
  }

  if (!authToken) {
    throw new Error("Authorization token is missing.");
  }

  return runtime === "tauri"
    ? new TauriFetcher(type, enableCache, authToken)
    : new BrowserFetcher(type, enableCache, authToken);
}
