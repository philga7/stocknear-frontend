<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const defaultList = [
    { name: "Revenue", rule: "revenue" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];
</script>

<SEO
  title={"The Biggest U.S. Companies by Revenue or Sales"}
  description={"A list of the biggest U.S. companies ranked by the total sales or revenue in the past twelve months."}
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="These are the biggest U.S. companies ranked by total revenue or sales over
    the past 12 months. It includes companies based in the United States that
    can be publicly traded on the stock exchange."
  />

  <!-- Page wrapper -->
  <Table
    {data}
    rawData={data?.getData}
    {defaultList}
    title={data?.getData?.length + " " + "Stocks"}
  />
</section>
