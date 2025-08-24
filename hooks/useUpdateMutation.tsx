/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { toaster } from "@/components/common/toaster";
import { Fetcher } from "@/services/api/IResourceFetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSingleUpdateMutation({
  resourceType,
  resourceId,
  fetcher,
}: {
  resourceType: RESOURCE_TYPE;
  resourceId: string | undefined;
  fetcher: Fetcher;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { [key: string]: string }) => {
      if (!resourceId) throw new Error("resourceId is required");
      const formData = new FormData();
      formData.append(
        "detail-file",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      return fetcher.updateResource(resourceId, formData);
    },
    onSuccess: () => {
      toaster.create({ description: "Updated successfully", type: "success" });
      queryClient.invalidateQueries({
        queryKey: ["resource", resourceType, resourceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["allResources", resourceType],
      });
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toaster.create({ description: "Update failed", type: "error" });
    },
  });
}

export function useBulkUpdateMutation({
  resourceType,
  selectedIds,
  fetcher,
  onSuccessCallback,
}: {
  resourceType: string;
  selectedIds: string[];
  fetcher: Fetcher;
  onSuccessCallback?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { [key: string]: string }) => {
      const meta = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v.trim() !== "")
      );

      const formData = new FormData();
      formData.append(
        "detail-file",
        new Blob([JSON.stringify(meta)], { type: "application/json" })
      );

      await Promise.all(
        selectedIds.map((id) => fetcher.updateResource(id, formData))
      );
    },
    onSuccess: () => {
      toaster.create({ description: "Resources updated ✅", type: "success" });
      queryClient.invalidateQueries({
        queryKey: ["allResources", resourceType],
      });
      onSuccessCallback?.();
    },
    onError: (error) => {
      toaster.create({ description: "Bulk update failed", type: "error" });
      console.error("Bulk update error:", error);
    },
  });
}
