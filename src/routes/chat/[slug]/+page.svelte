<script lang="ts">
  import ChatMessage from "$lib/components/Chat/ChatMessage.svelte";
  import { onMount } from "svelte";

  let messages: { text: string; sender: "user" | "ai" }[] = [
    { text: "Hello! How can I help you today?", sender: "ai" },
  ];

  let inputText = "";
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
    const userQuery = inputText.trim();
    if (!userQuery) return;

    messages = [...messages, { text: userQuery, sender: "user" }];
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

    messages = [...messages, { text: "", sender: "ai" }];
    const idx = messages.length - 1;
    let assistantText = "";

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

<section class="w-full max-w-8xl mx-auto min-h-screen pb-20 pt-5 px-4 lg:px-3">
  <div class="flex flex-col h-full">
    <main
      class="flex-1 overflow-y-auto p-4 space-y-4"
      bind:this={chatContainer}
    >
      {#each messages as message (message)}
        <ChatMessage {message} />
      {/each}
    </main>

    <form
      on:submit|preventDefault={llmChat}
      class="border-t border-gray-200 dark:border-gray-600 p-4 flex items-end space-x-2"
    >
      <textarea
        bind:this={inputEl}
        bind:value={inputText}
        on:input={resize}
        placeholder="Ask anything…"
        class="flex-1 resize-none bg-transparent outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white px-2 py-1"
        rows="1"
      />

      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 transition"
      >
        Ask
      </button>
    </form>
  </div>
</section>
