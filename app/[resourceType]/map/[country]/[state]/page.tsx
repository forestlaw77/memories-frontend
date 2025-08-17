/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module StateViewMap
 * @description
 * This module provides the `StateViewMap` component, which displays a unified map view for regions (states, provinces, etc.).
 */

"use client";

import UnifiedRegionViewMap from "@/components/map/UnifiedRegionViewMap";

/**
 * A client-side component that renders a map for a state or region view.
 *
 * This component acts as a wrapper for `UnifiedRegionViewMap`, providing a
 * focused map view specifically for states or similar geographical subdivisions.
 *
 * @returns {JSX.Element} A React component that displays a unified regional map.
 */
export default function StateViewMap() {
  return <UnifiedRegionViewMap />;
}
