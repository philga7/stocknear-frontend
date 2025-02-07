<script lang="ts">
  import { stockTicker } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { page } from "$app/stores";

  export let data;

  let displaySubSection = "overview";

  function changeSubSection(state) {
    const subSectionMap = {
      overview: "/options",
      "hottest-contracts": "/options/hottest-contracts",
      "unusual-activity": "/options/unusual-activity",
      volatility: "/options/volatility",
      gex: "/options/gex",
      dex: "/options/dex",
      oi: "/options/oi",
    };

    if (state !== "overview" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}/statistics`);
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname.split("/");
      const sectionMap = {
        overview: "overview",
        "hottest-contracts": "hottest-contracts",
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
            class="sm:ml-4 overflow-x-scroll pt-1 text-sm sm:text-[1rem] whitespace-nowrap"
          >
            <ul class="flex flex-row items-center w-full text-white">
              <a
                href={`/stocks/${$stockTicker}/options`}
                on:click={() => changeSubSection("overview")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'overview'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                Overview
              </a>
              <a
                href={`/stocks/${$stockTicker}/options/unusual-activity`}
                on:click={() => changeSubSection("unusual-activity")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'unusual-activity'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                Unusual Activity
              </a>
              <a
                href={`/stocks/${$stockTicker}/options/hottest-contracts`}
                on:click={() => changeSubSection("hottest-contracts")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'hottest-contracts'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                Hottest Contracts
              </a>
              <a
                href={`/stocks/${$stockTicker}/options/volatility`}
                on:click={() => changeSubSection("volatility")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'volatility'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                Volatility
              </a>
              <a
                href={`/stocks/${$stockTicker}/options/oi`}
                on:click={() => changeSubSection("oi")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'oi'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                OI
              </a>

              <a
                href={`/stocks/${$stockTicker}/options/gex`}
                on:click={() => changeSubSection("gex")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'gex'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                GEX
              </a>
              <a
                href={`/stocks/${$stockTicker}/options/dex`}
                on:click={() => changeSubSection("dex")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'dex'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
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
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={`/options-flow?query=${$stockTicker}`}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Options Flow
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get realtime options flow and customize your screener
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/stock-screener"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Stock Screener
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Build your Stock Screener to find profitable stocks.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
