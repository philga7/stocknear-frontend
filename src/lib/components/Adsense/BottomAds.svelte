<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    // Set up Google Consent Mode before loading AdSense
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
    });

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

    const loadAds = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Ads failed to load", e);
      }
    };

    if (window.adsbygoogle) {
      loadAds();
    } else {
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
