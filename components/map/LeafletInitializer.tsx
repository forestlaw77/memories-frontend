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

import L from "leaflet";
import { useEffect, useRef } from "react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

/**
 * LeafletInitializer Component
 *
 * This component initializes Leaflet's default icon settings to prevent
 * a bug where react-leaflet icons fail to display.
 *
 * Since Next.js operates in a server-side rendering environment,
 * accessing the `window` object can cause issues. This initialization logic
 * ensures that Leaflet's default icons are set up properly on the client side.
 */

export default function LeafletInitializer() {
  // Using useRef to track whether initialization has already been completed.
  // This prevents the initialization process from running multiple times,
  // especially in development mode where React's Strict Mode causes double rendering.
  const initialized = useRef(false);

  useEffect(() => {
    // Executes only once when the component is mounted.
    if (!initialized.current) {
      L.Icon.Default.mergeOptions({
        iconUrl: markerIcon.src,
        iconRetinaUrl: markerIcon2x.src,
        shadowUrl: markerShadow.src,
      });
      initialized.current = true; // Marks initialization as completed
      console.debug("Leaflet default icon options initialized.");
    }

    // No cleanup function needed since initialization is performed only once.
  }, []); // The empty dependency array ensures it runs only on mount.

  // This component does not render any UI elements, so it returns null.
  return null;
}
