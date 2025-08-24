/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { Box } from "@chakra-ui/react";
import { LeafletMapEditor } from "../map/LeafletMapEditor";

interface GeoMapEditorBoxProps {
  lat: number;
  lng: number;
  onUpdateLocation: (lat: number, lng: number, address?: string) => void;
}

export function GeoMapEditorBox({
  lat,
  lng,
  onUpdateLocation,
}: GeoMapEditorBoxProps) {
  async function handleUpdate(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "User-Agent": "Memories/1.0" } }
      );
      const data = await res.json();
      const address = data?.display_name || "";
      onUpdateLocation(lat, lng, address);
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
      onUpdateLocation(lat, lng); // fallback without address
    }
  }

  return (
    <Box
      mt={4}
      borderRadius="md"
      overflow="hidden"
      minW="480px"
      minH="272px"
      maxW="720px"
      maxH="480px"
      height="480px"
    >
      <LeafletMapEditor lat={lat} lng={lng} onUpdate={handleUpdate} />
    </Box>
  );
}
