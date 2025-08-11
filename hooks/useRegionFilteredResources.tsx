// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import {
  BaseContentMeta,
  BaseDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { useMemo } from "react";

export function useRegionFilteredResources<
  TContent extends BaseContentMeta,
  TDetail extends BaseDetailMeta
>(
  allResources: ResourceMeta<TContent, TDetail>[] | undefined,
  country?: string,
  state?: string
) {
  return useMemo(() => {
    if (!allResources) return [];
    let temp = allResources;

    if (country) {
      temp = temp.filter((r) => r.detailMeta?.country === country);
    }
    if (state) {
      temp = temp.filter((r) => r.detailMeta?.state === state);
    }

    return temp;
  }, [allResources, country, state]);
}
