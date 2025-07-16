<script>
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";

  export let text = "Loading...";
  export let label = "";
  let infoIcon;

  // Initialize tippy on mount
  $: if (infoIcon) {
    tippy(infoIcon, {
      content: `
				<div class="text-sm text-white p-1.5">
					${text}<br>
				</div>
			`,
      allowHTML: true,
      placement: "bottom",
      theme: "light-border",
      maxWidth: 300,
      interactive: true,
      trigger: "click mouseenter focus",
      hideOnClick: true,
      touch: ["hold", 500],
    });
  }
</script>

<div class=" flex flex-row items-center whitespace-nowrap">
  <h3
    class="{label?.length === 0
      ? 'hidden'
      : ''} text-sm text-gray-800 dark:text-gray-300 w-fit mr-1.5"
  >
    {label}
  </h3>
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
</div>
