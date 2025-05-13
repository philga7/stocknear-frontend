<script lang="ts">
  import highcharts from "$lib/highcharts";

  import SEO from "$lib/components/SEO.svelte";

  export let data;
</script>

<SEO
  title="Stock Comparison Tool"
  description="Compare Stocks side by side, including charts, performance, statistics, financials, and more."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Compare</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-[#2C6288] dark:border-white border-b-[2px]">
            <h1 class="mb-1 text-2xl sm:text-3xl font-bold">Compare Stocks</h1>
          </div>

          <div class="w-full m-auto mt-20 sm:mt-10">
            <div
              class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-auto"
            ></div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
