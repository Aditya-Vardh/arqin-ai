"use client";

import { useEffect, useRef, useCallback } from "react";

const TILE_DESKTOP = 80;
const TILE_MOBILE = 56;
const POINTER_RADIUS = 70;
const INITIAL_ON_PROB = 0.045; // ~4.5% — restrained, not dominant

type TileEl = HTMLDivElement & {
  _offTimer?: ReturnType<typeof setTimeout>;
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
  // Stores the latest mouse position relative to the page for the glow rAF
  const glowMouseRef = useRef<{ x: number; y: number } | null>(null);

  const setTileOn = useCallback((tile: TileEl, on: boolean) => {
    const inner = tile.firstElementChild as HTMLElement | null;
    if (!inner) return;
    inner.style.transform = on ? "rotateX(180deg)" : "rotateX(0deg)";
    if (on) {
      tile.classList.add("is-on");
    } else {
      tile.classList.remove("is-on");
    }
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

    // Guard against zero dimensions (SSR or hidden elements)
    if (W === 0 || H === 0) return;

    const size = W >= 768 ? TILE_DESKTOP : TILE_MOBILE;
    tileSizeRef.current = size;

    const cols = Math.ceil(W / size);
    const rows = Math.ceil(H / size);
    colsRef.current = cols;
    rowsRef.current = rows;

    // Wipe old tiles, clear any pending timers
    tilesRef.current.forEach((row) =>
      row.forEach((t) => {
        if (t._offTimer) clearTimeout(t._offTimer);
      })
    );
    grid.innerHTML = "";
    tilesRef.current = [];

    // Size the grid to exactly cover the container
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
          transition:transform 650ms cubic-bezier(0.2,0.7,0.2,1), box-shadow 0.15s ease;
          will-change:transform;
        `;

        // Front face — dark graphite tile with subtle inset border + glow support
        const front = document.createElement("div");
        front.style.cssText = `
          position:absolute;inset:0;
          backface-visibility:hidden;-webkit-backface-visibility:hidden;
          background:#161B22;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,0.035), 0 0 18px rgba(214,173,105,calc(var(--glow,0)*0.25));
        `;

        // Back face — very subtle amber tint, not solid gold
        const back = document.createElement("div");
        back.style.cssText = `
          position:absolute;inset:0;
          backface-visibility:hidden;-webkit-backface-visibility:hidden;
          background:rgba(214,173,105,0.18);
          border:1px solid rgba(214,173,105,0.28);
          transform:rotateX(180deg);
        `;

        inner.appendChild(front);
        inner.appendChild(back);
        tile.appendChild(inner);
        grid.appendChild(tile);
        tilesRef.current[r][c] = tile;

        if (Math.random() < INITIAL_ON_PROB) {
          selected.push({ r, c, delay: (c + r) * 38 });
        }
      }
    }

    if (reducedMotionRef.current) {
      // Static — just flip selected tiles immediately
      for (const { r, c } of selected) {
        const t = tilesRef.current[r]?.[c];
        if (t) setTileOn(t, true);
      }
      return;
    }

    // Diagonal wave from top-left
    for (const { r, c, delay } of selected) {
      const t = tilesRef.current[r]?.[c];
      if (!t) continue;
      setTimeout(() => setTileOn(t, true), delay);
    }
  }, [setTileOn]);

  // Ambient shuffle — keep mosaic alive at rest
  const scheduleAmbientShuffle = useCallback(() => {
    if (reducedMotionRef.current) return;
    shuffleTimerRef.current = setTimeout(() => {
      const r = Math.floor(Math.random() * rowsRef.current);
      const c = Math.floor(Math.random() * colsRef.current);
      const tile = tilesRef.current[r]?.[c];
      if (tile) setTileOn(tile, !tile.classList.contains("is-on"));
      scheduleAmbientShuffle();
    }, 3500);
  }, [setTileOn]);

  // Idle probe — virtual pointer sweeps when user is not interacting
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
        // Lissajous-like path
        const px = rect.left + W * (0.5 + 0.38 * Math.sin(t * 0.55));
        const py = rect.top + H * (0.5 + 0.22 * Math.sin(t * 1.0));
        pointerEffect(px, py);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [pointerEffect]);

  // Reset all tile glow values to 0
  const resetAllGlow = useCallback(() => {
    tilesRef.current.forEach((row) => {
      row.forEach((tile) => {
        tile.style.setProperty("--glow", "0");
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

    // ── Glow effect — skip on touch devices and reduced motion ──────────────
    if (!isTouchRef.current && !reducedMotionRef.current) {
      const onMouseMove = (e: MouseEvent) => {
        glowMouseRef.current = { x: e.clientX, y: e.clientY };

        // Cancel any pending glow frame and schedule a fresh one
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
              const cx = c * size + size / 2;
              const cy = r * size + size / 2;
              const dist = Math.hypot(cx - lx, cy - ly);
              const glow = Math.max(0, 1 - dist / 140); // 140px radius, restrained
              tile.style.setProperty("--glow", glow.toFixed(3));
            });
          });
        });
      };

      const onMouseLeave = () => {
        glowMouseRef.current = null;
        if (glowRafRef.current) cancelAnimationFrame(glowRafRef.current);
        resetAllGlow();
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);
      container.addEventListener("mouseleave", onMouseLeave);

      // Resize: debounced rebuild
      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildGrid, 200);
      };
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
          row.forEach((t) => {
            if (t._offTimer) clearTimeout(t._offTimer);
          })
        );
      };
    }

    // No glow (touch or reduced motion) — still need resize and cleanup
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
        row.forEach((t) => {
          if (t._offTimer) clearTimeout(t._offTimer);
        })
      );
    };
  }, [buildGrid, scheduleAmbientShuffle, startProbeLoop, pointerEffect, resetAllGlow]);

  return (
    /*
      This div fills the hero section absolutely (z-0).
      overflow:hidden clips tiles that would extend beyond the container.
      pointer-events:none ensures tiles never block headline/CTA interaction.
    */
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <div
        ref={gridRef}
        style={{
          display: "grid",
          position: "absolute",
          top: 0,
          left: 0,
          /* tiles that extend past container edges are clipped by parent overflow:hidden */
        }}
      />
    </div>
  );
}
