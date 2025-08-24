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
//import { Button } from "@chakra-ui/react";
import type { Rendition } from "epubjs";
//import { useEffect, useRef, useState } from "react";
import { useRef, useState } from "react";
import { ReactReader } from "react-reader";

const EpubViewer: React.FC<{ url: string | ArrayBuffer | null }> = ({
  url,
}) => {
  //const [largeText, setLargeText] = useState(false);
  const rendition = useRef<Rendition | undefined>(undefined);
  const [location, setLocation] = useState<string | null>(null);
  if (!url) {
    return <></>;
  }
  // useEffect(() => {}, [largeText]);
  console.log(url);
  return (
    <div style={{ height: "90vh" }}>
      <ReactReader
        url={url}
        //url="/oreilly-978-4-87311-758-4e.epub"
        location={location}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;
          //rendition.current.themes.fontSize(largeText ? "200%" : "100%");
        }}
      />
    </div>
  );
};

export default EpubViewer;

{
  /* <Button onClick={() => setLargeText(!largeText)} className="btn">
  Toggle font-size
</Button>;
          rendition.current.themes.fontSize(largeText ? "200%" : "100%"); */
}
