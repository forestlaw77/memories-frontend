/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import MenuTabs from "@/components/layout/MenuTabs";

import { Container } from "@chakra-ui/react";

import { Inter } from "next/font/google";
import Provider from "./provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

import BGMControlPanel from "@/components/resource/music/BGMContrlPanel";
import "@/styles/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";

/**
 * RootLayout component
 *
 * This component serves as the root layout for the application.
 * It includes the HTML structure and applies the Inter font.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered root layout component.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning は開発環境でサーバーとクライアントのHTMLが一時的に異なる場合に警告を抑制
    // classList を使うため className は維持
    <html className={inter.className} suppressHydrationWarning>
      <head />
      <body>
        <Provider>
          <Container maxW="90vw" py={6}>
            <MenuTabs />
            <BGMControlPanel />
            {children}
          </Container>
        </Provider>
      </body>
    </html>
  );
}
