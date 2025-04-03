<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const names = data?.getBusinessMetrics?.revenue?.names || [];

  const subsectionTitles = ["Overview", ...names];

  const sectionMap = Object.fromEntries(
    subsectionTitles?.map((title) => {
      const key = title
        ?.toLowerCase()
        ?.replace(/&/g, "") // Remove & symbol
        ?.replace(/\s+/g, "-") // Replace spaces with dash
        ?.replace(/-{2,}/g, "-") // Replace multiple dashes with single dash
        ?.replace(/^-|-$/g, "") // Remove leading/trailing dashes
        ?.trim();
      return [key, key === "overview" ? "" : key];
    }),
  );
  const dataset = data?.getBusinessMetrics?.revenue?.history || [];
  const geographicDataset = data?.getBusinessMetrics?.geographic?.history || [];
  const operatingExpensesDataset =
    data?.getBusinessMetrics?.operatingExpenses?.history || [];

  const revenueNames = data?.getBusinessMetrics?.revenue?.names || [];
  const geographicNames = data?.getBusinessMetrics?.geographic?.names || [];
  const operatingExpensesNames =
    data?.getBusinessMetrics?.operatingExpenses?.names || [];

  const xData = dataset?.map((item) => item?.date);
  const geographicXData = geographicDataset?.map((item) => item?.date);
  const operatingExpensesXData = operatingExpensesDataset?.map(
    (item) => item?.date,
  );

  const categoryValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.value[index]),
  );
  const geographiCategoryValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.value[index]),
  );
  const operatingExpensesCategoryValues = operatingExpensesNames?.map(
    (_, index) => operatingExpensesDataset?.map((item) => item.value[index]),
  );

  const growthValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.valueGrowth[index]),
  );
  const geographicGrowthValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.valueGrowth[index]),
  );
  const operatingExpensesGrowthValues = operatingExpensesNames?.map(
    (_, index) =>
      operatingExpensesDataset?.map((item) => item.valueGrowth[index]),
  );

  function getHref(title) {
    const key = title?.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
    const path =
      key === "overview" ? "/metrics" : `/metrics/${sectionMap[key]}`;
    return `/stocks/${$stockTicker}${path}`;
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Business Metric Overview`}
  description={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`}
/>

