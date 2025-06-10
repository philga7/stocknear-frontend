<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const defaultList = [
    { name: "Total OI", rule: "totalOI" },
    { name: "Change OI", rule: "changeOI" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "IV Rank", rule: "ivRank" },
    { name: "Total Prem", rule: "totalPrem" },
  ];

  const excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "revenue",
    "eps",
    "changeOI",
    "totalOI",
    "totalPrem",
    "ivRank",
  ]);
</script>

<SEO
  title="Top US Companies with the highest IV Rank"
  description="Explore the largest US companies ranked by their IV Rank."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of stocks with the highest Implied Volatility (IV) Rank. IV Rank measures a stock's current implied volatility compared to its range over a specific period, helping identify potential opportunities in the options market."
  />

  <!-- Page wrapper -->
  <Table
    {data}
    rawData={data?.getData}
    {excludedRules}
    {defaultList}
    title={data?.getData?.length + " " + "Stocks"}
  />
</section>
