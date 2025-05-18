<script lang="ts">
  import Arrow from "lucide-svelte/icons/arrow-up";
</script>

<div class="w-full transition-all duration-200">
  <div class="rounded-full mr-2 md:mr-0 py-2 shadow-sm">
    <div
      class="relative flex items-center rounded-full bg-[#2A2E39] p-3 border border-gray-300 dark:border-gray-700"
    >
      <div
        class="w-full outline-none focus:outline-none flex items-center focus:outline-none rounded-t-[32px] rounded-b-[32px] py-md px-lg pr-[50px] md:pr-[50px]"
      >
        <div class="relative w-full px-2">
          <input
            placeholder="Ask follow-up..."
            class="overflow-auto h-[24px] max-h-[50vh] outline-none w-full flex items-center duration-200 transition-all resize-none"
            value=""
          />
        </div>
      </div>
      <div class="absolute flex items-center gap-sm rounded-full right-4">
        <button
          class="cursor-pointer text-black text-[1rem] rounded-md border border-gray-300 dark:border-gray-700 dark:bg-white px-1.5 py-1 transition-colors"
          type="button"
        >
          <Arrow class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</div>
