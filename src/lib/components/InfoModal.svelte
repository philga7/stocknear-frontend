<script lang="ts">
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";

  export let title: string;
  export let content: string;
  export let id: string;

  let infoIcon: HTMLElement;

  // Initialize tippy on mount
  $: if (infoIcon) {
    tippy(infoIcon, {
      content: `
        <div class="text-sm text-white p-2 w-full">
          <div class="font-bold mb-2">${title}</div>
          <div>${content}</div>
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

<div class="flex flex-row items-center whitespace-nowrap">
  <div
    bind:this={infoIcon}
    class="cursor-pointer p-1 text-gray-500 dark:text-gray-300 dark:sm:hover:text-white"
  >
    <svg
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
</div>
