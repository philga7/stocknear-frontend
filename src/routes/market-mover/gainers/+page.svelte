<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";

  export let data;

  let rawData = data?.getMarketMover["1D"];

  let excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "eps",
    "marketCap",
  ]);

  const defaultList = [
    { name: "Market Cap", rule: "marketCap" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Volume", rule: "volume" },
  ];
</script>

<Table
  {data}
  {rawData}
  {excludedRules}
  {defaultList}
  title={"Gainers Today"}
  date={"Aug 1, 2025"}
/>
