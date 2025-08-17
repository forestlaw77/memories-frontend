/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { AccessLog, RESOURCE_TYPE } from "@/types/client/client_model";

export function recordAccess(
  resourceType: RESOURCE_TYPE,
  resourceId: string,
  contentId?: number
) {
  const logEntry: AccessLog = {
    resourceType,
    resourceId,
    contentId,
    timestamp: Date.now(), // UNIX 時間（ミリ秒単位）
  };

  const logs = JSON.parse(localStorage.getItem("accessLogs") ?? "[]");
  if (!resourceId || !resourceType) {
    console.warn("無効なアクセスデータ: ", {
      resourceType,
      resourceId,
      contentId,
    });
    return; // 記録をスキップ
  }
  logs.push(logEntry);

  // 最大保存件数を設定（例：最新100件のみ）
  if (logs.length > 100) logs.shift();

  try {
    localStorage.setItem("accessLogs", JSON.stringify(logs));
  } catch (error) {
    console.error("アクセスログの保存中にエラーが発生:", error);
  }
}
