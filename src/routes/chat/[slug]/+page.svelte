<script lang="ts">
  import ChatMessage from "$lib/components/Chat/ChatMessage.svelte";
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";

  import { onMount } from "svelte";

  let messages: { text: string; sender: "user" | "llm" }[] = [
    { text: "Hello! How can I help you today?", sender: "llm" },
  ];

  let inputText = "";
  let isLoading = false;
  let inputEl: HTMLTextAreaElement;
  let chatContainer: HTMLDivElement;
  const MAX_HEIGHT = 16 * 16;

  onMount(() => {
    inputEl?.focus();
    resize();
  });

  function resize() {
    if (!inputEl) return;
    inputEl.style.height = "auto";
    const scrollH = inputEl.scrollHeight;
    const newH = Math.min(scrollH, MAX_HEIGHT);
    inputEl.style.height = `${newH}px`;
    inputEl.style.overflowY = scrollH > MAX_HEIGHT ? "auto" : "hidden";
  }

  function scrollToBottom() {
    chatContainer?.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  async function llmChat() {
    isLoading = true;
    const userQuery = inputText.trim();
    if (!userQuery) return;

    messages = [
      ...messages,
      { text: userQuery, sender: "user" },
      { text: "", sender: "llm" },
    ];
    inputText = "";
    resize();
    inputEl.focus();

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userQuery }),
    });

    if (!res.ok || !res.body) {
      console.error("Chat stream failed:", await res.text());
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

      // Process lines
      let lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // keep the last line if incomplete

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
            messages = [...messages]; // trigger reactivity
            scrollToBottom();
          }
        } catch (err) {
          console.error("Parse error:", err, "Line:", line);
        }
      }
    }
  }
</script>

<section class="w-full max-w-7xl mx-auto h-full pt-5 px-4 lg:px-0">
  <div class="flex flex-col h-full">
    <main
      class="w-full flex-1 overflow-y-auto p-4 space-y-4"
      bind:this={chatContainer}
    >
      <div class="pb-60">
        {#each messages as message, index}
          {#if index === messages.length - 1 && message.sender === "llm" && isLoading}
            <!-- only the very last AI message shows the spinner -->
            <ChatMessage {message} isLoading={true} />
          {:else}
            <ChatMessage {message} isLoading={false} />
          {/if}
        {/each}
      </div>
    </main>

    <div
      class="absolute fixed bottom-10 left-1/2 transform -translate-x-1/2 block w-11/12 sm:w-full max-w-5xl bg-default border border-gray-300 dark:border-gray-600 shadow-sm rounded-lg overflow-hidden"
    >
      <form
        on:submit|preventDefault={llmChat}
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
              class="w-full flex-1 bg-transparent outline-none
          placeholder-gray-500 dark:placeholder-gray-200 text-gray-900
          dark:text-white px-2 break-words"
            />
          </div>

          <div
            class="absolute bottom-0 mb-2 flex flex-row gap-x-2 justify-end w-full px-2 bg-default z-20"
          >
            <div class=" flex flex-row gap-x-2 justify-end w-full px-2">
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
                type="submit"
                class="cursor-pointer text-black text-[1rem] rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-white px-3 py-1 transition-colors duration-200"
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
