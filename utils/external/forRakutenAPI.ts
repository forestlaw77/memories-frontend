// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

export function parseSalesDate(salesDate: string): string {
  // 「頃」「以降」などの不要な文字を削除
  const cleanedDate = salesDate.replace(/(頃|以降|上旬|中旬|下旬)/g, "");

  // 「YYYY年MM月DD日」のフォーマットに一致する場合
  if (/^\d{4}年\d{2}月\d{2}日$/.test(cleanedDate)) {
    return cleanedDate.replace(/年|月/g, "-").replace(/日/, "");
  }

  // 「YYYY年MM月」の場合 → `YYYY-MM-01` とする
  if (/^\d{4}年\d{2}月$/.test(cleanedDate)) {
    return cleanedDate.replace(/年/, "-").replace(/月/, "-01");
  }

  // 「YYYY年」の場合 → `YYYY-01-01` とする
  if (/^\d{4}年$/.test(cleanedDate)) {
    return cleanedDate.replace(/年/, "-01-01");
  }

  // 不明なフォーマットなら空文字を返す
  return "";
}
