// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import UnifiedRegionViewMap from "@/components/map/UnifiedRegionViewMap";
import UnifiedGridView from "@/components/resource/ui/UnifiedGridView";
import UnifiedSlideView from "@/components/resource/ui/UnifiedSlideView";
import TrajectoryView from "@/components/trajectory/TrajectoryView";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { ViewMode } from "@/types/client/view_preferences";

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
