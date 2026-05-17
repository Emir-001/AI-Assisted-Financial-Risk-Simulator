"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@wrksz/themes/client";

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

interface TrendLine {
  startIdx: number;
  startValue: number; // Y offset from high/low
  endIdx: number;
  endValue: number;
  color: string;
  isDashed: boolean;
}



export function StockBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Candle spacing parameters
    const candleWidth = 7;
    const candleGap = 7;
    const step = candleWidth + candleGap; // 14 pixels per candle

    // Resizing handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Setup initial candles
    const maxCandles = Math.ceil(width / step) + 5;
    const candles: Candle[] = [];
    let currentVal = height * 0.45;
    let globalCandleIndex = 0;

    const generateCandle = (prevVal: number): Candle => {
      // Create some macro waves using global index to prevent sudden jumping/teleporting
      const wave = Math.sin(globalCandleIndex * 0.08) * 35 + Math.cos(globalCandleIndex * 0.04) * 20;
      const trend = -0.15; // slight upward drift (downward Y)
      const change = (Math.random() * 22 - 11) + trend + wave * 0.05;

      const open = prevVal;
      // Keep within bounds
      const close = Math.max(height * 0.2, Math.min(height * 0.78, open - change));

      const bodyMin = Math.min(open, close);
      const bodyMax = Math.max(open, close);
      const high = Math.max(height * 0.15, bodyMin - Math.random() * 12);
      const low = Math.min(height * 0.85, bodyMax + Math.random() * 12);

      globalCandleIndex++;
      return { open, close, high, low };
    };

    // Populate initial candles
    for (let i = 0; i < maxCandles; i++) {
      const prev = candles.length > 0 ? candles[candles.length - 1].close : currentVal;
      candles.push(generateCandle(prev));
    }

    // Scrolling and animation states
    let scrollOffset = 0;
    const scrollSpeed = 0.07; // Very slow and calm scrolling (yavaşça)
    let livePriceY = candles[candles.length - 1].close;
    let liveTargetY = livePriceY;
    let liveFluctuationTime = 0;

    // Scrolling Trend Lines (index-based, synchronized with candles)
    let trendLines: TrendLine[] = [
      { startIdx: 5, startValue: -30, endIdx: 28, endValue: 40, color: "rgba(59, 130, 246, 0.35)", isDashed: false },
      { startIdx: 32, startValue: -40, endIdx: 50, endValue: -10, color: "rgba(59, 130, 246, 0.35)", isDashed: false }
    ];

    const generateNewTrendLine = () => {
      const startIdx = candles.length - 25;
      const endIdx = candles.length - 2;
      const startVal = Math.random() * 60 - 30;
      const endVal = Math.random() * 40 - 20;
      trendLines.push({
        startIdx,
        startValue: startVal,
        endIdx,
        endValue: endVal,
        color: "rgba(59, 130, 246, 0.35)",
        isDashed: false
      });
    };

    // Main animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clean canvas
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === "dark";

      // Dynamic Styling Palette (Muted background opacities)
      const gridColor = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.015)";
      const axisColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)";
      const textColor = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.25)";

      const greenBody = isDark ? "rgba(16, 185, 129, 0.16)" : "rgba(16, 185, 129, 0.08)";
      const greenWick = isDark ? "rgba(16, 185, 129, 0.35)" : "rgba(16, 185, 129, 0.2)";

      const redBody = isDark ? "rgba(239, 68, 68, 0.16)" : "rgba(239, 68, 68, 0.08)";
      const redWick = isDark ? "rgba(239, 68, 68, 0.35)" : "rgba(239, 68, 68, 0.2)";

      const MAColor = isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.08)"; // Orange Moving Average
      const waterColor = isDark ? "rgba(255, 255, 255, 0.01)" : "rgba(0, 0, 0, 0.007)";


      // --- 2. Grid lines ---
      ctx.lineWidth = 1;
      ctx.strokeStyle = gridColor;

      // Vertical grid lines scrolling along with the ticker
      const gridScroll = (scrollOffset * -1) % 45;
      for (let x = gridScroll; x < width; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y < height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- 3. Scroll Update Logic ---
      scrollOffset += scrollSpeed;
      if (scrollOffset >= step) {
        scrollOffset -= step; // Maintain remainder for pixel-perfect smoothness

        // Remove oldest candle on left, push new candle on right
        candles.shift();
        const lastCandleVal = candles[candles.length - 1].close;
        candles.push(generateCandle(lastCandleVal));

        // Adjust trend lines indexes due to shift
        trendLines.forEach(line => {
          line.startIdx--;
          line.endIdx--;
        });

        // Filter out expired trend lines that scrolled off screen
        trendLines = trendLines.filter(line => line.endIdx >= 0);

        // Periodically generate new trend lines to keep the graph decorated
        if (trendLines.length < 2 && Math.random() < 0.15) {
          generateNewTrendLine();
        }
      }

      // Live price fluctuation tracker
      liveFluctuationTime += 0.03;
      if (Math.random() < 0.05) {
        liveTargetY = candles[candles.length - 1].close + (Math.random() * 10 - 5);
      }
      livePriceY += (liveTargetY - livePriceY) * 0.05;
      candles[candles.length - 1].close = livePriceY;

      // Ensure Y limits for high/low of live candle
      const liveCandle = candles[candles.length - 1];
      liveCandle.high = Math.min(liveCandle.high, livePriceY - 3);
      liveCandle.low = Math.max(liveCandle.low, livePriceY + 3);

      // --- 4. Draw Trend Lines ---
      trendLines.forEach(line => {
        const startCandle = candles[line.startIdx];
        const endCandle = candles[line.endIdx];
        if (!startCandle || !endCandle) return;

        const x1 = line.startIdx * step - scrollOffset + candleWidth / 2;
        const y1 = startCandle.high + line.startValue;
        const x2 = line.endIdx * step - scrollOffset + candleWidth / 2;
        const y2 = endCandle.low + line.endValue;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.5;
        if (line.isDashed) {
          ctx.setLineDash([4, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset
      });

      // --- 5. Draw Horizontal Support & Resistance Lines (from user screenshot) ---
      const supportY = height * 0.62;
      const resistanceY = height * 0.38;

      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = isDark ? "rgba(59, 130, 246, 0.22)" : "rgba(37, 99, 235, 0.12)";

      // Support line
      ctx.beginPath();
      ctx.moveTo(0, supportY);
      ctx.lineTo(width - 55, supportY);
      ctx.stroke();

      // Resistance line
      ctx.beginPath();
      ctx.moveTo(0, resistanceY);
      ctx.lineTo(width - 55, resistanceY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Support & Resistance Price tags (on right axis)
      ctx.font = "bold 9px monospace";

      // Resistance tag (59.80 in dark/black box)
      ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - 52, resistanceY - 7, 45, 14, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
      ctx.textAlign = "center";
      ctx.fillText("59.80", width - 30, resistanceY + 3);

      // Support tag (40.06 in red outline box)
      ctx.fillStyle = isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.04)";
      ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
      ctx.beginPath();
      ctx.roundRect(width - 52, supportY - 7, 45, 14, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(239, 68, 68, 0.7)";
      ctx.fillText("40.06", width - 30, supportY + 3);

      // --- 6. Draw Candlesticks & Moving Average ---
      const maPoints: { x: number; y: number }[] = [];
      const maPeriod = 7;

      for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const x = i * step - scrollOffset;

        // Skip drawing if completely off-screen
        if (x < -20 || x > width + 20) continue;

        const isGreen = candle.close <= candle.open; // Bullish (price went up)
        const bodyMin = Math.min(candle.open, candle.close);
        const bodyMax = Math.max(candle.open, candle.close);

        // Wick (Shadow line)
        ctx.strokeStyle = isGreen ? greenWick : redWick;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, candle.high);
        ctx.lineTo(x + candleWidth / 2, candle.low);
        ctx.stroke();

        // Body block
        ctx.fillStyle = isGreen ? greenBody : redBody;
        ctx.strokeStyle = isGreen ? greenWick : redWick;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x, bodyMin, candleWidth, Math.max(1.5, bodyMax - bodyMin));
        ctx.fill();
        ctx.stroke();

        // Calculate Simple Moving Average (SMA) point
        if (i >= maPeriod) {
          let sum = 0;
          for (let k = 0; k < maPeriod; k++) {
            sum += (candles[i - k].open + candles[i - k].close) / 2;
          }
          maPoints.push({ x: x + candleWidth / 2, y: sum / maPeriod });
        }
      }

      // Draw Moving Average Line
      if (maPoints.length > 1) {
        ctx.strokeStyle = MAColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(maPoints[0].x, maPoints[0].y);
        for (let i = 1; i < maPoints.length; i++) {
          ctx.lineTo(maPoints[i].x, maPoints[i].y);
        }
        ctx.stroke();
      }

      // --- 7. Live Price Tracker (glowing line & pulsing tag on rightmost side) ---
      const rightX = (candles.length - 1) * step - scrollOffset + candleWidth / 2;
      const pulsingRadius = 4 + Math.sin(liveFluctuationTime * 3) * 1.5;

      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.18)";

      // Tracker line extending to right edge
      ctx.beginPath();
      ctx.moveTo(rightX, livePriceY);
      ctx.lineTo(width - 55, livePriceY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Pulse ring at rightmost candle
      ctx.beginPath();
      ctx.arc(rightX, livePriceY, pulsingRadius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.06)";
      ctx.fill();

      // Core center of live price
      ctx.beginPath();
      ctx.arc(rightX, livePriceY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();

      // Right axis live price badge (black/green pulsing tag)
      ctx.fillStyle = isDark ? "#064e3b" : "#d1fae5";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(width - 52, livePriceY - 7, 45, 14, 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = "bold 9px monospace";
      ctx.fillStyle = isDark ? "#34d399" : "#065f46";
      ctx.textAlign = "center";

      // Calculate realistic active index price text (e.g. 40.76)
      const currentLivePrice = ((height - livePriceY) * 0.12 + 25.4).toFixed(2);
      ctx.fillText(currentLivePrice, width - 30, livePriceY + 3);

      // --- 8. Vertical Axis Border ---
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width - 55, 0);
      ctx.lineTo(width - 55, height - 32);
      ctx.stroke();

      // Horizontal Axis Border
      ctx.beginPath();
      ctx.moveTo(0, height - 32);
      ctx.lineTo(width, height - 32);
      ctx.stroke();

      animationId = requestAnimationFrame(animate);
    };

    // Fire animation loop
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [mounted, theme]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ mixBlendMode: "normal" }}
      />
    </div>
  );
}
