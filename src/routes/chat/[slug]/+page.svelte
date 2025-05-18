<script lang="ts">
  import ChatMessage from "$lib/components/Chat/ChatMessage.svelte";
  import ChatInput from "$lib/components/Chat/ChatInput.svelte";

  // Dummy data for messages
  let messages = [
    { text: "Hello! How can I help you today?", sender: "ai" },
    {
      text: "Hi there! I'd like to know more about SvelteKit.",
      sender: "user",
    },
    {
      text: "SvelteKit is a framework for building web applications of all sizes, with a focus on a fantastic developer experience and flexible filesystem-based routing.",
      sender: "ai",
    },
    {
      text: "That sounds interesting! How does it handle server-side rendering?",
      sender: "user",
    },
  ];
</script>

<section
  class="text-muted dark:text-white w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            {#each messages as message}
              <ChatMessage {message} />
            {/each}
          </div>

          <div class="p-4 border-t border-gray-200 dark:border-gray-600">
            <ChatInput />
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
