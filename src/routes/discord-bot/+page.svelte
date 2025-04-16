<script lang="ts">
  import { openLemonSqueezyUrl } from "$lib/lemonsqueezy";
  import { onMount } from "svelte";

  import SEO from "$lib/components/SEO.svelte";

  export let data;
  export let form;

  let mode = true;
  const emailAddress = "support@stocknear.com";

  function toggleMode() {
    mode = !mode;
  }

  let LoginPopup;

  onMount(async () => {
    if (!data?.user) {
      LoginPopup = (await import("$lib/components/LoginPopup.svelte")).default;
    }

    /*
    if(data?.subscribeToPro === 'monthly') {
        mode = false;
        const closePopup = document.getElementById("becomePro");
        closePopup?.dispatchEvent(new MouseEvent('click'))
    } else if (data?.subscribeToPro === 'annually') {
        mode = true;
        const closePopup = document.getElementById("becomePro");
        closePopup?.dispatchEvent(new MouseEvent('click'))
    }
    */
  });

  async function purchasePlan(subscriptionType: string = "") {
    if (data?.user) {
      let subId = "";

      if (subscriptionType === "lifeTime") {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_LIFE_TIME_ACCESS_ID;
      } else if (mode && subscriptionType === "plus") {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_ANNUAL_ID_PLUS;
      } else if (!mode && subscriptionType === "plus") {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_MONTHLY_ID_PLUS;
      } else if (mode && subscriptionType === "pro") {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_ANNUAL_ID_PRO;
      } else if (!mode && subscriptionType === "pro") {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_MONTHLY_ID_PRO;
      } else {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_ANNUAL_ID_PRO;
      }
      try {
      } catch (e) {
        console.log(e);
      }

      const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const checkoutUrl =
        `https://stocknear.lemonsqueezy.com/checkout/buy/${subId}?` +
        new URLSearchParams({
          embed: "1",
          dark: isDarkMode ? "1" : "0",
          "checkout[email]": data?.user?.email,
          "checkout[name]": data?.user?.username,
          "checkout[custom][userId]": data?.user?.id,
        }).toString();

      openLemonSqueezyUrl(checkoutUrl);
      //goto(`https://stocknear.lemonsqueezy.com/checkout/buy/${subId}`)
    }
  }
</script>

<SEO
  title="Pricing Plans"
  description="Get unlimited access to all of our data and tools, including full financial history, full ETF holdings, and more."
/>

<svelte:head>
  <script>
    window.lemonSqueezyAffiliateConfig = { store: "stocknear" };
  </script>
  <script src="https://lmsqueezy.com/affiliate.js" defer></script>
</svelte:head>

<section
  class=" min-h-screen mb-40 w-full max-w-3xl sm:max-w-6xl m-auto text-muted dark:text-white"
