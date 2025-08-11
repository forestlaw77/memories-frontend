// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

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

export function useBulkDeleteMutation({
  resourceType,
  fetcher,
  selectedIds,
  onSuccess,
}: {
  resourceType: string;
  fetcher: ResourceFetcher<
    RESOURCE_TYPE,
    BaseContentMeta | ImageContentMeta | MusicContentMeta,
    | BookDetailMeta
    | DocumentDetailMeta
    | ImageDetailMeta
    | MusicDetailMeta
    | VideoDetailMeta
  >;
  selectedIds: string[];
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all(selectedIds.map((id) => fetcher.deleteResource(id)));
    },
    onSuccess: () => {
      toaster.create({ description: "Resources deleted ✅", type: "success" });
      queryClient.invalidateQueries({
        queryKey: ["allResources", resourceType],
      });
      onSuccess?.();
    },
    onError: (err) => {
      toaster.create({ description: "Delete failed.", type: "error" });
      console.error("Bulk delete error:", err);
    },
  });
}
