/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { useRouter } from "next/navigation";
import { useCallback } from "react";

type UseOnActionProps = {
  resourceType: string;
  setIsEditOpen?: (open: boolean) => void;
  setIsDeleteOpen?: (open: boolean) => void;
};

export function useOnAction({
  resourceType,
  setIsEditOpen,
  setIsDeleteOpen,
}: UseOnActionProps) {
  const router = useRouter();

  const onAction = useCallback(
    (action: string) => {
      switch (action) {
        case "add":
          router.push(`/${resourceType}/add`, { scroll: false });
          break;
        case "bulkAdd":
          router.push(`/${resourceType}/bulk-add`, { scroll: false });
          break;
        case "bulkEdit":
          setIsEditOpen?.(true);
          break;
        case "delete":
          setIsDeleteOpen?.(true);
          break;
        default:
          console.warn("Unknown action:", action);
      }
    },
    [resourceType, router, setIsEditOpen, setIsDeleteOpen]
  );

  return onAction;
}
