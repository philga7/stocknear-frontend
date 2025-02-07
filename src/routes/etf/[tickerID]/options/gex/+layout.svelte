<script lang="ts">
  import { etfTicker } from "$lib/store";
  import { page } from "$app/stores";

  export let data;

  let displaySubSection = "overview";

  function changeSubSection(state) {
    const subSectionMap = {
      gex: "/options/gex",
      strike: "/options/gex/strike",
      expiry: "/options/gex/expiry",
    };

    if (state !== "overview" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/stocks/${$etfTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/stocks/${$etfTicker}/statistics`);
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname.split("/");
      const sectionMap = {
        overview: "overview",
        strike: "strike",
        expiry: "expiry",
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
        <main class="w-full">
          <nav
            class="sm:ml-4 overflow-x-scroll pt-1 text-sm sm:text-[1rem] whitespace-nowrap"
          >
            <ul class="flex flex-row items-center w-full text-white">
              <a
                href={`/etf/${$etfTicker}/options/gex`}
                on:click={() => changeSubSection("overview")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'overview'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                Overview
              </a>

              <a
                href={`/etf/${$etfTicker}/options/gex/strike`}
                on:click={() => changeSubSection("strike")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'strike'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                By Strike
              </a>
              <a
                href={`/etf/${$etfTicker}/options/gex/expiry`}
                on:click={() => changeSubSection("expiry")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'expiry'
                  ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
              >
                By Expiry
              </a>
            </ul>
          </nav>
          <div class="mt-2 sm:mt-0">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
