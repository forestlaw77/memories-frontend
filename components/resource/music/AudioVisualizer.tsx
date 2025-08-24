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

import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useEffect, useRef } from "react";

const effectFunctionMap: {
  [key: string]: (
    analyser: AnalyserNode,
    dataArray: Uint8Array<ArrayBuffer>,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    bufferLength: number,
    ref: React.RefObject<any>
  ) => void;
} = {
  bar: barEffect,
  wave: waveEffect,
};

export default function AudioVisualizer() {
  const { audioRef, effectType } = useMusicPlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<
    { x: number; y: number; radius: number; opacity: number }[] | null
  >(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(
          audioRef.current
        );
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        analyserRef.current.fftSize = 256;
        console.log("new source");
      }
    }

    if (!analyserRef.current) {
      return;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!ctx || !canvas || !analyserRef.current) return;
      const effectFunction = effectFunctionMap[effectType];
      effectFunction(
        analyserRef.current,
        dataArray,
        ctx,
        canvas,
        bufferLength,
        ripplesRef
      );
      requestAnimationFrame(draw);
    }

    draw();
  }, [effectType, audioRef]);

  return (
    <div>
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
}

function barEffect(
  analyser: AnalyserNode,
  dataArray: Uint8Array<ArrayBuffer>,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  bufferLength: number
) {
  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 1.2;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] / 2;
    const hue = (i / bufferLength) * 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

function waveEffect(
  analyser: AnalyserNode,
  dataArray: Uint8Array<ArrayBuffer>,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  bufferLength: number,
  ripplesRef: React.RefObject<
    { x: number; y: number; radius: number; opacity: number }[]
  >
) {
  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const intensity = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

  // `ripplesRef.current` が `null` の場合は初期化
  if (!ripplesRef?.current) {
    ripplesRef.current = [];
  }

  // 波紋を追加
  ripplesRef.current.push({
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: intensity * 0.8,
    opacity: 1,
  });

  // 波紋の描画
  ripplesRef.current.forEach((ripple, index) => {
    ripple.radius += 1.5;
    ripple.opacity -= 0.02;

    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 255, 255, ${ripple.opacity})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ripple.x, canvas.height - ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.5})`;
    ctx.stroke();

    if (ripple.opacity <= 0) ripplesRef.current.splice(index, 1);
  });

  // `requestAnimationFrame()` を `waveEffect` 内で呼び出し、継続的な描画を確保
  requestAnimationFrame(() =>
    waveEffect(analyser, dataArray, ctx, canvas, bufferLength, ripplesRef)
  );
}
