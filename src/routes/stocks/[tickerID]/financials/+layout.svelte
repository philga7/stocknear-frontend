<script lang="ts">
  import { stockTicker, screenWidth, coolMode } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  import { page } from "$app/stores";
  export let data;
  let displaySubSection = "income";

  function changeSubSection(state) {
    const subSectionMap = {
      income: "/financials/income",
      "balance-sheet": "/financials/balance-sheet",
      "cash-flow": "/financials/cash-flow",
      ratios: "/financials/ratios",
    };

    if (state !== "income" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}/financials`);
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname.split("/");
      const sectionMap = {
        income: "income",
        "balance-sheet": "balance-sheet",
        "cash-flow": "cash-flow",
        ratios: "ratios",
      };

      const foundSection = parts?.find((part) =>
        Object?.values(sectionMap)?.includes(part),
      );

      displaySubSection =
        Object?.keys(sectionMap)?.find(
          (key) => sectionMap[key] === foundSection,
        ) || "income";
    }
  }
</script>

<section class="w-full overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="m-auto">
            <nav
              class="mb-5 sm:mb-0 sm:ml-4 pt-1 text-sm sm:text-[1rem] whitespace-nowrap overflow-x-auto whitespace-nowrap"
            >
              <ul class="flex flex-row items-center w-full">
                <a
                  href={`/stocks/${$stockTicker}/financials`}
                  on:click={() => changeSubSection("income")}
                  class="p-2 px-5 cursor-pointer {displaySubSection === 'income'
                    ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                    : 'text-blue-600 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
                >
                  Income
                </a>

                <a
                  href={`/stocks/${$stockTicker}/financials/balance-sheet`}
                  on:click={() => changeSubSection("balance-sheet")}
                  class="p-2 px-5 cursor-pointer {displaySubSection ===
                  'balance-sheet'
                    ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                    : 'text-blue-600 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
                >
                  Balance Sheet
                </a>
                <a
                  href={`/stocks/${$stockTicker}/financials/cash-flow`}
                  on:click={() => changeSubSection("cash-flow")}
                  class="p-2 px-5 cursor-pointer {displaySubSection ===
                  'cash-flow'
                    ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                    : 'text-blue-600 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
                >
                  Cashflow
                </a>
                <a
                  href={`/stocks/${$stockTicker}/financials/ratios`}
                  on:click={() => changeSubSection("ratios")}
                  class="p-2 px-5 cursor-pointer {displaySubSection === 'ratios'
                    ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                    : 'text-blue-600 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
                >
                  Ratios
                </a>
              </ul>
            </nav>
          </div>
          <slot />
        </main>
      </div>
    </div>
  </div>
</section>

<style>
  .scrollbar {
    display: grid;
    grid-gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin; /* Hide the default scrollbar in Firefox */
    scrollbar-color: transparent transparent; /* Hide the default scrollbar in Firefox */
  }

  /* Custom scrollbar for Webkit (Chrome, Safari) */
  .scrollbar::-webkit-scrollbar {
    width: 0; /* Hide the width of the scrollbar */
    height: 0; /* Hide the height of the scrollbar */
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent; /* Make the thumb transparent */
  }
</style>
