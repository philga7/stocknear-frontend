<script lang="ts">
  import Chat from "lucide-svelte/icons/message-circle";
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";

  import { onMount } from "svelte";
  export let data;

  let defaultChats = [
    { chat: "Track Pelosi’s recent trades" },
    { chat: "Which NVDA options are trending now?" },
    {
      chat: "List companies with >$10 B revenue and ≥10% growth, sorted by P/E",
    },
    { chat: "Backtest: buy when RSI >30, sell when RSI >70" },
  ];

  let inputText = ""; // To bind the textarea value
  let inputEl: HTMLInputElement;

  onMount(() => {
    inputEl?.focus();
  });

  function handleAsk() {
    if (inputText.trim()) {
      inputText = ""; // Clear the input after action
    }
  }

  function handleDefaultChatClick(chatText: string) {
    inputText = chatText;
    inputEl?.focus();
  }
</script>

<div
  class="w-full max-w-4xl overflow-hidden m-auto min-h-screen bg-white dark:bg-default mb-16"
>
  <div class="flex flex-col m-auto justify-center items-center">
    <div class="text-center mb-10 w-full px-4 sm:px-3">
      <main class="flex flex-1 flex-col gap-4 sm:p-4 md:gap-8 text-start">
        <div class=" h-full w-full flex">
          <div
            class=" w-full flex flex-col justify-center items-center gap-6 pt-10 pb-4"
          >
            <img
              class="m-auto w-16 sm:w-20 rounded-full pt-4"
              src="/pwa-192x192.png"
              alt="Stocknear Logo"
              loading="lazy"
            />
            <h1
              class="block text-2xl lg:text-4xl font-bold text-center mb-10 relative w-fit flex justify-center m-auto"
            >
              Research your Trading Ideas
            </h1>

            <div
              class="block w-full border border-gray-300 dark:border-gray-600 shadow-sm rounded-md"
            >
              <form class="grow rounded-md relative flex items-center w-full">
                <div class="overflow-y-auto w-full outline-none">
                  <div class="w-full p-2 pt-4 h-auto">
                    <input
                      type="text"
                      bind:this={inputEl}
                      bind:value={inputText}
                      on:keydown={(e) => e.key === "Enter" && onSubmit()}
                      placeholder="Ask anything"
                      class="w-full flex-1 bg-transparent outline-none
                    placeholder-gray-500 dark:placeholder-gray-400 text-gray-900
                    dark:text-white px-2"
                    />
                  </div>
                </div>
              </form>
              <div class="mb-2 flex flex-row gap-x-2 justify-end w-full px-2">
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
            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-2 shrink w-full overflow-y-auto sidenav-scrollbar"
            >
              {#each defaultChats as item}
                <div class=" flex flex-col">
                  <div class="block flex-grow">
                    <button
                      type="button"
                      class="text-sm w-full h-full p-3 group font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-in-out items-center relative group cursor-pointer active:scale-95 origin-center border border-gray-300 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      on:click={() => handleDefaultChatClick(item?.chat)}
                    >
                      <div
                        class="flex leading-none items-center h-full flex-grow"
                      >
                        <div
                          class="ml-2 py-1 text-left font-medium flex flex-row items-center justify-center box-border relative"
                        >
                          <Chat class="w-4 h-4 inline-block mr-3 " />
                          {item?.chat}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</div>
