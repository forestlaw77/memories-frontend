// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useEffect, useRef, useState } from "react";

export function SmartPhoneBarcodeScanner({
  onScanSuccess,
}: {
  onScanSuccess: (isbn: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("BarcodeDetector" in window)) {
      setError("このブラウザは BarcodeDetector に対応していません");
      return;
    }

    const barcodeDetector = new (window as any).BarcodeDetector({
      formats: ["ean_13", "code_128"],
    });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => setError("カメラアクセスに失敗しました: " + err));

    const scanBarcode = async () => {
      if (videoRef.current) {
        const barcodeResults = await barcodeDetector.detect(videoRef.current);
        if (barcodeResults.length > 0) {
          onScanSuccess(barcodeResults[0].rawValue);
        }
      }
    };

    const interval = setInterval(scanBarcode, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div>{error ? <p>{error}</p> : <video ref={videoRef} />}</div>;
}

import BarcodeScannerComponent, {
  BarcodeFormat,
} from "react-qr-barcode-scanner";

export function ReactBarcodeScanner({
  onScanSuccess,
}: {
  onScanSuccess: (isbn: string) => void;
}) {
  const [data, setData] = useState("");

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: 1280, height: 720 },
  });

  return (
    <div>
      <BarcodeScannerComponent
        formats={[BarcodeFormat.EAN_13, BarcodeFormat.CODE_128]}
        onUpdate={(err, result) => {
          if (result) {
            setData(result.getText());
            onScanSuccess(result.getText()); // ✅ スキャン結果を親コンポーネントに渡す！
          }
        }}
      />
      <p>Scanned ISBN: {data}</p>
    </div>
  );
}

import { Html5QrcodeScanner } from "html5-qrcode";

export default function BarcodeScanner({
  onScanSuccess,
}: {
  onScanSuccess: (barcodeText: string) => void;
}) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      scannerRef.current.id,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        // formatsToSupport: [
        //   Html5QrcodeSupportedFormats.EAN_13,
        //   Html5QrcodeSupportedFormats.CODE_39,
        //   Html5QrcodeSupportedFormats.CODE_128,
        // ],
      },
      false
    );

    scanner.render(
      (decodedText: string, _) => {
        onScanSuccess(decodedText);
        scanner.clear(); // 一度スキャンしたら停止（連続スキャンを防ぐ）
      },
      (errorMessage) => {
        // スキャンエラー時（オプション）
        console.log("Scan error:", errorMessage);
      }
    );

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div>
      <div id="html5qr-code-full-region" ref={scannerRef} />
    </div>
  );
}
