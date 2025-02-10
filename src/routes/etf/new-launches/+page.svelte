<script lang="ts">
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let etfData = data?.getETFNewLaunches;

  $: charNumber = $screenWidth < 640 ? 30 : 40;

  let columns = [
    { key: "inceptionDate", label: "Inception", align: "left" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Fund Name", align: "left" },
    { key: "numberOfHoldings", label: "Holdings", align: "right" },
    { key: "totalAssets", label: "Total Assets", align: "right" },
  ];

  let sortOrders = {
    inceptionDate: { order: "none", type: "date" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    numberOfHoldings: { order: "none", type: "number" },
    totalAssets: { order: "none", type: "number" },
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

    let originalData = data?.getETFNewLaunches;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      etfData = [...originalData]; // Reset to original data (spread to avoid mutation)
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
    etfData = [...originalData].sort(compareValues);
  };
</script>

<SEO
  title="New Launches of ETFs"
  description="A list of the 100 most recently launched ETFs on the US stock market, sorted by the inception date."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li><a class="text-gray-300">New Launches of ETFs</a></li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              New Launches of ETFs
            </h1>
          </div>

          <div class="w-full mt-5 m-auto mb-10 bg-default overflow-hidden">
            <!--Start Top Winners/Losers-->
            <div class="flex flex-col justify-center items-center">
              <div class="text-start w-full text-white mb-2">
                <span class="font-bold text-2xl">
                  {etfData?.length} ETFs
                </span>
              </div>

              <div class="w-full overflow-x-scroll">
                <table
                  class="mt-5 table table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto overflow-hidden"
                >
                  <thead>
                    <TableHeader {columns} {sortOrders} {sortData} />
                  </thead>
                  <tbody>
                    {#each etfData as item}
                      <tr
                        class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b-[#09090B]"
                      >
                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                        >
                          {new Date(item?.inceptionDate)?.toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              daySuffix: "2-digit",
                            },
                          )}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                        >
                          <a
                            href={"/etf/" + item?.symbol}
                            class="sm:hover:text-white text-blue-400"
                          >
                            {item?.symbol}
                          </a>
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                        >
                          {item?.name?.length > charNumber
                            ? item?.name?.slice(0, charNumber) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B] text-end"
                        >
                          {item?.numberOfHoldings !== null &&
                          item?.numberOfHoldings !== 0
                            ? item?.numberOfHoldings
                            : "-"}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B] text-end"
                        >
                          {item?.totalAssets !== 0 && item?.totalAssets !== null
                            ? abbreviateNumber(item?.totalAssets)
                            : "-"}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/analysts"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Analyst
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/politicians"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Congress Trading
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Congress trading insights.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
