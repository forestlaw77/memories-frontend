// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  }

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
      setFiles([]); // ✅ ファイル選択リセット
      queryClient.invalidateQueries({
        queryKey: ["allResources", resourceType], // ← useQuery と一致させてください
      });
      router.push(`/${resourceType}`);
    });
  }

  const progressValue =
    files.length > 0 ? (completedCount / files.length) * 100 : 0;

  const returnPage =
    typeof window !== "undefined"
      ? sessionStorage.getItem("returnPageNumber")
      : null;

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
