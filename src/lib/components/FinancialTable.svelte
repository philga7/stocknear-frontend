<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  export let data: any[];
  export let fields: { label: string; key: string }[];

  // Use a Set for fast margin lookup
  const marginKeys = new Set([
    "pretaxProfitMargin",
    "freeCashFlowMargin",
    "grossProfitMargin",
    "netProfitMargin",
    "operatingProfitMargin",
    "ebitdaMargin",
  ]);

  // Precompute fields with an additional flag
  $: computedFields = fields.map((field) => ({
    ...field,
    isMargin: marginKeys.has(field.key),
  }));

  // Helper to format the cell value
  function formatValue(
    value: number | null | undefined,
    isMargin: boolean,
  ): string {
    if (value === null || value === undefined || value === 0) {
      return "n/a";
    }
    const formatted = abbreviateNumber(value.toFixed(2));
    return isMargin ? formatted + "%" : formatted;
  }
</script>

{#each computedFields as { label, key, isMargin } (key)}
  <tr class="text-white odd:bg-odd whitespace-nowrap border-b border-gray-800">
    <td
      class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
    >
      {label}
    </td>
    {#each data as item, index (index)}
      <td class="text-sm sm:text-[1rem] text-end">
        {formatValue(item[key], isMargin)}
      </td>
    {/each}
  </tr>
{/each}
