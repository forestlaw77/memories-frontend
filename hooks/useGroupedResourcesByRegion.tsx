/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  ImageContentMeta,
  ImageDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { useMemo } from "react";

export type RegionType = "world" | "country" | "state";

export function useGroupedResourcesByRegion(
  resources: ResourceMeta<ImageContentMeta, ImageDetailMeta>[],
  regionType: RegionType,
  country?: string,
  state?: string
): Record<string, ResourceMeta<ImageContentMeta, ImageDetailMeta>[]> {
  const groupedDataMap = useMemo(() => {
    const map = new Map<
      string,
      ResourceMeta<ImageContentMeta, ImageDetailMeta>[]
    >();
    resources.forEach((res) => {
      const key = makeGroupKey(res, regionType, country, state);
      if (key === undefined) {
        return;
      }
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(res);
    });
    return Object.fromEntries(map);
  }, [resources, regionType, country, state]);

  return groupedDataMap;
}

function makeGroupKey(
  res: ResourceMeta<ImageContentMeta, ImageDetailMeta>,
  regionType: RegionType,
  filterCountry?: string,
  filterState?: string
): string | undefined {
  const detail = res.detailMeta;

  if (!detail) return undefined;

  const country = detail.country || "Unknown";
  const state = detail.state || "Unknown";
  const city = detail.city || "Unknown";

  switch (regionType) {
    case "world": // 世界は国でグループ化
      return country;
    case "country": // 国は州でグループ化
      if (filterCountry && filterCountry === country) {
        return state;
      }
      return "Unknown";
    case "state": // 州は都市でグループ化
      if (filterState && filterState === state) {
        return city;
      }
      return "Unknown";
    default:
      return undefined; // 未知の regionType の場合
  }
}
