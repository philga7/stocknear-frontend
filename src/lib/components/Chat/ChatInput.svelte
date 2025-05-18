<script lang="ts">
  import Chat from "lucide-svelte/icons/message-circle";
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";

  import { onMount } from "svelte";
  export let data;

  let inputText = ""; // To bind the textarea value
  let inputEl: HTMLTextAreaElement;
  const MAX_HEIGHT = 16 * 16; // 16rem * 16px = 256px

  onMount(() => {
    if (inputEl) {
      inputEl.focus();
      resize();
    }
  });

  function handleAsk() {
    if (inputEl) {
      inputEl.focus();
      resize();
    }
  }

  function resize() {
    if (!inputEl) return;
    // Reset height
    inputEl.style.height = "auto";
    const scrollH = inputEl.scrollHeight;
    const newHeight = Math.min(scrollH, MAX_HEIGHT);
    inputEl.style.height = newHeight + "px";
    inputEl.style.overflowY = scrollH > MAX_HEIGHT ? "auto" : "hidden";
  }
</script>

<div class="w-full transition-all duration-200">
  <div
    class="block w-full border border-gray-300 dark:border-gray-600 shadow-sm rounded-md overflow-hidden"
  >
    <form
      class="grow rounded-md relative flex items-center w-full overflow-hidden"
    >
      <div
        class="relative min-h-32 h-auto max-h-64 overflow-y-hidden w-full outline-none"
      >
        <div class="w-full p-2 pt-4 h-auto">
          <textarea
            bind:this={inputEl}
            bind:value={inputText}
            on:input={resize}
            placeholder="Ask anything"
            class="w-full flex-1 bg-transparent outline-none
        placeholder-gray-500 dark:placeholder-gray-400 text-gray-900
        dark:text-white px-2 break-words"
          />
        </div>

        <div
          class="absolute bottom-0 mb-2 flex flex-row gap-x-2 justify-end w-full px-2 bg-default z-20"
        >
          <div class=" flex flex-row gap-x-2 justify-end w-full px-2">
            <button
              class="cursor-pointer text-[1rem] rounded-md bg-gray-100 dark:bg-[#2A2E39] px-3 py-1 transition-colors duration-50"
              type="button"
              on:click={handleAsk}
            >
              Ask
            </button>
            <button
              class="cursor-pointer text-[1rem] opacity-80 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-default px-3 py-1 transition-colors duration-200"
              type="button"
              on:click={() =>
                toast?.info("Feature is coming soon 🔥", {
                  style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
                })}
            >
              Backtest
            </button>
            <button
              class="cursor-pointer text-black text-[1rem] rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-white px-3 py-1 transition-colors duration-200"
              type="button"
            >
              <Arrow class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
