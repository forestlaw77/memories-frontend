/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  BaseContentMeta,
  BaseDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { useMemo } from "react";

export interface TrajectoryPoint {
  lat: number;
  lng: number;
  recordedDateTime: Date;
  resourceId: string;
  resourceIndex: number;
  title: string;
  direction?: number; // degrees
  speed?: number; // km/h or m/s
}

interface RawTrajectoryPoint extends Omit<TrajectoryPoint, "recordedDateTime"> {
  recordedDateTime: Date | null;
}

export function useTrajectoryPoints(
  resources: ResourceMeta<BaseContentMeta, BaseDetailMeta>[] | undefined
): TrajectoryPoint[] {
  return useMemo(() => {
    if (!resources) return [];

    const trajectoryPoints = resources
      .map((r, i) => createTrajectoryPoint(r, i))
      .filter((p) => isValidTrajectoryPoint(p))
      .sort((a, b) => {
        const dateA = a.recordedDateTime.getTime();
        const dateB = b.recordedDateTime.getTime();
        if (dateB === undefined && dateA !== undefined) {
          return -1;
        }
        if (dateA === undefined && dateB !== undefined) {
          return 1;
        }
        return (dateA ?? 0) - (dateB ?? 0);
      });

    return enrichTrajectoryPoints(trajectoryPoints);
  }, [resources]);
}

function isValidTrajectoryPoint(
  p: Partial<RawTrajectoryPoint>
): p is TrajectoryPoint {
  return (
    typeof p.lat === "number" &&
    !isNaN(p.lat) &&
    typeof p.lng === "number" &&
    !isNaN(p.lng) &&
    p.recordedDateTime instanceof Date &&
    !isNaN(p.recordedDateTime.getTime())
  );
}

function createTrajectoryPoint(
  r: ResourceMeta<BaseContentMeta, BaseDetailMeta>,
  index: number
): RawTrajectoryPoint {
  const { latitude, longitude, recordedDateTime, title } = r.detailMeta ?? {};
  return {
    lat: latitude ?? NaN,
    lng: longitude ?? NaN,
    recordedDateTime: recordedDateTime ?? null,
    resourceId: r.basicMeta.resourceId,
    title: title ?? "Untitled",
    resourceIndex: index,
  };
}

function calculateBearing(p1: TrajectoryPoint, p2: TrajectoryPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);
  const dLng = toRad(p2.lng - p1.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360; // 0〜360°
}

function calculateSpeed(p1: TrajectoryPoint, p2: TrajectoryPoint): number {
  const distance = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng); // km
  const timeDiff =
    (p2.recordedDateTime.getTime() - p1.recordedDateTime.getTime()) / 3600000; // 時間
  return timeDiff > 0 ? distance / timeDiff : 0;
}
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球の半径 (km)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // km
}
export function enrichTrajectoryPoints(
  points: TrajectoryPoint[]
): TrajectoryPoint[] {
  if (points.length <= 1) {
    return points;
  }

  return points.map((point, index) => {
    let bearing: number | undefined;
    let speed: number | undefined;

    if (index === 0) {
      // 最初のポイントの場合、次のポイントとの間で方向と速度を計算する
      // points.length > 1 なので points[1] は必ず存在する
      const nextPoint = points[1];
      bearing = calculateBearing(point, nextPoint);
      speed = calculateSpeed(point, nextPoint);
    } else {
      // 2番目以降のポイントの場合、前のポイントとの間で方向と速度を計算する
      const prevPoint = points[index - 1];
      // index > 0 かつ points.length > 1 なので prevPoint は必ず存在する
      bearing = calculateBearing(prevPoint, point);
      speed = calculateSpeed(prevPoint, point);
    }

    return {
      ...point,
      direction: bearing,
      speed: speed,
    };
  });
}
