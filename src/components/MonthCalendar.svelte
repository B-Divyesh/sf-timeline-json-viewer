<script lang="ts">
  import { tick } from 'svelte';

  export let selected: string;
  export let dates: string[] = [];
  export let onselect: (date: string) => void;

  let month = selected?.slice(0, 7) || new Date().toISOString().slice(0, 7);
  let lastSelected = selected;
  let focusedDate = selected;
  let daysElement: HTMLDivElement;
  $: if (selected && selected !== lastSelected) {
    lastSelected = selected;
    month = selected.slice(0, 7);
    focusedDate = selected;
  }
  $: [year, monthNumber] = month.split('-').map(Number);
  $: firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  $: dayCount = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  $: cells = Array.from({ length: firstDay + dayCount }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  $: dateSet = new Set(dates);
  $: monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
  $: tabbableDate = focusedDate.startsWith(month)
    ? focusedDate
    : selected.startsWith(month)
      ? selected
      : `${month}-01`;

  function shift(delta: number) {
    const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
    month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  function formatDate(date: Date): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }

  async function moveFocus(date: Date) {
    focusedDate = formatDate(date);
    month = focusedDate.slice(0, 7);
    await tick();
    daysElement.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)?.focus();
  }

  function moveByMonth(date: Date, delta: number): Date {
    const day = date.getUTCDate();
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    target.setUTCDate(Math.min(day, lastDay));
    return target;
  }

  function handleDayKey(event: KeyboardEvent, fullDate: string) {
    const date = new Date(`${fullDate}T00:00:00Z`);
    let target: Date | undefined;
    if (event.key === 'ArrowLeft') target = new Date(date.valueOf() - 86_400_000);
    if (event.key === 'ArrowRight') target = new Date(date.valueOf() + 86_400_000);
    if (event.key === 'ArrowUp') target = new Date(date.valueOf() - 7 * 86_400_000);
    if (event.key === 'ArrowDown') target = new Date(date.valueOf() + 7 * 86_400_000);
    if (event.key === 'Home') target = new Date(date.valueOf() - date.getUTCDay() * 86_400_000);
    if (event.key === 'End') target = new Date(date.valueOf() + (6 - date.getUTCDay()) * 86_400_000);
    if (event.key === 'PageUp') target = moveByMonth(date, -1);
    if (event.key === 'PageDown') target = moveByMonth(date, 1);
    if (!target) return;
    event.preventDefault();
    void moveFocus(target);
  }
</script>

<section class="calendar" aria-labelledby="calendar-title">
  <div class="calendar-heading">
    <button class="icon-button" type="button" on:click={() => shift(-1)} aria-label="Previous month">←</button>
    <h2 id="calendar-title">{monthLabel}</h2>
    <button class="icon-button" type="button" on:click={() => shift(1)} aria-label="Next month">→</button>
  </div>
  <div class="weekdays" aria-hidden="true">
    {#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as day}<span>{day}</span>{/each}
  </div>
  <div class="days" role="group" aria-label={`${monthLabel} calendar days`} bind:this={daysElement}>
    {#each cells as day}
      {#if day === null}
        <span class="blank"></span>
      {:else}
        {@const fullDate = `${month}-${String(day).padStart(2, '0')}`}
        <button
          type="button"
          data-date={fullDate}
          tabindex={tabbableDate === fullDate ? 0 : -1}
          class:has-data={dateSet.has(fullDate)}
          class:selected={selected === fullDate}
          aria-label={`${fullDate}${dateSet.has(fullDate) ? ', has timeline entries' : ', no entries'}`}
          aria-pressed={selected === fullDate}
          on:focus={() => focusedDate = fullDate}
          on:keydown={(event) => handleDayKey(event, fullDate)}
          on:click={() => onselect(fullDate)}>{day}</button>
      {/if}
    {/each}
  </div>
</section>

<style>
  .calendar { border-bottom: 1px solid var(--rule); padding: var(--s4); }
  .calendar-heading { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; margin-bottom: var(--s2); }
  h2 { font: 650 1rem var(--font); margin: 0; text-align: center; }
  .icon-button { min-height: 44px; border: 0; background: transparent; color: var(--ink); font-size: 1.3rem; }
  .weekdays, .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }
  .weekdays { font: 600 .7rem var(--mono); color: var(--muted); padding-bottom: 4px; }
  .days button, .blank { aspect-ratio: 1; min-width: 0; min-height: 36px; }
  .days button { position: relative; border: 1px solid transparent; background: transparent; color: var(--muted); font: 550 .78rem var(--mono); border-radius: 50%; }
  .days button.has-data { color: var(--ink); font-weight: 750; }
  .days button.has-data::after { content: ''; position: absolute; width: 4px; height: 4px; border-radius: 50%; background: var(--meadow); bottom: 3px; left: calc(50% - 2px); }
  .days button.selected { color: var(--paper); background: var(--rust-dark); }
  .days button.selected::after { background: var(--paper); }
  @media (min-width: 720px) { .days button, .blank { min-height: 38px; } }
</style>
