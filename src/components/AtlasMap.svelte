<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { TimelineEvent, Point } from '../lib/types';
  export let events: TimelineEvent[] = [];
  export let online = false;
  export let ononlinechange: (value: boolean) => void;

  let mapElement: HTMLDivElement;
  let leafletMap: any;
  let loadError = '';
  $: points = events.flatMap((event) => event.points).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
  $: bounds = getBounds(points);
  $: svgPaths = events.filter((event) => event.points.length).map((event) => ({ kind: event.kind, path: event.points.map(project).join(' ') }));
  $: if (online && mapElement) void buildOnlineMap();
  $: if (!online && leafletMap) { leafletMap.remove(); leafletMap = undefined; }

  function getBounds(items: Point[]) {
    if (!items.length) return { minLat: -1, maxLat: 1, minLng: -1, maxLng: 1 };
    let minLat = Math.min(...items.map((p) => p.lat));
    let maxLat = Math.max(...items.map((p) => p.lat));
    let minLng = Math.min(...items.map((p) => p.lng));
    let maxLng = Math.max(...items.map((p) => p.lng));
    if (minLat === maxLat) { minLat -= .005; maxLat += .005; }
    if (minLng === maxLng) { minLng -= .005; maxLng += .005; }
    return { minLat, maxLat, minLng, maxLng };
  }

  function project(point: Point): string {
    const x = 7 + ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 86;
    const y = 7 + (1 - (point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 86;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }

  async function buildOnlineMap() {
    if (leafletMap) return;
    try {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      if (!online || !mapElement) return;
      leafletMap = L.map(mapElement, { zoomControl: true, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap);
      for (const event of events) {
        const latLngs = event.points.map((p) => [p.lat, p.lng] as [number, number]);
        if (latLngs.length > 1) L.polyline(latLngs, { color: '#A83B24', weight: 4, opacity: .86 }).addTo(leafletMap);
        else if (latLngs[0]) L.circleMarker(latLngs[0], { radius: 7, color: '#fff9eb', weight: 3, fillColor: event.kind === 'visit' ? '#6C7B50' : '#2B7184', fillOpacity: 1 }).bindTooltip(event.name).addTo(leafletMap);
      }
      if (points.length) leafletMap.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [28, 28], maxZoom: 15 });
      else leafletMap.setView([20, 0], 2);
    } catch {
      loadError = 'Street tiles could not be loaded. The private atlas view still works.';
      online = false;
      ononlinechange(false);
    }
  }

  onDestroy(() => leafletMap?.remove());
</script>

<section class="map-shell" aria-labelledby="map-title">
  <div class="map-bar">
    <div>
      <p class="eyebrow">Map sheet</p>
      <h2 id="map-title">Routes for this day</h2>
    </div>
    <label class="tile-switch" title="This makes requests to OpenStreetMap tile servers. Your source file is never sent.">
      <input type="checkbox" checked={online} on:change={(event) => ononlinechange(event.currentTarget.checked)} disabled={!navigator.onLine} />
      <span>Street tiles</span>
    </label>
  </div>
  <div class="map-frame">
    {#if online}
      <div class="leaflet-host" bind:this={mapElement} aria-label="Interactive route map. A complete text itinerary follows the map."></div>
    {:else}
      <svg class="atlas" viewBox="0 0 100 100" role="img" aria-labelledby="atlas-title atlas-description">
        <title id="atlas-title">Private route atlas</title>
        <desc id="atlas-description">A local coordinate plot of {events.length} timeline entries. The text itinerary provides the same details.</desc>
        <defs><pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="#2b7184" stroke-opacity=".16" stroke-width=".25"/></pattern></defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {#each svgPaths as route}
          {#if route.path}
            <polyline class:visit={route.kind === 'visit'} points={route.path} />
            {@const first = route.path.split(' ')[0]}
            <circle cx={first.split(',')[0]} cy={first.split(',')[1]} r="1.5" class:visit-dot={route.kind === 'visit'} />
          {/if}
        {/each}
      </svg>
      {#if !points.length}<div class="no-coordinates">No coordinates recorded for this selection</div>{/if}
      <p class="private-note"><span aria-hidden="true">⌁</span> Private plot · no tile requests</p>
    {/if}
  </div>
  {#if loadError}<p class="map-error" role="status">{loadError}</p>{/if}
</section>

<style>
  .map-shell { min-width: 0; background: var(--ink); color: var(--paper); display: flex; flex-direction: column; }
  .map-bar { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px clamp(16px, 3vw, 32px); border-bottom: 1px solid #53605c; }
  .eyebrow { margin: 0 0 2px; color: #aab8b2; font: 650 .68rem var(--mono); text-transform: uppercase; letter-spacing: .16em; }
  h2 { margin: 0; font-size: clamp(1rem, 2vw, 1.3rem); }
  .tile-switch { display: inline-flex; min-height: 44px; align-items: center; gap: 8px; color: var(--paper); font-size: .83rem; cursor: pointer; }
  .tile-switch input { width: 20px; height: 20px; accent-color: var(--rust); }
  .map-frame { flex: 1; position: relative; min-height: 330px; overflow: hidden; background: #152220; }
  .atlas { width: 100%; height: 100%; min-height: 330px; display: block; background: #1b2927; }
  polyline { fill: none; stroke: var(--rust); stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; stroke-dasharray: 240; animation: route-draw .6s ease-out both; }
  polyline.visit { stroke: var(--meadow); }
  circle { fill: var(--rust); stroke: var(--paper); stroke-width: .7; vector-effect: non-scaling-stroke; }
  circle.visit-dot { fill: var(--meadow); }
  .leaflet-host { width: 100%; height: 100%; min-height: 330px; color: var(--ink); z-index: 1; }
  .private-note { position: absolute; bottom: 12px; left: 16px; margin: 0; padding: 6px 10px; background: #111918df; color: #d8ded9; font: 600 .7rem var(--mono); }
  .no-coordinates { position: absolute; inset: 0; display: grid; place-items: center; padding: 24px; text-align: center; color: #cad1cc; }
  .map-error { margin: 0; padding: 8px 16px; background: #50231e; }
  @keyframes route-draw { from { stroke-dashoffset: 240; } to { stroke-dashoffset: 0; } }
  @media (prefers-reduced-motion: reduce) { polyline { animation: none; } }
</style>
