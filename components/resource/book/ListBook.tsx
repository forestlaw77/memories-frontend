// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { fetchResourceById } from "@/libs/api/resources";
import { recordAccess } from "@/libs/services/recordAccess";

import {
  BaseContentMeta,
  BookDetailMeta,
  ContentListComponentProps,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import {
  Box,
  Button,
  Card,
  HStack,
  Image,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ListBook({
  resourceId,
  thumbnailUrl,
  contents,
}: ContentListComponentProps<BaseContentMeta>) {
  const router = useRouter();
  const { settings } = useGlobalSettings();
  const { data: session, status } = useSession();

  const fetcher = useMemo(
    () =>
      createFetcher(
        RESOURCE_TYPE.BOOKS,
        settings.enableCache,
        session?.authToken || null
      ),
    [settings.enableCache, session?.authToken]
  );

  const [downloadBlobUrls, setDownloadBlobUrls] = useState<string[]>([]);
  const activeDownloadUrlsRef = useRef<string[]>([]);

  const {
    data: resourceMeta,
    isLoading: isLoadingResourceMeta,
    isError: isErrorResourceMeta,
    error: resourceMetaError,
  } = useQuery<ResourceMeta<BaseContentMeta, BookDetailMeta>, Error>({
    queryKey: ["bookDetail", resourceId],
    queryFn: () => {
      if (!session?.authToken) {
        throw new Error("Authentication required to fetch book details.");
      }
      return fetchResourceById(
        RESOURCE_TYPE.BOOKS,
        resourceId,
        session.authToken
      );
    },
    enabled: !!resourceId && status === "authenticated",
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  const detailMeta: BookDetailMeta | undefined = useMemo(
    () => resourceMeta?.detailMeta,
    [resourceMeta]
  );

  useEffect(() => {
    return () => {
      activeDownloadUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      activeDownloadUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const oldUrls = activeDownloadUrlsRef.current;
    const newUrls = downloadBlobUrls;

    oldUrls.forEach((url) => {
      if (!newUrls.includes(url)) {
        URL.revokeObjectURL(url);
      }
    });
    activeDownloadUrlsRef.current = newUrls;
  }, [downloadBlobUrls]);

  async function fetchBook(contentId: number) {
    if (!fetcher) {
      console.error("Fetcher is not initialized. Cannot download file.");
      return;
    }

    try {
      recordAccess(RESOURCE_TYPE.BOOKS, resourceId, contentId);

      const targetContent = contents.find(
        (content) => content.contentId === contentId
      );
      if (!targetContent) {
        console.error("Content not found:", contentId);
        return;
      }

      const abortController = new AbortController();
      const signal = abortController.signal;

      const bookBlob = await fetcher.getContent(
        resourceId,
        contentId,
        {
          binary: true,
        },
        RESPONSE_TYPE.BLOB,
        undefined,
        signal
      );

      if (!bookBlob) {
        console.error("Failed to get file.");
        return;
      }

      const bookUrl = URL.createObjectURL(bookBlob);
      setDownloadBlobUrls((prev) => [...prev, bookUrl]);

      const a = document.createElement("a");
      a.href = bookUrl;
      a.download = targetContent?.filename || "unknown.bin";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("File download aborted.");
      } else {
        console.error("Error while downloading file:", error);
      }
    }
  }

  if (isLoadingResourceMeta) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4} fontSize="lg">
          Loading book details...
        </Text>
      </Box>
    );
  }

  if (isErrorResourceMeta) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" color="red.500">
          Error loading book details:
          {resourceMetaError?.message || "Unknown error"}
        </Text>
      </Box>
    );
  }

  if (!resourceMeta) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" color="gray.500">
          Book with ID '{resourceId}' not found.
        </Text>
      </Box>
    );
  }

  return (
    <Card.Root maxW="full" overflow="hidden">
      <HStack gap={6} align="start" p={4}>
        <Box flexShrink={0}>
          <Image
            fit="contain"
            width={{ base: "100%", md: "300px", lg: "400px" }}
            height={{ base: "auto", md: "300px", lg: "400px" }}
            src={thumbnailUrl || "/default-cover-image.png"}
            alt={resourceMeta.detailMeta?.title || "Unknown Book"}
          />
        </Box>
        <VStack align="stretch" flex="1">
          <Card.Body p={0}>
            <Card.Title>{detailMeta?.title || "Untitled Book"}</Card.Title>{" "}
            {detailMeta?.description && (
              <Card.Description>{detailMeta.description}</Card.Description>
            )}
            {contents && contents.length > 0 && (
              <Box mb={6} overflowX="auto">
                <Table.Root variant="outline" size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>ID</Table.ColumnHeader>
                      <Table.ColumnHeader>
                        MIME TYPE
                        <Text as="span" fontSize="xs" color="gray.500">
                          (Preview)
                        </Text>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader>
                        FILENAME
                        <Text as="span" fontSize="xs" color="gray.500">
                          (Download)
                        </Text>
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {contents.map((content) => (
                      <Table.Row key={content.contentId}>
                        <Table.Cell>
                          <Button
                            variant="outline"
                            colorScheme="blue"
                            onClick={() =>
                              router.push(
                                `/${RESOURCE_TYPE.BOOKS}/${resourceId}/${content.contentId}`
                              )
                            }
                          >
                            {content.contentId}
                          </Button>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="outline"
                            colorScheme="blue"
                            onClick={() =>
                              router.push(
                                `/${RESOURCE_TYPE.BOOKS}/${resourceId}/${content.contentId}`
                              )
                            }
                          >
                            {content.mimetype}
                          </Button>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="outline"
                            colorScheme="teal"
                            onClick={() => fetchBook(content.contentId)}
                            _hover={{ bg: "teal.50" }}
                          >
                            {content.filename}
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
            {detailMeta && Object.keys(detailMeta).length > 0 && (
              <Box overflowX="auto">
                <Table.Root variant="outline" size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>#</Table.ColumnHeader>
                      <Table.ColumnHeader>Key</Table.ColumnHeader>
                      <Table.ColumnHeader>Value</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {Object.entries(detailMeta).map(([key, value], index) => (
                      <Table.Row key={key}>
                        <Table.Cell>{index + 1}</Table.Cell>
                        <Table.Cell fontWeight="semibold">{key}</Table.Cell>
                        <Table.Cell>{String(value)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Card.Body>
        </VStack>
      </HStack>
    </Card.Root>
  );
}
