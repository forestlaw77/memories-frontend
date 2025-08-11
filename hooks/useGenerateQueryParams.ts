// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { RESOURCE_TYPE } from "@/types/client/client_model";
import { resourceDataMap } from "@/types/formDataMap";

export default function useGenerateQueryParams(
  resourceType: RESOURCE_TYPE | null
) {
  if (!resourceType) {
    return null;
  }
  return function generateQueryParams(
    formData: Record<string, string>
  ): Record<string, string> {
    const resourceFields = resourceDataMap[resourceType];
    const validFields = new Set(
      resourceFields
        .filter((field) => field.isSearchable)
        .map((field) => field.fieldName)
    );

    const queryParams: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (validFields.has(key) && value) {
        queryParams[key] = value;
      }
    });

    return queryParams;
  };
}
