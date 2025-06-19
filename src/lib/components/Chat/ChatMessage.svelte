<script lang="ts">
  import { onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { toast } from "svelte-sonner";
  import { mode } from "mode-watcher";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  //import CompareGraph from "$lib/components/Plot/CompareGraph.svelte";

  export let message: {
    text: string;
    role: "user" | "system";
    callComponent: {};
  };
  export let isLoading = false;
  export let isStreaming = false;
  export let index;

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

  function handleShare() {
    const url = $page?.url?.href;
    navigator.clipboard
      ?.writeText(url)
      ?.then(() => {
        toast?.success("Link copied. Paste to share", {
          style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
        });
      })
      ?.catch((err) => {
        toast?.error("Something went wrong. Please try again!", {
          style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
        });
      });
  }
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
      class="rounded p-3 min-w-14 max-w-[80vw] {message?.role === 'user'
        ? 'ml-auto border border-gray-200 dark:border-gray-800 rounded-[5px] bg-gray-100 dark:bg-table'
        : message?.role === 'system' && message?.callComponent?.tickerList
          ? 'mr-auto w-full'
          : 'mr-auto w-fit border-b border-gray-300 dark:border-gray-700'}"
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
          <p class="w-full">
            {@html message?.content}
          </p>

          <!--
          {#if message?.callComponent?.plot && message?.callComponent?.tickerList?.length > 0}
            <div class="mt-6">
              <CompareGraph tickerList={message?.callComponent?.tickerList} />
            </div>
          {/if}
          -->
        </div>
        {#if message?.role === "system"}
          {#if !isStreaming}
            <div class="-ml-sm gap-xs flex items-center">
              <button
                type="button"
                class="text-muted dark:text-gray-300 dark:sm:hover:text-white focus-visible:bg-offsetPlus dark:focus-visible:bg-offsetPlusDark hover:bg-offsetPlus text-textOff dark:text-textOffDark hover:text-textMain dark:hover:bg-offsetPlusDark dark:hover:text-textMainDark font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out font-sans select-none items-center relative group/button justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 pl-1 sm:pl-2.5 pr-3"
                on:click={handleShare}
                ><div
                  class="flex flex-row items-center min-w-0 font-medium gap-1.5 justify-center"
                >
                  <div class="flex shrink-0 items-center justify-center size-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-8 h-8 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><path
                        d="M13 4v4c-6.575 1.028 -9.02 6.788 -10 12c-.037 .206 5.384 -5.962 10 -6v4l8 -7l-8 -7z"
                      ></path></svg
                    >
                  </div>
                  <div
                    class="text-align-center relative truncate leading-loose -mb-px"
                  >
                    Share
                  </div>
                </div></button
              >

              <button
                type="button"
                on:click={() => {
                  if (!isStreaming) {
                    dispatch("rewrite", index);
                  }
                }}
                class="text-muted dark:text-gray-300 dark:sm:hover:text-white focus-visible:bg-offsetPlus dark:focus-visible:bg-offsetPlusDark hover:bg-offsetPlus text-textOff dark:text-textOffDark hover:text-textMain dark:hover:bg-offsetPlusDark dark:hover:text-textMainDark font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out font-sans select-none items-center relative group/button justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 pl-1 sm:pl-2.5 pr-3"
                ><div
                  class="flex flex-row items-center min-w-0 font-medium gap-1.5 justify-center"
                >
                  <div class="flex shrink-0 items-center justify-center size-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-8 h-8 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"
                      ></path><path
                        d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"
                      ></path></svg
                    >
                  </div>
                  <div
                    class="text-align-center relative truncate leading-loose -mb-px"
                  >
                    Rewrite
                  </div>
                </div></button
              >
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
</div>
