'use client';
import { useEffect, useRef } from 'react';

type Candle = { o: number; c: number; h: number; l: number };

/** Decorative, endlessly streaming candlestick field. Prices are random and carry no meaning. */
export function MarketCanvas({ className, speed = 0.35 }: { className?: string; speed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = 18;
    const body = 8;
    const candles: Candle[] = [];
    let width = 0;
    let height = 0;
    let offset = 0;
    let price = 0.42;
    let raf = 0;
    let onScreen = true;

    const next = (): Candle => {
      const o = price;
      // Mean-reverting walk with a gentle upward bias, so the line reads as a climbing curve.
      const drift = (0.55 - price) * 0.035 + 0.003;
      const c = Math.min(0.9, Math.max(0.1, o + drift + (Math.random() - 0.5) * 0.07));
      price = c;
      return {
        o,
        c,
        h: Math.max(o, c) + Math.random() * 0.03,
        l: Math.min(o, c) - Math.random() * 0.03,
      };
    };
    const y = (v: number) => height * 0.12 + (1 - v) * height * 0.76;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Price gridlines — chart scaffolding, deliberately unlabelled (the data is decorative).
      ctx.strokeStyle = 'rgba(255,255,255,0.035)';
      ctx.lineWidth = 1;
      for (let g = 1; g < 5; g++) {
        const gy = Math.round(height * 0.12 + (height * 0.76 * g) / 5) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      for (let i = 0; i < candles.length; i++) {
        const k = candles[i]!;
        const x = i * step - offset;
        const up = k.c >= k.o;
        ctx.fillStyle = ctx.strokeStyle = up ? 'rgba(74,222,128,0.30)' : 'rgba(255,92,108,0.26)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + body / 2, y(k.h));
        ctx.lineTo(x + body / 2, y(k.l));
        ctx.stroke();
        const top = y(Math.max(k.o, k.c));
        ctx.fillRect(x, top, body, Math.max(1.5, y(Math.min(k.o, k.c)) - top));
      }
      // Area fill under the price line, for depth.
      const area = ctx.createLinearGradient(0, 0, 0, height);
      area.addColorStop(0, 'rgba(139,92,246,0.22)');
      area.addColorStop(0.55, 'rgba(139,92,246,0.06)');
      area.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = area;
      ctx.beginPath();
      ctx.moveTo(-step, height);
      candles.forEach((k, i) => ctx.lineTo(i * step - offset + body / 2, y(k.c)));
      ctx.lineTo(width + step, height);
      ctx.closePath();
      ctx.fill();

      const line = ctx.createLinearGradient(0, 0, width, 0);
      line.addColorStop(0, 'rgba(139,92,246,0)');
      line.addColorStop(0.45, 'rgba(167,139,250,0.6)');
      line.addColorStop(1, 'rgba(34,211,238,0.9)');
      ctx.strokeStyle = line;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(139,92,246,0.7)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      candles.forEach((k, i) => {
        const x = i * step - offset + body / 2;
        if (i) ctx.lineTo(x, y(k.c));
        else ctx.moveTo(x, y(k.c));
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glowing "live price" head on the newest candle, with a breathing halo.
      const head = candles[candles.length - 1];
      if (head) {
        const hx = (candles.length - 1) * step - offset + body / 2;
        const hy = y(head.c);
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 420);
        ctx.strokeStyle = 'rgba(34,211,238,0.14)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(0, hy);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(34,211,238,${0.10 + pulse * 0.16})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 7 + pulse * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(190,245,255,0.95)';
        ctx.shadowColor = 'rgba(34,211,238,0.9)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      while (candles.length < Math.ceil(width / step) + 2) candles.push(next());
      draw();
    };

    const tick = () => {
      offset += speed;
      if (offset >= step) {
        offset -= step;
        candles.shift();
        candles.push(next());
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && !reduced && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [speed]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
