<script lang="ts">
  export let selected: string;
  export let dates: string[] = [];
  export let onselect: (date: string) => void;

  let month = selected?.slice(0, 7) || new Date().toISOString().slice(0, 7);
  let lastSelected = selected;
  $: if (selected && selected !== lastSelected) {
    lastSelected = selected;
    month = selected.slice(0, 7);
  }
  $: [year, monthNumber] = month.split('-').map(Number);
  $: firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  $: dayCount = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  $: cells = Array.from({ length: firstDay + dayCount }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  $: dateSet = new Set(dates);
  $: monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));

  function shift(delta: number) {
    const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
    month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
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
  <div class="days" role="grid" aria-label={monthLabel}>
    {#each cells as day}
      {#if day === null}
        <span class="blank"></span>
      {:else}
        {@const fullDate = `${month}-${String(day).padStart(2, '0')}`}
        <button
          type="button"
          class:has-data={dateSet.has(fullDate)}
          class:selected={selected === fullDate}
          aria-label={`${fullDate}${dateSet.has(fullDate) ? ', has timeline entries' : ', no entries'}`}
          aria-pressed={selected === fullDate}
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
