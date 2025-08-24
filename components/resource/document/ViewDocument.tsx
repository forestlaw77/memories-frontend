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

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
//import { createFetcher } from "@/libs/api/resource_fetcher";
import { createFetcher } from "@/services/api/createFetcher";
import {
  BaseContentMeta,
  RESOURCE_TYPE,
  ViewComponentProps,
} from "@/types/client/client_model";
import { Alert, Button, Spinner } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import EpubViewer from "../book/EpubViewer";
import PDFViewer from "../book/PDFViewer";

export default function ViewDocument({
  contentMeta,
  resourceId,
  contentId,
}: ViewComponentProps<BaseContentMeta>) {
  const [documentUrl, setDocumentUrl] = useState<string | ArrayBuffer | null>(
    null
  );
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
  const objectUrlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mimetype = contentMeta?.mimetype ?? "";

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        const documentBlob = await fetcher?.getContent(
          resourceId,
          contentId,
          { binary: true },
          RESPONSE_TYPE.BLOB
        );
        if (!documentBlob) {
          return;
        }
        if (mimetype === "application/epub+zip") {
          const documentArrayBuffer = await documentBlob.arrayBuffer();
          setDocumentUrl(documentArrayBuffer);
        } else {
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
          }
          const objectUrl = URL.createObjectURL(documentBlob);
          objectUrlRef.current = objectUrl;
          setDocumentUrl(objectUrl);
        }
      } catch (error) {
        console.error("An error occurred while loading content data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocument();
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [contentMeta, resourceId, contentId, fetcher, mimetype]);

  if (!contentMeta)
    return (
      <Alert.Root>
        <Alert.Indicator />
        <Alert.Title>Content not found.</Alert.Title>
      </Alert.Root>
    );

  if (loading) {
    return (
      <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Title>Loading document...</Alert.Title>
        <Spinner />
      </Alert.Root>
    );
  }

  if (typeof documentUrl === "string" && mimetype === "application/pdf") {
    return <PDFViewer url={documentUrl} />;
  }
  if (
    documentUrl instanceof ArrayBuffer &&
    mimetype === "application/epub+zip"
  ) {
    return <EpubViewer url={documentUrl} />;
  }

  if (documentUrl === null) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>Failed to load the document.</Alert.Title>
      </Alert.Root>
    );
  }

  return (
    <div>
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>
          This format ({contentMeta?.mimetype}) cannot be previewed.
        </Alert.Title>
      </Alert.Root>
      {typeof documentUrl === "string" && (
        <a href={documentUrl} download>
          <Button>Download this document.</Button>
        </a>
      )}
    </div>
  );
}
