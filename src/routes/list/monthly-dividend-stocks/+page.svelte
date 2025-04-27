<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const currentYear = new Date().getFullYear();
  const defaultList = [
    { name: "Dividend Yield", rule: "dividendYield" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];
</script>

<SEO
  title={`Top Monthly Dividend Stocks for Steady Income in ${currentYear}`}
  description={`Discover the best monthly dividend stocks to earn reliable passive income every month. Our ${currentYear} list features high-yield, low-volatility picks for consistent returns.`}
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="This list includes all the stocks that pay dividends every month and are listed on the NASDAQ, NYSE or NYSE American in the U.S."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getData} {defaultList} />
</section>
