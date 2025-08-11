// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import L from "leaflet";

interface Marker {
  lat: number;
  lng: number;
  id: string;
}

export interface NearbyPoint {
  id: string;
  latLng: L.LatLng;
}

/**
 * 指定した中心点から一定距離内のマーカーを抽出する
 * @param allMarkers - 全マーカー配列
 * @param centerLatLng - 中心点
 * @param nearbyRadiusKm - 半径（km）
 * @returns NearbyPoint[] - ID付きの近傍ポイント
 */
export const getNearbyLatLngs = (
  allMarkers: Marker[],
  centerLatLng: L.LatLng,
  nearbyRadiusKm: number = 1
): NearbyPoint[] => {
  const radiusMeters = nearbyRadiusKm * 1000;
  const bounds = centerLatLng.toBounds(radiusMeters); // 矩形領域で事前フィルタ

  return allMarkers
    .filter((m) => {
      const markerLatLng = L.latLng(m.lat, m.lng);
      const isInBounds = bounds.contains(markerLatLng);
      const isNotCenter = !(
        centerLatLng.lat === m.lat && centerLatLng.lng === m.lng
      );
      const isInRadius = centerLatLng.distanceTo(markerLatLng) <= radiusMeters;

      return isInBounds && isNotCenter && isInRadius;
    })
    .map((m) => ({
      id: m.id,
      latLng: L.latLng(m.lat, m.lng),
    }));
};
