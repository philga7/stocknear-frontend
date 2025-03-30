<script lang="ts">
  import { etfTicker } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { page } from "$app/stores";

  export let data;

  let displaySubSection = "overview";

  function changeSubSection(state) {
    const subSectionMap = {
      overview: "/options",
      "hottest-contracts": "/options/hottest-contracts",
      "contract-lookup": "/options/contract-lookup",
      "unusual-activity": "/options/unusual-activity",
      volatility: "/options/volatility",
      gex: "/options/gex",
      dex: "/options/dex",
      oi: "/options/oi",
    };

    if (state !== "overview" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/etf/${$etfTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/etf/${$etfTicker}/statistics`);
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname.split("/");
      const sectionMap = {
        overview: "overview",
        "hottest-contracts": "hottest-contracts",
        "contract-lookup": "contract-lookup",
        "unusual-activity": "unusual-activity",
        volatility: "volatility",
        gex: "gex",
        dex: "dex",
        oi: "oi",
      };

      const foundSection = parts?.find((part) =>
        Object?.values(sectionMap)?.includes(part),
      );

      displaySubSection =
        Object?.keys(sectionMap)?.find(
          (key) => sectionMap[key] === foundSection,
        ) || "overview";
    }
  }
</script>

<section class="w-full overflow-hidden min-h-screen">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <nav
            class="sm:ml-4 pt-1 text-sm sm:text-[1rem] whitespace-nowrap overflow-x-auto whitespace-nowrap"
          >
            <ul class="flex flex-row items-center w-full">
              <a
                href={`/etf/${$etfTicker}/options`}
                on:click={() => changeSubSection("overview")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'overview'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                Overview
              </a>
              <a
                href={`/etf/${$etfTicker}/options/contract-lookup`}
                on:click={() => changeSubSection("contract-lookup")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'contract-lookup'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                Contract Lookup
              </a>
              <a
                href={`/etf/${$etfTicker}/options/unusual-activity`}
                on:click={() => changeSubSection("unusual-activity")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'unusual-activity'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                Unusual Activity
              </a>
              <a
                href={`/etf/${$etfTicker}/options/hottest-contracts`}
                on:click={() => changeSubSection("hottest-contracts")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'hottest-contracts'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                Hottest Contracts
              </a>
              <a
                href={`/etf/${$etfTicker}/options/volatility`}
                on:click={() => changeSubSection("volatility")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'volatility'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                Volatility
              </a>
              <a
                href={`/etf/${$etfTicker}/options/oi`}
                on:click={() => changeSubSection("oi")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'oi'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                OI
              </a>

              <a
                href={`/etf/${$etfTicker}/options/gex`}
                on:click={() => changeSubSection("gex")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'gex'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                GEX
              </a>
              <a
                href={`/etf/${$etfTicker}/options/dex`}
                on:click={() => changeSubSection("dex")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'dex'
                  ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                  : 'text-blue-700 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
              >
                DEX
              </a>
            </ul>
          </nav>
          <div class="mt-2 sm:mt-0">
            <slot />
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={`/options-flow?query=${$etfTicker}`}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold ml-3">
                  Options Flow
                </h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class=" p-3 ml-3 mr-3">
                Get realtime options flow and customize your screener
              </span>
            </a>
          </div>

          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/stock-screener"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold ml-3">
                  Stock Screener
                </h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class=" p-3 ml-3 mr-3">
                Build your Stock Screener to find profitable stocks.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
