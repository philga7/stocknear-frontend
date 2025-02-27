<script lang="ts">
  import { stockTicker } from "$lib/store";
  import { onDestroy } from "svelte";
  import { page } from "$app/stores";
  import ScrollToTop from "$lib/components/ScrollToTop.svelte";

  let displaySubSection = "overview";

  if (displaySubSection) {
    const parts = $page?.url?.pathname.split("/");
    const sectionMap = {
      overview: "overview",
      ai: "ai",
      analyst: "analyst",
    };

    const foundSection = parts?.find((part) =>
      Object?.values(sectionMap)?.includes(part),
    );

    displaySubSection =
      Object?.keys(sectionMap)?.find(
        (key) => sectionMap[key] === foundSection,
      ) || "overview";
  }

  function changeSubSection(state) {
    const subSectionMap = {
      overview: "/forecast",
      //ai: "/forecast/ai",
      analyst: "/forecast/analyst",
    };

    if (state !== "overview" && subSectionMap[state]) {
      displaySubSection = state;
    } else {
      displaySubSection = state;
    }
  }

  const unsubscribe = page.subscribe(($page) => {
    const splitRoute = $page.url.pathname.split("/");
    const routeState =
      splitRoute[splitRoute.length - 1] !== "forecast"
        ? splitRoute[splitRoute.length - 1]
        : "overview";

    changeSubSection(routeState);
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<section class="w-full bg-default overflow-hidden h-full">
  <div class="m-auto h-full overflow-hidden">
    <main class="w-full mb-4 sm:mb-0">
      <div class="m-auto">
        <nav
          class="sm:ml-4 pt-1 overflow-x-auto text-sm sm:text-[1rem] whitespace-nowrap"
        >
          <ul class="flex flex-row items-center w-full text-white">
            <a
              href={`/stocks/${$stockTicker}/forecast`}
              on:click={() => changeSubSection("overview")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'overview'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Overview
            </a>

            <a
              href={`/stocks/${$stockTicker}/forecast/analyst`}
              on:click={() => changeSubSection("analyst")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'analyst'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Analysts Ratings
            </a>
            <a
              href={`/stocks/${$stockTicker}/forecast/ai`}
              on:click={() => changeSubSection("ai")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'ai'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              AI Forecast
            </a>
          </ul>
        </nav>
      </div>
    </main>

    <slot />

    <ScrollToTop />
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
