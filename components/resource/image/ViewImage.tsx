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

import { toaster } from "@/components/common/toaster";
import GeoMap from "@/components/map/GeoMap";
import { GC_TIME_STANDARD, STALE_TIME_SHORT } from "@/config/time";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { createFetcher } from "@/services/api/createFetcher";
//import { createFetcher } from "@/libs/api/resource_fetcher";
import {
  ImageContentMeta,
  RESOURCE_TYPE,
  ViewComponentProps,
} from "@/types/client/client_model";
import {
  Alert,
  Box,
  Card,
  Image as ChakraImage,
  HStack,
  Icon,
  Spinner,
  Table,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NextLink from "next/link";
import { useEffect, useMemo } from "react";
import { AiOutlineEdit } from "react-icons/ai";

type Fetcher = ReturnType<typeof createFetcher>;

export default function ViewImage({
  resourceId,
  contentId,
  contentMeta,
}: ViewComponentProps<ImageContentMeta>) {
  const shootingDateTime = contentMeta?.shootingDateTime
    ? new Date(contentMeta.shootingDateTime)
    : null;
  const shootingOffsetTime = contentMeta?.shootingOffsetTime
    ? contentMeta?.shootingOffsetTime
    : null;
  const latitude = contentMeta?.latitude ?? 0;
  const longitude = contentMeta?.longitude ?? 0;
  const address = contentMeta?.address;
  const { authToken, enableCache } = useFetcherParams();
  const fetcher = useMemo<Fetcher>(
    () => createFetcher(RESOURCE_TYPE.IMAGES, enableCache, authToken),
    [enableCache, authToken]
  );

  const {
    data: imageUrl,
    isLoading,
    isError,
    error,
  } = useQuery<string, Error>({
    queryKey: ["imageData", resourceId, contentId],
    queryFn: async ({ signal }) => {
      if (!fetcher || !resourceId || !contentId) {
        throw new Error("Missing fetcher or resource/content ID.");
      }
      const imageBlob = await fetcher.getContent(
        resourceId,
        contentId,
        {
          binary: true,
          format: "webp",
        },
        RESPONSE_TYPE.BLOB,
        undefined,
        signal
      );
      if (!imageBlob) {
        throw new Error("Image content not found.");
      }
      return URL.createObjectURL(imageBlob);
    },
    enabled: !!fetcher && !!resourceId && !!contentId, //&& !!contentMeta.stored,
    staleTime: STALE_TIME_SHORT,
    gcTime: GC_TIME_STANDARD,
  });

  const effectiveUrl = contentMeta?.stored ? imageUrl : contentMeta?.filePath;

  useEffect(() => {
    if (isError && error) {
      toaster.create({
        title: "Failed to load image",
        description: "Please try again later.",
        type: "error",
        duration: 3000,
        closable: true,
      });
      console.error("Error displaying image:", error.message);
    }
  }, [isError, error]);

  // Blob URL のクリーンアップ設定 (QueryClientProvider 側で設定するのが理想的)
  // useQueryComponent の外で一度だけ設定するのが良いですが、
  // このコンポーネント内で完結させる場合は以下のように記述します。
  // ただし、このアプローチは useQuery を使う度に実行されるため、
  // _app.tsx などで setQueryDefaults する方が推奨されます。
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "removed") {
        const query = event.query;
        if (
          query.queryKey[0] === "imageData" &&
          query.queryKey[1] === resourceId &&
          query.queryKey[2] === contentId
        ) {
          const url = query.state.data as string | undefined;
          if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
            console.log(
              `Revoked Blob URL for image: ${resourceId}/${contentId}`
            );
          }
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient, resourceId, contentId]);

  if (isLoading) {
    return (
      <Alert.Root status="info">
        <Alert.Title>Loading image...</Alert.Title>
        <Spinner />
      </Alert.Root>
    );
  }

  if (isError || !imageUrl) {
    // エラー発生時、または URL が取得できなかった場合
    return (
      <Alert.Root status="error">
        <Alert.Title>Content not found or failed to load.</Alert.Title>
        <Alert.Description>
          {error?.message || "The content or resource may have been deleted."}
        </Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <div>
      <Card.Root flexDirection="row" overflow="hidden">
        <Box>
          <HStack justifyContent="space-between" px={2} pt={2}>
            <NextLink href={`/${RESOURCE_TYPE.IMAGES}}/${resourceId}/edit`}>
              <Icon color="gray.500">
                <AiOutlineEdit />
              </Icon>
            </NextLink>
          </HStack>
          <ChakraImage
            maxWidth="1024px"
            maxHeight="768px"
            src={effectiveUrl as string}
            alt="Image Preview"
            fit="contain"
          />
        </Box>

        <Box ml={4} width="640px">
          <Card.Body>
            <Card.Title mb="2">{contentMeta?.filename}</Card.Title>
          </Card.Body>
          <Table.Root>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Shooting Date Time</Table.Cell>
                <Table.Cell>
                  {shootingDateTime ? shootingDateTime.toLocaleString() : "N/A"}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Offset Time</Table.Cell>
                <Table.Cell>
                  {shootingOffsetTime ? shootingOffsetTime : "N/A"}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Mime Type</Table.Cell>
                <Table.Cell>{contentMeta?.mimetype}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Address</Table.Cell>
                <Table.Cell>{address}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Latitude</Table.Cell>
                <Table.Cell>{contentMeta?.latitude}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Longitude</Table.Cell>
                <Table.Cell>{contentMeta?.longitude}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
          <Box
            position="relative"
            width="100%"
            _before={{
              content: `""`,
              display: "block",
              paddingBottom: "56.25%", // ここで高さが計算される
            }}
          >
            <GeoMap
              markers={[{ lat: latitude, lng: longitude, id: resourceId }]}
              initialCenter={[latitude, longitude]}
              initialZoom={15}
            />
          </Box>
          <Card.Footer>
            <a
              href={effectiveUrl as string}
              download={`image-${contentMeta?.filename || "Photo Download"}`}
            >
              Download
            </a>
          </Card.Footer>
        </Box>
      </Card.Root>
    </div>
  );
}
