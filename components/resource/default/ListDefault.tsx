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

import {
  BaseContentMeta,
  ContentListComponentProps,
} from "@/types/client/client_model";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ListDefault({
  resourceType,
  resourceId,
  contents,
}: ContentListComponentProps<BaseContentMeta>) {
  const router = useRouter();

  useEffect(() => {
    if (contents && contents.length === 1) {
      router.push(`/${resourceType}/${resourceId}/${contents[0].contentId}`);
    }
  });
  return <></>;
}
