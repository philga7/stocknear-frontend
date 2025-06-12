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

  let fundamentalData = [
    {
      label: "SBC as % of Revenue",
      value: 2.94,
      sentiment: "Good",
    },
    {
      label: "SBC as % of Operating Cash Flow",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "SBC as % of Free Cash Flow",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "ROIC",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "ROCE",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "Return on Equity",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "Return on Assets",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "5-Year Returns above SPY",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "3-Year Returns above SPY",
      value: 2.94,
      sentiment: "Bad",
    },
  ];
</script>

<h2 class="text-xl sm:text-3xl font-bold mt-8">Management</h2>

<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <tbody class="">
      {#each fundamentalData as item}
        <tr
          class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
        >
          <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.label}
          </td>
          <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.value + "%"}
          </td>

          <td class=" text-sm sm:text-[1rem] whitespace-nowrap text-end">
            <label class="badge badge-lg w-24 rounded-[3px]"
              >{item?.sentiment}</label
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<p class="mt-8 mb-4">
  AAPL's management efficiency is reflected in its use of Stock-Based
  Compensation (SBC), which stands at a moderate 10.99% of Free Cash Flow. This
  suggests that the company rewards its employees with equity without
  significantly diluting shareholder value or impacting its cash reserves. The
  Return on Invested Capital (ROIC) and Return on Capital Employed (ROCE) are
  remark- ably high at 68.81% and 55.36%, respectively, indicating AAPL's
  exceptional ability to generate profits from its investments and overall
  capital
</p>

<p class="mb-4">
  Furthermore, AAPL boasts an extraordinary Return on Equity (ROE) of 135.31%,
  which signifies how effectively it generates profits relative to shareholders'
  equity. A high ROE often reflects a company's ability to reinvest earnings
  efficiently to generate additional earnings without needing as much capital
  funding. Additionally, the Return on Assets (ROA) is also impressive at
  29.75%, showing that AAPL is highly efficient in turning its assets into
  profit.
</p>

<p class="mb-4">
  In summary, AAPL demonstrates strong management effectiveness across all key
  financial metrics, including prudent use of stock-based compensation and
  superior returns on investment, equity, and assets. Since 2000, the CEO has
  also provided a staggering return of over 20,887%, vastly outperforming the
  S&P 500 index benchmark. With these factors considered, AAPL's average
  Management score stands commendably high at 4.4/5, reflecting robust
  leadership and financial stewardship within the company.
</p>

<p class="mb-4">
  In the past 18 months, insiders at Apple have sold shares worth approximately
  $479.6 million, with no insider purchases or buybacks recorded. The top five
  shareholders are institutional investors: The Vanguard Group, Inc., Berkshire
  Hathaway Inc., BlackRock Institutional Trust Company, N.A., State Street
  Global Advisors US, and Geode Capital Management, L.L.C. These entities
  collectively hold over 3.2 billion shares of AAPL stock. This concentration of
  ownership among major investment firms indicates a strong institutional
  backing for Apple, which can be reassuring for individual investors as it
  often reflects confidence in the company's long-term prospects and stability.
</p>

<h3 class="text-lg sm:text-xl font-semibold mt-5 mb-5">Ownership Details</h3>

<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <tbody class="">
      {#each fundamentalData as item}
        <tr
          class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
        >
          <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.label}
          </td>
          <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.value + "%"}
          </td>

          <td class=" text-sm sm:text-[1rem] whitespace-nowrap text-end">
            <label class="badge badge-lg w-24 rounded-[3px]"
              >{item?.sentiment}</label
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
