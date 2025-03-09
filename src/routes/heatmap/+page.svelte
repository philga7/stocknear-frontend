<script lang="ts">
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import SEO from "$lib/components/SEO.svelte";
  import { setCache, getCache } from "$lib/store";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { mode } from "mode-watcher";

  export let data;
  let isLoaded = false;
  let isLoading = true;

  let rawData;
  let iframe: HTMLIFrameElement;
  let selectedTimePeriod = "1D";
  let iframeUrl;

  onMount(async () => {
    await getHeatMap("1D");
  });

  async function getHeatMap(timePeriod) {
    selectedTimePeriod = timePeriod;
    isLoading = true;

    try {
      const cachedData = getCache(selectedTimePeriod, "getHeatmap");
      if (cachedData) {
        rawData = cachedData;
      } else {
        const postData = { params: selectedTimePeriod };
        const response = await fetch("/api/heatmap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        rawData = await response.json();
        setCache(selectedTimePeriod, rawData, "getHeatmap");
      }

      const blob = new Blob([rawData], { type: "text/html" });
      if (iframeUrl) {
        URL.revokeObjectURL(iframeUrl);
      }
      iframeUrl = URL.createObjectURL(blob);

      // Wait for iframe to load before considering it ready
      if (iframe) {
        const loadPromise = new Promise<void>((resolve) => {
          iframe.onload = () => resolve();
        });

        // Set a timeout to prevent hanging if iframe doesn't load properly
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 50);
        });

        await Promise.race([loadPromise, timeoutPromise]);
      }

      isLoaded = true;
    } catch (error) {
      console.error("Error loading heatmap:", error);
      toast.error("Failed to load heatmap. Please try again.", {
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      });
    } finally {
      isLoading = false;
    }
  }

  async function downloadPlot(item) {
    return toast.promise(
      (async () => {
        let selectedFormat;

        if (item === "PNG") {
          selectedFormat = "png";
        } else if (item === "JPG") {
          selectedFormat = "jpeg";
        } else {
          selectedFormat = "svg";
        }

        if (!iframe || !isLoaded) throw new Error("Iframe not ready");

        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) throw new Error("Iframe window not available");

        const Plotly = iframeWindow.Plotly;
        if (!Plotly) throw new Error("Plotly not found in iframe");

        const plotDiv =
          iframe.contentDocument?.querySelector(".plotly-graph-div");
        if (!plotDiv) throw new Error("Plotly div not found");

        const options = {
          format: selectedFormat,
          width: 1200,
          height: 800,
        };

        const imageData = await Plotly.toImage(plotDiv, options);

        const link = document.createElement("a");
        link.href = imageData;
        link.download = `sp500-heatmap-${selectedTimePeriod}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })(),
      {
        loading: "Downloading heatmap...",
        success: "Heatmap downloaded!",
        error: "Download failed. Try again.",
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      },
    );
  }

  function handleIframeLoad() {
    // This will be triggered when the iframe has fully loaded
    isLoaded = true;
    isLoading = false;
  }

  onDestroy(() => {
    if (iframeUrl) URL.revokeObjectURL(iframeUrl);
  });
</script>

<SEO
  title="S&P 500 Stock Market Heatmap"
  description="A stock market heatmap showing the performance of the individual stocks, sectors and industries in the S&P500."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Heatmap</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="border-b-[2px] flex justify-between items-center gap-4">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              S&P 500 - {selectedTimePeriod} Performance
            </h1>
          </div>

          <div class="flex flex-row items-center w-fit">
            <div
              class="grid grid-cols-2 sm:grid-cols-3 gap-y-3 sm:gap-y-0 gap-x-2.5 lg:grid-cols-3 w-full mt-5"
            >
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    builders={[builder]}
                    class="border-gray-600 border bg-default sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                    disabled={isLoading}
                  >
                    <span class="truncate text-white">Time Period</span>
                    <svg
                      class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
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
                  class="w-auto h-fit max-h-72 overflow-y-auto scroller"
                >
                  <div
                    class="relative sticky z-40 focus:outline-hidden -top-1"
                    tabindex="0"
                    role="menu"
                    style=""
                  ></div>
                  <DropdownMenu.Group>
                    {#each ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y"] as item}
                      <DropdownMenu.Item class="sm:hover:bg-primary">
                        <div class="flex items-center">
                          <button
                            on:click={() => getHeatMap(item)}
                            class="cursor-pointer text-white"
                          >
                            <span class="mr-8">{item}</span>
                          </button>
                        </div>
                      </DropdownMenu.Item>
                    {/each}
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    builders={[builder]}
                    class="border-gray-600 border bg-default sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                    disabled={isLoading || !isLoaded}
                  >
                    <span class="truncate text-white">Download</span>
                    <svg
                      class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
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
                  class="w-auto h-fit max-h-72 overflow-y-auto scroller"
                >
                  <div
                    class="relative sticky z-40 focus:outline-hidden -top-1"
                    tabindex="0"
                    role="menu"
                    style=""
                  ></div>
                  <DropdownMenu.Group>
                    {#each ["PNG", "JPG", "SVG"] as item}
                      <DropdownMenu.Item class="sm:hover:bg-primary">
                        <div class="flex items-center">
                          <button
                            on:click={() => downloadPlot(item)}
                            disabled={!isLoaded}
                            class="cursor-pointer text-white"
                          >
                            <span class="mr-8">Download {item}</span>
                          </button>
                        </div>
                      </DropdownMenu.Item>
                    {/each}
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
          <div class="w-full h-full bg-[#09090B] overflow-hidden">
            {#if isLoading}
              <div class="flex justify-center items-center h-80">
                <div class="relative">
                  <label
                    class=" h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <span class="loading loading-bars loading-md text-gray-400"
                    ></span>
                  </label>
                </div>
              </div>
            {:else if rawData && iframeUrl && !isLoading}
              <iframe
                bind:this={iframe}
                src={iframeUrl}
                class="w-full h-screen border-none"
                on:load={handleIframeLoad}
                title="S&P 500 Heatmap"
              />
            {:else}
              <div class="flex justify-center items-center h-80">
                <p class="text-gray-400">No data available</p>
              </div>
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
