<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";
  import ScrollToTop from "$lib/components/ScrollToTop.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;
  let rawData = data?.getStatistics ?? {};

  let companyName = removeCompanyStrings($displayCompanyName);

  function checkValue(val, category) {
    if (val !== null && val !== undefined) {
      if (category === "percent") {
        return `${val}%`;
      } else if (category === "int") {
        return abbreviateNumber(val);
      } else {
        return val;
      }
    } else {
      return "n/a";
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Statistics & Valuation Metrics`}
  description={`Detailed statistics for ${$displayCompanyName} (${$stockTicker}) stock, including valuation, metrics, financial numbers, share information and more.`}
/>

<section class=" w-full">
  <div class="sm:pb-7 sm:pt-7 sm:pl-7 m-auto mt-7 sm:mt-0">
    <div class="mb-6">
      {#if Object?.keys(rawData)?.length > 0}
        <div
          class="space-y-5 xs:space-y-6 lg:grid lg:grid-cols-3 lg:space-x-10 lg:space-y-0"
        >
          <div class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8">
            <div class="flex items-start justify-between">
              <h1 class="text-xl sm:text-2xl font-bold">
                {companyName} Statistics
              </h1>
            </div>

            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Share Statistics</h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                {companyName} has {abbreviateNumber(
                  rawData?.sharesOutStanding,
                  false,
                )}
                shares outstanding. The number of shares has increased by {rawData?.sharesYoY}%
                in one year.
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Outstanding</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="3,194,640,415"
                      >{abbreviateNumber(rawData?.sharesOutStanding, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Change (YoY)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.sharesYoY, "percent")}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Change (QoQ)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.sharesQoQ, "percent")}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Owned by Institutions (%)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{checkValue(
                        rawData?.institutionalOwnership,
                        "percent",
                      )}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Floating</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="2,777,647,654"
                      >{abbreviateNumber(rawData?.floatShares, false)}</td
                    >
                  </tr>
                  <tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Failed to Deliver (FTD) Shares</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="2,777,647,654"
                      >{abbreviateNumber(rawData?.failToDeliver, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FTD / Avg. Volume</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.relativeFTD < 0.01
                        ? "< 0.01%"
                        : checkValue(
                            abbreviateNumber(rawData?.relativeFTD),
                            "percent",
                          )}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">
                Short Selling Information
              </h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                The latest short interest is {abbreviateNumber(
                  rawData?.sharesShort,
                  false,
                )}, so {rawData?.shortOutStandingPercent}% of the outstanding
                shares have been sold short.
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short Interest</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="74,332,630"
                      >{abbreviateNumber(rawData?.sharesShort, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short % of Shares Out</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.shortOutStandingPercent}%</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short % of Float</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.shortFloatPercent}%</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short Ratio (days to cover)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.shortRatio}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Valuation Ratios</h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                The PE ratio is {rawData?.priceToEarningsRatio} and the forward PE
                ratio is {rawData?.forwardPE}.
                {rawData?.priceToEarningsGrowthRatio !== null
                  ? `${companyName}'s PEG ratio is
                ${rawData?.priceToEarningsGrowthRatio}.`
                  : ""}
              </p>

              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PE Ratio</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.priceToEarningsRatio}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Forward PE</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.forwardPE ?? "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PS Ratio</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.priceToSalesRatio}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Forward PS</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.forwardPS}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PB Ratio</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.priceToBookRatio}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>P/FCF Ratio</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.priceToFreeCashFlowRatio}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PEG Ratio</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.priceToEarningsGrowthRatio !== null
                        ? rawData?.priceToEarningsGrowthRatio
                        : "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/ratios`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto dark:sm:hover:bg-gray-300 bg-[#3B82F6] sm:hover:bg-blue-600 dark:bg-[#fff] transition duration-100"
              >
                Financial Ratio History
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">
                Enterprise Valuation
              </h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                {#if rawData?.enterpriseValue !== null}
                  {companyName} has an Enterprise Value (EV) of {abbreviateNumber(
                    rawData?.enterpriseValue,
                    false,
                  )}.
                {:else}
                  Currently the Enterprise Value (EV) is not available for {companyName}.
                {/if}
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / Sales</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.evToSales ?? "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / EBITDA</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.evToEBITDA ?? "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / EBIT</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.evToOperatingCashFlow ?? "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / FCF</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.evToFreeCashFlow ?? "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Financial Position</h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                The company has a current ratio of {rawData?.currentRatio}, with
                a Debt / Equity ratio of {rawData?.debtToEquityRatio}.
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Current Ratio</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.currentRatio}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Quick Ratio</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.quickRatio}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Debt / Equity</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.debtToEquityRatio}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Debt / EBITDA</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.debtToEBITDARatio, false)}</td
                    >
                  </tr>
                  <tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Debt / FCF</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(
                        rawData?.debtToFreeCashFlowRatio,
                        false,
                      )}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Interest Coverage</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.interestCoverageRatio}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">
                Financial Efficiency
              </h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                Return on Equity is {checkValue(
                  rawData?.returnOnEquity,
                  "percent",
                )} and Return on Invested Capital is {checkValue(
                  rawData?.returnOnInvestedCapital,
                  "percent",
                )}.
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Equity</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.returnOnEquity, "percent")}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Assets</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.returnOnAssets, "percent")}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Invested Capital</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{checkValue(
                        rawData?.returnOnInvestedCapital,
                        "percent",
                      )}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Revenue Per Employee</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >${abbreviateNumber(rawData?.revenuePerEmployee)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Profits Per Employee</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >${abbreviateNumber(rawData?.profitPerEmployee)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Employee Count</span></td
                    >
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="140,473"
                      >{rawData?.employees?.toLocaleString("en-US")}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Asset Turnover</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.assetTurnover}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Inventory Turnover</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.inventoryTurnover
                        ? abbreviateNumber(rawData?.inventoryTurnover, false)
                        : "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Taxes</h2>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Income Tax</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.incomeTaxExpense, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Effective Tax Rate</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.effectiveTaxRate, "percent")}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
          </div>
          <div class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8">
            <div class="mt-0 sm:mt-9 2xl:mt-0">
              <h2 class="mb-2 px-0.5 text-xl font-bold">
                Stock Price Statistics
              </h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                The stock price has increased by {rawData?.change1Y}% in the
                last 52 weeks. The beta is {rawData?.beta}, so {companyName}'s
                price volatility has been {rawData?.beta > 0
                  ? "higher"
                  : "lower"} than the market average.
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Beta</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.beta}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>52-Week Price Change</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.change1Y}%</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>50-Day Moving Average</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.sma50}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>200-Day Moving Average</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.sma200}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Relative Strength Index (RSI)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.rsi}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Average Volume (20 Days)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.avgVolume, false)}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>

            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Income Statement</h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                {#if rawData?.revenue !== null && rawData?.revenue !== 0}
                  In the last 12 months, {companyName} had revenue of {abbreviateNumber(
                    rawData?.revenue,
                    false,
                  )}
                  and earned {abbreviateNumber(rawData?.netIncome, false)}
                  in profits. Earnings per share was {rawData?.eps}.
                {/if}
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Revenue</span></td
                    >
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.revenue !== 0 && rawData?.revenue !== null
                        ? abbreviateNumber(rawData?.revenue, false)
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Gross Profit</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.grossProfit, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Income</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.operatingIncome, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Net Income</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.netIncome, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBITDA</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.ebitda, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBIT</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.ebit !== 0 && rawData?.ebit !== null
                        ? abbreviateNumber(rawData?.ebit, false)
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Earnings Per Share (EPS)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.eps}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto dark:sm:hover:bg-gray-300 bg-[#3B82F6] sm:hover:bg-blue-600 dark:bg-[#fff] transition duration-100"
              >
                Full Income Statement
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Balance Sheet</h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                The company has {abbreviateNumber(
                  rawData?.cashAndCashEquivalents,
                  false,
                )} in cash and {abbreviateNumber(rawData?.totalDebt, false)} in debt,
                giving a net cash position of {abbreviateNumber(
                  rawData?.cashAndCashEquivalents - rawData?.totalDebt,
                  false,
                )}.
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Cash &amp; Cash Equivalents</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(
                        rawData?.cashAndCashEquivalents,
                        false,
                      )}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Total Debt</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.totalDebt, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Net Cash</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="20,865,000,000"
                      >{abbreviateNumber(
                        rawData?.cashAndCashEquivalents - rawData?.totalDebt,
                        false,
                      )}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Retained Earnings</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.retainedEarnings, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Total Assets</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.totalAssets, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Working Capital</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.workingCapital, false)}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/balance-sheet`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto dark:sm:hover:bg-gray-300 bg-[#3B82F6] sm:hover:bg-blue-600 dark:bg-[#fff] transition duration-100"
              >
                Full Balance Sheet
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Cash Flow</h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                In the last 12 months, operating cash flow was {abbreviateNumber(
                  rawData?.operatingCashFlow,
                  false,
                )}
                and capital expenditures {abbreviateNumber(
                  rawData?.capitalExpenditure,
                  false,
                )}, giving a free cash flow of {abbreviateNumber(
                  rawData?.freeCashFlow,
                  false,
                )}.
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Cash Flow</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.operatingCashFlow, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Capital Expenditures</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(
                        rawData?.capitalExpenditure,
                        false,
                      )}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Free Cash Flow</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.freeCashFlow, false)}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Per Share</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.freeCashFlowPerShare}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/cash-flow`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto dark:sm:hover:bg-gray-300 bg-[#3B82F6] sm:hover:bg-blue-600 dark:bg-[#fff] transition duration-100"
              >
                Full Cash Flow Statement
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Margins</h2>
              <p class="mb-4 px-0.5 xs:text-[1.05rem] lg:leading-normal">
                {#if rawData?.grossProfitMargin !== 0 && rawData?.grossProfitMargin !== null}
                  Gross margin is {checkValue(
                    rawData?.grossProfitMargin,
                    "percent",
                  )}, with operating and profit margins of {checkValue(
                    rawData?.operatingProfitMargin,
                    "percent",
                  )} and {checkValue(rawData?.netProfitMargin, "percent")}.
                {/if}
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Gross Margin</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.grossProfitMargin !== 0 &&
                      rawData?.grossProfitMargin !== null
                        ? checkValue(rawData?.grossProfitMargin, "percent")
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Margin</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.operatingProfitMargin !== 0 &&
                      rawData?.operatingProfitMargin !== null
                        ? checkValue(rawData?.operatingProfitMargin, "percent")
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Pretax Margin</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.pretaxProfitMargin !== 0 &&
                      rawData?.pretaxProfitMargin !== null
                        ? checkValue(rawData?.pretaxProfitMargin, "percent")
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Profit Margin</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.netProfitMargin !== 0 &&
                      rawData?.netProfitMargin !== null
                        ? checkValue(rawData?.netProfitMargin, "percent")
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBITDA Margin</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.ebitdaMargin !== 0 &&
                      rawData?.ebitdaMargin !== null
                        ? checkValue(rawData?.ebitdaMargin, "percent")
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBIT Margin</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.ebitMargin !== 0 &&
                      rawData?.ebitMargin !== null
                        ? checkValue(rawData?.ebitMargin, "percent")
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Margin</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.freeCashFlowMargin !== 0 &&
                      rawData?.freeCashFlowMargin !== null
                        ? checkValue(rawData?.freeCashFlowMargin, "percent")
                        : "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
          </div>

          <div
            class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8 w-full max-w-[360px]"
          >
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">
                Dividends &amp; Yields
              </h2>
              <p
                class="mb-4 px-0.5 leading-relaxed xs:text-[1.05rem] lg:leading-normal"
              >
                {#if rawData?.annualDividend !== null && rawData?.dividendYield !== null}
                  {$stockTicker} pays an annual dividend of ${rawData?.annualDividend},
                  which amounts to a dividend yield of {rawData?.dividendYield}%.
                {:else}
                  {$stockTicker} does not appear to pay any dividends at this time.
                {/if}
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Dividend Per Share</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.annualDividend !== null
                        ? "$" + rawData?.annualDividend?.toFixed(2)
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Dividend Yield</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.dividendYield !== null
                        ? rawData?.dividendYield + "%"
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Dividend Growth (YoY)</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.dividendGrowth !== null
                        ? rawData?.dividendGrowth + "%"
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Payout Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="n/a"
                      >{rawData?.payoutRatio !== null
                        ? rawData?.payoutRatio + "%"
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Earnings Yield</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.earningsYield !== null
                        ? checkValue(rawData?.earningsYield, "percent")
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Yield</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="0.578%"
                      >{rawData?.freeCashFlowYield !== null
                        ? checkValue(rawData?.freeCashFlowYield, "percent")
                        : "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/dividends`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto dark:sm:hover:bg-gray-300 bg-[#3B82F6] sm:hover:bg-blue-600 dark:bg-[#fff] transition duration-100"
              >
                Dividend Details
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Analyst Forecast</h2>
              <p
                class="mb-4 px-0.5 leading-relaxed xs:text-[1.05rem] lg:leading-normal"
                data-test="statistics-text"
              >
                {#if rawData?.priceTarget && rawData?.upside && rawData?.analystRating}
                  The average price target for {$stockTicker} is ${rawData?.priceTarget},
                  which is {rawData?.upside}% {rawData?.upside > 0
                    ? "higher"
                    : "lower"} than the current price. The consensus rating is "{rawData?.analystRating}".
                {:else}
                  Currently there are no analyst rating for {$stockTicker}.
                {/if}
              </p>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Price Target</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="$197.17"
                      >{rawData?.priceTarget !== null
                        ? "$" + rawData?.priceTarget
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Price Target Difference</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="30.69%"
                      >{rawData?.upside !== null
                        ? rawData?.upside + "%"
                        : "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Analyst Consensus</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="Strong Buy">{rawData?.analystRating ?? "n/a"}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Analyst Count</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="30">{rawData?.analystCounter ?? "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/forecast/analyst`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto dark:sm:hover:bg-gray-300 bg-[#3B82F6] sm:hover:bg-blue-600 dark:bg-[#fff] transition duration-100"
              >
                Stock Forecasts
              </a>
            </div>
            {#if rawData?.lastStockSplit && rawData?.splitType && rawData?.splitRatio}
              <div>
                <h2 class="mb-2 px-0.5 text-xl font-bold">Stock Splits</h2>
                <p
                  class="mb-4 px-0.5 leading-relaxed xs:text-[1.05rem] lg:leading-normal"
                  data-test="statistics-text"
                >
                  The last stock split was on {new Date(
                    rawData?.lastStockSplit,
                  ).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "Europe/Berlin",
                  })}. It was a
                  {rawData?.splitType}
                  split with a ratio of {rawData?.splitRatio}.
                </p>
                <table
                  class="w-full border border-gray-300 dark:border-gray-800"
                >
                  <tbody
                    ><tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                      ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                        ><span>Last Split Date</span>
                      </td>
                      <td
                        class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                        title="August 22, 2000"
                        >{new Date(rawData?.lastStockSplit).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "Europe/Berlin",
                          },
                        )}</td
                      >
                    </tr><tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                      ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                        ><span>Split Type</span>
                      </td>
                      <td
                        class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                        title="Forward">{rawData?.splitType}</td
                      >
                    </tr><tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                      ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                        ><span>Split Ratio</span>
                      </td>
                      <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                        >{rawData?.splitRatio}</td
                      >
                    </tr></tbody
                  >
                </table>
              </div>
            {/if}
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold">Scores</h2>
              <table class="w-full border border-gray-300 dark:border-gray-800">
                <tbody
                  ><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Altman Z-Score</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      title="n/a">{rawData?.altmanZScore}</td
                    >
                  </tr><tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Piotroski F-Score</span>
                    </td>
                    <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2"
                      >{rawData?.piotroskiScore}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>
      {:else}
        <Infobox text="No data available" />
      {/if}
    </div>

    <ScrollToTop />
  </div>
</section>
