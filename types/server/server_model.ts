/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

export interface ServerContentMeta {
  id: number; // Unique identifier of the content
  filename: string; // Name of the file
  mimetype: string; // MIME type of the content
  hash: string; // Hash of the content for integrity validation
  size?: number; // Size of the content in bytes
  created_at: string; // Timestamp when the content was created (ISO 8601 format)
  updated_at: string; // Timestamp when the content was last updated (ISO 8601 format)
  extra_info?: {
    exif?: Record<string, any>; // File information obtainable with exiftools
    location?: {
      address_string?: string | null; // Address string of the location
      address: Record<string, string | null>; // Address components of the location
    }; // Geolocation information
  };
}

export interface ServerBasicMeta {
  created_at: string; // Timestamp when the resource was created (ISO 8601 format)
  updated_at: string; // Timestamp when the resource was last updated (ISO 8601 format)
  content_ids: number[]; // List of associated content IDs
  contents: ServerContentMeta[]; // List of content metadata associated with the resource
  extra_info?: {
    exif?: Record<string, any>; // File information obtainable with exiftools
    location?: {
      latitude: number | null; // Latitude of the location
      longitude: number | null; // Longitude of the location
    }; // Geolocation information
  };
  child_resource_ids?: string[]; // Nested resources within a resource
  parent_resource_ids?: string[]; // Parent resources
}

export interface ServerDetailMeta {}
export interface ServerResourceMeta {
  id: string; // Unique identifier of the resource
  basic_meta: ServerBasicMeta; // Fundamental metadata shared across resource types
  detail_meta?: ServerDetailMeta; // Resource-specific detailed metadata
}

export interface ServerResponse {
  status: "success" | "warning" | "error";
  message: string;

  // オプションのフィールド
  resource_id?: string;
  content_id?: number;
  error?: string;

  // `success` ステータスでのみ含まれる可能性のあるメタデータ
  basic_meta?: ServerBasicMeta;
  detail_meta?: ServerDetailMeta;

  response_data?: any;
}
