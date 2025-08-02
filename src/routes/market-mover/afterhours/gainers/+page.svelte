<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import { displayTitle, displayDate } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getMarketMover;

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

<SEO
  title="Top Aftermarket Gainers Today"
  description="Explore today's top aftermarket stock gainers based on percentage increase. View extended hours stock performance, volume, market cap, and more."
/>
<Table
  {data}
  {rawData}
  {excludedRules}
  {defaultList}
  title={$displayTitle}
  date={$displayDate}
/>
