<script lang="ts">
  import ScrollToTop from "$lib/components/ScrollToTop.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { page } from "$app/stores";

  export let data;

  const tabs = [
    {
      title: "Overview",
      path: "/market-flow",
    },
    {
      title: "Sector Flow",
      path: "/market-flow/sector-flow",
    },
  ];

  let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === "/market-flow") {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith("/market-flow/sector-flow")) {
    activeIdx = 1;
  }
</script>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-40 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Market Flow</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5 sm:max-w-[1400px]">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <h1 class="mb-3 text-white text-2xl sm:text-3xl font-bold">
            {activeIdx === 0 ? "Market Flow" : "Sector Flow"}
          </h1>

          <nav class=" border-b-[2px] overflow-x-auto whitespace-nowrap">
            <ul class="flex flex-row items-center w-full text-lg text-white">
              {#each tabs as item, i}
                <a
                  href={item?.path}
                  class="p-2 px-5 cursor-pointer {activeIdx === i
                    ? 'text-white bg-primary sm:hover:bg-opacity-[0.95] font-semibold'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
                >
                  {item.title}
                </a>
              {/each}
            </ul>
          </nav>

          <slot />

          <ScrollToTop />
        </main>
        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/list/highest-open-interest-change"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Highest OI Change
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Stocks with the highest changes in open interest (OI).
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/list/highest-option-premium"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Highest Option Premium
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Stocks with the highest option premium.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
