<script lang="ts">
  import {
    etfTicker,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";
  import { formatString } from "$lib/utils";
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;
  let rawData = data?.getETFHoldings?.holdings || [];

  const lastUpdate = new Date(data?.getETFHoldings?.lastUpdate);
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = lastUpdate?.toLocaleDateString("en-US", options);

  const excludedRules = new Set([
    "price",
    "changesPercentage",
    "sharesNumber",
    "weightPercentage",
  ]);

  const defaultList = [
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Shares", rule: "sharesNumber" },
    { name: "% Weight", rule: "weightPercentage" },
  ];

  const specificRows = [
    { name: "% Weight", rule: "weightPercentage", type: "percent" },
    { name: "Shares", rule: "sharesNumber", type: "int" },
  ];

  function generateStatementInfoHTML() {
    if (rawData?.length > 0) {
      return `
      <span>
         The ${$displayCompanyName} holds ${rawData?.length} different assets
              and the largest one in the portfolio is ${formatString(
                rawData?.at(0)?.name,
              )}, making up ${rawData?.at(0)?.weightPercentage?.toFixed(2)}% of
              the total.
      </span>
    `;
    } else {
      return `
      <span>
        No financial data available for ${$displayCompanyName}.
      </span>
    `;
    }
  }

  let htmlOutput = generateStatementInfoHTML();
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$etfTicker}) Holdings List · Stocknear
  </title>
  <meta
    name="description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$etfTicker}) Holdings List · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$etfTicker}) Holdings List · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="bg-default overflow-hidden text-white h-full min-h-screen mb-20 sm:mb-0 w-full mt-2 sm:mt-0"
>
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="mt-5 sm:mt-0 sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto">
        <div class="flex flex-row items-center md:space-x-4 md:border-0">
          <h1 class=" text-xl sm:text-2xl font-bold">
            {$etfTicker} Holdings List
          </h1>
          {#if data?.getETFHoldings?.lastUpdate}
            <div
              class="ml-3 sm:mt-1 whitespace-nowrap text-sm sm:text-[1rem] md:ml-0"
            >
              <span class="inline">As of </span>{formattedDate}
            </div>
          {/if}
        </div>
        <div class="mt-5 mb-10">
          <Infobox text={htmlOutput} />
        </div>

        {#if rawData?.length !== 0}
          <Table
            {data}
            {rawData}
            {excludedRules}
            {defaultList}
            {specificRows}
          />
        {/if}
      </div>
    </div>
  </div>
</section>
