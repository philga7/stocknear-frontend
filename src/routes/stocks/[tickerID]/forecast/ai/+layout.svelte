<script lang="ts">
  export let data;
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
          {#if !["Pro", "Plus"]?.includes(data?.user?.tier) || data?.user?.freeTrial}
            <div
              class="w-full border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold sm:ml-3">
                    Pro Subscription
                  </h2>
                </div>
                <span class=" p-3 sm:ml-3 sm:mr-3 -mt-4">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4"
          >
            <h3 class="p-2 pt-4 text-xl font-semibold">AI Score Definition</h3>
            <div class=" p-2">
              Revenue, also called sales, is the amount of money a company
              receives from its business activities, such as sales of products
              or services. Revenue does not take any expenses into account and
              is therefore different from profits.
            </div>
            <!--
            <div class="px-2">
              <a
                href="/blog/article/revenue"
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto sm:hover:bg-blue-600 dark:sm:hover:bg-gray-300 bg-[#3B82F6] dark:bg-[#fff] transition duration-100"
              >
                Full Definition
              </a>
            </div>
            -->
          </div>

          <div
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4"
          >
            <h3 class="p-2 pt-4 text-xl font-semibold">
              AI Trend Forecast Definition
            </h3>
            <div class=" p-2">
              Revenue, also called sales, is the amount of money a company
              receives from its business activities, such as sales of products
              or services. Revenue does not take any expenses into account and
              is therefore different from profits.
            </div>
            <!--
            <div class="px-2">
              <a
                href="/blog/article/revenue"
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-white dark:text-black m-auto sm:hover:bg-blue-600 dark:sm:hover:bg-gray-300 bg-[#3B82F6] dark:bg-[#fff] transition duration-100"
              >
                Full Definition
              </a>
            </div>
            -->
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
