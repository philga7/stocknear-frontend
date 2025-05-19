<script lang="ts">
  import ChatMessage from "$lib/components/Chat/ChatMessage.svelte";
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";
  import { onMount, afterUpdate, tick } from "svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  // Initialize messages with default or data
  let messages = data?.getChat?.messages || [
    { text: "Hello! How can I help you today?", sender: "llm" },
  ];
  let inputText = "";
  let isLoading = false;
  let inputEl: HTMLTextAreaElement;
  let chatContainer: HTMLDivElement;
  let bottomEl: HTMLDivElement;
  const MAX_HEIGHT = 16 * 16;

  // Auto-scrolling
  let autoScroll = true;
  let lastScrollTop = 0;

  // Check for first message and process it immediately
  onMount(async () => {
    // Check if the first message is from user and needs a response
    if (messages.length === 1 && messages[0].sender === "user") {
      const userQuery = messages[0].text;
      if (userQuery.trim()) {
        // Clear messages and set user message
        messages = [{ text: userQuery, sender: "user" }];
        await llmChat(userQuery);
      }
    }

    inputEl?.focus();
    resize();

    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }
  });

  afterUpdate(async () => {
    if (autoScroll && bottomEl) {
      // Wait for new messages to render
      await tick();
      bottomEl.scrollIntoView({ behavior: isLoading ? "auto" : "smooth" });
    }
  });

  function handleScroll() {
    if (!chatContainer) return;

    const distanceFromBottom =
      chatContainer.scrollHeight -
      chatContainer.scrollTop -
      chatContainer.clientHeight;

    // User scrolled up
    if (chatContainer.scrollTop < lastScrollTop && distanceFromBottom > 100) {
      autoScroll = false;
    }

    // User back near bottom
    if (distanceFromBottom < 50) {
      autoScroll = true;
    }

    lastScrollTop = chatContainer.scrollTop;
  }

  function resize() {
    if (!inputEl) return;

    inputEl.style.height = "auto";
    const scrollH = inputEl.scrollHeight;
    const newH = Math.min(scrollH, MAX_HEIGHT);
    inputEl.style.height = `${newH}px`;
    inputEl.style.overflowY = scrollH > MAX_HEIGHT ? "fit" : "hidden";
  }

  async function llmChat(userMessage?: string) {
    isLoading = true;

    // Use provided message or input text
    const userQuery = userMessage || inputText?.trim();
    console.log(userQuery);
    if (!userQuery || userQuery?.length < 1) {
      isLoading = false;
      return;
    }

    // Only append user message if not already in messages
    if (!userMessage) {
      messages = [...messages, { text: userQuery, sender: "user" }];
    }

    // Add placeholder for assistant response
    messages = [...messages, { text: "", sender: "llm" }];

    // Clear input and adjust UI
    inputText = "";
    resize();
    inputEl?.focus();

    // Re-enable auto-scroll on new message
    autoScroll = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!res.ok || !res.body) {
        // Remove empty LLM message
        messages = messages?.slice(0, -1);

        const errorMessage = (await res?.json())?.error || "Unknown error";
        messages = [...messages, { text: errorMessage, sender: "llm" }];
        isLoading = false;
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const idx = messages.length - 1;
      let assistantText = "";

      isLoading = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const json = JSON.parse(line);

            if (json.error) {
              console.error("Stream error:", json.error);
              break;
            }

            if (json.content) {
              assistantText = json.content;
              messages[idx].text = assistantText;
              messages = [...messages]; // Trigger reactivity
            }
          } catch (err) {
            console.error("Parse error:", err, "Line:", line);
          }
        }
      }

      await saveChat();
    } catch (error) {
      console.error("Chat request failed:", error);
      messages = messages.slice(0, -1);
      messages = [
        ...messages,
        {
          text: "Failed to connect to the chat service. Please try again later.",
          sender: "llm",
        },
      ];
    } finally {
      isLoading = false;
    }
  }

  async function saveChat() {
    const postData = { messages: messages, chatId: data?.getChat?.id };

    const response = await fetch("/api/update-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    const output = await response?.json();
  }
</script>

<SEO
  title="Stocknear AI Agent – Real-Time Market Insights, Options Flow, and News"
  description="Get real-time stock market insights with Stocknear AI Agent. Analyze fundamentals, dark pool activity, options flow, and breaking market news – all in one place."
/>

<section class="w-full max-w-[1400px] mx-auto h-full pt-5 px-4 lg:px-0">
  <div class="w-full 2xl:max-w-[1100px] flex flex-col h-full">
    <main
      class="w-full overflow-y-auto p-4 space-y-4"
      bind:this={chatContainer}
    >
      <div class="pb-60">
        {#each messages as message, index}
          {#if index === messages.length - 1 && message.sender === "llm" && isLoading}
            <ChatMessage {message} isLoading={true} />
          {:else}
            <ChatMessage {message} isLoading={false} />
          {/if}
        {/each}
        <!-- sentinel div always at the bottom -->
        <div bind:this={bottomEl}></div>
      </div>
    </main>

    <div
      class="absolute fixed bottom-5 sm:bottom-10 left-0 right-0 mx-auto w-11/12 sm:w-11/12 md:w-3/4 lg:w-2/3 max-w-4xl shadow-lg bg-gray-100 dark:bg-default border border-gray-300 dark:border-gray-600 shadow-sm rounded-lg overflow-hidden"
    >
      <form
        on:submit|preventDefault={() => llmChat()}
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
                  llmChat();
                }
              }}
              placeholder="Ask anything"
              class="w-full flex-1 bg-transparent outline-none placeholder-gray-800 dark:placeholder-gray-200 dark:text-white px-2 break-words"
            />
          </div>
          <div
            class="absolute bottom-0 mb-2 flex flex-row gap-x-2 justify-end w-full px-2 bg-gray-100 dark:bg-default z-20"
          >
            <div class="flex flex-row gap-x-2 justify-end w-full px-2">
              <button
                class="cursor-pointer text-sm rounded-md bg-gray-100 dark:bg-[#2A2E39] px-3 py-1 transition-colors duration-50"
                type="button"
              >
                Ask
              </button>
              <button
                class="cursor-pointer text-sm opacity-80 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-default px-3 py-1 transition-colors duration-50"
                type="button"
                on:click={() =>
                  toast?.info("Feature is coming soon 🔥", {
                    style: `border-radius: 5px; background: #fff; color: #000; border-color: ${
                      $mode === "light" ? "#F9FAFB" : "#4B5563"
                    }; font-size: 15px;`,
                  })}
              >
                Backtest
                <svg
                  class="w-4 h-4 mb-1 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                  />
                </svg>
              </button>
              <button
                type="submit"
                class="{inputText?.trim()?.length > 0
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-60'} text-white dark:text-black text-[1rem] rounded-md border border-gray-300 dark:border-gray-700 bg-blue-500 dark:bg-white px-3 py-1 transition-colors duration-50"
              >
                <Arrow class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</section>
