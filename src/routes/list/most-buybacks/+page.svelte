<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const defaultList = [
    { name: "Buybacks", rule: "commonStockRepurchased" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];
</script>

<SEO
  title={"Top 100 U.S. Companies with Highest Buybacks"}
  description={"A list of the biggest U.S. companies ranked by the highest buybacks"}
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="These are the biggest U.S. companies ranked by the highest repurchasing common stock also known as buybacks.
    These are companies based in the United States of
    America and listed on the stock market."
  />

  <!-- Page wrapper -->
  <Table
    {data}
    rawData={data?.getData}
    {defaultList}
    title={data?.getData?.length + " " + "Stocks"}
  />
</section>
