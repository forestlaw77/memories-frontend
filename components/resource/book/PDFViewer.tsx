// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import React, { useEffect } from "react";
const PDFViewer: React.FC<{ url: string }> = ({ url }) => {
  useEffect(() => {
    function adjustIframeHeight() {
      const iframe = document.getElementById("bookPreviewIframe");
      if (iframe) {
        const topOffset = iframe.getBoundingClientRect().top;
        iframe.style.height = `${window.innerHeight - topOffset}px`;
        iframe.style.display = "block"; // 初期表示を確実に適用
      }
    }

    // 初回表示時に確実に適用
    setTimeout(adjustIframeHeight, 2000); // 少し遅らせることで描画後に適用

    window.addEventListener("resize", adjustIframeHeight);

    return () => {
      window.removeEventListener("resize", adjustIframeHeight);
    };
  }, []);
  return (
    <iframe
      id="bookPreviewIframe"
      src={url}
      style={{ width: "100%", border: "none" }}
    ></iframe>
  );
};

export default PDFViewer;
