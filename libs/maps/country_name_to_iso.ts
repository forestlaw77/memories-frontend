/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

export const COUNTRY_NAME_TO_ISO: Record<string, string[]> = {
  // Asia
  JP: ["Japan", "日本"],
  KR: ["South Korea", "Republic of Korea", "韓国", "Korea"],
  CN: ["China", "中華人民共和国", "中国"],
  IN: ["India", "インド"],
  ID: ["Indonesia", "インドネシア"],
  TH: ["Thailand", "タイ"],
  PH: ["Philippines", "フィリピン"],
  VN: ["Vietnam", "ベトナム"],
  SG: ["Singapore", "シンガポール"],
  MY: ["Malaysia", "マレーシア"],
  HK: ["Hong Kong", "香港"], // ISO 3166-1 alpha-2 official code for Hong Kong
  TW: ["Taiwan", "台湾", "Republic of China"], // ISO 3166-1 alpha-2 official code for Taiwan

  // North America
  US: ["United States", "USA", "United States of America", "米国", "アメリカ"],
  CA: ["Canada", "カナダ"],
  MX: ["Mexico", "メキシコ"],

  // Europe
  FR: ["France", "フランス"],
  DE: ["Germany", "ドイツ"],
  GB: ["United Kingdom", "UK", "イギリス", "英国"],
  IT: ["Italy", "イタリア"],
  ES: ["Spain", "スペイン"],
  RU: ["Russia", "Russian Federation", "ロシア"],
  NL: ["Netherlands", "オランダ"],
  BE: ["Belgium", "ベルギー"],
  SE: ["Sweden", "スウェーデン"],
  NO: ["Norway", "ノルウェー"],
  DK: ["Denmark", "デンマーク"],
  FI: ["Finland", "フィンランド"],
  CH: ["Switzerland", "スイス"],
  AT: ["Austria", "オーストリア"],
  PT: ["Portugal", "ポルトガル"],
  IE: ["Ireland", "アイルランド"],
  GR: ["Greece", "ギリシャ"],
  PL: ["Poland", "ポーランド"],
  CZ: ["Czech Republic", "チェコ"],
  HU: ["Hungary", "ハンガリー"],

  // South America
  BR: ["Brazil", "ブラジル"],
  AR: ["Argentina", "アルゼンチン"],
  CL: ["Chile", "チリ"],
  CO: ["Colombia", "コロンビア"],
  PE: ["Peru", "ペルー"],

  // Oceania
  AU: ["Australia", "オーストラリア"],
  NZ: ["New Zealand", "ニュージーランド"],

  // Africa
  ZA: ["South Africa", "南アフリカ"],
  EG: ["Egypt", "エジプト"],
  NG: ["Nigeria", "ナイジェリア"],

  // Middle East
  SA: ["Saudi Arabia", "サウジアラビア"],
  AE: ["United Arab Emirates", "UAE", "アラブ首長国連邦"],
  TR: ["Turkey", "トルコ"], // Note: Geographically partly in Europe
};

export function resolveCountryCode(name: string): string | null {
  const normalized = name?.trim().toUpperCase();

  if (normalized?.length === 2) {
    return normalized;
  }

  for (const [iso, names] of Object.entries(COUNTRY_NAME_TO_ISO)) {
    if (names.map((n) => n.toUpperCase()).includes(normalized)) {
      return iso;
    }
  }

  return null;
}

export const COUNTRY_OPTIONS = Object.entries(COUNTRY_NAME_TO_ISO)
  .map(([iso, names]) => ({
    label: names[0],
    value: iso,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
