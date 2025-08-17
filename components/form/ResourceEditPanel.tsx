/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { EditGenericForm } from "@/components/form/EditGenericForm";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { FieldConfig, resourceDataMap } from "@/types/formDataMap";

interface ResourceEditPanelProps {
  mode: "single" | "bulk";
  resourceType: RESOURCE_TYPE;
  resourceId?: string; // single 用
  selectedIds?: string[]; // bulk 用
  handleSubmit: (
    data: { [key: string]: string },
    files: File[] | null,
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
    setCompletedCount: React.Dispatch<React.SetStateAction<number>>
  ) => Promise<void> | void;
  defaultValues?: { [key: string]: string }; // フォーム初期値
  generateQueryParams?: (
    formData: Record<string, string>
  ) => Record<string, string>;
  handleSearch?: <T>(queryParams: Record<string, string>) => Promise<T>;
  isSubmitting?: boolean;
}

/**
 * 汎用的なリソース編集パネル（ドロワー内でもページ上でも使用可能）
 */
export function ResourceEditPanel({
  mode,
  resourceType,
  resourceId,
  selectedIds,
  handleSubmit,
  defaultValues = {},
  generateQueryParams,
  handleSearch,
  isSubmitting,
}: ResourceEditPanelProps) {
  const fields: FieldConfig[] = resourceDataMap[resourceType];

  // フォーム内部に渡す oldFormData 構築
  const formKey =
    mode === "single" ? resourceId ?? "" : selectedIds?.join(",") ?? "";

  return (
    <EditGenericForm
      key={formKey} // フォームを切り替えるための強制マウント変更用
      fields={fields}
      oldFormData={defaultValues}
      handleSubmit={handleSubmit}
      generateQueryParams={generateQueryParams}
      handleSearch={handleSearch}
    />
  );
}
