/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module BulkAddResource
 * @description
 * This module provides a client-side component for bulk uploading and registering
 * multiple resource files at once.
 */

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import { toaster } from "@/components/common/toaster";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import {
  Box,
  Button,
  Field,
  Input,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

/**
 * A client-side component for bulk adding resources.
 *
 * This component allows users to select multiple files and upload them to be
 * registered as new resources. It displays the upload progress, provides
 * real-time feedback with toasts, and navigates back to the main resource page
 * upon completion.
 *
 * @returns {JSX.Element} A React component for the bulk resource addition page.
 */
export default function BulkAddResource() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<{ [key: string]: string }>({});
  const completedCount = Object.values(status).filter(
    (s) => s === "Success"
  ).length;
  const { authToken, enableCache } = useFetcherParams();
  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, enableCache, authToken]
  );
  const queryClient = useQueryClient();

  /**
   * Handles the file selection from the input element.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
   */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  }

  /**
   * Handles the form submission, uploading each file individually.
   * It shows a progress bar and provides toast notifications for the overall process.
   * @param {React.FormEvent} e - The form submission event.
   */
  async function handleSubmit(e: React.FormEvent) {
    if (!fetcher) {
      return;
    }
    e.preventDefault();
    const promises = files.map((file) => {
      const formData = new FormData();
      formData.append("content-file", file);

      const promise = fetcher.addResource(formData);

      promise
        .then(() => setStatus((prev) => ({ ...prev, [file.name]: "Success" })))
        .catch(() =>
          setStatus((prev) => ({ ...prev, [file.name]: "Failure" }))
        );

      return promise;
    });

    toaster.promise(Promise.allSettled(promises), {
      success: {
        title: "Registration Successful",
        description:
          "All files have been successfully registered as resources!",
      },
      error: {
        title: "Registration Failed",
        description: "Some files failed to register.",
      },
      loading: {
        title: `Registering (${files.length} files)`,
        description: "Please wait a moment.",
      },
    });

    Promise.allSettled(promises).then(() => {
      setFiles([]); // Reset the file selection
      queryClient.invalidateQueries({
        queryKey: ["allResources", resourceType], // Invalidate the main resource list query to refresh the data
      });
      router.push(`/${resourceType}`);
    });
  }

  // Calculate the progress value for the progress bar
  const progressValue =
    files.length > 0 ? (completedCount / files.length) * 100 : 0;

  // Retrieve the return page from session storage for breadcrumb navigation
  const returnPage =
    typeof window !== "undefined"
      ? sessionStorage.getItem("returnPageNumber")
      : null;

  // Determine the breadcrumb's back link
  const breadcrumbBackHref = returnPage
    ? `/${resourceType}?page=${returnPage}`
    : `/${resourceType}`;

  return (
    <Box p={6}>
      <DynamicBreadcrumb backLinkOverride={breadcrumbBackHref} />

      <Text as="h1" fontSize="2xl" mb={4}>
        {resourceType.toUpperCase()} Bulk registration
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <Field.Root>
            <Field.Label>Content file</Field.Label>
            <Input type="file" multiple onChange={handleFileChange} />
          </Field.Root>

          {files.length > 0 && (
            <Progress.Root
              value={progressValue}
              variant="outline"
              size="lg"
              colorPalette="black"
              striped
              animated
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
              <Progress.ValueText>
                {Math.round(progressValue)}%
              </Progress.ValueText>
            </Progress.Root>
          )}
          <Button type="submit" colorPalette="blue">
            Registration
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
