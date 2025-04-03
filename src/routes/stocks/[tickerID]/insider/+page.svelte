<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { formatString, abbreviateNumber } from "$lib/utils";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { onMount } from "svelte";

  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;
  let isLoaded = true;

  let rawData = data?.getInsiderTrading?.sort(
    (a, b) => new Date(b?.transactionDate) - new Date(a?.transactionDate),
  );

  let insiderTradingList = rawData?.slice(0, 50);
  function backToTop() {
    window.scrollTo({
      top: 0,
    });
  }

  function extractOfficeInfo(inputString) {
    const indexOfficer = inputString?.toLowerCase()?.indexOf("officer:");
    const indexOther = inputString?.toLowerCase()?.indexOf("other:");
    if (indexOfficer !== -1) {
      return inputString?.substring(indexOfficer + "officer:"?.length)?.trim();
    } else if (indexOther !== -1) {
      return inputString?.substring(indexOther + "other:"?.length)?.trim();
    } else if (inputString?.toLowerCase()?.includes("director")) {
      return "Director";
    } else if (inputString?.toLowerCase()?.includes("percent owner")) {
      return inputString?.replace("percent owner", "% Owner");
    } else {
      return "n/a";
    }
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && insiderTradingList?.length !== rawData?.length) {
      const nextIndex = insiderTradingList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      insiderTradingList = [...insiderTradingList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "reportingName", label: "Name", align: "left" },
    { key: "transactionDate", label: "Date", align: "right" },
    { key: "securitiesTransacted", label: "Shares", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "value", label: "Value", align: "right" },
    { key: "transactionType", label: "Trade Type", align: "right" },
  ];

  let sortOrders = {
    reportingName: { order: "none", type: "string" },
    transactionDate: { order: "none", type: "date" },
    securitiesTransacted: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    value: { order: "none", type: "number" },
    transactionType: { order: "none", type: "string" },
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
      insiderTradingList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    insiderTradingList = [...originalData].sort(compareValues)?.slice(0, 50);
  };
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) US Congress & Senate Trading · Stocknear`}
  description={`Get the latest US congress & senate trading of ${$displayCompanyName} (${$stockTicker}) from democrates and republicans.`}
/>

<section class="w-full overflow-hidden h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-6">
          <h1 class="text-xl sm:text-2xl font-bold mb-4">Insider Trading</h1>
          {#if insiderTradingList?.length === 0}
            <Infobox
              text={`No trading history available for ${$displayCompanyName}. Likely no
              insider trading has happened yet.`}
            />
          {/if}
        </div>

        {#if isLoaded}
          {#if insiderTradingList?.length !== 0}
            <div
              class="mt-5 flex justify-start items-center w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-auto no-scrollbar"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody>
                  {#each insiderTradingList as item, index}
                    {#if item?.price > 0}
                      <tr
                        class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                          1 ===
                          insiderTradingList?.slice(0, 6)?.length &&
                        !['Pro', 'Plus']?.includes(data?.user?.tier)
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td class=" text-sm sm:text-[1rem] ] whitespace-nowrap">
                          <div class="flex flex-col">
                            <span class=""
                              >{formatString(item?.reportingName)?.replace(
                                "/de/",
                                "",
                              )}</span
                            >
                            <span class="text-sm"
                              >{extractOfficeInfo(item?.typeOfOwner)}</span
                            >
                          </div>
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap ]"
                        >
                          {new Date(item?.transactionDate)?.toLocaleString(
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
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap ]"
                        >
                          {item?.securitiesTransacted?.toLocaleString("en-US")}
                        </td>
                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap ]"
                        >
                          ${item?.price?.toFixed(2)}
                        </td>
                        <td
                          class=" text-end text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          ${abbreviateNumber(item?.value)}
                        </td>
                        <td class="text-end flex justify-end whitespace-nowrap">
                          <div
                            class="w-auto px-4 py-1 rounded-full uppercase {item?.transactionType ===
                            'Bought'
                              ? 'bg-[#75D377] text-muted'
                              : 'bg-[#cd4050] '} font-semibold"
                          >
                            {item?.transactionType}
                          </div>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>

            {#if rawData?.length > 5 && rawData?.length === insiderTradingList?.length && ["Pro", "Plus"]?.includes(data?.user?.tier)}
              <label
                on:click={backToTop}
                class="w-32 py-1.5 mt-10 hover:bg-white hover:bg-opacity-[0.05] cursor-pointer m-auto flex justify-center items-center border border-gray-300 dark:border-gray-600 rounded-full"
              >
                Back to top
              </label>
            {/if}

            <UpgradeToPro {data} />
          {/if}
        {:else}
          <div class="flex justify-center items-center h-80">
            <div class="relative">
              <label
                class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <span class="loading loading-spinner loading-md text-gray-400"
                ></span>
              </label>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
