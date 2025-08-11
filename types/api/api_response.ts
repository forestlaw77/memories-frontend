// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

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
