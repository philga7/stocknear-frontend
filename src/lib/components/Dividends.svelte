<script lang="ts">
  import { displayCompanyName } from "$lib/store";
  import Infobox from "$lib/components/Infobox.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { goto } from "$app/navigation";

  import { onMount } from "svelte";

  export let data;
  export let ticker;

  let dateDistance;
  let rawData = data?.getStockDividend;
  let stockList = rawData?.history?.slice(0, 50);
  let exDividendDate;
  let dividendYield;
  let annualDividend;
  let payoutFrequency;
  let payoutRatio;
  let dividendGrowth;

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && stockList?.length !== rawData?.history?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = rawData?.history?.slice(
        nextIndex,
        nextIndex + 50,
      );
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  function generateDividendInfoHTML() {
    const history = rawData?.history || [];

    if (history.length !== 0) {
      if (!dateDistance) {
        const formattedExDividendDate = new Date(exDividendDate).toLocaleString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        );

        return `
       <span>
  ${ticker} has a dividend yield of ${dividendYield}% and paid $${annualDividend} per share in the past year. The dividend is paid once per ${payoutFrequency === "Annually" ? "year" : payoutFrequency === "Quarterly" ? "quarter" : payoutFrequency === "Weekly" ? "week" : ""} and the last ex-dividend date was ${formattedExDividendDate}.
</span>

      `;
      } else {
        const latestDividendDate = new Date(history.at(0)?.date).toLocaleString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        );

        return `
        <span>
          ${$displayCompanyName} issued its most recent dividend on ${latestDividendDate}. 
          Since then, the company has not distributed any further dividends for over 12 months.
        </span>
      `;
      }
    } else {
      return `
      <span>
        No dividend history available for ${$displayCompanyName}.
      </span>
    `;
    }
  }

  let htmlOutput = `No dividend history available for ${$displayCompanyName}.`;

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "date", label: "Ex-Dividend Date", align: "left" },
    { key: "adjDividend", label: "Cash Amount", align: "right" },
    { key: "declarationDate", label: "Declaration Date", align: "right" },
    { key: "recordDate", label: "Record Date", align: "right" },
    { key: "paymentDate", label: "Pay Date", align: "right" },
  ];

  let sortOrders = {
    date: { order: "none", type: "date" },
    adjDividend: { order: "none", type: "number" },
    declarationDate: { order: "none", type: "date" },
    recordDate: { order: "none", type: "date" },
    paymentDate: { order: "none", type: "date" },
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

    let originalData = rawData?.history;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      stockList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    stockList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  rawData = data?.getStockDividend;
  stockList = rawData?.history?.slice(0, 50);

  exDividendDate = rawData?.history?.at(0)?.date;
  dividendYield = rawData?.dividendYield;
  annualDividend = rawData?.annualDividend;
  payoutFrequency = rawData?.payoutFrequency;
  payoutRatio = rawData?.payoutRatio;
  dividendGrowth = rawData?.dividendGrowth;

  htmlOutput = generateDividendInfoHTML();

  const exportData = (format = "csv") => {
    if (["Pro", "Plus"]?.includes(data?.user?.tier)) {
      const csvRows = [];

      // Add headers row matching your table columns
      csvRows.push(
        "Date,Adjusted Dividend,Declaration Date,Record Date,Payment Date",
      );

      rawData?.history?.forEach((item) => {
        const formatDate = (dateStr) => {
          if (!dateStr) return "n/a";
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = `${date.getMonth() + 1}`.padStart(2, "0");
          const day = `${date.getDate()}`.padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const row = [
          formatDate(item?.date),
          item?.adjDividend != null ? item?.adjDividend.toFixed(3) : "n/a",
          formatDate(item?.declarationDate),
          formatDate(item?.recordDate),
          formatDate(item?.paymentDate),
        ];

        csvRows.push(row.join(","));
      });

      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${ticker?.toLowerCase()}_dividend_data.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  };
</script>

<section class="w-full overflow-hidden h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 pt-3 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-6">
          <h2 class="text-xl sm:text-2xl font-bold mb-4 w-full">Dividends</h2>

          <Infobox text={htmlOutput} />
        </div>

        {#if rawData?.history?.length > 0}
          <div
            class="shadow-xs mb-4 grid grid-cols-2 grid-rows-1 divide-gray-300 dark:divide-gray-600 rounded border border-gray-300 dark:border-gray-600 md:grid-cols-3 md:grid-rows-1 divide-x"
          >
            <div class="p-4 bp:p-5 sm:p-6">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-[1rem]"
              >
                Dividend Yield
              </label>
              <div class="mt-1 break-words font-semibold leading-8 text-xl">
                {dividendYield !== "0.00" ? dividendYield : "0"}%
              </div>
            </div>
            <div
              class="p-4 bp:p-5 sm:p-6 border-b border-gray-300 dark:border-gray-600"
            >
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-[1rem]"
              >
                Annual Dividend
              </label>

              <div class="mt-1 break-words font-semibold leading-8 text-xl">
                {annualDividend !== "0.00" ? annualDividend : "0"}
              </div>
            </div>
            <div class="p-4 bp:p-5 sm:p-6 border-t border-b sm:border-none">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-[1rem]"
              >
                Ex-Dividend Date
              </label>

              <div class="mt-1 break-words font-semibold leading-8 text-xl">
                {new Date(exDividendDate)?.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  daySuffix: "2-digit",
                })}
              </div>
            </div>

            <div class="p-4 bp:p-5 sm:p-6 border-t">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-[1rem]"
              >
                Payout Frequency
              </label>

              <div class="mt-1 break-words font-semibold leading-8 text-xl">
                {payoutFrequency ? payoutFrequency : "n/a"}
              </div>
            </div>
            <div class="p-4 bp:p-5 sm:p-6">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-[1rem]"
              >
                Payout Ratio
              </label>

              <div class="mt-1 break-words font-semibold leading-8 text-xl">
                {payoutRatio !== "0.00" && payoutRatio !== null
                  ? payoutRatio + "%"
                  : "n/a"}
              </div>
            </div>
            <div
              class="p-4 bp:p-5 sm:p-6 border-t border-gray-300 dark:border-gray-600"
            >
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-[1rem]"
              >
                Dividend Growth
              </label>

              <div class="mt-1 break-words font-semibold leading-8 text-xl">
                {dividendGrowth ? dividendGrowth + "%" : "n/a"}
              </div>
            </div>
          </div>

          <div
            class="flex flex-row justify-between items-center w-full mt-5 mb-4"
          >
            <h2 class="text-xl sm:text-2xl font-bold">Dividends History</h2>
            <Button
              on:click={() => exportData("csv")}
              class="ml-2 w-fit shadow-xs border-gray-300 dark:border-gray-600 border sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2  rounded truncate"
            >
              <span class="truncate text-xs sm:text-sm">Download</span>
              <svg
                class="{['Pro', 'Plus']?.includes(data?.user?.tier)
                  ? 'hidden'
                  : ''} ml-1 -mt-0.5 w-3.5 h-3.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                ><path
                  fill="#A3A3A3"
                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                /></svg
              >
            </Button>
          </div>

          {#if stockList?.length > 0}
            <div
              class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-4"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody class="">
                  {#each stockList as item}
                    <tr
                      class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    >
                      <td
                        class="text-start text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {new Date(item?.date)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        })}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        ${item?.adjDividend?.toFixed(3)}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.declarationDate?.length !== 0
                          ? new Date(item?.declarationDate)?.toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                daySuffix: "2-digit",
                              },
                            )
                          : "n/a"}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.recordDate?.length !== 0
                          ? new Date(item?.recordDate)?.toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                daySuffix: "2-digit",
                              },
                            )
                          : "n/a"}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.paymentDate?.length !== 0
                          ? new Date(item?.paymentDate)?.toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                daySuffix: "2-digit",
                              },
                            )
                          : "n/a"}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <span class="text-gray-800 dark:text-gray-200 text-sm italic">
              * Dividend amounts are adjusted for stock splits when applicable.
            </span>
          {:else}
            <Infobox text="No dividend data found" />
          {/if}
        {/if}
      </div>
    </div>
  </div>
</section>
