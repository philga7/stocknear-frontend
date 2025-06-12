<script lang="ts">
  export let dataList = [
    {
      label: "Dividend Growth Rate",
      value: -34.71,
      rating: "Very Bad",
    },
    {
      label: "Dividend Yield",
      value: 4.17,
      rating: "Average",
    },
    {
      label: "Payout Ratio TTM",
      value: 14.87,
      rating: "Very Good",
    },
  ];

  let dividendList = [
    {
      symbol: "A",
      date: "2025-07-01",
      recordDate: "2025-07-01",
      paymentDate: "2025-07-23",
      declarationDate: "2025-05-21",
      adjDividend: 0.248,
      dividend: 0.248,
      yield: 0.8604794099569759,
      frequency: "Quarterly",
    },
    {
      symbol: "A",
      date: "2025-04-01",
      recordDate: "2025-04-01",
      paymentDate: "2025-04-23",
      declarationDate: "2025-02-19",
      adjDividend: 0.248,
      dividend: 0.248,
      yield: 0.8487505480052608,
      frequency: "Quarterly",
    },
  ];

  let ratiosName = [
    { label: "EV/FCF (TTM)", align: "left" },
    { label: "P/E (TTM)", align: "right" },
    { label: "P/FCF (TTM)", align: "right" },
    { label: "P/S (TTM)", align: "right" },
  ];
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
        {#each ratiosName as column}
          <th
            class="  font-semibold text-sm sm:text-[1rem] whitespace-nowrap {column.align ===
            'right'
              ? 'text-end'
              : column.align === 'left'
                ? 'text-start'
                : 'text-center'}"
          >
            {column?.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="">
      {#each dividendList as item}
        <tr
          class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
        >
          <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
            {new Date(item?.date)?.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              daySuffix: "2-digit",
            })}
          </td>
          <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
            ${item?.adjDividend?.toFixed(3)}
          </td>
          <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.declarationDate?.length !== 0
              ? new Date(item?.declarationDate)?.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  daySuffix: "2-digit",
                })
              : "n/a"}
          </td>
          <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.recordDate?.length !== 0
              ? new Date(item?.recordDate)?.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  daySuffix: "2-digit",
                })
              : "n/a"}
          </td>
        </tr>
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

<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <tbody class="">
      {#each dividendList as item}
        <tr
          class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
        >
          <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
            SBC as % of Revenue
          </td>
          <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
            ${item?.adjDividend?.toFixed(3)}
          </td>

          <td class=" text-sm sm:text-[1rem] whitespace-nowrap text-end">
            <label class="badge badge-lg rounded-[3px]">Good</label>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
