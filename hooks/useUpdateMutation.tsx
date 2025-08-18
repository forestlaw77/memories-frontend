/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { toaster } from "@/components/common/toaster";
import { ResourceFetcher } from "@/libs/api/resource_fetcher";
import {
  BaseContentMeta,
  BookDetailMeta,
  DocumentDetailMeta,
  ImageContentMeta,
  ImageDetailMeta,
  MusicContentMeta,
  MusicDetailMeta,
  RESOURCE_TYPE,
  VideoDetailMeta,
} from "@/types/client/client_model";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSingleUpdateMutation({
  resourceType,
  resourceId,
  fetcher,
}: {
  resourceType: RESOURCE_TYPE;
  resourceId: string | undefined;
  fetcher: ResourceFetcher<
    RESOURCE_TYPE,
    BaseContentMeta | ImageContentMeta | MusicContentMeta,
    | BookDetailMeta
    | DocumentDetailMeta
    | ImageDetailMeta
    | MusicDetailMeta
    | VideoDetailMeta
  >;
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
  fetcher: ResourceFetcher<
    RESOURCE_TYPE,
    BaseContentMeta | ImageContentMeta | MusicContentMeta,
    | BookDetailMeta
    | DocumentDetailMeta
    | ImageDetailMeta
    | MusicDetailMeta
    | VideoDetailMeta
  >;
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
