<script lang="ts">
  import { onMount } from 'svelte';
  import MonthCalendar from './components/MonthCalendar.svelte';
  import AtlasMap from './components/AtlasMap.svelte';
  import type { TimelineDataset, TimelineEvent, WorkerResponse } from './lib/types';
  import { clearDataset, loadDataset, saveDataset } from './lib/storage';
  import { download, eventsToCsv, eventsToGpx } from './lib/export';

  let dataset: TimelineDataset | undefined;
  let selectedDate = localStorage.getItem('field-atlas-date') ?? '';
  let search = '';
  let rangeStart = '';
  let rangeEnd = '';
  let importing = false;
  let progress = 0;
  let progressMessage = '';
  let error = '';
  let restored = false;
  let dragging = false;
  let online = navigator.onLine;
  let streetTiles = false;
  let updateWaiting: ServiceWorker | null = null;
  let privacyDialog: HTMLDialogElement;
  const page = location.pathname;
  const isLegal = page === '/privacy' || page === '/terms';

  $: dates = dataset ? [...new Set(dataset.events.map((event) => event.date))].sort() : [];
  $: if (dataset && !dates.includes(selectedDate)) selectedDate = dates.at(-1) ?? '';
  $: if (selectedDate) localStorage.setItem('field-atlas-date', selectedDate);
  $: selectedEvents = (dataset?.events ?? []).filter((event) => event.date === selectedDate && matches(event, search));
  $: rangeEvents = (dataset?.events ?? []).filter((event) => (!rangeStart || event.date >= rangeStart) && (!rangeEnd || event.date <= rangeEnd));
  $: totals = selectedEvents.reduce((value, event) => value + (event.distanceMeters ?? 0), 0);

  onMount(() => {
    void initialize();
    window.addEventListener('online', connectionChange);
    window.addEventListener('offline', connectionChange);
    return () => {
      window.removeEventListener('online', connectionChange);
      window.removeEventListener('offline', connectionChange);
    };
  });

  async function initialize() {
    if (!localStorage.getItem('field-atlas-privacy-seen') && !isLegal) {
      privacyDialog.showModal();
      setTimeout(() => privacyDialog.querySelector<HTMLButtonElement>('button')?.focus(), 0);
    }
    try {
      dataset = await loadDataset();
      if (dataset) {
        const foundDates = [...new Set(dataset.events.map((event) => event.date))].sort();
        if (!foundDates.includes(selectedDate)) selectedDate = foundDates.at(-1) ?? '';
        rangeStart = foundDates[0] ?? '';
        rangeEnd = foundDates.at(-1) ?? '';
      }
    } catch { error = 'The saved archive could not be opened. You can import the source file again.'; }
    restored = true;
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      if (registration.waiting) updateWaiting = registration.waiting;
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', () => {
          if (registration.waiting && navigator.serviceWorker.controller) updateWaiting = registration.waiting;
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
    }
  }

  function connectionChange() {
    online = navigator.onLine;
    if (!online) streetTiles = false;
  }

  function matches(event: TimelineEvent, value: string): boolean {
    const needle = value.trim().toLocaleLowerCase();
    return !needle || [event.name, event.address, event.activity].some((item) => item?.toLocaleLowerCase().includes(needle));
  }

  function formatTime(timestamp: string): string {
    const wallTime = timestamp.match(/T(\d{2}):(\d{2})/);
    if (wallTime) return `${wallTime[1]}:${wallTime[2]}`;
    const date = new Date(timestamp);
    return Number.isNaN(date.valueOf()) ? timestamp : new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  }

  function duration(event: TimelineEvent): string {
    const minutes = Math.max(0, Math.round((new Date(event.end).valueOf() - new Date(event.start).valueOf()) / 60000));
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes} min`;
  }

  function previousDay(delta: number) {
    const current = dates.indexOf(selectedDate);
    const next = dates[current + delta];
    if (next) selectedDate = next;
  }

  async function chooseFile(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) await importFile(file);
    (event.currentTarget as HTMLInputElement).value = '';
  }

  async function importFile(file: File) {
    error = '';
    if (!file.name.toLowerCase().endsWith('.json')) { error = 'Choose a .json export such as Timeline.json or Records.json.'; return; }
    if (file.size > 200 * 1024 * 1024) { error = 'This file is larger than the supported 200 MB limit. Split it by year before importing.'; return; }
    importing = true;
    progress = 2;
    progressMessage = 'Opening a local worker…';
    const worker = new Worker(new URL('./lib/parser.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === 'progress') { progress = message.progress; progressMessage = message.message; }
      if (message.type === 'error') { error = message.message; importing = false; worker.terminate(); }
      if (message.type === 'complete') {
        try {
          await saveDataset(message.dataset);
          dataset = message.dataset;
          const foundDates = [...new Set(dataset.events.map((item) => item.date))].sort();
          selectedDate = foundDates.at(-1) ?? '';
          rangeStart = foundDates[0] ?? '';
          rangeEnd = foundDates.at(-1) ?? '';
          progress = 100;
          progressMessage = `${dataset.events.length.toLocaleString()} entries saved on this device.`;
        } catch { error = 'The file parsed, but this browser did not have enough local storage to save it.'; }
        importing = false;
        worker.terminate();
      }
    };
    worker.onerror = () => { error = 'The background parser stopped unexpectedly. Try closing other tabs and importing again.'; importing = false; worker.terminate(); };
    worker.postMessage({ file });
  }

  async function drop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) await importFile(file);
  }

  function acknowledgePrivacy() {
    localStorage.setItem('field-atlas-privacy-seen', '1');
    privacyDialog.close();
  }

  function exportRange(format: 'csv' | 'gpx') {
    if (!rangeEvents.length) return;
    const name = `field-atlas_${rangeStart || 'first'}_${rangeEnd || 'last'}.${format}`;
    if (format === 'csv') download(eventsToCsv(rangeEvents), 'text/csv;charset=utf-8', name);
    else download(eventsToGpx(rangeEvents), 'application/gpx+xml;charset=utf-8', name);
  }

  async function removeArchive() {
    if (!confirm(`Remove the locally saved archive “${dataset?.name}”? Your source file will not be changed.`)) return;
    await clearDataset();
    dataset = undefined;
    selectedDate = '';
    error = '';
  }
</script>

<svelte:head>
  <title>{page === '/privacy' ? 'Privacy — Field Atlas' : page === '/terms' ? 'Terms — Field Atlas' : 'Field Atlas — Local Timeline JSON viewer'}</title>
</svelte:head>

<a class="skip-link" href="#main">Skip to timeline</a>
<header class="site-header">
  <a class="brand" href="/" aria-label="Field Atlas home">
    <img src="/icons/atlas.svg" width="40" height="40" alt="" />
    <div><h1>Field Atlas</h1><p>Local timeline viewer</p></div>
  </a>
  <div class="status-group">
    <span class:offline={!online} class="connection"><span aria-hidden="true">●</span> {online ? 'Online' : 'Offline'}</span>
    {#if !isLegal}<label class="import-button"><input type="file" accept=".json,application/json" on:change={chooseFile} /><span>{dataset ? 'Import another' : 'Open JSON'}</span></label>{/if}
  </div>
</header>

{#if isLegal}
  <main id="main" class="legal-page">
    {#if page === '/privacy'}
      <p class="kicker">Policy · effective 27 August 2026</p>
      <h2>Privacy is the architecture</h2>
      <p>Field Atlas processes your Google Maps Timeline export in your browser. The source file, extracted places, coordinates, dates, searches, and exports are never sent to us. There is no account, backend, analytics, advertising, or tracking.</p>
      <h3>Storage on your device</h3>
      <p>The normalized timeline is saved in this browser’s IndexedDB so it remains available after refresh and offline. Your privacy acknowledgement and last selected date use local storage. Use “Remove local archive” in the app, or clear this site’s browser data, to erase them.</p>
      <h3>Optional street tiles</h3>
      <p>The private coordinate plot makes no map request. If you enable “Street tiles”, your browser requests standard tile images from OpenStreetMap. Those requests reveal your IP address and the requested tile areas to that service, but never include your source file or literal coordinates. The switch turns off when you go offline.</p>
      <h3>Contact</h3><p>Questions can be filed in the project’s public GitHub repository. Do not attach personal timeline files.</p>
    {:else}
      <p class="kicker">Terms · effective 27 August 2026</p>
      <h2>Terms of use</h2>
      <p>Field Atlas is free, open-source software provided to help you inspect your own location-history exports. You retain ownership and control of all data you open or export.</p>
      <h3>No warranty</h3><p>Google’s export formats change. Results may omit unsupported records or contain inaccuracies from the source. Do not rely on this tool as the sole copy of important evidence or memories; keep the original export.</p>
      <h3>Acceptable use</h3><p>Use the tool only with data you are authorized to access. When enabling OpenStreetMap tiles, follow the OpenStreetMap tile usage policy and avoid bulk or automated use.</p>
    {/if}
    <p><a href="/">← Return to Field Atlas</a></p>
  </main>
{:else}
  <main id="main" class:has-data={dataset} on:dragover={(event) => { event.preventDefault(); dragging = true; }} on:dragleave={() => dragging = false} on:drop={drop}>
    {#if dragging}<div class="drop-overlay" aria-hidden="true">Drop the JSON archive here</div>{/if}
    {#if !restored}
      <section class="center-state" aria-live="polite"><span class="compass" aria-hidden="true">✣</span><h2>Opening your local atlas…</h2></section>
    {:else if !dataset}
      <section class="welcome" aria-labelledby="welcome-title">
        <div class="welcome-copy">
          <p class="kicker">Private recovery desk · works offline</p>
          <h2 id="welcome-title">Turn an export back into days you can browse.</h2>
          <p>Open Google <strong>Timeline.json</strong>, legacy <strong>Records.json</strong>, or a Takeout file with <strong>timelineObjects</strong>. Parsing and storage stay in this browser.</p>
          <label class="primary-file"><input type="file" accept=".json,application/json" on:change={chooseFile} /><span>Choose Timeline JSON</span></label>
          <p class="drop-hint">or drop one file here · up to 200 MB</p>
          <ul class="trust-list">
            <li><span aria-hidden="true">01</span> No upload or account</li>
            <li><span aria-hidden="true">02</span> Browse after going offline</li>
            <li><span aria-hidden="true">03</span> Export CSV or GPX</li>
          </ul>
        </div>
        <div class="atlas-key" aria-label="Supported contents">
          <p class="sheet-label">Archive contents</p>
          <div><i class="mark visit"></i><span>Visits and named places</span></div>
          <div><i class="mark route"></i><span>Trips and paths</span></div>
          <div><i class="mark point"></i><span>Raw location records</span></div>
          <p class="coordinate">PARSED LOCALLY<br />47.0000° N — 08.0000° E</p>
        </div>
      </section>
    {:else}
      <div class="workspace">
        <aside class="ledger" aria-label="Day ledger">
          <div class="archive-meta"><div><p class="eyebrow">Local archive</p><strong title={dataset.name}>{dataset.name}</strong><small>{dataset.events.length.toLocaleString()} entries · {dataset.schema}</small></div><button class="text-button danger" type="button" on:click={removeArchive}>Remove</button></div>
          {#if dataset.warnings.length}<p class="archive-warning" role="status">{dataset.warnings.join(' ')}</p>{/if}
          <MonthCalendar selected={selectedDate} {dates} onselect={(date) => selectedDate = date} />
          <div class="day-heading">
            <button type="button" aria-label="Previous day with entries" disabled={dates.indexOf(selectedDate) <= 0} on:click={() => previousDay(-1)}>←</button>
            <div><p class="eyebrow">Selected day</p><h2>{new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${selectedDate}T00:00:00Z`))}</h2><small>{selectedEvents.length} entries{totals ? ` · ${(totals / 1000).toFixed(1)} km` : ''}</small></div>
            <button type="button" aria-label="Next day with entries" disabled={dates.indexOf(selectedDate) >= dates.length - 1} on:click={() => previousDay(1)}>→</button>
          </div>
          <div class="search-field"><label for="place-search">Search places and activities</label><input id="place-search" type="search" bind:value={search} placeholder="e.g. museum or walking" /></div>
          <ol class="itinerary" aria-label="Text itinerary equivalent for the map">
            {#each selectedEvents as event}
              <li>
                <time datetime={event.start}>{formatTime(event.start)}</time>
                <span class:event-route={event.kind !== 'visit'} class="event-mark" aria-hidden="true"></span>
                <div><strong>{event.name}</strong><p>{event.address || (event.activity ? event.activity.replaceAll('_', ' ').toLocaleLowerCase() : event.kind)}</p><small>{duration(event)}{event.distanceMeters ? ` · ${(event.distanceMeters / 1000).toFixed(1)} km` : ''}{event.points[0] ? ` · ${event.points[0].lat.toFixed(4)}, ${event.points[0].lng.toFixed(4)}` : ''}</small></div>
              </li>
            {:else}
              <li class="no-results">No entries match this day and search. Clear the search or choose a marked date.</li>
            {/each}
          </ol>
        </aside>
        <div class="map-and-export">
          <AtlasMap events={selectedEvents} online={streetTiles && online} ononlinechange={(value) => streetTiles = value} />
          <section class="export-strip" aria-labelledby="export-title">
            <div><p class="eyebrow">Take a copy</p><h2 id="export-title">Export a date range</h2></div>
            <label>From<input type="date" min={dates[0]} max={dates.at(-1)} bind:value={rangeStart} /></label>
            <label>Through<input type="date" min={dates[0]} max={dates.at(-1)} bind:value={rangeEnd} /></label>
            <span class="export-count">{rangeEvents.length.toLocaleString()} entries</span>
            <button class="secondary-button" type="button" disabled={!rangeEvents.length || rangeStart > rangeEnd} on:click={() => exportRange('csv')}>Export CSV</button>
            <button class="primary-button" type="button" disabled={!rangeEvents.length || rangeStart > rangeEnd} on:click={() => exportRange('gpx')}>Export GPX</button>
          </section>
        </div>
      </div>
    {/if}
    {#if importing}<div class="import-status" role="status" aria-live="polite"><div><strong>{progressMessage}</strong><span>{progress}%</span></div><progress max="100" value={progress}>{progress}%</progress><small>Keep this tab open. Parsing runs away from the interface.</small></div>{/if}
    {#if error}<div class="error-toast" role="alert"><div><strong>Couldn’t open this archive</strong><p>{error}</p></div><button type="button" aria-label="Dismiss error" on:click={() => error = ''}>×</button></div>{/if}
  </main>
{/if}

<footer><span>Field Atlas · your timeline stays yours</span><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://github.com/B-Divyesh/sf-timeline-json-viewer">Source</a></nav></footer>

{#if updateWaiting}<div class="update-toast" role="status"><span>A fresh atlas is ready.</span><button type="button" on:click={() => updateWaiting?.postMessage({ type: 'SKIP_WAITING' })}>Update now</button></div>{/if}

<dialog bind:this={privacyDialog} class="privacy-dialog" on:cancel={(event) => event.preventDefault()}>
  <div class="dialog-mark" aria-hidden="true">⌖</div>
  <p class="kicker">Before you open an archive</p>
  <h2>Your movements stay on this device.</h2>
  <p>Field Atlas has no server, account, analytics, or sync. It reads and saves your timeline only inside this browser. The private map makes no network requests.</p>
  <p>If you later enable optional OpenStreetMap tiles, tile requests reveal the viewed area and your IP address to OpenStreetMap—not your JSON file.</p>
  <button class="primary-button" type="button" on:click={acknowledgePrivacy}>Continue privately</button>
  <a href="/privacy">Read the privacy policy</a>
</dialog>
