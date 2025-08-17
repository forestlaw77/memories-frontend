/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module WorldViewMap
 * @description
 * This module provides the `WorldViewMap` component, which displays a unified world map view.
 */

"use client";

import UnifiedRegionViewMap from "@/components/map/UnifiedRegionViewMap";

/**
 * A client-side component that renders a map for a world view.
 *
 * This component acts as a wrapper for `UnifiedRegionViewMap`, providing a
 * comprehensive map view covering the entire globe.
 *
 * @returns {JSX.Element} A React component that displays a unified regional map.
 */
export default function WorldViewMap() {
  return <UnifiedRegionViewMap />;
}
