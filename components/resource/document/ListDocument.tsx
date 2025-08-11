// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { recordAccess } from "@/libs/services/recordAccess";
import {
  BaseContentMeta,
  ContentListComponentProps,
  RESOURCE_TYPE,
} from "@/types/client/client_model";
import { Box, Button, HStack, Image, Table, Text } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ListDocument({
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
        RESOURCE_TYPE.DOCUMENTS,
        settings.enableCache,
        session?.authToken
      ),
    [settings.enableCache, session?.authToken]
  );
  const [blobUrls, setBlobUrls] = useState<string[]>([]);

  async function getDocument(contentId: number) {
    try {
      recordAccess(RESOURCE_TYPE.DOCUMENTS, resourceId, contentId);

      const targetContent = contents.find(
        (content) => content.contentId === contentId
      );
      if (!targetContent) {
        console.error("Content not found:", contentId);
        return;
      }

      const documentBlob = await fetcher?.getContent(
        resourceId,
        contentId,
        {
          binary: true,
        },
        RESPONSE_TYPE.BLOB
      );
      if (!documentBlob) {
        console.error("Failed to get file.");
        return;
      }

      const documentUrl = URL.createObjectURL(documentBlob);
      setBlobUrls((prev) => [...prev, documentUrl]);
      const a = document.createElement("a");
      a.href = documentUrl;
      a.download = targetContent?.filename || "unknown.bin";
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error("Error while downloading file:", error);
    }
  }

  useEffect(() => {
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  return (
    <HStack>
      <Box>
        <Image
          width={400}
          height={400}
          src={thumbnailUrl || "/default-cover-image.png"}
          alt={"Unknown"}
        />
      </Box>
      <Box>
        <Table.Root size="sm" interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>
                MIME TYPE
                <Text fontSize="sm" color="gray.500">
                  (Preview)
                </Text>
              </Table.ColumnHeader>
              <Table.ColumnHeader>
                FILENAME
                <Text fontSize="sm" color="gray.500">
                  (Download)
                </Text>
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {contents.map((content) => {
              return (
                <Table.Row key={content.contentId}>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      color="blue.500"
                      onClick={() =>
                        router.push(
                          `/${RESOURCE_TYPE.DOCUMENTS}/${resourceId}/${content.contentId}`
                        )
                      }
                      _hover={{ bg: "blue.100" }}
                    >
                      {content.contentId}
                    </Button>
                  </Table.Cell>

                  <Table.Cell>
                    <Button
                      variant="outline"
                      color="blue.500"
                      onClick={() =>
                        router.push(
                          `/${RESOURCE_TYPE.DOCUMENTS}/${resourceId}/${content.contentId}`
                        )
                      }
                      _hover={{ bg: "blue.100" }}
                    >
                      {content.mimetype}
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      color="blue.500"
                      onClick={() => getDocument(content.contentId)}
                      _hover={{ bg: "blue.100" }}
                    >
                      {content.filename}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </HStack>
  );
}