<section class=" overflow-hidden min-h-screen w-full">
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        {#if revenueNames?.length !== 0 || geographicNames?.length !== 0}
          <h2 class="mt-5 text-xl sm:text-2xl font-bold mb-4">
            {$displayCompanyName} Revenue Breakdown
          </h2>

          <div
            class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-auto pr-5 sm:pr-0"
          >
            <table
              class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto"
            >
              <thead class="text-muted dark:text-white dark:bg-default">
                <tr>
                  <th
                    class=" border-b border-gray-300 dark:border-gray-800 font-semibold text-sm sm:text-[1rem] text-start"
                    >Quarter</th
                  >
                  {#each xData as item}
                    <th
                      class="z-20 border-b border-gray-300 dark:border-gray-800 font-semibold text-sm text-center"
                      >{new Date(item ?? null)?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}</th
                    >
                  {/each}
                </tr>
              </thead>
              <tbody class="shadow-md">
                {#each revenueNames as name, index}
                  <tr class=" odd:bg-[#F6F7F8] dark:odd:bg-odd">
                    <th
                      class="whitespace-nowrap odd:bg-[#F6F7F8] dark:odd:bg-odd text-sm sm:text-[1rem] font-normal text-start border-b border-gray-300 dark:border-gray-800"
                    >
                      <a
                        href={getHref(name)}
                        class="sm:hover:text-blue-700 dark:sm:hover:text-blue-400 cursor-pointer underline underline-offset-4"
                      >
                        {name} Revenue
                      </a>
                    </th>
                    {#each categoryValues[index] as value}
                      <td
                        class=" text-sm sm:text-[1rem] text-end border-b border-gray-300 dark:border-gray-800"
                      >
                        {@html value !== null && value !== undefined
                          ? abbreviateNumber(value, false, true)
                          : "n/a"}
                      </td>
                    {/each}
                  </tr>
                  <tr class="">
                    <td
                      class=" whitespace-nowrap text-sm sm:text-[1rem] text-start border-b border-gray-300 dark:border-gray-800"
                    >
                      <span class="ml-2">{name} Revenue Growth</span>
                    </td>
                    {#each growthValues[index] as growthValue}
                      <td
                        class="text-sm sm:text-[1rem] text-end {growthValue > 0
                          ? 'text-green-800 dark:text-[#00FC50]'
                          : growthValue < 0
                            ? 'text-red-800 dark:text-[#FF2F1F]'
                            : ''}  border-b border-gray-300 dark:border-gray-800"
                      >
                        {growthValue > 0 ? "+" : ""}{growthValue !== null &&
                        growthValue !== undefined
                          ? growthValue?.toFixed(2) + "%"
                          : "n/a"}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          {#if geographicNames?.length !== 0}
            <h2 class="mt-10 text-xl sm:text-2xl font-bold mb-4">
              Revenue by Geography
            </h2>

            <div
              class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-auto pr-5 sm:pr-0"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto"
              >
                <thead class="text-muted dark:text-white dark:bg-default">
                  <tr>
                    <th
                      class=" border-b border-gray-300 dark:border-gray-800 font-semibold text-sm sm:text-[1rem] text-start"
                      >Quarter</th
                    >
                    {#each geographicXData as item}
                      <th
                        class="z-20 bg-default border-b border-gray-800 text-white font-semibold text-sm text-center bg-default"
                        >{new Date(item ?? null)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}</th
                      >
                    {/each}
                  </tr>
                </thead>
                <tbody class="shadow-md">
                  {#each geographicNames as name, index}
                    <tr class=" odd:bg-[#F6F7F8] dark:odd:bg-odd">
                      <th
                        class="whitespace-nowrap dark:odd:bg-odd text-sm sm:text-[1rem] font-normal text-start border-b border-gray-300 dark:border-gray-800"
                        >{name} Revenue</th
                      >
                      {#each geographiCategoryValues[index] as value}
                        <td
                          class="whitespace-nowrap text-sm sm:text-[1rem] font-normal text-center border-b border-gray-300 dark:border-gray-800"
                        >
                          {@html value !== null &&
                          value !== 0 &&
                          value !== undefined
                            ? abbreviateNumber(value, false, true)
                            : "n/a"}
                        </td>
                      {/each}
                    </tr>
                    <tr>
                      <td
                        class="whitespace-nowrap text-sm sm:text-[1rem] font-normal text-start border-b border-gray-300 dark:border-gray-800"
                      >
                        <span class="ml-2">{name} Revenue Growth</span>
                      </td>
                      {#each geographicGrowthValues[index] as growthValue}
                        <td
                          class="text-sm sm:text-[1rem] text-center {growthValue >
                          0
                            ? 'text-green-800 dark:text-[#00FC50]'
                            : growthValue < 0
                              ? 'text-red-800 dark:text-[#FF2F1F]'
                              : ''}  border-b border-gray-300 dark:border-gray-800"
                        >
                          {growthValue > 0 ? "+" : ""}{growthValue !== null &&
                          growthValue !== 0 &&
                          growthValue !== undefined
                            ? growthValue?.toFixed(2) + "%"
                            : "n/a"}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          {#if operatingExpensesNames?.length !== 0}
            <h2 class="mt-10 text-xl sm:text-2xl font-bold mb-4">
              Operating Expense Breakdown
            </h2>

            <div
              class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-auto pr-5 sm:pr-0"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto"
              >
                <thead class="text-muted dark:text-white dark:bg-default">
                  <tr>
                    <th
                      class=" border-b border-gray-300 dark:border-gray-800 font-semibold text-sm sm:text-[1rem] text-start"
                      >Quarter</th
                    >
                    {#each operatingExpensesXData as item}
                      <th
                        class="z-20 border-b border-gray-300 dark:border-gray-800 font-semibold text-sm text-center"
                        >{new Date(item ?? null)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}</th
                      >
                    {/each}
                  </tr>
                </thead>
                <tbody class="shadow-md">
                  {#each operatingExpensesNames as name, index}
                    <tr class=" odd:bg-[#F6F7F8] dark:odd:bg-odd">
                      <th
                        class="whitespace-nowrap odd:bg-[#F6F7F8] dark:odd:bg-odd text-sm sm:text-[1rem] font-normal text-start border-b border-gray-300 dark:border-gray-800"
                        >{name} Revenue</th
                      >
                      {#each operatingExpensesCategoryValues[index] as value}
                        <td
                          class=" whitespace-nowrap text-sm sm:text-[1rem] text-center border-b border-gray-300 dark:border-gray-800"
                        >
                          {@html value !== null &&
                          value !== 0 &&
                          value !== undefined
                            ? abbreviateNumber(value, false, true)
                            : "n/a"}
                        </td>
                      {/each}
                    </tr>
                    <tr class="">
                      <td
                        class="whitespace-nowrap text-sm sm:text-[1rem] font-normal text-start border-b border-gray-300 dark:border-gray-800"
                      >
                        <span class="ml-2">{name} Revenue Growth</span>
                      </td>
                      {#each operatingExpensesGrowthValues[index] as growthValue}
                        <td
                          class="text-sm sm:text-[1rem] text-center {growthValue >
                          0
                            ? 'text-green-800 dark:text-[#00FC50]'
                            : growthValue < 0
                              ? 'text-red-800 dark:text-[#FF2F1F]'
                              : ''}  border-b border-gray-300 dark:border-gray-800"
                        >
                          {growthValue > 0 ? "+" : ""}{growthValue !== null &&
                          growthValue !== 0 &&
                          growthValue !== undefined
                            ? growthValue?.toFixed(2) + "%"
                            : "n/a"}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {:else}
          <Infobox
            text={`Currently, there are no business metrics available for ${$stockTicker}.`}
          />
        {/if}
      </div>
    </div>
  </div>
</section>
