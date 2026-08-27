# Field Atlas visual system

## Direction

The product is an **archival field atlas**: a private workbench for recovering a personal record, not a travel dashboard. The map is a sheet laid on a dark drafting table; the selected day is a ruled field ledger. Fine coordinate ticks, route keys, paper grain made only with CSS, and a hand-drawn folded-map mark establish a cartographic identity without ornamental imagery.

## Tokens

- Paper / background: `#F3ECDD`; raised paper: `#FFF9EB`; deep ink: `#182221`; muted ink: `#53605C`.
- Route rust / primary action: `#A83B24` (the thesis rust was darkened from `#C34E32` for accessible text); water: `#2B7184`; meadow: `#6C7B50`.
- Drafting-table surround: `#111918`; error: `#9D2F2B`; rule: `#B9B19F`.
- Type: a self-host-free humanist system stack (`Aptos`, `Segoe UI`, `Noto Sans`, sans-serif) with `ui-monospace` for coordinates and times. No font network requests.
- Spacing uses a 4/8 px rhythm. Controls are at least 44 px. Page measures cap readable copy near 70 characters.

This is intentionally a single warm-paper mode. It represents a physical archive, is painted explicitly at every surface, and has verified ink-on-paper contrast rather than following system dark mode.

## Interaction and motion

Controls use squared paper tabs and ruled underlines rather than generic floating cards. Rust means routes/actions, water means position/map, and meadow means visits. Focus is a high-contrast double ink/water ring. Ledger rows reveal detail in place; the map remains the work surface.

Motion is limited to a 180 ms paper-panel transition and a 600 ms one-shot route draw. Under `prefers-reduced-motion: reduce`, transitions and route animation are disabled and state changes are instant. No looping motion exists.

## Original assets and provenance

The folded-map/route icon in `public/icons/atlas.svg` was hand-authored for this product from basic SVG paths on 2026-08-27. PNG install icons reproduce that geometry through a local ImageMagick raster draw. No stock, generated, or third-party visual assets are used. OpenStreetMap tiles, when a user explicitly enables them while online, retain the required © OpenStreetMap attribution.
