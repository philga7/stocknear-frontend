<script lang="ts">
  export let columns = [];
  export let sortOrders = {};
  export let sortData;

  const SortIcon = ({ sortOrder }) => `
    <svg class="shrink-0 w-4 h-4 ${
      sortOrder === "asc"
        ? "rotate-180 inline-block"
        : sortOrder === "desc"
          ? "inline-block"
          : "hidden"
    }" viewBox="0 0 20 20" fill="currentColor" style="max-width:50px">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
    </svg>
  `;
</script>

<tr
  class="bg-white dark:bg-default border-b border-[#27272A] text-muted dark:text-white"
>
  {#each columns as column}
    <th
      on:click={() => sortData(column.key)}
      class="cursor-pointer select-none font-semibold text-sm sm:text-[1rem] whitespace-nowrap {column.align ===
      'right'
        ? 'text-end'
        : column.align === 'left'
          ? 'text-start'
          : 'text-center'}"
    >
      {column?.label}
      {@html SortIcon({ sortOrder: sortOrders[column.key]?.order })}
    </th>
  {/each}
</tr>
