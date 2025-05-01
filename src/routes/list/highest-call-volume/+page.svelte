<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const defaultList = [
    { name: "Call Volume", rule: "callVolume" },
    { name: "Put Volume", rule: "putVolume" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
  ];

  const excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "revenue",
    "eps",
    "callVolume",
    "putVolume",
  ]);
</script>

<SEO
  title="Top US Companies with the Highest Call Volume"
  description="Explore the largest US companies ranked by their highest call volume."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of stocks with the highest call volume. Call volume represents the total number of call option contracts traded during a given period."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
