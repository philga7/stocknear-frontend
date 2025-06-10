<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

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
  ];
</script>

<SEO
  title="A List of SPAC Stocks (Special Purpose Acquisition Company)"
  description="These are all the actively traded SPACs (Special Purpose Acquisition Companies) on the US stock market. These are also known as blank check companies or shell companies."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="These are all the actively traded SPACs (Special Purpose Acquisition Companies) on the US stock market. These are also known as blank check companies or shell companies."
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
