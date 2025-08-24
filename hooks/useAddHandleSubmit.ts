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
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { createFetcher } from "@/services/api/createFetcher";
//import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useAddHandleSubmit(
  resourceType: RESOURCE_TYPE,
  authToken: string | null | undefined
) {
  const { settings } = useGlobalSettings();
  console.log("[useAddHandleSubmit]authToken:", authToken);
  const fetcher = useMemo(
    () => createFetcher(resourceType, settings.enableCache, authToken),
    [resourceType, settings.enableCache, authToken]
  );
  const queryClient = useQueryClient();

  if (!fetcher) {
    if (!authToken) {
      console.log("Invalid access token");
    } else {
      console.error(`Invalid resourceType: ${resourceType}`);
    }

    return null;
  }

  return async function handleSubmit(
    data: object,
    files: File[] | null,
    filePaths: string[] | null,
    options: { shouldStoreFile: boolean },
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
    setCompletedCount: React.Dispatch<React.SetStateAction<number>>
  ) {
    setIsSubmitting(true);
    setCompletedCount(0);

    try {
      const formData = new FormData();
      if (Object.keys(data).length > 0) {
        formData.append(
          "detail-file",
          new Blob([JSON.stringify(data)], { type: "application/json" })
        );
      }
      if (files && files.length > 0) formData.append("content-file", files[0]);
      if (filePaths && filePaths.length > 0)
        formData.append("file-path", filePaths[0]);
      if (options.shouldStoreFile)
        formData.append("stored", options.shouldStoreFile ? "true" : "false");

      const response = await fetcher.addResource(formData);
      const resource_id = response.resource_id;
      setCompletedCount(1);

      if (files && files.length > 1) {
        const promises = files.slice(1).map(async (file, index) => {
          const formData = new FormData();
          formData.append("content-file", file);
          if (filePaths && filePaths.length > index + 1) {
            formData.append("file-path", filePaths[index + 1]);
          }
          if (options.shouldStoreFile)
            formData.append(
              "stored",
              options.shouldStoreFile ? "true" : "false"
            );

          const result = await fetcher.addResourceContent(
            resource_id,
            formData
          );
          setCompletedCount((prev) => prev + 1);
          return result;
        });

        toaster.promise(Promise.all(promises), {
          success: {
            title: "Registration Successful",
            description: "All files have been registered as resource content!",
          },
          error: {
            title: "Registration Failed",
            description: "Some files failed to register.",
          },
          loading: {
            title: `Registering (${files.length} items)`,
            description: "Please wait a moment.",
          },
        });
        await Promise.all(promises);
      }
    } catch (error) {
      console.error("Resource registration failed:", error);
      toaster.promise(Promise.reject(error), {
        error: {
          title: "Registration Failed",
          description: `Failed to register ${resourceType}.`,
        },
      });
    } finally {
      setIsSubmitting(false);
      queryClient.invalidateQueries({
        queryKey: ["allResources", resourceType],
      });
    }
  };
}
