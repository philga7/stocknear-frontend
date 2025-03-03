<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  let rawData = data?.getMarketMover;

  const excludedRules = new Set([
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

  const hideLastRow = true;
</script>

{#if rawData?.length > 0}
  <Table {data} {rawData} {excludedRules} {defaultList} {hideLastRow} />

  <UpgradeToPro {data} />
{:else}
  <Infobox text="Currently no premarket data is available yet!" />
{/if}
