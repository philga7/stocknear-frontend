<script lang="ts">
  export let message: { text: string; sender: "user" | "ai" };
</script>

<div class="flex mb-4" class:justify-end={message.sender === "user"}>
  <div
    class="rounded-lg p-3 max-w-[70%] shadow border border-gray-300 dark:border-gray-600"
  >
    <p>{message.text}</p>
  </div>
</div>
