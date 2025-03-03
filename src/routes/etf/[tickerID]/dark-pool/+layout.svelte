<script lang="ts">
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { etfTicker } from "$lib/store";
  export let data;
</script>

<section class="w-auto overflow-hidden min-h-screen">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4">
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={`/dark-pool-flow?query=${$etfTicker}`}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Dark Pool Flow
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Follow the dark pool feed in realtime
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
