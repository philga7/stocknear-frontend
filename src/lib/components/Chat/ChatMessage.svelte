<script lang="ts">
  import { onDestroy } from "svelte";
  import CompareGraph from "$lib/components/Plot/CompareGraph.svelte";

  export let message: {
    text: string;
    role: "user" | "system";
    callComponent: {};
  };
  export let isLoading = false;

  let loadingTime = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null; // Specify type for clarity
  const loadingMessages = [
    "Fetching data...",
    "Analyzing....",
    "Thinking...",
    "Finalizing....",
  ];

  $: {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (isLoading) {
      intervalId = setInterval(() => {
        // Only increment if we haven't reached the last message
        if (loadingTime < loadingMessages.length + 2) {
          // +2 because of "Preparing insights..." and then index 0 of loadingMessages
          loadingTime += 1;
        } else {
          // If we've reached the last message, clear the interval
          clearInterval(intervalId as ReturnType<typeof setInterval>);
          intervalId = null;
        }
      }, 3000);
    } else {
      loadingTime = 0;
    }
  }

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

<div
  class="flex m-auto mb-6 w-full max-w-[1000px]"
  class:justify-end={message.role === "user"}
>
  <div class="flex flex-col sm:flex-row items-start w-full">
    <img
      class="mr-auto mb-2 sm:mb-0 sm:mr-3 w-10 h-10 rounded-full {message.role ===
      'user'
        ? 'hidden'
        : ''}"
      src="/pwa-192x192.png"
      alt="Stocknear Logo"
      loading="lazy"
    />
    <div
      class="rounded p-3 min-w-14 max-w-[80vw] shadow border border-gray-300 dark:border-gray-700 {message?.role ===
      'user'
        ? 'ml-auto '
        : message?.role === 'system' && message?.callComponent?.tickerList
          ? 'mr-auto w-full'
          : 'mr-auto w-fit'}"
    >
      {#if isLoading}
        <div class="text-center">
          <span class="text-sm animate-pulse">
            {#if loadingTime <= 2}
              Preparing insights...
            {:else}
              {loadingMessages[
                Math.min(loadingTime - 3, loadingMessages.length - 1)
              ]}
            {/if}
          </span>
        </div>
      {:else}
        <div class="w-full">
          <p class="w-full">{@html message?.content}</p>
          {#if message?.callComponent?.plot && message?.callComponent?.tickerList?.length > 0}
            <div class="">
              <CompareGraph tickerList={message?.callComponent?.tickerList} />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
