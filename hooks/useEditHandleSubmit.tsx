// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import {
  useBulkUpdateMutation,
  useSingleUpdateMutation,
} from "@/hooks/useUpdateMutation";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type HandleSubmitFn = (
  data: { [key: string]: string },
  files: File[] | null,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  setCompletedCount: React.Dispatch<React.SetStateAction<number>>
) => void;

interface UseEditHandleSubmitOptions {
  mode: "single" | "bulk";
  resourceId?: string;
  selectedIds?: string[];
  onBulkSuccess?: () => void;
}

/**
 * フォームデータを送信するための汎用 submit 関数を返すフック。
 * - mode === "single" の場合は useMutation() で単体更新
 * - mode === "bulk" の場合は useBulkUpdateMutation() に委譲
 */
export default function useEditHandleSubmit(
  resourceType: RESOURCE_TYPE,
  options: UseEditHandleSubmitOptions
): HandleSubmitFn {
  const { authToken } = useFetcherParams();
  const queryClient = useQueryClient();

  const fetcher = useMemo(
    () => createFetcher(resourceType, false, authToken),
    [resourceType, authToken]
  );

  // ✅ 単体更新 mutation
  const singleMutation = useSingleUpdateMutation({
    resourceType,
    resourceId: options.resourceId,
    fetcher,
  });

  // ✅ 一括更新 mutation（外部切り出しされたものを使用）
  const bulkMutation = useBulkUpdateMutation({
    resourceType,
    selectedIds: options.selectedIds || [],
    fetcher,
    onSuccessCallback: options.onBulkSuccess,
  });

  // ✅ submit 関数（mode に応じて分岐）
  const handleSubmit: HandleSubmitFn = (
    data,
    _files,
    setIsSubmitting,
    setCompletedCount
  ) => {
    setIsSubmitting(true);
    setCompletedCount(0);

    if (options.mode === "single") {
      singleMutation.mutate(data, {
        onSuccess: () => setCompletedCount(1),
        onSettled: () => setIsSubmitting(false),
      });
    } else {
      bulkMutation.mutate(data, {
        onSuccess: () => setCompletedCount(options.selectedIds?.length || 0),
        onSettled: () => setIsSubmitting(false),
      });
    }
  };

  return handleSubmit;
}
