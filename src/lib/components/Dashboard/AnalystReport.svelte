<script lang="ts">
  import * as Card from "$lib/components/shadcn/card/index.ts";
  import Infobox from "$lib/components/Infobox.svelte";

  export let analystReport;
</script>

<Card.Root
  class="bg-gray-50 dark:bg-default overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[470px]"
>
  <Card.Header class="flex flex-row items-center">
    <div class="flex flex-col items-start w-full">
      <div class="whitespace-nowrap flex flex-row w-full items-center">
        <Card.Title
          class="text-xl sm:text-2xl text-muted dark:text-white font-semibold"
          >Analyst Insight Report
        </Card.Title>
        {#if analystReport?.date}
          <label class="hidden sm:inline-block text-sm italic ml-auto"
            >Updated {analystReport?.date}</label
          >
        {/if}
      </div>
      {#if analystReport?.date}
        <label class="sm:hidden text-xs italic mt-2"
          >Updated {analystReport?.date}</label
        >
      {/if}
    </div>
  </Card.Header>
  <Card.Content>
    {#if Object?.keys(analystReport)?.length > 0}
      {analystReport?.insight}

      <div class="text-muted dark:text-white mt-4">
        According to {analystReport?.numOfAnalyst} analyst ratings, the average rating
        for
        <a
          href={`/stocks/${analystReport?.symbol}`}
          class="text-blue-700 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
          >{analystReport?.symbol}</a
        >
        stock is "{analystReport?.consensusRating}" The 12-month stock price
        forecast is ${analystReport?.highPriceTarget}, which is an {analystReport?.highPriceChange >
        0
          ? "increase"
          : "decrease"} of {analystReport?.highPriceChange}% from the latest
        price.
      </div>
      <table class="w-full text-right xs:text-sm sm: mt-5">
        <thead
          ><tr
            class="border-b border-gray-400 dark:border-gray-600 font-normal text-sm sm:text-[1rem]"
            ><th class="py-[3px] text-left font-semibold lg:py-0.5">Target</th>
            <th class="font-semibold">Low</th>
            <th class="font-semibold">Average</th>
            <th class="font-semibold">Median</th>
            <th class="font-semibold">High</th></tr
          ></thead
        >
        <tbody
          ><tr
            class="border-b border-gray-400 dark:border-gray-600 font-normal text-sm sm:text-[1rem]"
            ><td class="py-[3px] text-left lg:py-0.5">Price</td>
            <td>${analystReport?.lowPriceTarget}</td>
            <td>${analystReport?.avgPriceTarget}</td>
            <td>${analystReport?.medianPriceTarget}</td>
            <td>${analystReport?.highPriceTarget}</td></tr
          >
          <tr class="text-sm sm:text-[1rem]"
            ><td class="py-[3px] text-left lg:py-0.5">Change</td>
            <td
              class={analystReport?.lowPriceChange > 0
                ? "before:content-['+'] text-green-800 dark:text-[#00FC50]"
                : "text-red-800 dark:text-[#FF2F1F]"}
              >{analystReport?.lowPriceChange}%</td
            >
            <td
              class={analystReport?.avgPriceChange > 0
                ? "before:content-['+'] text-green-800 dark:text-[#00FC50]"
                : "text-red-800 dark:text-[#FF2F1F]"}
              >{analystReport?.avgPriceChange}%</td
            >
            <td
              class={analystReport?.medianPriceChange > 0
                ? "before:content-['+'] text-green-800 dark:text-[#00FC50]"
                : "text-red-800 dark:text-[#FF2F1F]"}
              >{analystReport?.medianPriceChange}%</td
            >
            <td
              class={analystReport?.highPriceChange > 0
                ? "before:content-['+'] text-green-800 dark:text-[#00FC50]"
                : "text-red-800 dark:text-[#FF2F1F]"}
              >{analystReport?.highPriceChange}%</td
            ></tr
          ></tbody
        >
      </table>
    {:else}
      <Infobox text="Currently, there are no new analyst reports available." />
    {/if}
  </Card.Content>
</Card.Root>
