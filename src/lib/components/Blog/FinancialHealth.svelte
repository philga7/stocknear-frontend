<script lang="ts">
  export let blogData = [];
</script>

<h2 class="text-xl sm:text-3xl font-bold mt-8">Financial Health</h2>

<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <tbody class="">
      {#each blogData as item}
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
            <label
              class="badge badge-lg w-24 rounded-[3px] {[
                'Very Good',
                'Good',
              ]?.includes(item?.sentiment)
                ? 'bg-green-800 dark:bg-green-600'
                : item?.sentiment === 'Average'
                  ? 'bg-orange-800 dark:bg-orange-600'
                  : 'bg-red-800 dark:bg-red-600'}">{item?.sentiment}</label
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<p class="mt-8 mb-4">
  Apple's growth profile presents a mixed picture, with some areas showing
  improvement while others indicate challenges. The company's revenue has
  slightly decreased by 0.9 percent, which could suggest a slowdown in sales or
  more competitive market conditions.
</p>

<p class="mb-4">
  Despite the dip in revenue, Apple has managed to increase its gross profit by
  4.62 percent. This indicates that while they may be selling less, they are
  making more money on what they do sell due to better margins or cost
  efficiencies. Operating income and net income have also seen increases of 5.29
  percent and 6.43 percent respectively, demonstrating Apple's ability to grow
  its profits from core business activities.
</p>

<p class="mb-4">
  The company's cash flow situation is also generally positive, with operating
  cash flow up by 0.89 percent and free cash flow—which represents the cash
  Apple can use for dividends, share buybacks, or investments—increasing by 4.54
  percent.
</p>

<p class="mb-4">
  In summary, despite a slight decrease in revenue, Apple has shown an ability
  to improve profitability and maintain healthy cash flows. These factors
  contribute to an average growth score of 3.13/5 according to Stock Unlock's
  analysis, reflecting a solid but not exceptional performance in growth metrics
  for the period assessed.
</p>
