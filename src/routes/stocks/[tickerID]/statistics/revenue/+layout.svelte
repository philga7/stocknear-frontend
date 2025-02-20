<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";

  export let data;
  const similarStocks = data?.getSimilarStocks;
</script>

<section class="w-full overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex flex-col lg:flex-row justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <slot />
        </main>

        <aside class="inline-block relative w-full lg:w-1/4 mt-3">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2
                    class="text-start text-xl font-semibold text-white sm:ml-3"
                  >
                    Pro Subscription
                  </h2>
                </div>
                <span class="text-white p-3 sm:ml-3 sm:mr-3 -mt-4">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full p-2 text-white border border-gray-600 bg-inherit rounded-md h-fit pb-4 mt-4"
          >
            <h3 class="p-2 pt-4 text-xl font-semibold">Revenue Definition</h3>
            <div class="text-white p-2">
              Revenue, also called sales, is the amount of money a company
              receives from its business activities, such as sales of products
              or services. Revenue does not take any expenses into account and
              is therefore different from profits.
            </div>
            <div class="px-2">
              <a
                href="/blog/article/revenue"
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Full Definition
              </a>
            </div>
          </div>

          {#if similarStocks?.length > 0}
            <div
              class="w-full p-2 text-white border border-gray-600 bg-inherit rounded-md h-fit pb-4 mt-4"
            >
              <h3 class="p-2 pt-4 text-xl font-semibold">Related Stocks</h3>
              <table class="table table-sm table-compact w-full text-white">
                <thead class="text-white"
                  ><tr
                    ><th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-left px-2"
                      >Company</th
                    >
                    <th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-right px-2"
                      >Revenue</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each similarStocks?.slice(0, 8) as item, index}
                    {#if item?.revenue > 0}
                      <tr
                        class="border-gray-800 text-[1rem] {index !==
                        similarStocks?.slice(0, 8).length - 1
                          ? 'border-b'
                          : ''}"
                        ><td class="text-left text-[1rem] px-2"
                          ><a
                            href={`/stocks/${item?.symbol}/statistics/revenue`}
                            class="sm:hover:text-white text-blue-400"
                            >{item?.name}</a
                          ></td
                        >
                        <td class="text-right cursor-normal text-[1rem] px-2"
                          >{abbreviateNumber(item?.revenue)}</td
                        >
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
              <div class="px-2">
                <a
                  href="/list/highest-revenue"
                  class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
                >
                  Revenue Rankings
                </a>
              </div>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>
