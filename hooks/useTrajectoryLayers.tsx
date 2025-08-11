// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import L from "leaflet";
import "leaflet-polylinedecorator";
import { useEffect, useRef } from "react";

interface TrajectorySegment {
  path: [number, number][];
  color: string;
}

interface UseTrajectoryLayersProps {
  mapRef: React.RefObject<L.Map | null>;
  trajectoryPath?: [number, number][];
  trajectorySegments?: TrajectorySegment[];
}

export const useTrajectoryLayers = ({
  mapRef,
  trajectoryPath,
  trajectorySegments,
}: UseTrajectoryLayersProps) => {
  const trajectoryLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const mainPolylineRef = useRef<L.Polyline | null>(null); // trajectoryPath用
  const mainDecoratorRef = useRef<L.PolylineDecorator | null>(null); // trajectoryPath用

  // trajectoryPath の描画
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 既存のレイヤーを削除
    if (mainPolylineRef.current) map.removeLayer(mainPolylineRef.current);
    if (mainDecoratorRef.current) map.removeLayer(mainDecoratorRef.current);

    if (!trajectoryPath || trajectoryPath.length < 2) {
      mainPolylineRef.current = null;
      mainDecoratorRef.current = null;
      return;
    }

    const polyline = L.polyline(trajectoryPath, {
      color: "blue",
      weight: 3,
      opacity: 0.7,
    }).addTo(map);
    mainPolylineRef.current = polyline;

    const decorator = L.polylineDecorator(polyline, {
      patterns: [
        {
          offset: 0,
          repeat: 30,
          symbol: L.Symbol.arrowHead({
            pixelSize: 12,
            headAngle: 60,
            pathOptions: {
              stroke: true,
              color: "red",
              weight: 2,
              opacity: 1,
            },
          }),
        },
      ],
    }).addTo(map);
    mainDecoratorRef.current = decorator;

    return () => {
      if (mainPolylineRef.current) map.removeLayer(mainPolylineRef.current);
      if (mainDecoratorRef.current) map.removeLayer(mainDecoratorRef.current);
      mainPolylineRef.current = null;
      mainDecoratorRef.current = null;
    };
  }, [mapRef, trajectoryPath]);

  // trajectorySegments の描画
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !trajectorySegments) return;

    // 既存のレイヤを削除
    if (trajectoryLayerGroupRef.current) {
      trajectoryLayerGroupRef.current.clearLayers();
      map.removeLayer(trajectoryLayerGroupRef.current);
    }

    // 新しいレイヤグループを作成
    const layerGroup = L.layerGroup();
    trajectorySegments.forEach(({ path, color }) => {
      if (path.length >= 2) {
        const polyline = L.polyline(path, {
          color,
          weight: 3,
          opacity: 0.7,
        }).addTo(map);

        const decorator = L.polylineDecorator(polyline, {
          patterns: [
            {
              offset: 0,
              repeat: 30,
              symbol: L.Symbol.arrowHead({
                pixelSize: 12,
                headAngle: 60,
                pathOptions: {
                  stroke: true,
                  color,
                  weight: 2,
                  opacity: 1,
                },
              }),
            },
          ],
        }).addTo(map);

        layerGroup.addLayer(polyline);
        layerGroup.addLayer(decorator);
      }
    });

    layerGroup.addTo(map);
    trajectoryLayerGroupRef.current = layerGroup;

    return () => {
      if (trajectoryLayerGroupRef.current) {
        trajectoryLayerGroupRef.current.clearLayers();
        map.removeLayer(trajectoryLayerGroupRef.current);
        trajectoryLayerGroupRef.current = null;
      }
    };
  }, [mapRef, trajectorySegments]);
};
