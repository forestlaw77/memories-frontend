/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { useCallback, useEffect, useState } from "react";

export function useThumbnailRotation(initialSrc: string | null) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(initialSrc);
  const [hasPendingChange, setHasPendingChange] = useState(false);

  useEffect(() => {
    setRotatedUrl(initialSrc);
  }, [initialSrc]);

  const rotateImage = useCallback(async (src: string, angle: number) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const isNinetyDegreeRotation = angle % 180 !== 0;
        canvas.width = isNinetyDegreeRotation ? img.height : img.width;
        canvas.height = isNinetyDegreeRotation ? img.width : img.height;

        ctx?.translate(canvas.width / 2, canvas.height / 2);
        ctx?.rotate((angle * Math.PI) / 180);
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        reject(new Error("Failed to load image."));
      };
    });
  }, []);

  const rotate = useCallback(
    async (direction: "left" | "right") => {
      if (!initialSrc) return;
      const delta = direction === "left" ? -90 : 90;
      const newAngle = (rotationAngle + delta + 360) % 360;
      const result = await rotateImage(initialSrc, newAngle);
      setRotationAngle(newAngle);
      setRotatedUrl(result);
      setHasPendingChange(newAngle != 0);
    },
    [rotationAngle, rotateImage, initialSrc]
  );

  const reset = useCallback(() => {
    setRotatedUrl(initialSrc);
    setRotationAngle(0);
    setHasPendingChange(false);
  }, [initialSrc]);

  return {
    rotatedUrl,
    rotationAngle,
    hasPendingChange,
    rotate,
    reset,
  };
}
