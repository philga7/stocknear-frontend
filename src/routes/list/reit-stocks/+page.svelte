<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "dividendYield",
    "eps",
    "marketCap",
  ]);

  const defaultList = [
    { name: "Market Cap", rule: "marketCap" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Dividend Yield", rule: "dividendYield" },
  ];
</script>

<SEO
  title="Top REIT Stocks List – Best Real Estate Investment Trusts to Invest In"
  description="Discover the best REIT stocks to invest in. Explore a comprehensive list of real estate investment trusts (REITs) with key insights, performance data, and sector trends."
/>

<section class="w-full overflow-hidden m-auto">
  <div
    class="border border-gray-800 w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 bg-default sm:rounded-md h-auto p-5 mb-4"
  >
    <svg
      class="w-5 h-5 inline-block sm:mr-2 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      ><path
        fill="#fff"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
      /></svg
    >

    These are all the actively traded REITs (Real Estate Investment Trusts) on
    the US stock market.
  </div>

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getAllREITS} {excludedRules} {defaultList} />
</section>