>
  <div class="px-3">
    <div class="mx-auto text-center mb-8 mt-10">
      <h1 class="text-4xl sm:text-5xl font-bold pb-4">
        Instantly 10x Your Discord Server's Value & Engagement
      </h1>
    </div>

    <!--<Discount/>-->

    <div class="flex flex-row items-center justify-center mb-5 sm:mb-0">
      <div class="flex flex-row items-center ml-auto">
        <span class="text-[1rem] font-semibold mr-3"> Monthly </span>

        <label class="inline-flex cursor-pointer relative">
          <input
            on:click={toggleMode}
            type="checkbox"
            checked={mode}
            value={mode}
            class="sr-only peer"
          />
          <div
            class="w-14 h-7 bg-[#09090B] border border-gray-600 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[0.40rem] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 {mode ===
            false
              ? 'after:translate-x-[-0.2rem]'
              : ''} "
          ></div>
        </label>

        <div class="ml-3 flex flex-col text-[1rem] items-start">Annually</div>
      </div>
    </div>

    <div
      class="grid max-w-md grid-cols-1 gap-6 mx-auto text-center lg:max-w-full lg:grid-cols-2"
    >
      <div>
        <h3 class="text-4xl font-bold text-start pb-6">
          Stocknear Discord Bot
        </h3>
        <p class=" text-xl text-start">
          Our bots are designed to help you and your community stay ahead of the
          curve by providing data on significant stock data, options and dark
          pool trades.
        </p>
      </div>

      <div
        style="opacity: 1; transform: translateY(20px);"
        class="flex flex-col relative bg-zinc-300 dark:bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded overflow-visible border border-zinc-300 dark:border-zinc-600 p-6 isolate"
      >
        <h3 class="text-3xl font-bold">Pro</h3>
        <p class="text-muted dark:text-zinc-300 text-sm mt-1">
          Best for Professional Traders
        </p>
        <div class="mt-4">
          <span class="text-4xl font-bold">{mode ? "$15" : "$20"}</span><span
            class=" text-xl ml-1">/Month</span
          >
        </div>
        <p
          class="text-muted dark:text-gray-400 text-sm mt-1 mx-4 {!mode
            ? 'hidden'
            : ''}"
        >
          (Billed Annually)
        </p>

        <ul class="mt-6 mb-6 space-y-2">
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path></svg
            ><span class="">Everything in Plus and ...</span>
          </li>

          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path></svg
            ><span class="">Watchlist with up to 300 stocks</span>
          </li>

          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path></svg
            ><span class="">1,000 Bulk Download Credits</span>
          </li>

          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path></svg
            >

            <span class="">Realtime Options Activity</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path></svg
            >

            <span class="">Realtime Dark Pool Trades</span>
          </li>
        </ul>
        <!--
        {#if !["Pro", "Plus"]?.includes(data?.user?.tier) || data?.user?.freeTrial === true}
          <div class="mt-3 items-center text-[1rem] font-medium mb-5">
            Promo Code: <strong>SPRINGSALE</strong>
            <br class="mb-2" />
            Get <strong>50% OFF</strong> on Pro Annual Membership!
          </div>
        {/if}
        -->
        <div class="mt-auto pt-6 border-t border-zinc-700 mx-4">
          <label
            for={!data?.user ? "userLogin" : ""}
            on:click={() => purchasePlan("pro")}
            class="text-white cursor-pointer w-full py-3 px-4 bg-blue-600 rounded font-semibold sm:hover:bg-blue-700 transition duration-100 flex items-center justify-center"
            >Unlock Pro Access Now<svg
              class="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path></svg
            ></label
          >
        </div>
      </div>
    </div>

    <!--Feature Table-->
    <section class="py-8 md:py-12 mt-8 md:mt-10">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-center">
          Compare plans &amp; features
        </h2>
        <!-- Make sure the table can scroll horizontally on small screens -->
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse text-left">
            <colgroup>
              <col class="w-1/3" />
              <col class="w-1/6" />
              <col class="w-1/6" />
              <col class="w-1/6" />
            </colgroup>
            <thead>
              <tr>
                <th class="py-2 md:py-3 pt-8 font-semibold text-sm sm:text-lg">
                  Research company stocks
                </th>
                <th
                  class="py-2 md:py-3 font-semibold text-center text-sm sm:text-lg"
                >
                  Free
                </th>
                <th
                  class="py-2 md:py-3 font-semibold text-center text-sm sm:text-lg"
                >
                  Plus
                </th>
                <th
                  class="py-2 md:py-3 font-semibold text-center text-sm sm:text-lg"
                >
                  Pro
                </th>
              </tr>
            </thead>
            <tbody class="text-sm md:text-[1rem]">
              <tr>
                <td class="py-2 md:py-3">Full Market Access</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">✅</td>
                <td class="py-2 md:py-3 text-center">✅</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">Hedge Fund Portfolio</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">✅</td>
                <td class="py-2 md:py-3 text-center">✅</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">US Congress Portfolio</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">✅</td>
                <td class="py-2 md:py-3 text-center">✅</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">Stock Screener</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">Unlimited</td>
                <td class="py-2 md:py-3 text-center">Unlimited</td>
              </tr>
              <tr>
                <td
                  colspan="4"
                  class="py-2 md:py-3 pt-8 font-semibold text-sm sm:text-lg"
                >
                  Unusual Activity
                </td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">Realtime Options Data from OPRA</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">✅</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">Realtime Dark Pool Data</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">✅</td>
              </tr>

              <tr>
                <td
                  colspan="4"
                  class="py-2 md:py-3 pt-8 font-semibold text-sm sm:text-lg"
                >
                  Trade Ideas
                </td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">No. of Watchlists</td>
                <td class="py-2 md:py-3 text-center">1</td>
                <td class="py-2 md:py-3 text-center">Unlimited</td>
                <td class="py-2 md:py-3 text-center">Unlimited</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">No. of Bulk Downloads</td><td
                  class="py-2 md:py-3 text-center">10</td
                >
                <td class="py-2 md:py-3 text-center">500</td>
                <td class="py-2 md:py-3 text-center">1,000</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">No. of Price Alerts</td>
                <td class="py-2 md:py-3 text-center">3</td>
                <td class="py-2 md:py-3 text-center">Unlimited</td>
                <td class="py-2 md:py-3 text-center">Unlimited</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">Wallstreet Analyst Rating</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">✅</td>
                <td class="py-2 md:py-3 text-center">✅</td>
              </tr>
              <tr>
                <td class="py-2 md:py-3">AI Model Forecasts</td>
                <td class="py-2 md:py-3 text-center">❌</td>
                <td class="py-2 md:py-3 text-center">✅</td>
                <td class="py-2 md:py-3 text-center">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!--Feature Table -->

    <!--Start FAQ-->

    <section class="">
      <div class="mx-auto">
        <div class="py-12 md:py-10">
          <!-- Section header -->
          <div class="max-w-3xl mx-auto text-center pb-12 md:pb-14">
            <h2 class="text-4xl font-bold">Frequently Asked Questions</h2>
          </div>

          <!-- Faqs -->
          <ul class="mx-auto divide-y divide-gray-800">
            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                  >What are the advantages of Stocknear Service?</summary
                >
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    Stocknear Service provides simplified, actionable trading
                    data and an extensive tool suite for every trader, featuring
                    exclusive, high-quality Wall Street data at an unmatched
                    price. We also offer proprietary AI models for accurate
                    forecasting and timely alerts, all within a single, unified
                    platform.
                  </p>
                </div>
              </details>
            </li>

            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  What is a Credit and How Can I Use It?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 transition-all duration-300 ease-in-out"
                  >
                    Your monthly credit allows you to download historical price
                    data in bulk for all the companies in your watchlist. In the
                    future, you’ll be able to download a wide range of financial
                    data in bulk as well. Each company download costs one
                    credit. For example, in the Plus Tier you can download data
                    for up to 500 companies per month, while the Pro Tier lets
                    you download data for up to 1,000 companies.
                  </p>
                </div>
              </details>
            </li>

            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Can I change my plan at any time?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 transition-all duration-300 ease-in-out"
                  >
                    Yes! Simply reach out to us via email, and we’ll take care
                    of it for you.
                    <a
                      href={`mailto:${emailAddress}`}
                      class="text-blue-700 dark:text-blue-400 underline"
                    >
                      {emailAddress}
                    </a>
                  </p>
                </div>
              </details>
            </li>

            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Are there any commissions in addition to the subscription
                  plans?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    No, we do not charge any additional commissions or hidden
                    fees beyond our subscription plans.
                  </p>
                </div>
              </details>
            </li>
            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Can I request a refund?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    We offer a 30 day money back guarantee, no questions asked.
                    Just send an email to <a
                      href={`mailto:${emailAddress}`}
                      class="text-blue-700 dark:text-blue-400 underline"
                      >{emailAddress}</a
                    > and you will get a full refund.
                  </p>
                </div>
              </details>
            </li>

            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  What are my payment options?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    We support Credit Card & Paypal payments.
                  </p>
                </div>
              </details>
            </li>

            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Can I cancel at any time?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    Of course. There is a "Cancel Subscription" button in your
                    account area that you get access to after signing up. You
                    can also send us a message and we will cancel for you.
                  </p>
                </div>
              </details>
            </li>
            <li class="border-b border-gray-400 dark:border-gray-800">
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Why is Stocknear so much cheaper than other platforms?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    Stocknear is a solo project, which means I handle everything
                    myself—eliminating the need for a large team and costly
                    overhead. This allows me to keep prices low while still
                    delivering a high-quality service. Unlike many financial
                    platforms that prioritize high profit margins, my goal is to
                    make market data accessible to everyone.
                  </p>
                </div>
              </details>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!--End FAQ-->
  </div>
</section>

<!--Start Login Modal-->
{#if LoginPopup}
  <LoginPopup {form} />
{/if}

<!--End Login Modal-->
