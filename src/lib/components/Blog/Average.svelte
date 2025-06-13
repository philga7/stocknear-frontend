<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";

  export let blogData = [];
</script>

<h2 class="text-xl sm:text-3xl font-bold mt-8">Industry Comparison</h2>
<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <thead>
      <tr
        class="bg-white dark:bg-default border-b border-[#27272A] text-muted dark:text-white"
      >
        {#each ["Metric", "Industry Value", "Stock Value", "Difference"] as column, index}
          <th
            class="  font-semibold text-sm sm:text-[1rem] whitespace-nowrap {index ===
            0
              ? 'text-start'
              : 'text-end'}"
          >
            {column}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="">
      {#each blogData as item}
        {#if ["evToFreeCashFlow", "priceToEarningsRatio", "priceToFreeCashFlowRatio", "priceToSalesRatio"]?.includes(item?.key)}
          <tr
            class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
          >
            <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.label}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.industryAvg}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.value}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.upside + "%"}
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<p class="mt-8 mb-4">
  Apple Inc's 5-year dividend growth rate is slightly below the industry average
  at 6.58% compared to 6.67%, indicating a marginally slower increase in
  dividend payouts. The indicated annual dividend yield for Apple is
  considerably lower at 0.47% versus the industry's 1.29%, which means investors
  might see less income from dividends relative to other companies in the same
  sector. Additionally, Apple's payout ratio on a trailing twelve-month (TTM)
  basis is much lower at 15.08% compared to the industry standard of 41.07%.
  This suggests that Apple retains a larger portion of its earnings, potentially
  using it for reinvestment or other strategic purposes, which could bode well
  for future growth and innovation.
</p>

<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <thead>
      <tr
        class="bg-white dark:bg-default border-b border-[#27272A] text-muted dark:text-white"
      >
        {#each ["Metric", "Industry Value", "Stock Value", "Difference"] as column, index}
          <th
            class="  font-semibold text-sm sm:text-[1rem] whitespace-nowrap {index ===
            0
              ? 'text-start'
              : 'text-end'}"
          >
            {column}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="">
      {#each blogData as item}
        {#if ["cagr5YearRevenue", "cagr5YearEPS", "revenuePerShare", "revenuePerEmployee"]?.includes(item?.key)}
          <tr
            class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
          >
            <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.label}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {abbreviateNumber(item?.industryAvg)}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {abbreviateNumber(item?.value)}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.upside + "%"}
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<p class="mb-4">
  Looking at the longer-term trend, Apple's Dividends Per Share have grown at a
  Compound Annual Growth Rate (CAGR) of approximately 5.37% over the past five
  years, demonstrating consistent growth in dividend payouts over time.
  Additionally, Apple's Payout Ratio and Free Cash Flow Payout Ratio are both
  favorable at around 14.87% and 14.65%, respectively. These ratios suggest that
  Apple is using only a small portion of its earnings and free cash flow for
  dividends, which implies potential for future dividend increases or other
  shareholder-friendly activities without straining its financial resources.
</p>

<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <thead>
      <tr
        class="bg-white dark:bg-default border-b border-[#27272A] text-muted dark:text-white"
      >
        {#each ["Metric", "Industry Value", "Stock Value", "Difference"] as column, index}
          <th
            class="  font-semibold text-sm sm:text-[1rem] whitespace-nowrap {index ===
            0
              ? 'text-start'
              : 'text-end'}"
          >
            {column}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="">
      {#each blogData as item}
        {#if ["grossProfitMargin", "netProfitMargin", "operatingProfitMargin", "altmanZScore"]?.includes(item?.key)}
          <tr
            class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
          >
            <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.label}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {abbreviateNumber(item?.industryAvg)}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {abbreviateNumber(item?.value)}
            </td>
            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
              {item?.upside + "%"}
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<p class="mb-4">
  Apple Inc's fnancial metrics show it trading at a premium compared to industry
  averages. Its EV/FCF (Enterprise Value to Free Cash Flow) TTM (Trailing Twelve
  Months) is 32.68, higher than the industry's 26.84, suggesting investors are
  willing to pay more for Apple's cash generation potential. The P/E (Price to
  Earnings) ratio is also elevated at 32.46 versus the industry's 25.71,
  indicating higher earnings expectations. Apple's P/FCF (Price to Free Cash
  Flow per Share) and P/S (Price to Sales) ratios are sig- nifcantly higher than
  the industry, at 31.97 and 8.54 respectively, refecting its strong market
  position and robust sales outlook despite a higher price tag on its stock.
</p>
