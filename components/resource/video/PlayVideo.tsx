/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import ErrorMessage from "@/components/common/ErrorMessage";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import {
  BaseContentMeta,
  ViewComponentProps,
} from "@/types/client/client_model";
import { Alert, Box, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export default function PlayVideo({
  resourceId,
  contentId,
  fetcher,
}: ViewComponentProps<BaseContentMeta>) {
  const {
    data: videoBlob,
    isLoading,
    isError,
    error,
  } = useQuery<Blob, Error>({
    queryKey: ["videoContent", resourceId, contentId],
    queryFn: async () => {
      if (!fetcher) {
        throw new Error("Fetcher is not available.");
      }

      const blob = await fetcher.getContent(
        resourceId,
        contentId,
        { binary: true },
        RESPONSE_TYPE.BLOB
      );

      if (!blob) {
        throw new Error("No video content found.");
      }

      return blob;
    },
    enabled: !!fetcher,
    staleTime: 1000 * 60 * 10, // 10分間はキャッシュを新鮮と見なす
    gcTime: 1000 * 60 * 30, // 30分間キャッシュ保持
  });

  const videoUrl = useMemo(() => {
    return videoBlob ? URL.createObjectURL(videoBlob) : null;
  }, [videoBlob]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  return (
    <div>
      {isError ? (
        <ErrorMessage message={error?.message || "Failed to load video"} />
      ) : isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Spinner size="xl" />
        </Box>
      ) : !videoUrl ? (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Content not found.</Alert.Title>
            <Alert.Description>
              The content or resource may have been deleted or is unavailable.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <Box maxWidth="80%" maxHeight="80%">
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
      )}
    </div>
  );
}
