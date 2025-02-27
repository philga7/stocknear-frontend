<script lang="ts">
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { page } from "$app/stores";

  export let data;

  const tabs = [
    {
      title: "Stocks",
      path: "/watchlist/stocks",
    },
    {
      title: "Options",
      path: "/watchlist/options",
    },
  ];

  let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === "/watchlist/stocks") {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith("/watchlist/options")) {
    activeIdx = 1;
  }
</script>

<!-- HEADER FOR BETTER SEO -->
<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Watchlist</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <h1 class="mb-6 text-white text-2xl sm:text-3xl font-bold">
            Watchlist
          </h1>

          <nav class=" border-b-[2px] overflow-x-auto whitespace-nowrap">
            <ul
              class="flex flex-row items-center w-full text-[1rem] sm:text-lg text-white"
            >
              {#each tabs as item, i}
                <a
                  href={item?.path}
                  class="p-2 px-5 cursor-pointer {activeIdx === i
                    ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
                >
                  {item.title}
                </a>
              {/each}
            </ul>
          </nav>

          <slot />
        </main>
      </div>
    </div>
  </div>
</section>
