<script lang="ts">
  import { stockTicker } from "$lib/store";
  import { page } from "$app/stores";

  let displaySubSection = "overview";

  function changeSubSection(state) {
    const subSectionMap = {
      "market-cap": "/statistics/market-cap",
      revenue: "/statistics/revenue",
      "price-reaction": "/statistics/price-reaction",
      "fail-to-deliver": "/statistics/fail-to-deliver",
    };

    if (state !== "overview" && subSectionMap[state]) {
      displaySubSection = state;
    } else {
      displaySubSection = state;
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname.split("/");
      const sectionMap = {
        "market-cap": "market-cap",
        revenue: "revenue",
        "price-reaction": "price-reaction",
        "fail-to-deliver": "fail-to-deliver",
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

<section class="w-auto bg-default overflow-hidden text-black h-full">
  <div class="m-auto h-full overflow-hidden">
    <main class="w-full">
      <div class="m-auto">
        <nav
          class="sm:ml-4 pt-1 overflow-x-auto text-sm sm:text-[1rem] whitespace-nowrap"
        >
          <ul class="flex flex-row items-center w-full text-white">
            <a
              href={`/stocks/${$stockTicker}/statistics`}
              on:click={() => changeSubSection("overview")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'overview'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Overview
            </a>

            <a
              href={`/stocks/${$stockTicker}/statistics/market-cap`}
              on:click={() => changeSubSection("market-cap")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'market-cap'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Market Cap
            </a>

            <a
              href={`/stocks/${$stockTicker}/statistics/revenue`}
              on:click={() => changeSubSection("revenue")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'revenue'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Revenue
            </a>

            <a
              href={`/stocks/${$stockTicker}/statistics/price-reaction`}
              on:click={() => changeSubSection("price-reaction")}
              class="p-2 px-5 cursor-pointer {displaySubSection ===
              'price-reaction'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Price Reaction
            </a>

            <a
              href={`/stocks/${$stockTicker}/statistics/fail-to-deliver`}
              on:click={() => changeSubSection("fail-to-deliver")}
              class="p-2 px-5 cursor-pointer {displaySubSection ===
              'fail-to-deliver'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Fail-to-Deliver
            </a>
          </ul>
        </nav>
      </div>
    </main>

    <slot />
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
