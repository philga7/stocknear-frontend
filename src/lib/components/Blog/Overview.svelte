<script>
  export let overviewList;
</script>

<div
  class="my-5 pb-5 grid
            grid-cols-2 gap-3
            xs:mt-6 bp:mt-7
            sm:grid-cols-3 sm:gap-6
            lg:grid-cols-4"
>
  {#each overviewList as item}
    <div class="flex flex-col">
      <div class="text-gray-500 text-sm">
        {item?.label}
      </div>
      <div class="mt-0.5 text-lg bp:text-lg sm:mt-1.5 sm:text-xl font-semibold">
        {item?.value}
      </div>
    </div>
  {/each}
</div>

<h2 class="text-xl sm:text-2xl font-bold mt-6 mb-4">Description</h2>
<p class="mb-4">
  Apple Inc., with a market capitalization of around $3.26 trillion USD, stands
  as a titan in the technology sector. As one of the Big Four tech companies,
  Apple's product line extends from the ubiquitous iPhone to services like
  iCloud and Apple Music. The company's extensive hardware range includes iPads,
  Macs, iPods, Apple Watches, and more, complemented by software such as iOS and
  professional applications like Final Cut Pro. Their innovation in consumer
  electronics and digital services solidifes their position as a key player in
  the global market.
</p>
