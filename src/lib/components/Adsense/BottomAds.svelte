<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    // Load the Google AdSense script if it hasn't been added yet.
    if (
      !document.querySelector(
        'script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]',
      )
    ) {
      const script = document.createElement("script");
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7722951169931877";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Push to adsbygoogle after the script has loaded
    // You might need a small delay if the script isn't immediately ready.
    const loadAds = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Ads failed to load", e);
      }
    };

    // Check if the ads script is loaded, then load the ads.
    if (window.adsbygoogle) {
      loadAds();
    } else {
      // If not, add an event listener to load ads once the script loads.
      window.addEventListener("load", loadAds);
    }
  });
</script>

<!-- Ad markup -->
<div
  class="border bg-gray-100 dark:bg-default shadow-sm border-gray-100 dark:border-gray-600 relative w-full min-h-[150px] mt-10 rounded"
>
  <h3
    class="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 uppercase text-xs"
  >
    Advertisement
  </h3>
  <ins
    class="adsbygoogle"
    style="display:block"
    data-ad-client="ca-pub-7722951169931877"
    data-ad-slot="4890164325"
    data-ad-format="auto"
    data-full-width-responsive="true"
  >
  </ins>
</div>
