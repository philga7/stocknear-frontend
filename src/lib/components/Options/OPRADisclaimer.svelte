<script>
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";

  let infoIcon;

  // Initialize tippy on mount
  $: if (infoIcon) {
    tippy(infoIcon, {
      content: `
				<div class="text-sm text-white">
					Options data from the Options Price Reporting Authority (OPRA) provided by Intrinio.<br>
					You're viewing End-of-Day (EOD) delayed options data.<br>
				</div>
			`,
      allowHTML: true,
      placement: "bottom",
      theme: "light-border",
    });
  }
</script>

<h3
  class="mb-4 text-sm text-gray-800 dark:text-gray-300 w-fit flex items-center gap-2 whitespace-nowrap"
>
  OPRA Data EOD delayed
  <!-- Info icon -->
  <svg
    bind:this={infoIcon}
    xmlns="http://www.w3.org/2000/svg"
    class="h-4 w-4 text-gray-600 cursor-pointer sm:hover:text-gray-800 dark:text-gray-200 dark:sm:hover:text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
    />
  </svg>
</h3>
