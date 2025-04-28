<!-- SquareAdComponent.svelte -->
<script>
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  // State to track if the ad is loaded
  let adLoaded = false;

  onMount(() => {
    if (browser) {
      // Check if AdSense script is already loaded
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        // Load Google AdSense script dynamically
        const script = document.createElement("script");
        script.src =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7722951169931877";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => {
          adLoaded = true;
          initializeAd();
        };
        document.head.appendChild(script);
      } else {
        // AdSense script already exists, just initialize the ad
        adLoaded = true;
        initializeAd();
      }
    }
  });

  function initializeAd() {
    // Push the ad after a slight delay to ensure AdSense is fully loaded
    setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }, 100);
  }
</script>

<div class="mt-5 text-center xl:max-w-screen-xl px-3 sm:px-0">
  <h3
    class="uppercase text-center text-[9px] font-semibold text-gray-500 dark:text-gray-300"
  >
    Advertisement
  </h3>

  <div
    class="mx-auto h-[280px] w-full border border-gray-300 dark:border-gray-800 rounded bg-gray-100 dark:bg-gray-800"
  >
    {#if adLoaded}
      <ins
        class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-7722951169931877"
        data-ad-slot="7703947777"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    {/if}
  </div>
</div>
