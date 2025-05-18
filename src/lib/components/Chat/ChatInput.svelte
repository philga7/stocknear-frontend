<script lang="ts">
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";
</script>

<div class="w-full transition-all duration-200">
  <div class="rounded-full mr-2 md:mr-0 py-2 shadow-sm">
    <div
      class="relative flex items-center rounded-full bg-default p-3 border border-gray-300 dark:border-gray-700"
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
        <div class=" flex flex-row gap-x-2 justify-end w-full px-2">
          <button
            class="cursor-pointer text-[1rem] rounded-md bg-gray-100 dark:bg-[#2A2E39] px-3 py-1 transition-colors duration-50"
            type="button"
          >
            Ask
          </button>
          <button
            class="cursor-pointer text-[1rem] opacity-60 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-default px-3 py-1 transition-colors duration-200"
            type="button"
            on:click={() =>
              toast?.info("Feature is coming soon 🔥", {
                style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
              })}
          >
            Backtest
          </button>

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
</div>
