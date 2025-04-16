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
  let discordURL = import.meta.env.VITE_DISCORD_URL;

  onMount(async () => {
    if (!data?.user) {
      LoginPopup = (await import("$lib/components/LoginPopup.svelte")).default;
    }
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
        Power up your Discord Server
      </h1>
    </div>

    <!--<Discount/>-->

    <div class="flex flex-row items-center justify-center">
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

    <div class="">
      <section
        class="relative overflow-hidden card card-side mt-5 bg-[#18181B] to-black rounded-lg p-5 flex flex-col lg:flex-row items-center justify-between"
      >
        <div class="card-body relative z-10 min-h-[300px] sm:min-h-0">
          <h2 class="card-title text-4xl font-bold mb-6 text-start">
            All-in-one Bot
          </h2>
          <p
            class="text-[1rem] sm:text-lg mb-6 w-full sm:max-w-[450px] text-start"
          >
            We provide real-time options flow from large institutional players,
            live dark pool activity, instant earnings reports, market-moving
            news, and so much more.
          </p>

          <ul class="space-y-3 grid grid-cols-2 sm:grid-cols-3 mt-4 sm:mt-8">
            <li class="flex items-start text-[1rem]">
              <svg
                class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Unusual Options Flow</span>
            </li>

            <li class="flex items-start text-[1rem]">
              <svg
                class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Unusual Dark Pool Orders</span>
            </li>

            <li class="flex items-start text-[1rem]">
              <svg
                class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Earnings Release</span>
            </li>

            <li class="flex items-start text-[1rem]">
              <svg
                class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Latest Executive Orders</span>
            </li>

            <li class="flex items-start text-[1rem]">
              <svg
                class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Congress Trading</span>
            </li>
            <li class="flex items-start text-[1rem]">
              <svg
                class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Analyst Ratings</span>
            </li>
            <li class="flex items-start text-[1rem]">
              <svg
                class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Market News</span>
            </li>
          </ul>

          <div class="card-actions mt-4 sm:mt-13">
            <div
              class="flex flex-col sm:flex-row items-center justify-between w-full"
            >
              <button
                on:click={() => purchasePlan("lifeTime")}
                class=" text-lg text-white cursor-pointer w-full lg:w-auto py-3 lg:mt-2 px-4 bg-blue-600 rounded font-semibold sm:hover:bg-blue-700 transition duration-100 flex items-center justify-center lg:justify-end"
              >
                Unlock Discord Bot
              </button>
              <div
                class="hidden lg:flex flex-col justify-center lg:justify-end lg:ml-auto items-center mb-1"
              >
                <div>
                  <span class="text-3xl md:text-4xl font-bold"
                    >{mode ? "$20" : "$30"}</span
                  ><span class=" text-xl ml-1">/Month</span>
                </div>

                <p class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {!mode ? "" : "(Billed Annually)"}
                </p>
              </div>
            </div>
          </div>

          <figure
            class="mt-10 lg:mt-0 lg:absolute lg:-bottom-20 lg:top-5 lg:-right-0 z-2"
          >
            <div class="flex-shrink-0">
              <img
                class="rounded-xl w-full sm:w-[600px]"
                src="/img/discord-dark-pool-order.png"
                alt="Dark Pool Card"
              />
            </div>
          </figure>
        </div>
      </section>

      <section
        class="relative overflow-hidden mt-4 card card-side mt-10 mb-10 bg-[#18181B] to-black rounded-lg p-5 flex flex-col lg:flex-row items-center justify-between"
      >
        <div class="card-body relative z-10 min-h-96 sm:min-h-0">
          <h2 class="card-title text-4xl font-bold mb-6 text-start">
            See Our Discord Bots In Action!
          </h2>
          <p
            class="text-[1rem] sm:text-lg mb-6 w-full sm:max-w-[450px] text-start"
          >
            Connect like-minded traders, share insights and stay ahead of market
            movements with the support of our cutting-edge tools and community
            members.
          </p>
          <div class="card-actions justify-start">
            <a
              href={discordURL}
              rel="noopener noreferrer"
              target="_blank"
              class="btn btn-ghost bg-blue-600 text-lg font-bold px-5 py-2.5 rounded"
            >
              Join Discord
            </a>
          </div>
        </div>
        <figure class="absolute -bottom-48 sm:top-5 sm:-right-20 z-2">
          <div class="flex-shrink-0">
            <img
              class="rounded-xl w-full sm:w-[600px] opacity-60 sm:opacity-100"
              src="/img/discord-server.png"
              alt="Dark Pool Card"
            />
          </div>
        </figure>
      </section>

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
                  >
                    How do I integrate the Bot to my Discord Server?
                  </summary>
                  <div class="collapse-content">
                    <p
                      class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                    >
                      After purchasing our Bot, we will contact you via email to
                      set everything up. You can also reach out to us, and we'll
                      respond as soon as possible to get you started.
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
                    Is the data real time?
                  </summary>
                  <div class="collapse-content">
                    <p
                      class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                    >
                      Options Flow Orders are delayed by 5 minutes, and Dark
                      Pool Data is delayed by 15 minutes. All other data is
                      provided in real time.
                    </p>
                  </div>
                </details>
              </li>

              <li class="border-b border-gray-400 dark:border-gray-800">
                <details class="collapse collapse-arrow">
                  <summary
                    class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                  >
                    Is the data filtered in any way?
                  </summary>
                  <div class="collapse-content">
                    <p
                      class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 transition-all duration-300 ease-in-out"
                    >
                      Yes, the data is filtered to reduce the amount of data
                      being sent over to your discord channel. This is not the
                      same amount of data you would find in the general
                      Stocknear application.
                    </p>
                  </div>
                </details>
              </li>

              <li class="border-b border-gray-400 dark:border-gray-800">
                <details class="collapse collapse-arrow">
                  <summary
                    class="font-semibold collapse-title text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                  >
                    How do I cancel my subscription?
                  </summary>
                  <div class="collapse-content">
                    <p
                      class="text-sm sm:text-[1rem] pb-5 dark:text-gray-200 transition-all duration-300 ease-in-out"
                    >
                      You can cancel anytime. Just send us an email and we will
                      do it asap for you.
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
                      We offer a 30 day money back guarantee, no questions
                      asked. Just send an email to <a
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
            </ul>
          </div>
        </div>
      </section>
      <!--End FAQ-->
    </div>
  </div>
</section>

<!--Start Login Modal-->
{#if LoginPopup}
  <LoginPopup {form} />
{/if}
