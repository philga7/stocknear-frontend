<script lang="ts">
  import Chat from "lucide-svelte/icons/message-circle";
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
 // import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
 // import { Button } from "$lib/components/shadcn/button/index.js";
  import SEO from "$lib/components/SEO.svelte";

  import { onMount } from "svelte";
  export let data;

  let isLoading = false;
  const agentOptions = [
    "Analyst Rating",
    "Analyst Estimate",
    "Stock Screener",
    "Options Flow",
  ];
  // Prepend '@' to each option to create trigger strings
  const agentTriggers = agentOptions.map((opt) => `@${opt}`);

  let defaultChats = [
    {
      chat: "What are key highlights of dark pool and options flow orders for Nvidia today.",
    },
    { chat: "Which SPY options are trending now?" },
    { chat: "Tell me everything about Tesla." },
    { chat: "Which stocks reporting earnings today?" },
    { chat: "How does Google make money?" },
  ];

  let inputText = "";
  let inputEl: HTMLTextAreaElement;
  let highlightOverlay: HTMLDivElement;
  const MAX_HEIGHT = 16 * 16;

  async function createChat() {
    isLoading = true;
    if (!["Pro", "Plus"].includes(data?.user?.tier)) {
      toast.error("Upgrade your account to unlock this feature", {
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      });
      inputText = "";
      isLoading = false;
      return;
    }

    if (data?.user?.credits < 20) {
      toast.error(
        `Insufficient credits. Your current balance is ${data?.user?.credits}.`,
        {
          style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
        },
      );
      inputText = "";
      isLoading = false;
      return;
    }

    const userQuery = inputText?.trim();
    if (userQuery?.length > 0) {
      const response = await fetch("/api/create-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      const output = await response.json();
      goto(`/chat/${output.id}`);
    }
    isLoading = false;
  }

  function updateHighlightedText() {
    if (!highlightOverlay || !inputEl) return;
    let text = inputText;
    // Escape HTML
    text = text
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;");

    // Iterate through triggers and wrap occurrences
    let highlighted = text;
    for (const trigger of agentTriggers) {
      const escaped = trigger?.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      highlighted = highlighted.replace(
        regex,
        `<span class=\"text-blue-800 dark:text-blue-500\">${trigger}</span>`,
      );
    }

    // Preserve new lines
    highlighted = highlighted.replace(/\n/g, "<br>");
    if (!highlighted) highlighted = "&nbsp;";
    highlightOverlay.innerHTML = highlighted;
  }

  onMount(() => {
    if (inputEl) {
      inputEl.focus();
      resize();
    }
  });

  function handleDefaultChatClick(chatText: string) {
    inputText = chatText;
    resize();
    updateHighlightedText();
    inputEl?.focus();
  }

  function resize() {
    if (!inputEl) return;
    inputEl.style.height = "auto";
    const scrollH = inputEl.scrollHeight;
    const newH = Math.min(scrollH, MAX_HEIGHT);
    inputEl.style.height = newH + "px";
    inputEl.style.overflowY = scrollH > MAX_HEIGHT ? "auto" : "hidden";
    if (highlightOverlay) {
      highlightOverlay.style.height = newH + "px";
      highlightOverlay.style.overflowY =
        scrollH > MAX_HEIGHT ? "auto" : "hidden";
    }
  }

  function handleInput(event) {
    console.log(event.target.value);
    updateHighlightedText();
    resize();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createChat();
      return;
    }

    const cursorPos = inputEl.selectionStart;
    for (const trigger of agentTriggers) {
      const idx = inputText.indexOf(trigger);
      if (idx === -1) continue;
      const end = idx + trigger.length;
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        cursorPos > idx &&
        cursorPos <= end
      ) {
        e.preventDefault();
        inputText = inputText.slice(0, idx) + inputText.slice(end);
        setTimeout(() => {
          inputEl.selectionStart = idx;
          inputEl.selectionEnd = idx;
          updateHighlightedText();
          resize();
        }, 0);
        break;
      }
    }
  }

  $: if (inputText !== undefined) {
    updateHighlightedText();
  }

  function syncScroll() {
    if (highlightOverlay && inputEl) {
      highlightOverlay.scrollTop = inputEl.scrollTop;
      highlightOverlay.scrollLeft = inputEl.scrollLeft;
    }
  }
</script>

<SEO
  title="Stocknear AI Agent – Real-Time Market Insights, Options Flow, and News"
  description="Get real-time stock market insights with Stocknear AI Agent. Analyze fundamentals, dark pool activity, options flow, and breaking market news – all in one place."
/>

<div
  class="w-full max-w-5xl overflow-hidden m-auto min-h-screen bg-white dark:bg-default mb-16"
>
  <div class="flex flex-col m-auto justify-center items-center">
    <div class="text-center mb-10 w-full px-4 sm:px-3">
      <main class="flex flex-1 flex-col gap-4 sm:p-4 md:gap-8 text-start">
        <div class="h-full w-full flex">
          <div
            class="w-full flex flex-col justify-center items-center gap-6 pb-4"
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
                  <div class="w-full p-2 pt-4 h-auto relative">
                    <!-- Actual textarea for input -->
                    <textarea
                      bind:this={inputEl}
                      bind:value={inputText}
                      on:input={handleInput}
                      on:keydown={handleKeyDown}
                      on:scroll={syncScroll}
                      placeholder="Ask anything"
                      class="w-full flex-1 bg-transparent outline-none
                      placeholder-gray-500 dark:placeholder-gray-400 px-2 break-words textarea-base"
                    />
                  </div>

                  <div
                    class="absolute bottom-0 mb-2 flex flex-row gap-x-2 justify-end w-full px-2 bg:inherit dark:bg-default z-20"
                  >
                    <div class=" flex flex-row justify-end w-full">
                      <!--
                      <div
                        class="order-first relative inline-block text-left cursor-pointer ml-1 shadow-xs"
                      >
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              class="w-full border-gray-300 font-semibold dark:font-normal dark:border-gray-600 border bg-white dark:bg-default sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2  rounded truncate"
                            >
                              <span class="truncate">@Agents</span>
                              <svg
                                class="-mr-1 ml-3 h-5 w-5 xs:ml-2 inline-block"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style="max-width:40px"
                                aria-hidden="true"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clip-rule="evenodd"
                                ></path>
                              </svg>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content
                            class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                          >
                            <DropdownMenu.Group>
                              {#each agentOptions as item}
                                <DropdownMenu.Item
                                  on:click={() => {
                                    inputText += "@" + item + " ";
                                    inputEl?.focus();
                                  }}
                                  class="cursor-pointer sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                                >
                                  {item}
                                </DropdownMenu.Item>
                              {/each}
                            </DropdownMenu.Group>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </div>
                      -->
                      <button
                        on:click={createChat}
                        class="{inputText?.trim()?.length > 0
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-60'} py-1.5 text-white dark:text-black text-[1rem] rounded-md border border-gray-300 dark:border-gray-700 bg-blue-500 dark:bg-white px-3 py-1 transition-colors duration-200"
                        type="button"
                      >
                        {#if isLoading}
                          <span
                            class="loading loading-spinner loading-xs shrink-0 text-white dark:text-black"
                          ></span>
                        {:else}
                          <Arrow class="w-4 h-4" />
                        {/if}
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

<style>
  /* Base textarea styling */
  .textarea-base {
    background: transparent;
    position: relative;
    z-index: 1;
    color: currentColor;
    resize: none;
    white-space: pre-wrap;
  }
</style>
