<script lang="ts">
  import { onMount, tick } from 'svelte';
  import MonthCalendar from './components/MonthCalendar.svelte';
  import AtlasMap from './components/AtlasMap.svelte';
  import type { TimelineDataset, TimelineEvent, WorkerResponse } from './lib/types';
  import { clearDataset, loadDataset, saveDataset, type StorageScope } from './lib/storage';
  import { demoDataset } from './lib/demo';
  import { download, eventsToCsv, eventsToGpx, eventsToKml } from './lib/export';

  let path = location.pathname, query = location.search, dataset: TimelineDataset | undefined, selectedDate = '', search = '', rangeStart = '', rangeEnd = '';
  let importing = false, progress = 0, progressMessage = '', error = '', restored = false, dragging = false, online = false, connectionKnown = false, connectionCheck = 0, streetTiles = false;
  let updateWaiting: ServiceWorker | null = null, reloadForUpdate = false, routeAnnouncement = '', routeRevision = 0, importRevision = 0;
  $: demoMode = path === '/demo' || new URLSearchParams(query).get('demo') === '1';
  $: isLegal = path === '/privacy' || path === '/terms';
  $: isNotFound = !['/', '/demo', '/privacy', '/terms'].includes(path);
  $: dateKey = `${demoMode ? 'demo:' : ''}field-atlas-date`;
  $: dates = dataset ? [...new Set(dataset.events.map((event) => event.date))].sort() : [];
  $: if (dataset && !dates.includes(selectedDate)) selectedDate = dates.at(-1) ?? '';
  $: if (selectedDate && restored) localStorage.setItem(dateKey, selectedDate);
  $: selectedEvents = (dataset?.events ?? []).filter((event) => event.date === selectedDate && matches(event, search));
  $: rangeEvents = (dataset?.events ?? []).filter((event) => (!rangeStart || event.date >= rangeStart) && (!rangeEnd || event.date <= rangeEnd));
  $: totals = selectedEvents.reduce((value, event) => value + (event.distanceMeters ?? 0), 0);
  $: title = isNotFound ? 'Page not found — Field Atlas' : path === '/privacy' ? 'Privacy — Field Atlas' : path === '/terms' ? 'Terms — Field Atlas' : demoMode ? 'Demo — Field Atlas' : 'Field Atlas — Browse Google Timeline JSON';
  $: description = isNotFound ? 'The requested Field Atlas page does not exist.' : path === '/privacy' ? 'Learn how Field Atlas stores Timeline JSON and optional map tiles.' : path === '/terms' ? 'Read the terms for using Field Atlas with your Timeline JSON.' : demoMode ? 'Explore a sample Google Timeline in Field Atlas.' : 'Browse an exported Google Timeline privately in your browser.';
  $: canonicalPath = demoMode ? '/demo' : path;

  onMount(() => {
    void initialize(path, query); void registerServiceWorker(); void checkConnection();
    const pop = () => void changeRoute(location.pathname, location.search, false);
    window.addEventListener('popstate', pop); window.addEventListener('online', connectionChange); window.addEventListener('offline', connectionChange);
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('online', connectionChange); window.removeEventListener('offline', connectionChange); };
  });
  function routeState(nextPath: string, nextQuery: string) {
    const nextDemoMode = nextPath === '/demo' || new URLSearchParams(nextQuery).get('demo') === '1';
    return {
      demoMode: nextDemoMode,
      legal: nextPath === '/privacy' || nextPath === '/terms',
      notFound: !['/', '/demo', '/privacy', '/terms'].includes(nextPath),
      scope: (nextDemoMode ? 'demo' : 'real') as StorageScope,
      dateKey: `${nextDemoMode ? 'demo:' : ''}field-atlas-date`
    };
  }
  async function initialize(nextPath: string, nextQuery: string) {
    const revision = ++routeRevision;
    const destination = routeState(nextPath, nextQuery);
    if (destination.legal || destination.notFound) { restored = true; return; }
    selectedDate = localStorage.getItem(destination.dateKey) ?? '';
    try {
      let nextDataset = await loadDataset(destination.scope);
      if (destination.demoMode && !nextDataset) {
        nextDataset = structuredClone(demoDataset);
        await saveDataset(nextDataset, 'demo');
      }
      if (revision !== routeRevision) return;
      dataset = nextDataset;
      hydrateDates();
    } catch {
      if (revision === routeRevision) error = 'The saved timeline could not be opened. Import the Timeline JSON again.';
    }
    if (revision === routeRevision) restored = true;
  }
  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      if (registration?.waiting) updateWaiting = registration.waiting;
      registration?.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => { if (registration.waiting && navigator.serviceWorker.controller) updateWaiting = registration.waiting; }));
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloadForUpdate) location.reload(); });
    } catch { /* usable without a service worker */ }
  }
  function hydrateDates() { const found = dataset ? [...new Set(dataset.events.map((event) => event.date))].sort() : []; if (!found.includes(selectedDate)) selectedDate = found.at(-1) ?? ''; rangeStart = found[0] ?? ''; rangeEnd = found.at(-1) ?? ''; }
  async function changeRoute(nextPath: string, nextQuery = '', push = true) {
    if (push) history.pushState({}, '', `${nextPath}${nextQuery}`);
    importRevision += 1; importing = false;
    path = nextPath; query = nextQuery; search = ''; error = ''; restored = false; dataset = undefined; selectedDate = '';
    await initialize(nextPath, nextQuery); await tick();
    const heading = document.querySelector<HTMLElement>('main h1'); heading?.focus(); routeAnnouncement = heading?.textContent?.trim() ?? 'Page changed';
  }
  async function navigate(event: MouseEvent, href: string) { event.preventDefault(); const url = new URL(href, location.origin); await changeRoute(url.pathname, url.search); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }
  async function startDemo() { await changeRoute('/demo'); }
  async function resetDemo() { const fresh = structuredClone(demoDataset); await saveDataset(fresh, 'demo'); localStorage.removeItem('demo:field-atlas-date'); dataset = fresh; selectedDate = ''; hydrateDates(); search = ''; }
  async function exitDemo() { await clearDataset('demo'); localStorage.removeItem('demo:field-atlas-date'); await changeRoute('/'); }
  function connectionChange() { if (!navigator.onLine) { connectionCheck += 1; setConnection(false); return; } connectionKnown = false; void checkConnection(); }
  function setConnection(value: boolean) { online = value; connectionKnown = true; if (!value) streetTiles = false; }
  async function checkConnection() { const check = ++connectionCheck; if (!navigator.onLine) { setConnection(false); return; } try { const response = await fetch(`/online-check.txt?check=${Date.now()}`, { cache: 'no-store' }); if (check === connectionCheck) setConnection(response.ok && response.headers.get('X-Field-Atlas-Connection') !== 'offline'); } catch { if (check === connectionCheck) setConnection(false); } }
  function matches(event: TimelineEvent, value: string) { const needle = value.trim().toLocaleLowerCase(); return !needle || [event.name, event.address, event.activity].some((item) => item?.toLocaleLowerCase().includes(needle)); }
  function formatTime(timestamp: string) { const wall = timestamp.match(/T(\d{2}):(\d{2})/); return wall ? `${wall[1]}:${wall[2]}` : new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(timestamp)); }
  function duration(event: TimelineEvent) { const minutes = Math.max(0, Math.round((new Date(event.end).valueOf() - new Date(event.start).valueOf()) / 60000)); return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`; }
  function previousDay(delta: number) { const next = dates[dates.indexOf(selectedDate) + delta]; if (next) selectedDate = next; }
  async function chooseFile(event: Event) { const input = event.currentTarget as HTMLInputElement, file = input.files?.[0]; try { if (file) await importFile(file); } finally { input.value = ''; } }
  async function importFile(file: File) {
    error = '';
    if (!file.name.toLowerCase().endsWith('.json')) { error = 'Choose a .json file such as Timeline.json or Records.json.'; return; }
    if (file.size > 200 * 1024 * 1024) { error = 'This file is larger than 200 MB. Split it by year before importing.'; return; }
    const destination = routeState(path, query), revision = ++importRevision;
    importing = true; progress = 2; progressMessage = 'Reading the Timeline JSON…';
    await new Promise<void>((resolve) => {
      const worker = new Worker(new URL('./lib/parser.worker.ts', import.meta.url), { type: 'module' }), finish = () => { if (revision === importRevision) importing = false; worker.terminate(); resolve(); };
      worker.onmessage = async (event: MessageEvent<WorkerResponse>) => { const message = event.data; if (message.type === 'progress' && revision === importRevision) { progress = message.progress; progressMessage = message.message; } if (message.type === 'error') { if (revision === importRevision) error = message.message; finish(); } if (message.type === 'complete') { try { await saveDataset(message.dataset, destination.scope); if (revision === importRevision) { dataset = message.dataset; hydrateDates(); progress = 100; progressMessage = `${dataset.events.length.toLocaleString()} entries saved in this browser.`; } } catch { if (revision === importRevision) error = 'The file parsed, but this browser could not save it.'; } finish(); } };
      worker.onerror = () => { if (revision === importRevision) error = 'The file reader stopped. Close other tabs and import again.'; finish(); }; worker.postMessage({ file });
    });
  }
  async function drop(event: DragEvent) { event.preventDefault(); dragging = false; const file = event.dataTransfer?.files[0]; if (file) await importFile(file); }
  function activateUpdate() { if (updateWaiting) { reloadForUpdate = true; updateWaiting.postMessage({ type: 'SKIP_WAITING' }); } }
  function exportRange(format: 'csv' | 'gpx' | 'kml') { if (!rangeEvents.length) return; const name = `field-atlas_${rangeStart || 'first'}_${rangeEnd || 'last'}.${format}`; if (format === 'csv') download(eventsToCsv(rangeEvents), 'text/csv;charset=utf-8', name); else if (format === 'gpx') download(eventsToGpx(rangeEvents), 'application/gpx+xml;charset=utf-8', name); else download(eventsToKml(rangeEvents), 'application/vnd.google-earth.kml+xml;charset=utf-8', name); }
  async function removeTimeline() { if (!confirm(`Remove the saved timeline “${dataset?.name}”? Your source file is unchanged.`)) return; await clearDataset(routeState(path, query).scope); dataset = undefined; selectedDate = ''; error = ''; }
</script>

<svelte:head>
  <title>{title}</title><meta name="description" content={description} /><link rel="canonical" href={`https://timeline-json-viewer.sociobot.in${canonicalPath}`} />
  <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:type" content="website" /><meta property="og:image" content="https://timeline-json-viewer.sociobot.in/social-card.png" />
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} /><meta name="twitter:image" content="https://timeline-json-viewer.sociobot.in/social-card.png" />
</svelte:head>

