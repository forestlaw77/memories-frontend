/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  ServerBasicMeta,
  ServerDetailMeta,
  ServerResourceMeta,
} from "../server/server_model";

// content を保持する内部データ構造
export interface ContentResponseData {
  content: string; // base64-encoded string
  mimetype: string;
}

// fetchContent が DataFormat.JSON で返す全体のレスポンス構造
export interface ContentApiResponse {
  status: "success" | "error"; // status は success だけでなく error もあり得るため
  message: string;
  resource_id: string;
  content_id: number;
  response_data: ContentResponseData;
}

export interface GetResourcesSuccessResponse {
  status: "success";
  message: string;
  response_data: {
    resources: ServerResourceMeta[];
    total_items: number;
    page: number | "all";
    per_page: number | "all";
  };
}

export interface GetResourceSuccessResponse {
  status: "success";
  message: string;
  resource_id: string;
  basic_meta: ServerBasicMeta;
  detail_meta: ServerDetailMeta;
}

export interface GetContentSuccessResponse {
  status: "success";
  message: string;
  resource_id: string;
  content_id: number;
  response_data: {
    content: string;
    mimetype: string;
  };
}

export interface AddResourceSuccessResponse {
  status: "success";
  message: string;
  resource_id: string; // 追加されたリソースID (オプション)
}

export interface UpdateResourceSuccessResponse {
  status: "success"; // 通常、成功時は "success"
  message: string;
  resource_id: string; // 更新されたリソースID (オプション)
}

export interface AddResourceContentSuccessResponse {
  status: "success"; // 通常、成功時は "success"
  message: string;
  resource_id: string; // 追加されたリソースID (オプション)
  content_id: number; // 追加されたコンテンツID (オプション)
}

export interface UpdateThumbnailSuccessResponse {
  status: "success";
  message: string;
  resource_id: string;
}
