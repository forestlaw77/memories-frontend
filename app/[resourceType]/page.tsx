/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module UnifiedResourceView
 * @description
 * This module provides a dynamic component that renders a specific view based on the user's selected view mode.
 */

"use client";

import UnifiedRegionViewMap from "@/components/map/UnifiedRegionViewMap";
import UnifiedGridView from "@/components/resource/ui/UnifiedGridView";
import UnifiedSlideView from "@/components/resource/ui/UnifiedSlideView";
import TrajectoryView from "@/components/trajectory/TrajectoryView";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { ViewMode } from "@/types/client/view_preferences";

/**
 * A client-side component that dynamically renders a different view based on the current global settings.
 *
 * This component uses the `useGlobalSettings` hook to determine the user's preferred `ViewMode`
 * (Grid, Slide, Map, or Trajectory) and renders the corresponding component.
 * It serves as a central view switcher for the application's main content area.
 *
 * @returns {JSX.Element} A React component for the currently selected view mode.
 */
export default function UnifiedResourceView() {
  console.debug("UnifiedResourceView");
  const { settings } = useGlobalSettings();
  console.debug("settings.viewMode", settings.viewMode);

  switch (settings.viewMode) {
    case ViewMode.Grid:
      return <UnifiedGridView />;
    case ViewMode.Slide:
      return <UnifiedSlideView />;
    case ViewMode.Map:
      return <UnifiedRegionViewMap />;
    case ViewMode.Trajectory:
      return <TrajectoryView />;
  }
  // default map view
  return <UnifiedRegionViewMap />;
}
