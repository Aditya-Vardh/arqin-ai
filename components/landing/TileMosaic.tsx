"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Tuning constants ────────────────────────────────────────────────────────
const TILE_SIZE_DESKTOP = 72;
const TILE_SIZE_MOBILE  = 52;
const FLIP_RADIUS       = 80;   // px — tiles within this radius of cursor flip
const GLOW_RADIUS       = 180;  // px — glow falloff distance
const GLOW_MAX_ALPHA    = 0.60; // max amber glow opacity on front face
const FLIP_DURATION     = "600ms";
const INITIAL_ON_PROB   = 0.055; // ~5.5% of tiles start flipped
const AMBIENT_INTERVAL  = 2800; // ms between ambient random flips
const FLIP_AUTO_OFF_MS  = 950;  // ms before pointer-triggered tile flips back

// Amber RGB for glow (hardcoded — not via CSS var to avoid inheritance issues)
const AMBER_R = 214, AMBER_G = 173, AMBER_B = 105;

type TileEl = HTMLDivElement & {
  _timer?: ReturnType<typeof setTimeout>;
  _face?: HTMLDivElement; // direct ref to front face
};

export default function TileMosaic() {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);
  const tiles        = useRef<TileEl[][]>([]);
  const cols         = useRef(0);
  const rows         = useRef(0);
  const tileSize     = useRef(TILE_SIZE_DESKTOP);
  const probeRaf     = useRef(0);
  const glowRaf      = useRef(0);
  const mountTime    = useRef(Date.now());
  const lastMouse    = useRef<{ x: number; y: number; t: number } | null>(null);
  const ambientTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noMotion     = useRef(false);
  const isTouch      = useRef(false);
  const mousePos     = useRef<{ x: number; y: number } | null>(null);

  // ── Flip a tile on/off ─────────────────────────────────────────────────────
  const flipTile = useCallback((tile: TileEl, on: boolean) => {
    const inner = tile.firstElementChild as HTMLElement | null;
    if (!inner) return;
    inner.style.transform = on ? "rotateX(180deg)" : "rotateX(0deg)";
    tile.dataset.on = on ? "1" : "0";
  }, []);

  // ── Flip tile then auto-restore after delay ────────────────────────────────
  const flipTemp = useCallback((tile: TileEl) => {
    if (tile._timer) return; // already in a flip cycle
    flipTile(tile, true);
    tile._timer = setTimeout(() => {
      flipTile(tile, false);
      tile._timer = undefined;
    }, FLIP_AUTO_OFF_MS);
  }, [flipTile]);

  // ── Flip tiles near a screen coordinate ───────────────────────────────────
  const flipNear = useCallback((clientX: number, clientY: number) => {
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    const sz = tileSize.current;

    const c0 = Math.max(0, Math.floor((lx - FLIP_RADIUS) / sz));
    const c1 = Math.min(cols.current - 1, Math.floor((lx + FLIP_RADIUS) / sz));
    const r0 = Math.max(0, Math.floor((ly - FLIP_RADIUS) / sz));
    const r1 = Math.min(rows.current - 1, Math.floor((ly + FLIP_RADIUS) / sz));

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const t = tiles.current[r]?.[c];
        if (!t) continue;
        if (Math.hypot(c * sz + sz / 2 - lx, r * sz + sz / 2 - ly) <= FLIP_RADIUS) {
          flipTemp(t);
        }
      }
    }
  }, [flipTemp]);

  // ── Build the tile grid ────────────────────────────────────────────────────
  const buildGrid = useCallback(() => {
    const wrap = wrapRef.current;
    const grid = gridRef.current;
    if (!wrap || !grid) return;

    const W = wrap.offsetWidth;
    const H = wrap.offsetHeight;
    if (W === 0 || H === 0) return;

    const sz = W >= 768 ? TILE_SIZE_DESKTOP : TILE_SIZE_MOBILE;
    tileSize.current = sz;

    const nc = Math.ceil(W / sz);
    const nr = Math.ceil(H / sz);
    cols.current = nc;
    rows.current = nr;

    // Clear old tiles
    tiles.current.forEach(row => row.forEach(t => { if (t._timer) clearTimeout(t._timer); }));
    grid.innerHTML = "";
    tiles.current = [];

    grid.style.cssText = `
      display:grid;
      position:absolute;top:0;left:0;
      width:${nc * sz}px;height:${nr * sz}px;
      grid-template-columns:repeat(${nc},${sz}px);
      grid-template-rows:repeat(${nr},${sz}px);
    `;

    const toFlip: { r: number; c: number; delay: number }[] = [];

    for (let r = 0; r < nr; r++) {
      tiles.current[r] = [];
      for (let c = 0; c < nc; c++) {
        const tile = document.createElement("div") as TileEl;
        tile.style.cssText = `
          width:${sz}px;height:${sz}px;
          position:relative;overflow:hidden;
          perspective:900px;
        `;
        tile.setAttribute("aria-hidden", "true");
        tile.dataset.on = "0";

        // Inner flipper
        const inner = document.createElement("div");
        inner.style.cssText = `
          position:absolute;inset:0;
          transform-style:preserve-3d;
          transition:transform ${FLIP_DURATION} cubic-bezier(0.2,0.8,0.2,1);
          will-change:transform;
        `;

        // Front face — dark graphite with glow
        const front = document.createElement("div") as HTMLDivElement;
        front.style.cssText = `
          position:absolute;inset:0;
          backface-visibility:hidden;-webkit-backface-visibility:hidden;
          background:#141820;
          box-shadow:inset 0 0 0 0.5px rgba(255,255,255,0.04);
          transition:box-shadow 0.1s linear;
        `;
        tile._face = front;

        // Back face — warm amber tint
        const back = document.createElement("div");
        back.style.cssText = `
          position:absolute;inset:0;
          backface-visibility:hidden;-webkit-backface-visibility:hidden;
          background:rgba(214,173,105,0.22);
          box-shadow:inset 0 0 0 0.5px rgba(214,173,105,0.35);
          transform:rotateX(180deg);
        `;

        inner.appendChild(front);
        inner.appendChild(back);
        tile.appendChild(inner);
        grid.appendChild(tile);
        tiles.current[r][c] = tile;

        if (Math.random() < INITIAL_ON_PROB) {
          toFlip.push({ r, c, delay: (c + r) * 32 });
        }
      }
    }

    if (noMotion.current) {
      toFlip.forEach(({ r, c }) => {
        const t = tiles.current[r]?.[c];
        if (t) flipTile(t, true);
      });
      return;
    }

    // Diagonal wave entrance
    toFlip.forEach(({ r, c, delay }) => {
      const t = tiles.current[r]?.[c];
      if (!t) return;
      setTimeout(() => flipTile(t, true), delay);
    });
  }, [flipTile]);

  // ── Ambient random flip ────────────────────────────────────────────────────
  const scheduleAmbient = useCallback(() => {
    if (noMotion.current) return;
    ambientTimer.current = setTimeout(() => {
      const r = Math.floor(Math.random() * rows.current);
      const c = Math.floor(Math.random() * cols.current);
      const t = tiles.current[r]?.[c];
      if (t && !t._timer) flipTemp(t);
      scheduleAmbient();
    }, AMBIENT_INTERVAL + Math.random() * 800);
  }, [flipTemp]);

  // ── Idle probe — slow Lissajous sweep when mouse is away ──────────────────
  const startProbe = useCallback(() => {
    if (noMotion.current) return;
    const loop = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const now = Date.now();
      const last = lastMouse.current;
      if (!last || now - last.t > 2000) {
        const t  = (now - mountTime.current) / 1000;
        const W  = wrap.offsetWidth;
        const H  = wrap.offsetHeight;
        const rc = wrap.getBoundingClientRect();
        flipNear(
          rc.left + W * (0.5 + 0.40 * Math.sin(t * 0.45)),
          rc.top  + H * (0.5 + 0.20 * Math.sin(t * 0.90))
        );
      }
      probeRaf.current = requestAnimationFrame(loop);
    };
    probeRaf.current = requestAnimationFrame(loop);
  }, [flipNear]);

  // ── Update per-tile glow from current mouse position ──────────────────────
  const updateGlow = useCallback(() => {
    const pos  = mousePos.current;
    const grid = gridRef.current;
    if (!grid) return;

    if (!pos) {
      // Reset all glows
      tiles.current.forEach(row =>
        row.forEach(t => {
          if (t._face) t._face.style.boxShadow = "inset 0 0 0 0.5px rgba(255,255,255,0.04)";
        })
      );
      return;
    }

    const rect = grid.getBoundingClientRect();
    const sz   = tileSize.current;
    const lx   = pos.x - rect.left;
    const ly   = pos.y - rect.top;

    tiles.current.forEach((row, r) => {
      row.forEach((tile, c) => {
        if (!tile._face) return;
        const dist = Math.hypot(c * sz + sz / 2 - lx, r * sz + sz / 2 - ly);
        const t    = Math.max(0, 1 - dist / GLOW_RADIUS);
        if (t < 0.006) {
          tile._face.style.boxShadow = "inset 0 0 0 0.5px rgba(255,255,255,0.04)";
        } else {
          const a  = (t * GLOW_MAX_ALPHA).toFixed(3);
          const sp = Math.round(t * 24);
          tile._face.style.boxShadow =
            `inset 0 0 0 0.5px rgba(255,255,255,0.04), 0 0 ${sp}px rgba(${AMBER_R},${AMBER_G},${AMBER_B},${a})`;
        }
      });
    });
  }, []);

  // ── Main effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    noMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    isTouch.current  = "ontouchstart" in window;

    buildGrid();
    if (!noMotion.current) {
      scheduleAmbient();
      startProbe();
    }

    // Mouse events on window — works even though container has pointer-events:none
    const onMouseMove = (e: MouseEvent) => {
      lastMouse.current  = { x: e.clientX, y: e.clientY, t: Date.now() };
      mousePos.current   = { x: e.clientX, y: e.clientY };

      // Flip tiles near cursor
      flipNear(e.clientX, e.clientY);

      // Schedule glow update
      if (glowRaf.current) cancelAnimationFrame(glowRaf.current);
      glowRaf.current = requestAnimationFrame(updateGlow);
    };

    const onMouseLeave = () => {
      mousePos.current = null;
      if (glowRaf.current) cancelAnimationFrame(glowRaf.current);
      glowRaf.current = requestAnimationFrame(updateGlow);
    };

    // Touch — flip only, no glow
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      lastMouse.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
      flipNear(touch.clientX, touch.clientY);
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(buildGrid, 150); };

    if (!isTouch.current && !noMotion.current) {
      window.addEventListener("mousemove",  onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("mouseleave", onMouseLeave);
    }
    window.addEventListener("touchmove", onTouchMove, { passive: true } as AddEventListenerOptions);
    window.addEventListener("resize",    onResize);

    return () => {
      window.removeEventListener("mousemove",    onMouseMove);
      window.removeEventListener("mouseleave",   onMouseLeave);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove",    onTouchMove);
      window.removeEventListener("resize",       onResize);
      if (probeRaf.current)     cancelAnimationFrame(probeRaf.current);
      if (glowRaf.current)      cancelAnimationFrame(glowRaf.current);
      if (ambientTimer.current) clearTimeout(ambientTimer.current);
      tiles.current.forEach(row => row.forEach(t => { if (t._timer) clearTimeout(t._timer); }));
    };
  }, [buildGrid, scheduleAmbient, startProbe, flipNear, updateGlow]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <div ref={gridRef} />
    </div>
  );
}
