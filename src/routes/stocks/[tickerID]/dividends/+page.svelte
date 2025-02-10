<script lang="ts">
  import {
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
  let dateDistance;
  let rawData = data?.getStockDividend || [];

  let exDividendDate = rawData?.history?.at(0)?.date;
  let dividendYield = rawData?.dividendYield;
  let annualDividend = rawData?.annualDividend;
  let payoutFrequency = rawData?.payoutFrequency;
  let payoutRatio = rawData?.payoutRatio;
  let dividendGrowth = rawData?.dividendGrowth;

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

        const payoutFrequencyText =
          payoutFrequency === 4
            ? "3 months"
            : payoutFrequency === 2
              ? "6 months"
              : payoutFrequency === 1
                ? "12 months"
                : "n/a";

        return `
        <span>
          ${$displayCompanyName} has an annual dividend of $${annualDividend} per share, with a forward yield of ${dividendYield}%. 
          The dividend is paid every ${payoutFrequencyText} and the last ex-dividend date was ${formattedExDividendDate}.
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

  let htmlOutput = generateDividendInfoHTML();

  $: {
    if ($stockTicker) {
      rawData = data?.getStockDividend || [];
      exDividendDate = rawData?.history?.at(0)?.date;
      dividendYield = rawData?.dividendYield;
      annualDividend = rawData?.annualDividend;
      payoutFrequency = rawData?.payoutFrequency;
      payoutRatio = rawData?.payoutRatio;
      dividendGrowth = rawData?.dividendGrowth;

      htmlOutput = generateDividendInfoHTML();
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Dividend History, Dates & Yield · Stocknear`}
  description={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}) stock price quote with breaking news, financials, statistics, charts and more.`}
/>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-6">
          <h1 class="text-xl sm:text-2xl text-gray-200 font-bold mb-4 w-full">
            Dividends
          </h1>

          <Infobox text={htmlOutput} />
        </div>

        {#if rawData?.history?.length !== 0}
          <div
            class="mb-4 grid grid-cols-2 grid-rows-1 divide-gray-600 rounded-md border border-gray-600 md:grid-cols-3 md:grid-rows-1 divide-x"
          >
            <div class="p-4 bp:p-5 sm:p-6">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]"
              >
                Dividend Yield
              </label>
              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-xl"
              >
                {dividendYield !== "0.00" ? dividendYield : "0"}%
              </div>
            </div>
            <div class="p-4 bp:p-5 sm:p-6 border-l border-b border-contrast">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]"
              >
                Annual Dividend
              </label>

              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-xl"
              >
                {annualDividend !== "0.00" ? annualDividend : "0"}
              </div>
            </div>
            <div
              class="p-4 bp:p-5 sm:p-6 border-t border-r border-contrast border-contrast"
            >
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]"
              >
                Ex-Dividend Date
              </label>

              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-xl"
              >
                {new Date(exDividendDate)?.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  daySuffix: "2-digit",
                })}
              </div>
            </div>

            <div class="p-4 bp:p-5 sm:p-6 border-t border-r border-contrast">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]"
              >
                Payout Frequency
              </label>

              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-xl"
              >
                {payoutFrequency === 4
                  ? "Quartely"
                  : payoutFrequency === 2
                    ? "Half-Yearly"
                    : payoutFrequency === 1
                      ? "Annually"
                      : "n/a"}
              </div>
            </div>
            <div class="p-4 bp:p-5 sm:p-6 border-t border-r border-contrast">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]"
              >
                Payout Ratio
              </label>

              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-xl"
              >
                {payoutRatio !== "0.00" ? payoutRatio : "0"}%
              </div>
            </div>
            <div class="p-4 bp:p-5 sm:p-6 border-t border-r border-contrast">
              <label
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]"
              >
                Dividend Growth
              </label>

              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-xl"
              >
                {dividendGrowth !== "NaN" ? dividendGrowth + "%" : "-"}
              </div>
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row items-start sm:items-center w-full mt-14 mb-8"
          >
            <h3 class="text-xl text-white font-semibold">Dividends History</h3>
          </div>

          {#if rawData?.history?.length !== 0}
            <div
              class="overflow-x-scroll no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded-md mb-4"
            >
              <table
                class="table table-sm table-compact flex justify-start items-center w-full m-auto"
              >
                <thead>
                  <tr class="bg-default border-b border-gray-800">
                    <th
                      class="text-start bg-default text-white text-sm font-semibold"
                    >
                      Ex-Divid. Date
                    </th>
                    <th
                      class="text-end bg-default text-white text-sm font-semibold"
                    >
                      Cash Amount
                    </th>
                    <th
                      class="text-end bg-default text-white text-sm font-semibold"
                    >
                      Record Date
                    </th>
                    <th
                      class="text-end bg-default text-white text-sm font-semibold"
                    >
                      Pay Date
                    </th>
                  </tr>
                </thead>
                <tbody class="">
                  {#each rawData?.history as item}
                    <tr class="text-white odd:bg-odd border-b border-gray-800">
                      <td
                        class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white font-medium"
                      >
                        {new Date(item?.date)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        })}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                      >
                        {item?.adjDividend?.toFixed(3)}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
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
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
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
            <span class="text-gray-200 text-sm italic">
              * Dividend amounts are adjusted for stock splits when applicable.
            </span>
          {:else}
            <h1
              class="text-xl m-auto flex justify-center text-gray-200 mb-4 mt-10"
            >
              No history found
            </h1>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 400px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
