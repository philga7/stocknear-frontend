<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

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
  <div
    class="w-full text-white text-start p-3 sm:p-5 mb-10 mt-3 rounded-md sm:flex sm:flex-row sm:items-center border border-gray-600 text-sm sm:text-[1rem]"
  >
    <svg
      class="w-6 h-6 shrink-0 inline-block sm:mr-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      ><path
        fill="#fff"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
      /></svg
    >
    Currently no afterhours data is available yet!
  </div>
{/if}
