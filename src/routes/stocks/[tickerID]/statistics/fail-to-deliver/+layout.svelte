<script lang="ts">
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";

  export let data;
  const similarStocks = data?.getSimilarStocks?.sort(
    (a, b) => b?.relativeFTD - a?.relativeFTD,
  );
</script>

<section class="w-full overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 mt-3">
          {#if similarStocks?.length > 0}
            <div
              class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <h3 class="p-2 pt-4 text-xl font-semibold">Related Stocks</h3>
              <table class="table table-sm table-compact w-full">
                <thead class="text-muted dark:text-white"
                  ><tr
                    ><th
                      class="whitespace-nowrap border-b border-gray-300 dark:border-gray-600 font-semibold text-[1rem] text-left px-2"
                      >Company</th
                    >
                    <th
                      class="whitespace-nowrap border-b border-gray-300 dark:border-gray-600 font-semibold text-[1rem] text-right px-2"
                      >FTD / Avg Volume</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each similarStocks?.slice(0, 8) as item, index}
                    {#if item?.relativeFTD > 0}
                      <tr
                        class="border-gray-300 dark:border-gray-800 text-[1rem] {index !==
                        similarStocks?.slice(0, 8).length - 1
                          ? 'border-b'
                          : ''} "
                        ><td class="text-left text-[1rem] px-2"
                          ><a
                            href={`/stocks/${item?.symbol}`}
                            class="text-blue-700 sm:hover:text-muted dark:sm:hover:text-white dark:text-blue-400"
                            >{removeCompanyStrings(item?.name)}</a
                          ></td
                        >
                        <td class="text-right text-[1rem] px-2"
                          >{item?.relativeFTD > 0.01
                            ? abbreviateNumber(item?.relativeFTD) + "%"
                            : "< 0.01%"}</td
                        >
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
              <div class="px-2">
                <a
                  href="/list/most-ftd-shares"
                  class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto sm:hover:bg-blue-600 dark:sm:hover:bg-gray-300 bg-[#3B82F6] dark:bg-[#fff] transition duration-100"
                >
                  Fail-to-Deliver Ranks
                </a>
              </div>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>
