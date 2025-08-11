// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { isWithinBBox } from "@/libs/maps/utils";
import {
  BaseContentMeta,
  BaseDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { useMemo } from "react";

interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export function useFilteredByBBoxResources<
  TContent extends BaseContentMeta,
  TDetail extends BaseDetailMeta
>(resources: ResourceMeta<TContent, TDetail>[], bbox: BoundingBox | null) {
  return useMemo(() => {
    if (!bbox) return resources;
    return resources.filter((r) => isWithinBBox(r, bbox));
  }, [resources, bbox]);
}
