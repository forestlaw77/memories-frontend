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
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBulkDeleteMutation({
  resourceType,
  fetcher,
  selectedIds,
  onSuccess,
}: {
  resourceType: string;
  fetcher: Fetcher;
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