<a class="skip-link" href="#main">Skip to main content</a><p class="sr-only" aria-live="polite">{routeAnnouncement}</p>
<header class="site-header"><a class="brand" href="/" on:click={(event) => navigate(event, '/')} aria-label="Field Atlas home"><img src="/icons/atlas.svg" width="40" height="40" alt="" /><div><strong>Field Atlas</strong><p>Local Timeline JSON viewer</p></div></a><nav class="header-nav" aria-label="Primary"><a href="/demo" on:click={(event) => navigate(event, '/demo')}>Demo</a><a href="/privacy" on:click={(event) => navigate(event, '/privacy')}>Privacy</a></nav><div class="status-group"><span class:offline={connectionKnown && !online} class="connection" aria-live="polite"><span aria-hidden="true">●</span> {connectionKnown ? online ? 'Online' : 'Offline' : 'Checking'}</span>{#if !isLegal && !isNotFound}<label class="import-button"><input type="file" accept=".json,application/json" on:change={chooseFile} /><span>Open Timeline JSON</span></label>{/if}</div></header>
{#if demoMode}<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span>Explore the viewer without touching your saved timeline.</span><button class="text-button" type="button" on:click={resetDemo}>Reset demo</button><button class="text-button" type="button" on:click={exitDemo}>Start for real</button></aside>{/if}

{#if isNotFound}
  <main id="main" class="legal-page not-found"><p class="kicker">404</p><h1 tabindex="-1">This Field Atlas page does not exist</h1><p>Check the address or return to the Timeline JSON viewer.</p><p><a href="/" on:click={(event) => navigate(event, '/')}>Return to Field Atlas</a></p></main>
{:else if isLegal}
  <main id="main" class="legal-page">{#if path === '/privacy'}<p class="kicker">Policy · effective 28 August 2026</p><h1 tabindex="-1">How Field Atlas handles your data</h1><p>Field Atlas reads a Timeline JSON in your browser. It does not send the file, entries, searches, or exports to Field Atlas.</p><h2>Storage on your device</h2><p>Your saved timeline stays in this browser until you remove it or clear this site’s data. The demo uses a separate browser store. Starting for real discards the isolated demo timeline.</p><h2>Optional street tiles</h2><p>The coordinate map starts without street tiles. If you turn on OpenStreetMap tiles, the browser requests map images from OpenStreetMap. Optional tile requests fetch map images. They never include Timeline JSON data.</p><h2>Contact</h2><p>Questions belong in the project’s public GitHub repository. Do not attach personal Timeline JSON files.</p>{:else}<p class="kicker">Terms · effective 28 August 2026</p><h1 tabindex="-1">Terms of use</h1><p>Field Atlas helps you inspect data you are allowed to access. Keep your original Timeline JSON as your backup.</p><h2>No warranty</h2><p>Google changes export formats. Unsupported records can be skipped or displayed incorrectly.</p><h2>Map tiles</h2><p>When you choose street tiles, follow OpenStreetMap’s tile usage policy. Do not use them for bulk or automated requests.</p>{/if}</main>
{:else}
  <main id="main" class:has-data={dataset} on:dragover={(event) => { event.preventDefault(); dragging = true; }} on:dragleave={() => dragging = false} on:drop={drop}>
    {#if dragging}<div class="drop-overlay" aria-hidden="true">Drop the Timeline JSON here</div>{/if}
    {#if !restored}<section class="center-state" aria-live="polite"><span class="compass" aria-hidden="true">✣</span><h1 tabindex="-1">Opening Field Atlas</h1></section>
    {:else if !dataset}
      <section class="welcome" aria-labelledby="welcome-title"><div class="welcome-copy"><p class="kicker">Local Timeline JSON viewer</p><h1 id="welcome-title" tabindex="-1">Browse your exported Google Timeline</h1><p>For people with a Timeline JSON file they cannot open.</p><div class="welcome-actions"><button class="primary-button" type="button" on:click={startDemo}>Try it with sample data</button><label class="primary-file secondary-file"><input type="file" accept=".json,application/json" on:change={chooseFile} /><span>Open Timeline JSON</span></label></div><p class="drop-hint">The sample opens the calendar, map, and CSV, GPX, or KML exports.</p><ul class="trust-list"><li><span aria-hidden="true">01</span> No Timeline JSON upload</li><li><span aria-hidden="true">02</span> Sample works offline after your first visit</li><li><span aria-hidden="true">03</span> Free to use</li></ul></div><div class="atlas-key" aria-label="Timeline entry types"><p class="sheet-label">Timeline entry types</p><div><i class="mark visit"></i><span>Visits and named places</span></div><div><i class="mark route"></i><span>Trips and paths</span></div><div><i class="mark point"></i><span>Raw location records</span></div><p class="coordinate">PARSED IN THIS BROWSER</p></div></section>
      <section class="landing-section preview-section"><h2>See a sample timeline first</h2><p>The sample includes three visits, a walking route, and a cycling route. It never reads your saved timeline.</p><button class="secondary-button" type="button" on:click={startDemo}>Open the sample viewer</button></section>
      <section class="landing-section"><h2>How it works</h2><ol class="steps"><li><strong>Open a file</strong><span>Choose Timeline.json, Records.json, or a legacy Google Takeout file.</span></li><li><strong>Browse days</strong><span>Find visits, trips, and raw records in the calendar and coordinate map.</span></li><li><strong>Export a date range</strong><span>Export a selected date range as CSV, GPX, or KML.</span></li></ol></section>
      <section class="landing-section"><h2>What Field Atlas does not do</h2><p>Street tiles stay off until you choose them. The sample never touches your saved timeline.</p><p><a href="/privacy" on:click={(event) => navigate(event, '/privacy')}>Read how local storage and optional map tiles work.</a></p></section>
    {:else}
      <h1 class="sr-only" tabindex="-1">Browse your exported Google Timeline</h1><div class="workspace"><aside class="ledger" aria-label="Daily entries"><div class="archive-meta"><div><p class="eyebrow">Saved timeline</p><strong title={dataset.name}>{dataset.name}</strong><small>{dataset.events.length.toLocaleString()} entries · {dataset.schema}</small></div><button class="text-button danger" type="button" on:click={removeTimeline}>Remove</button></div>{#if dataset.warnings.length}<p class="archive-warning" role="status">{dataset.warnings.join(' ')}</p>{/if}<MonthCalendar selected={selectedDate} {dates} onselect={(date) => selectedDate = date} /><div class="day-heading"><button type="button" aria-label="Previous day with entries" disabled={dates.indexOf(selectedDate) <= 0} on:click={() => previousDay(-1)}>←</button><div><p class="eyebrow">Selected day</p><h2>{new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${selectedDate}T00:00:00Z`))}</h2><small>{selectedEvents.length} entries{totals ? ` · ${(totals / 1000).toFixed(1)} km` : ''}</small></div><button type="button" aria-label="Next day with entries" disabled={dates.indexOf(selectedDate) >= dates.length - 1} on:click={() => previousDay(1)}>→</button></div><div class="search-field"><label for="place-search">Search places and activities</label><input id="place-search" type="search" bind:value={search} placeholder="e.g. museum or walking" /></div><ol class="itinerary" aria-label="Text itinerary for the coordinate map">{#each selectedEvents as event}<li><time datetime={event.start}>{formatTime(event.start)}</time><span class:event-route={event.kind !== 'visit'} class="event-mark" aria-hidden="true"></span><div><strong>{event.name}</strong><p>{event.address || (event.activity ? event.activity.replaceAll('_', ' ').toLocaleLowerCase() : event.kind)}</p><small>{duration(event)}{event.distanceMeters ? ` · ${(event.distanceMeters / 1000).toFixed(1)} km` : ''}{event.points[0] ? ` · ${event.points[0].lat.toFixed(4)}, ${event.points[0].lng.toFixed(4)}` : ''}</small></div></li>{:else}<li class="no-results">No entries match this day and search. Clear the search or choose a marked date.</li>{/each}</ol></aside><div class="map-and-export"><AtlasMap events={selectedEvents} online={streetTiles && online} connected={online} ononlinechange={(value) => streetTiles = value} /><section class="export-strip" aria-labelledby="export-title"><div><p class="eyebrow">Timeline export</p><h2 id="export-title">Export a date range</h2></div><label>From<input type="date" min={dates[0]} max={dates.at(-1)} bind:value={rangeStart} /></label><label>Through<input type="date" min={dates[0]} max={dates.at(-1)} bind:value={rangeEnd} /></label><span class="export-count">{rangeEvents.length.toLocaleString()} entries</span><button class="secondary-button" type="button" disabled={!rangeEvents.length || rangeStart > rangeEnd} on:click={() => exportRange('csv')}>Export CSV</button><button class="secondary-button" type="button" disabled={!rangeEvents.length || rangeStart > rangeEnd} on:click={() => exportRange('gpx')}>Export GPX</button><button class="primary-button" type="button" disabled={!rangeEvents.length || rangeStart > rangeEnd} on:click={() => exportRange('kml')}>Export KML</button></section></div></div>
    {/if}
    {#if importing}<div class="import-status" role="status" aria-live="polite"><div><strong>{progressMessage}</strong><span>{progress}%</span></div><progress max="100" value={progress}>{progress}%</progress><small>Keep this tab open while Field Atlas reads the file.</small></div>{/if}
    {#if error}<div class="error-toast" role="alert"><div><strong>Couldn’t open this Timeline JSON</strong><p>{error}</p></div><button type="button" aria-label="Dismiss error" on:click={() => error = ''}>×</button></div>{/if}
  </main>
{/if}
<footer><span>Field Atlas reads Timeline JSON in your browser.</span><nav aria-label="Footer"><a href="/demo" on:click={(event) => navigate(event, '/demo')}>Demo</a><a href="/privacy" on:click={(event) => navigate(event, '/privacy')}>Privacy</a><a href="/terms" on:click={(event) => navigate(event, '/terms')}>Terms</a><a href="https://github.com/B-Divyesh/sf-timeline-json-viewer" target="_blank" rel="noopener">Source code on GitHub <span class="sr-only">(opens in a new site)</span></a></nav><span>Version 1.0.0</span><span>Built by Param Factory</span></footer>
{#if updateWaiting}<div class="update-toast" role="status"><span>An update is ready.</span><button type="button" on:click={activateUpdate}>Update now</button></div>{/if}
