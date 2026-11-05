"use client";

import { useEffect, useRef, useCallback } from "react";

const TILE_DESKTOP = 80;
const TILE_MOBILE = 56;
const POINTER_RADIUS = 72;
const INITIAL_ON_PROB = 0.05;
// Glow at full proximity — clearly visible amber, not subtle
const GLOW_COLOR = "214,173,105";
const GLOW_MAX_ALPHA = 0.55;
const GLOW_RADIUS_PX = 160;

type TileEl = HTMLDivElement & {
  _offTimer?: ReturnType<typeof setTimeout>;
  _front?: HTMLDivElement; // direct ref to front face for fast glow updates
};

export default function TileMosaic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<TileEl[][]>([]);
  const colsRef = useRef(0);
  const rowsRef = useRef(0);
  const tileSizeRef = useRef(TILE_DESKTOP);
  const rafRef = useRef<number>(0);
  const glowRafRef = useRef<number>(0);
  const mountTimeRef = useRef(Date.now());
  const lastPointerRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(false);
  const isTouchRef = useRef(false);
  const glowMouseRef = useRef<{ x: number; y: number } | null>(null);

  const setTileOn = useCallback((tile: TileEl, on: boolean) => {
    const inner = tile.firstElementChild as HTMLElement | null;
    if (!inner) return;
    inner.style.transform = on ? "rotateX(180deg)" : "rotateX(0deg)";
    if (on) tile.classList.add("is-on");
    else tile.classList.remove("is-on");
  }, []);

  const activateTileTemporarily = useCallback(
    (tile: TileEl) => {
      if (tile._offTimer) return;
      setTileOn(tile, true);
      tile._offTimer = setTimeout(() => {
        setTileOn(tile, false);
        tile._offTimer = undefined;
      }, 900);
    },
    [setTileOn]
  );

  const pointerEffect = useCallback(
    (clientX: number, clientY: number) => {
      const grid = gridRef.current;
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;
      const size = tileSizeRef.current;
      const radius = POINTER_RADIUS;

      const c0 = Math.max(0, Math.floor((lx - radius) / size));
      const c1 = Math.min(colsRef.current - 1, Math.floor((lx + radius) / size));
      const r0 = Math.max(0, Math.floor((ly - radius) / size));
      const r1 = Math.min(rowsRef.current - 1, Math.floor((ly + radius) / size));

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const tile = tilesRef.current[r]?.[c];
          if (!tile) continue;
          const cx = c * size + size / 2;
          const cy = r * size + size / 2;
          if (Math.hypot(cx - lx, cy - ly) <= radius) {
            activateTileTemporarily(tile);
          }
        }
      }
    },
    [activateTileTemporarily]
  );

  const buildGrid = useCallback(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return;

    const W = container.offsetWidth;
    const H = container.offsetHeight;
    if (W === 0 || H === 0) return;

    const size = W >= 768 ? TILE_DESKTOP : TILE_MOBILE;
    tileSizeRef.current = size;

    const cols = Math.ceil(W / size);
    const rows = Math.ceil(H / size);
    colsRef.current = cols;
    rowsRef.current = rows;

    tilesRef.current.forEach((row) =>
      row.forEach((t) => { if (t._offTimer) clearTimeout(t._offTimer); })
    );
    grid.innerHTML = "";
    tilesRef.current = [];

    grid.style.width = `${cols * size}px`;
    grid.style.height = `${rows * size}px`;
    grid.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${size}px)`;

    const selected: { r: number; c: number; delay: number }[] = [];

    for (let r = 0; r < rows; r++) {
      tilesRef.current[r] = [];
      for (let c = 0; c < cols; c++) {
        const tile = document.createElement("div") as TileEl;
        tile.setAttribute("aria-hidden", "true");
        tile.style.cssText = `width:${size}px;height:${size}px;perspective:800px;position:relative;overflow:hidden;`;

        const inner = document.createElement("div");
        inner.style.cssText = `
          position:absolute;inset:0;
          transform-style:preserve-3d;
          transition:transform 620ms cubic-bezier(0.2,0.7,0.2,1);
          will-change:transform;
        `;

        // Front face — store direct reference so glow can be set without CSS var inheritance
        const front = document.createElement("div") as HTMLDivElement;
        front.style.cssText = `
          position:absolute;inset:0;
          backface-visibility:hidden;-webkit-backface-visibility:hidden;
          background:#161B22;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,0.035);
          transition:box-shadow 0.12s ease;
        `;
        tile._front = front;

        // Back face — muted amber tint (not solid gold)
        const back = document.createElement("div");
        back.style.cssText = `
          position:absolute;inset:0;
          backface-visibility:hidden;-webkit-backface-visibility:hidden;
          background:rgba(214,173,105,0.20);
          border:1px solid rgba(214,173,105,0.30);
          transform:rotateX(180deg);
        `;

        inner.appendChild(front);
        inner.appendChild(back);
        tile.appendChild(inner);
        grid.appendChild(tile);
        tilesRef.current[r][c] = tile;

        if (Math.random() < INITIAL_ON_PROB) {
          selected.push({ r, c, delay: (c + r) * 35 });
        }
      }
    }

    if (reducedMotionRef.current) {
      for (const { r, c } of selected) {
        const t = tilesRef.current[r]?.[c];
        if (t) setTileOn(t, true);
      }
      return;
    }

    for (const { r, c, delay } of selected) {
      const t = tilesRef.current[r]?.[c];
      if (!t) continue;
      setTimeout(() => setTileOn(t, true), delay);
    }
  }, [setTileOn]);

  const scheduleAmbientShuffle = useCallback(() => {
    if (reducedMotionRef.current) return;
    shuffleTimerRef.current = setTimeout(() => {
      const r = Math.floor(Math.random() * rowsRef.current);
      const c = Math.floor(Math.random() * colsRef.current);
      const tile = tilesRef.current[r]?.[c];
      if (tile) setTileOn(tile, !tile.classList.contains("is-on"));
      scheduleAmbientShuffle();
    }, 3200);
  }, [setTileOn]);

  const startProbeLoop = useCallback(() => {
    if (reducedMotionRef.current) return;
    const loop = () => {
      const container = containerRef.current;
      if (!container) return;
      const now = Date.now();
      const last = lastPointerRef.current;
      if (!last || now - last.t > 1500) {
        const t = (now - mountTimeRef.current) / 1000;
        const W = container.offsetWidth;
        const H = container.offsetHeight;
        const rect = container.getBoundingClientRect();
        const px = rect.left + W * (0.5 + 0.38 * Math.sin(t * 0.55));
        const py = rect.top + H * (0.5 + 0.22 * Math.sin(t * 1.0));
        pointerEffect(px, py);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [pointerEffect]);

  const resetAllGlow = useCallback(() => {
    tilesRef.current.forEach((row) => {
      row.forEach((tile) => {
        if (tile._front) {
          tile._front.style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.035)";
        }
      });
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    isTouchRef.current = "ontouchstart" in window;

    buildGrid();

    if (!reducedMotionRef.current) {
      scheduleAmbientShuffle();
      startProbeLoop();
    }

    const container = containerRef.current;
    if (!container) return;

    const onPointer = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      pointerEffect(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      lastPointerRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
      pointerEffect(touch.clientX, touch.clientY);
    };

    container.addEventListener("pointermove", onPointer);
    container.addEventListener("touchmove", onTouch, { passive: true });

    // ── Glow: set box-shadow directly on front face element (bypasses CSS var inheritance issues) ──
    if (!isTouchRef.current && !reducedMotionRef.current) {
      const onMouseMove = (e: MouseEvent) => {
        glowMouseRef.current = { x: e.clientX, y: e.clientY };
        if (glowRafRef.current) cancelAnimationFrame(glowRafRef.current);
        glowRafRef.current = requestAnimationFrame(() => {
          const pos = glowMouseRef.current;
          if (!pos) return;
          const grid = gridRef.current;
          if (!grid) return;
          const rect = grid.getBoundingClientRect();
          const size = tileSizeRef.current;
          const lx = pos.x - rect.left;
          const ly = pos.y - rect.top;

          tilesRef.current.forEach((row, r) => {
            row.forEach((tile, c) => {
              if (!tile._front) return;
              const cx = c * size + size / 2;
              const cy = r * size + size / 2;
              const dist = Math.hypot(cx - lx, cy - ly);
              const t = Math.max(0, 1 - dist / GLOW_RADIUS_PX);
              if (t > 0.005) {
                const alpha = (t * GLOW_MAX_ALPHA).toFixed(3);
                const spread = Math.round(t * 22);
                tile._front.style.boxShadow =
                  `inset 0 0 0 1px rgba(255,255,255,0.035), 0 0 ${spread}px rgba(${GLOW_COLOR},${alpha})`;
              } else {
                tile._front.style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.035)";
              }
            });
          });
        });
      };

      const onMouseLeave = () => {
        glowMouseRef.current = null;
        if (glowRafRef.current) cancelAnimationFrame(glowRafRef.current);
        resetAllGlow();
      };

      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildGrid, 200);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);
      container.addEventListener("mouseleave", onMouseLeave);
      window.addEventListener("resize", onResize);

      return () => {
        container.removeEventListener("pointermove", onPointer);
        container.removeEventListener("touchmove", onTouch);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
        container.removeEventListener("mouseleave", onMouseLeave);
        window.removeEventListener("resize", onResize);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (glowRafRef.current) cancelAnimationFrame(glowRafRef.current);
        if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
        tilesRef.current.forEach((row) =>
          row.forEach((t) => { if (t._offTimer) clearTimeout(t._offTimer); })
        );
      };
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildGrid, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      container.removeEventListener("pointermove", onPointer);
      container.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (glowRafRef.current) cancelAnimationFrame(glowRafRef.current);
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      tilesRef.current.forEach((row) =>
        row.forEach((t) => { if (t._offTimer) clearTimeout(t._offTimer); })
      );
    };
  }, [buildGrid, scheduleAmbientShuffle, startProbeLoop, pointerEffect, resetAllGlow]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <div
        ref={gridRef}
        style={{ display: "grid", position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}
