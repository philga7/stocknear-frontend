<script lang="ts">
  import { abbreviateNumber, formatETFName } from "$lib/utils";
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import { onMount } from "svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
  let rawData = data?.getETFProviderData;
  let etfProviderData = rawData?.slice(0, 50);

  let etfProviderName = formatETFName(data?.getProviderName);

  const totalAssets = rawData?.reduce(
    (total, item) => total + item?.totalAssets,
    0,
  );

  const avgExpenseRatio =
    rawData?.reduce((total, item) => total + item?.expenseRatio || 0, 0) /
    rawData?.length;

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && etfProviderData?.length !== rawData?.length) {
      const nextIndex = etfProviderData?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      etfProviderData = [...etfProviderData, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: charNumber = $screenWidth < 640 ? 20 : 20;

  let columns = [
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "Change", align: "right" },
    { key: "totalAssets", label: "Total Assets", align: "right" },
    { key: "numberOfHoldings", label: "Holdings", align: "right" },
    { key: "expenseRatio", label: "Expense Ratio", align: "right" },
  ];

  let sortOrders = {
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    totalAssets: { order: "none", type: "number" },
    numberOfHoldings: { order: "none", type: "number" },
    expenseRatio: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    let originalData = rawData;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      etfProviderData = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    etfProviderData = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  function generateStatementInfoHTML() {
    return `
     ${etfProviderName} has ${rawData?.length} ETFs listed with a total of ${abbreviateNumber(
       totalAssets,
     )}
      in assets under management. The funds have an average expense ratio of ${avgExpenseRatio?.toFixed(
        2,
      )}%.
    `;
  }

  let htmlOutput = generateStatementInfoHTML();
</script>

<SEO
  title={`${etfProviderName} ETF List: Complete Guide to ${etfProviderData?.length} Exchange Traded Funds`}
  description={`Explore ${etfProviderName}'s complete ETF lineup of ${etfProviderData?.length} funds with $${abbreviateNumber(totalAssets)} AUM. Compare expense ratios, assets, and performance metrics to find the right ETF for your portfolio.`}
/>

<section class="w-full overflow-hidden m-auto">
  {#if rawData?.length !== 0}
    <div class="mb-5 mt-5 sm:mt-0">
      <Infobox text={htmlOutput} />
    </div>
  {/if}

  <div
    class="mb-4 flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
  >
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-[1rem] font-normal text-white">Listed Funds</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
        >
          {rawData?.length}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-[1rem] font-normal text-white">Total Assets</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalAssets)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-[1rem] font-normal text-white">Average Cost</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
        >
          {avgExpenseRatio?.toFixed(2)}%
        </div>
      </div>
    </div>
  </div>

  {#if rawData?.length !== 0}
    <!-- Page wrapper -->
    <div class="flex justify-center w-full m-auto h-full overflow-hidden">
      <!-- Content area -->
      <div class="w-full">
        <div class="w-full overflow-x-auto mt-5">
          <table
            class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each etfProviderData as item, index}
                <!-- row -->
                <tr
                  class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                    1 ===
                    etfProviderData?.length && data?.user?.tier !== 'Pro'
                    ? 'opacity-[0.1]'
                    : ''}"
                >
                  <td
                    class="font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    <HoverStockChart symbol={item?.symbol} assetType={"etf"} />
                  </td>

                  <td
                    class="text-gray-200 text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {item?.name?.length > charNumber
                      ? item?.name?.slice(0, charNumber) + "..."
                      : item?.name}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end"
                  >
                    {item?.price}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end"
                  >
                    {#if item?.changesPercentage >= 0}
                      <span class="text-[#00FC50]"
                        >+{item?.changesPercentage >= 1000
                          ? abbreviateNumber(item?.changesPercentage)
                          : item?.changesPercentage?.toFixed(2)}%</span
                      >
                    {:else if item?.changesPercentage < 0}
                      <span class="text-[#FF2F1F]"
                        >{item?.changesPercentage <= -1000
                          ? abbreviateNumber(item?.changesPercentage)
                          : item?.changesPercentage?.toFixed(2)}%
                      </span>
                    {:else}
                      -
                    {/if}
                  </td>

                  <td
                    class="text-white font-medium text-end text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {abbreviateNumber(item?.totalAssets)}
                  </td>

                  <td
                    class="text-white font-medium text-end text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {item?.numberOfHoldings}
                  </td>

                  <td
                    class="text-white font-medium text-end text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {item?.expenseRatio}%
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <UpgradeToPro {data} />
      </div>
    </div>
  {:else}
    <div
      class="mt-10 w-full flex justify-center items-center m-auto text-2xl font-bold text-gray-300"
    >
      No data Available
    </div>
  {/if}
</section>
