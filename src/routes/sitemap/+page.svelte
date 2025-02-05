<script>
  import { numberOfUnreadNotification } from "$lib/store";

  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  const tabs = [
    {
      title: "Stocks",
      link: "/stocks",
    },
    {
      title: "ETFs",
      link: "/etf",
    },
    {
      title: "ETF Provider",
      link: "/etf/etf-providers",
    },
    {
      title: "Options Flow",
      link: "/options-flow",
    },
    {
      title: "Market Flow",
      link: "/market-flow",
    },
    {
      title: "Earnings",
      link: "/earnings-calendar",
    },
    {
      title: "Dividends",
      link: "/dividends-calendar",
    },
    {
      title: "Economic Events",
      link: "/economic-calendar",
    },
    {
      title: "Economic Indicators",
      link: "/economic-indicator",
    },
    {
      title: "Market News",
      link: "/market-news",
    },
    {
      title: "U.S. Senate Portfolio",
      link: "/politicians",
    },
    {
      title: "Instituitonal Portfolio",
      link: "/hedge-funds",
    },
    {
      title: "Highest Open Interest",
      link: "/list/highest-open-interest-change",
    },
    {
      title: "Highest Open Interest Change",
      link: "/list/highest-open-interest",
    },
    {
      title: "Highest IV Rank",
      link: "/list/highest-option-iv-rank",
    },
    {
      title: "Highest Option Premium",
      link: "/list/highest-option-premium",
    },
    {
      title: "Insider Tracker",
      link: "/insider-tracker",
    },
    {
      title: "Sentiment Tracker",
      link: "/sentiment-tracker",
    },
    {
      title: "Wallstreetbets Tracker",
      link: "/reddit-tracker",
    },
    {
      title: "Top Stock Gainers",
      link: "/market-mover/gainers",
    },
    {
      title: "Top Stock Losers",
      link: "/market-mover/losers",
    },
    {
      title: "Most Active Stocks",
      link: "/market-mover/active",
    },
    {
      title: "Premarket Stock Gainers",
      link: "/market-mover/premarket/gainers",
    },
    {
      title: "Premarket Stock Losers",
      link: "/market-mover/premarket/losers",
    },
    {
      title: "Afterhours Stock Gainers",
      link: "/market-mover/afterhours/gainers",
    },
    {
      title: "Afterhours Stock Losers",
      link: "/market-mover/afterhours/losers",
    },
    {
      title: "Watchlist",
      link: "/watchlist/stocks",
    },
    {
      title: "Top Analyst Stocks Picks",
      link: "/analysts/top-stocks",
    },
    {
      title: "Top Wallstreet Analysts",
      link: "/analysts",
    },
    {
      title: "Stock Screener",
      link: "/stock-screener",
    },
    {
      title: "Market Heatmap",
      link: "/heatmap",
    },
    {
      title: "Stock Lists",
      link: "/list",
    },
    {
      title: "Price Alerts",
      link: "/price-alert",
    },
    {
      title: "About",
      link: "/about",
    },
    {
      title: "Contact Us",
      link: "/contact",
    },
    {
      title: "Terms of Use",
      link: "/terms-of-use",
    },
    {
      title: "Imprint",
      link: "/imprint",
    },
    {
      title: "Privacy Policy",
      link: "/privacy-policy",
    },
    {
      title: "Sponsor Us",
      link: "/donation",
    },
    {
      title: "Stock Analysis Pro",
      link: "/pricing",
    },
    {
      title: "Free Newsletter",
      link: "/newsletter",
    },
    {
      title: "Blog",
      link: "/blog",
    },
    {
      title: "Data Disclaimer",
      link: "/data-disclaimer",
    },
    {
      title: "Advertise with Us",
      link: "/advertise",
    },
  ];
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Sitemap
    - Stocknear
  </title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <!-- Other meta tags -->
  <meta property="og:title" content="Sitemap - Stocknear" />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Sitemap - Stocknear" />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Sitemap</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Sitemap
            </h1>
          </div>

          <div class=" w-full bg-default m-auto text-white">
            <div class="content">
              <p class="text-[1rem] sm:text-lg">
                Explore a list of popular pages on our site. If you're searching
                for a specific stock symbol, try using the search bar for quick
                results.
              </p>
              <h2 class="text-white text-3xl font-semibold mt-8 mb-5">Pages</h2>
              <ul
                class="list-outside list-disc space-y-1 p-1 pl-6 md:columns-2 md:gap-x-8 md:text-xl"
              >
                {#each tabs as item}
                  <li>
                    <a
                      class="sm:hover:underline sm:hover:underline-offset-4"
                      href={item?.link}>{item?.title}</a
                    >
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 mt-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/pricing"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Pro Subscription
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Upgrade now for unlimited access to all data and tools.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/donation"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Sponsor Us
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Learn more about why we're doing this here
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/contact"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Contact Us
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Let me know if you need something
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
