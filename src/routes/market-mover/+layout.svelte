<script lang="ts">
  import ScrollToTop from "$lib/components/ScrollToTop.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { page } from "$app/stores";

  export let data;

  const tabs = [
    {
      title: "Gainers",
      path: "/market-mover/gainers",
    },
    {
      title: "Losers",
      path: "/market-mover/losers",
    },
    {
      title: "Active",
      path: "/market-mover/active",
    },
    {
      title: "Pre-Market",
      path: "/market-mover/premarket/gainers",
    },
    {
      title: "After-Hours",
      path: "/market-mover/afterhours/gainers",
    },
  ];

  let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === "/market-mover/gainers") {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith("/market-mover/losers")) {
    activeIdx = 1;
  } else if ($page.url.pathname.startsWith("/market-mover/active")) {
    activeIdx = 2;
  } else if ($page.url.pathname.startsWith("/market-mover/premarket")) {
    activeIdx = 3;
  } else if ($page.url.pathname.startsWith("/market-mover/afterhours")) {
    activeIdx = 4;
  }
</script>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Market Mover</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:pr-5">
          <h1 class="mb-6 text-white text-2xl sm:text-3xl font-bold">
            Market Mover
          </h1>

          <nav class="border-b-[2px] overflow-x-scroll whitespace-nowrap">
            <ul
              class="flex flex-row items-center w-full text-[1rem] sm:text-lg text-white"
            >
              {#each tabs as item, index}
                <a
                  href={item?.path}
                  class="p-2 px-5 cursor-pointer {activeIdx === index
                    ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
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
      </div>
    </div>
  </div>
</section>
