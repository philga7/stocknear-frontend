<script lang="ts">
  import Chat from "lucide-svelte/icons/message-circle";
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  import { onMount } from "svelte";
  export let data;

  let defaultChats = [
    {
      chat: "What are key highlights of dark pool and options flow orders for Nvidia today.",
    },
    { chat: "Which SPY options are trending now?" },
    {
      chat: "List companies with >$10 B revenue and ≥10% growth, sorted by P/E",
    },
    {
      chat: "Which stocks reporting earnings today are expected to see a positive price reaction based on their news and financial results, since the last earnings call?",
    },
    { chat: "How does Google make money?" },
  ];

  let inputText = ""; // To bind the textarea value
  let inputEl: HTMLTextAreaElement;
  const MAX_HEIGHT = 16 * 16; // 16rem * 16px = 256px

  async function createChat() {
    if (!["Pro", "Plus"]?.includes(data?.user?.tier)) {
      toast.error("Upgrade your account to unlock this feature", {
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      });
      inputText = "";
    }

    if (data?.user?.credits < 20) {
      toast.error(
        `Insufficient credits. Your current balance is ${data?.user?.credits}.`,
        {
          style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
        },
      );
      inputText = "";
    }
    const userQuery = inputText?.trim();
    if (userQuery?.length > 0) {
      const response = await fetch("/api/create-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      const output = await response?.json();

      goto(`/chat/${output?.id}`);
    }
  }
  onMount(() => {
    if (inputEl) {
      inputEl.focus();
      resize();
    }
  });

  function handleDefaultChatClick(chatText: string) {
    inputText = chatText;
    inputEl?.focus();
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

<div
  class="w-full max-w-5xl overflow-hidden m-auto min-h-screen bg-white dark:bg-default mb-16"
>
  <div class="flex flex-col m-auto justify-center items-center">
    <div class="text-center mb-10 w-full px-4 sm:px-3">
      <main class="flex flex-1 flex-col gap-4 sm:p-4 md:gap-8 text-start">
        <div class="h-full w-full flex">
          <div
            class="w-full flex flex-col justify-center items-center gap-6 pt-10 pb-4"
          >
            <img
              class="m-auto w-16 sm:w-20 rounded-full pt-4"
              src="/pwa-192x192.png"
              alt="Stocknear Logo"
              loading="lazy"
            />
            <h1
              class="block text-2xl lg:text-4xl font-bold text-center mb-10 relative w-fit flex justify-center m-auto break-words"
            >
              Research your Trading Ideas
            </h1>

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
                      on:keydown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          createChat();
                        }
                      }}
                      placeholder="Ask anything"
                      class="w-full flex-1 bg-transparent outline-none
                    placeholder-gray-500 dark:placeholder-gray-400 px-2 break-words"
                    />
                  </div>

                  <div
                    class="absolute bottom-0 mb-2 flex flex-row gap-x-2 justify-end w-full px-2 bg:inherit dark:bg-default z-20"
                  >
                    <div class=" flex flex-row gap-x-2 justify-end w-full px-2">
                      <button
                        class="cursor-pointer text-sm rounded-md bg-gray-300 dark:bg-[#2A2E39] px-3 py-1 transition-colors duration-50"
                        type="button"
                      >
                        Ask
                      </button>
                      <button
                        class="cursor-pointer text-sm opacity-80 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-default px-3 py-1 transition-colors duration-50"
                        type="button"
                        on:click={() =>
                          toast?.info("Feature is coming soon 🔥", {
                            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
                          })}
                      >
                        Backtest
                        <svg
                          class="w-4 h-4 mb-1 inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          ><path
                            fill="currentColor"
                            d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                          /></svg
                        >
                      </button>
                      <button
                        on:click={createChat}
                        class="{inputText?.trim()?.length > 0
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-60'} text-white dark:text-black text-[1rem] rounded-md border border-gray-300 dark:border-gray-700 bg-blue-500 dark:bg-white px-3 py-1 transition-colors duration-200"
                        type="button"
                      >
                        <Arrow class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div
              class="grid grid-cols-1 gap-2 shrink w-full overflow-y-auto sidenav-scrollbar"
            >
              {#each defaultChats as item}
                <div class="flex flex-col">
                  <div class="block flex-grow">
                    <button
                      type="button"
                      class="text-sm sm:text-[1rem] w-full h-full p-3 group font-sans focus:outline-none outline-none outline-transparent transition duration-50 ease-in-out items-center relative group cursor-pointer active:scale-95 origin-center shadow-sm border border-gray-300 dark:border-gray-700 rounded sm:hover:bg-gray-100 dark:sm:hover:bg-gray-800"
                      on:click={() => handleDefaultChatClick(item?.chat)}
                    >
                      <div
                        class="flex leading-none items-center h-full flex-grow"
                      >
                        <div
                          class="px-2 py-2 text-left font-medium flex flex-row items-center justify-center box-border relative whitespace-normal break-words"
                        >
                          <Chat
                            class="w-4 h-4 inline-block mr-3 flex-shrink-0"
                          />
                          <span class="break-words p">{item?.chat}</span>
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
