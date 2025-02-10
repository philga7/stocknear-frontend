<script lang="ts">
  import { abbreviateNumber, formatETFName } from "$lib/utils";
  import { numberOfUnreadNotification } from "$lib/store";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
  let etfProviderList = data?.getAllETFProviders;

  let columns = [
    { key: "etfProvider", label: "Provider Name", align: "left" },
    { key: "totalAssets", label: "Total Assets", align: "right" },
    { key: "funds", label: "Funds", align: "right" },
    { key: "avgExpenseRatio", label: "Avg. Cost", align: "right" },
    { key: "avgHoldings", label: "Avg. Holdings", align: "right" },
  ];

  let sortOrders = {
    etfProvider: { order: "none", type: "string" },
    totalAssets: { order: "none", type: "number" },
    funds: { order: "none", type: "number" },
    avgExpenseRatio: { order: "none", type: "number" },
    avgHoldings: { order: "none", type: "number" },
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

    let originalData = data?.getAllETFProviders;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      etfProviderList = [...originalData]; // Reset to original data (spread to avoid mutation)
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
    etfProviderList = [...originalData].sort(compareValues);
  };
</script>

<SEO
  title="Largest ETF Providers by Assets Under Management"
  description="A complete list of all the companies that provide exchange-traded funds (ETFs) that are actively traded on the U.S. stock market."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text={"Every Exchange-Traded Fund (ETF) is managed by a specific company. Below is a list of companies offering actively traded ETFs on the U.S. stock market."}
  />

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full">
      <div class="w-full overflow-x-scroll">
        <table
          class="table rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto mt-4"
        >
          <thead>
            <TableHeader {columns} {sortOrders} {sortData} />
          </thead>
          <tbody>
            {#each etfProviderList as item, index}
              <!-- row -->
              <tr
                class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                  1 ===
                  etfProviderList?.length && data?.user?.tier !== 'Pro'
                  ? 'opacity-[0.1]'
                  : ''}"
              >
                <td
                  class="text-sm sm:text-[1rem] whitespace-nowrap font-medium"
                >
                  <a
                    href={"/etf/etf-providers/" + item?.etfProvider}
                    class="sm:hover:underline sm:hover:underline-offset-4 text-white"
                  >
                    {formatETFName(item?.etfProvider)}
                  </a>
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end"
                >
                  {abbreviateNumber(item?.totalAssets)}
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end"
                >
                  {item?.funds}
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end"
                >
                  {item?.avgExpenseRatio}%
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end"
                >
                  {item?.avgHoldings}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <UpgradeToPro {data} />
    </div>
  </div>
</section>
