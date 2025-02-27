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
  title="Top US Companies with the Highest Total Options Premium"
  description="Discover the largest US companies ranked by total options premium, highlighting top players in the options market and their financial performance."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of stocks with the highest total options premium. This premium is the sum of all options contract premiums for each stock, reflecting the overall market sentiment and expectations for volatility."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
