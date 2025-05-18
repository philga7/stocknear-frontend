<script lang="ts">
  export let message: { text: string; sender: "user" | "ai" };
</script>

<div class="flex mb-6" class:justify-end={message.sender === "user"}>
  <div class="flex flex-col sm:flex-row items-center">
    <img
      class="mr-auto mb-2 sm:mb-0 sm:mr-3 w-10 h-10 rounded-full {message.sender ===
      'user'
        ? 'hidden'
        : ''}"
      src="/pwa-192x192.png"
      alt="Stocknear Logo"
      loading="lazy"
    />
    <div
      class="rounded-lg p-3 w-full shadow border border-gray-300 dark:border-gray-600 {message?.sender ===
      'user'
        ? 'ml-auto'
        : 'mr-auto'}"
    >
      <p>{message?.text}</p>
    </div>
  </div>
</div>
