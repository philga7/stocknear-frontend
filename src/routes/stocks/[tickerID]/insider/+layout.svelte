<script lang="ts">
  import { stockTicker } from "$lib/store";

  import { page } from "$app/stores";

  export let data;

  let newsList = data?.getNews ?? [];

  const formatDate = (dateString) => {
    // Create a date object for the input dateString
    const inputDate = new Date(dateString);

    // Create a date object for the current time in New York City
    const nycTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const currentNYCDate = new Date(nycTime);

    // Calculate the difference in milliseconds
    const difference = inputDate.getTime() - currentNYCDate.getTime();

    // Convert the difference to minutes
    const minutes = Math.abs(Math.round(difference / (1000 * 60)));

    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.round(minutes / 60);
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.round(minutes / 1440);
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
  };

  let displaySubSection = "";

  if (!displaySubSection || displaySubSection.length === 0) {
    const parts = $page?.url?.pathname.split("/");
    const sectionMap = {
      institute: "institute",
      "congress-trading": "congress-trading",
      transcripts: "transcripts",
    };

    const foundSection = parts?.find((part) =>
      Object?.values(sectionMap)?.includes(part),
    );

    displaySubSection =
      Object?.keys(sectionMap)?.find(
        (key) => sectionMap[key] === foundSection,
      ) || "insider";
  }

  function changeSubSection(state) {
    const subSectionMap = {
      "congress-trading": "/insider/congress-trading",
      institute: "/insider/institute",
      transcripts: "/insider/transcripts",
    };

    if (state !== "insider" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}/insider`);
    }
  }
</script>

<section class="w-auto overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <nav
            class="mb-5 sm:mb-0 sm:ml-4 pt-1 overflow-x-auto md:overflow-hidden text-sm sm:text-[1rem] whitespace-nowrap"
          >
            <ul class="flex flex-row items-center w-full text-white">
              <a
                href={`/stocks/${$stockTicker}/insider`}
                on:click={() => changeSubSection("insider")}
                class="p-2 px-5 cursor-pointer {displaySubSection === 'insider'
                  ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
              >
                Insider Trading
              </a>

              <a
                href={`/stocks/${$stockTicker}/insider/institute`}
                on:click={() => changeSubSection("institute")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'institute'
                  ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
              >
                13F Institute
              </a>

              <a
                href={`/stocks/${$stockTicker}/insider/congress-trading`}
                on:click={() => changeSubSection("congress-trading")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'congress-trading'
                  ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
              >
                Congress Trading
              </a>
              <a
                href={`/stocks/${$stockTicker}/insider/transcripts`}
                on:click={() => changeSubSection("transcripts")}
                class="p-2 px-5 cursor-pointer {displaySubSection ===
                'transcripts'
                  ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                  : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
              >
                Transcripts
              </a>
            </ul>
          </nav>

          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 mt-3">
          {#if newsList?.length !== 0}
            <div
              class="w-full sm:hover:text-white text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit"
            >
              <div class="p-4 text-sm">
                <h3 class="text-lg text-white font-semibold mb-3">
                  {$stockTicker} News
                </h3>
                <ul class="text-white">
                  {#each newsList?.slice(0, 10) as item}
                    <li class="mb-3 last:mb-1">
                      {formatDate(item?.publishedDate)} ago -
                      <a
                        class="sm:hover:text-white text-blue-400"
                        href={item?.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow">{item?.title}</a
                      >
                      - {item?.site}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  .scrollbar {
    display: grid;
    grid-gap: 17px;
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

  ::-webkit-scrollbar {
    height: 7px;
    width: 10px;
    background: #09090b;
  }

  ::-webkit-scrollbar-thumb {
    background: #6b6f79;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
  }

  ::-webkit-scrollbar-corner {
    background: #09090b;
  }
</style>
