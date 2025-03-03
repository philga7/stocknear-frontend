<script lang="ts">
  import ScrollToTop from "$lib/components/ScrollToTop.svelte";
  import { page } from "$app/stores";

  export let data;

  const tabs = [
    {
      title: "All Stocks",
      path: "/market-news",
    },
    {
      title: "Market",
      path: "/market-news/general",
    },
    {
      title: "Press Releases",
      path: "/market-news/press-releases",
    },
  ];

  let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === "/market-news") {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith("/market-news/general")) {
    activeIdx = 1;
  } else if ($page.url.pathname.startsWith("/market-news/press-releases")) {
    activeIdx = 2;
  }
</script>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Market News</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:pr-5">
          <h1 class="mb-6 text-white text-2xl sm:text-3xl font-bold">
            {activeIdx === 0
              ? "All Stocks News"
              : activeIdx === 1
                ? "Market News"
                : "Press Releases"}
          </h1>

          <nav class=" border-b-[2px] overflow-x-auto whitespace-nowrap">
            <ul class="flex flex-row items-center w-full text-lg text-white">
              {#each tabs as item, i}
                <a
                  href={item?.path}
                  class="p-2 px-5 cursor-pointer {activeIdx === i
                    ? 'text-white bg-primary/90 font-semibold'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary/90'}"
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
