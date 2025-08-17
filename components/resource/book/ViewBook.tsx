/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import ErrorMessage from "@/components/common/ErrorMessage"; // ErrorMessage コンポーネントのインポートを明示
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import {
  BaseContentMeta,
  ViewComponentProps,
} from "@/types/client/client_model";
import { Alert, Button, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import EpubViewer from "./EpubViewer";
import PDFViewer from "./PDFViewer";

export default function ViewBook({
  contentMeta,
  resourceId,
  contentId,
  fetcher,
}: ViewComponentProps<BaseContentMeta>) {
  const [bookUrl, setBookUrl] = useState<string | ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleError = (error: unknown, context: string) => {
    const msg = `${context}: ${error}`;
    console.error(msg);
    setErrorMessage(msg);
  };

  const mimetype = contentMeta?.mimetype ?? "";

  useEffect(() => {
    return () => {
      if (typeof bookUrl === "string" && bookUrl.startsWith("blob:")) {
        URL.revokeObjectURL(bookUrl);
      }
    };
  }, [bookUrl]);

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      setErrorMessage("");
      setBookUrl(null);

      try {
        if (!fetcher) {
          handleError(
            "fetcher",
            "Fetcher is not available. Cannot load content."
          );
          return;
        }

        const bookBlob = await fetcher.getContent(
          resourceId,
          contentId,
          { binary: true },
          RESPONSE_TYPE.BLOB
        );

        if (!(bookBlob instanceof Blob)) {
          handleError(
            "content",
            "Fetched content is not a Blob. Unsupported format."
          );
          return;
        }

        if (mimetype === "application/epub+zip") {
          const bookArrayBuffer = await bookBlob.arrayBuffer();
          setBookUrl(bookArrayBuffer);
        } else if (mimetype === "application/pdf") {
          const objectUrl = URL.createObjectURL(bookBlob);
          setBookUrl(objectUrl);
        } else {
          handleError(
            "mimetype",
            `This format (${mimetype}) cannot be previewed. Providing download option.`
          );
          const objectUrl = URL.createObjectURL(bookBlob);
          setBookUrl(objectUrl);
        }
      } catch (error) {
        handleError(error, "An error occurred while loading book content");
        setBookUrl(null);
      } finally {
        setLoading(false);
      }
    }

    loadBook();

    return () => {};
  }, [contentMeta, resourceId, contentId, fetcher, mimetype]);

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (loading) {
    return (
      <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Loading book...</Alert.Title>
          <Spinner size="md" ml={4} /> {/* スピナーのサイズとマージンを調整 */}
        </Alert.Content>
      </Alert.Root>
    );
  }

  // contentMeta が存在しない場合（ロードが完了し、エラーもなく、コンテンツメタもない状態）
  if (!contentMeta) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Content metadata not found.</Alert.Title>
          <Alert.Description>
            The metadata for this content could not be retrieved.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  // ロード完了後も bookUrl が null の場合（フェッチ失敗、サポートされない形式でURLも生成されないなど）
  if (bookUrl === null) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Failed to load the book.</Alert.Title>
          <Alert.Description>
            The content may be corrupted, unavailable, or in an unsupported
            format for preview.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  // PDFビューワーの表示
  if (typeof bookUrl === "string" && mimetype === "application/pdf") {
    return <PDFViewer url={bookUrl} />;
  }

  // EPUBビューワーの表示
  if (bookUrl instanceof ArrayBuffer && mimetype === "application/epub+zip") {
    return <EpubViewer url={bookUrl} />;
  }

  // その他のサポートされていないMIMEタイプの場合
  return (
    <div>
      <Alert.Root status="warning">
        {/* status を warning に変更 */}
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>
            This format ({contentMeta.mimetype}) cannot be previewed directly.
          </Alert.Title>
          <Alert.Description>
            You may be able to download the content instead.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
      {/* bookUrl が string であればダウンロードリンクを提供する */}
      {typeof bookUrl === "string" && (
        <a
          href={bookUrl}
          download={`${contentMeta.filename}.${mimetype.split("/").pop()}`}
        >
          <Button mt={4}>Download this book</Button>
        </a>
      )}
    </div>
  );
}
