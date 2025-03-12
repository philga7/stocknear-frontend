<script lang="ts">
  import { openLemonSqueezyUrl } from "$lib/lemonsqueezy";
  import { onMount } from "svelte";

  import SEO from "$lib/components/SEO.svelte";

  export let data;
  export let form;

  let mode = false;
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
  descriptiion="Get unlimited access to all of our data and tools, including full financial history, full ETF holdings, and more."
/>

<svelte:head>
  <script>
    window.lemonSqueezyAffiliateConfig = { store: "stocknear" };
  </script>
  <script src="https://lmsqueezy.com/affiliate.js" defer></script>
</svelte:head>

<section
  class=" min-h-screen mb-40 w-full max-w-3xl sm:max-w-5xl m-auto text-muted dark:text-white"
>
  <div
    class="flex flex-col sm:flex-row w-full mx-auto justify-center items-center sm:space-x-8 text-sm relative pt-5 pb-20"
  >
    <div class="flex items-center" style="opacity: 1; transform: none;">
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 640 512"
        class="text-muted dark:text-zinc-400 mr-2"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"
        ></path></svg
      ><span class="font-medium text-muted dark:text-zinc-300"
        >Trusted by <span>4,000</span>+ Traders</span
      >
    </div>
    <span
      class="hidden sm:inline-block text-zinc-600"
      style="opacity: 1; transform: none;">|</span
    >
    <div
      class="mt-2 sm:mt-0 flex items-center"
      style="opacity: 1; transform: none;"
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 576 512"
        class="text-yellow-400 dark:text-zinc-400 mr-2"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
        ></path></svg
      ><span class="ml-1 mr-2 font-bold text-muted dark:text-zinc-300"
        ><span>4.4</span>/5</span
      ><span class="font-medium text-muted dark:text-zinc-300"
        >Rated "Excellent" on <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://www.trustpilot.com/review/stocknear.com"
          class="sm:hover: sm:hover:underline sm:hover:underline-offset-4"
        >
          Trustpilot</a
        ></span
      >
    </div>
  </div>

  <div class="px-3">
    <div class="mx-auto text-center mb-8">
      <h1 class="text-4xl sm:text-5xl font-bold pb-4">
        Save Time & Maximize Profits
      </h1>
    </div>

    <!--<Discount/>-->

    <div class="flex flex-row items-center justify-center lg:justify-between">
      <div
        class="hidden lg:inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 dark:bg-indigo-500/10 border border-blue-100 shadow-sm dark:border-indigo-500/20"
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 576 512"
          class="text-muted dark:text-indigo-400 mr-1.5 text-xs"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
          ></path></svg
        ><span class="text-sm text-muted dark:text-indigo-300"
          >Rated <span class="font-medium mx-0.5">Excellent</span> on Trustpilot</span
        >
      </div>

      <div class="flex flex-row items-center">
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
      class="grid max-w-md grid-cols-1 gap-6 mx-auto text-center lg:max-w-full lg:grid-cols-3"
    >
      <div
        style="opacity: 1; transform: translateY(20px);"
        class="hidden lg:flex flex-col relative bg-zinc-300 dark:bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-300 dark:border-zinc-600 p-6 isolate"
      >
        <h3 class="text-3xl font-bold">Basic</h3>
        <p class="text-muted dark:text-zinc-300 text-sm mt-1">
          Ideal for Beginners
        </p>
        <div class="mt-4">
          <span class="text-4xl font-bold">$0</span><span class=" text-xl ml-1"
            >/Month</span
          >
        </div>

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
            ><span class="">1 Watchlist</span>
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
            ><span class="">3 Price Alerts</span>
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
            ><span class="">Realtime Notification</span>
          </li>

          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400"
              >Hedge Fund Portfolio Access</span
            >
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400"
              >US Congress Portfolio Access</span
            >
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400"
              >Financial History Access</span
            >
          </li>

          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400">Stock Screener</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400"
              >Realtime Options Activity</span
            >
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400"
              >Realtime Dark Pool Trades</span
            >
          </li>
        </ul>
        <div class="mt-auto pt-6 border-t border-zinc-700 mx-4">
          {#if !data?.user}
            <label
              for="userLogin"
              class="text-white cursor-pointer w-full py-3 px-4 bg-blue-600 rounded-lg font-semibold sm:hover:bg-blue-700 transition duration-100 flex items-center justify-center"
              >Get Registered Now<svg
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
          {/if}
        </div>
      </div>
      <div
        style="opacity: 1; transform: translateY(20px);"
        class="flex flex-col relative bg-zinc-300 dark:bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-300 dark:border-zinc-600 p-6 isolate"
      >
        <h3 class="text-3xl font-bold">Plus</h3>
        <p class="text-muted dark:text-zinc-300 text-sm mt-1">
          Best for Intermediate Traders
        </p>
        <div class="mt-4">
          <span class="text-4xl font-bold">{mode ? "$7.50" : "$10"}</span><span
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
            ><span class="">Unlimited Watchlist</span>
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
            ><span class="">Unlimited Price Alerts</span>
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

            <span class="">Unlimited Stock Screener</span>
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
            ><span class="">Realtime Notification</span>
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

            <span class="">Hedge Fund Portfolio Access</span>
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

            <span class="">US Congress Portfolio Access</span>
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

            <span class="">Financial History Access</span>
          </li>

          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400"
              >Realtime Options Activity</span
            >
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 64 64"
              version="1.1"
              fill="currentColor"
              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <rect
                  id="Icons"
                  x="-448"
                  y="-64"
                  width="1280"
                  height="800"
                  style="fill:none;"
                ></rect>
                <g id="Icons1" serif:id="Icons">
                  <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>
                  <g id="H3"> </g> <g id="list-ul"> </g>
                  <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>
                  <g id="list-ol"> </g> <g id="list-task"> </g>
                  <g id="trash"> </g> <g id="vertical-menu"> </g>
                  <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>
                  <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g>
                  <g id="clock"> </g> <g id="external-link"> </g>
                  <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g>
                  <g id="plus-circle"> </g> <g id="minus-circle"> </g>
                  <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g>
                  <path
                    id="times"
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path>
                  <path
                    d="M32.033,29.19l15.55,-15.55l2.863,2.863l-15.55,15.55l15.55,15.55l-2.863,2.863l-15.55,-15.55l-15.55,15.55l-2.863,-2.863l15.55,-15.55l-15.55,-15.55l2.863,-2.863l15.55,15.55Z"
                  ></path> <g id="radio-check"> </g> <g id="eye-slash"> </g>
                  <g id="eye"> </g> <g id="toggle-off"> </g>
                  <g id="shredder"> </g>
                  <g
                    id="spinner--loading--dots-"
                    serif:id="spinner [loading, dots]"
                  >
                  </g> <g id="react"> </g> <g id="check-selected"> </g>
                  <g id="turn-off"> </g> <g id="code-block"> </g>
                  <g id="user"> </g> <g id="coffee-bean"> </g>
                  <g id="coffee-beans">
                    <g id="coffee-bean1" serif:id="coffee-bean"> </g>
                  </g> <g id="coffee-bean-filled"> </g>
                  <g id="coffee-beans-filled">
                    <g id="coffee-bean2" serif:id="coffee-bean"> </g>
                  </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g>
                  <g id="clipboard-copy"> </g> <g id="Layer1"> </g>
                </g>
              </g></svg
            >

            <span class="text-muted dark:text-gray-400"
              >Realtime Dark Pool Trades</span
            >
          </li>
        </ul>
        <div class="mt-auto pt-6 border-t border-zinc-700 mx-4">
          <label
            for={!data?.user ? "userLogin" : ""}
            on:click={() => purchasePlan("plus")}
            class="text-white cursor-pointer w-full py-3 px-4 bg-blue-600 rounded-lg font-semibold sm:hover:bg-blue-700 transition duration-100 flex items-center justify-center"
            >Unlock Plus Access Now<svg
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
      <div
        style="opacity: 1; transform: translateY(20px);"
        class="flex flex-col relative bg-zinc-300 dark:bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-300 dark:border-zinc-600 p-6 isolate"
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
        <div class="mt-auto pt-6 border-t border-zinc-700 mx-4">
          <label
            for={!data?.user ? "userLogin" : ""}
            on:click={() => purchasePlan("pro")}
            class="text-white cursor-pointer w-full py-3 px-4 bg-blue-600 rounded-lg font-semibold sm:hover:bg-blue-700 transition duration-100 flex items-center justify-center"
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

      <div
        class="text-left w-full col-span-1 lg:col-span-3 bg-zinc-300 dark:bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-200 dark:border-zinc-600 p-6 isolate translate-y-5 opacity-100 transition-all duration-300"
      >
        <!-- Responsive header: stacks vertically on mobile, horizontal on md+ -->
        <div class="flex flex-row items-center justify-between">
          <h3 class="text-2xl md:text-3xl font-bold">Lifetime</h3>
          <div>
            <span class="text-3xl md:text-4xl font-bold">$599</span>
          </div>
        </div>
        <!-- Responsive paragraph text -->
        <p class=" md:text-lg mt-2">
          Everything in Pro, pay once, never again!
        </p>
        <!-- Button container: full width on mobile, 1/4 width on md+ -->
        <div class="flex justify-end w-full md:w-1/4 ml-auto mt-4 md:mt-0">
          <label
            for={!data?.user ? "userLogin" : ""}
            on:click={() => purchasePlan("lifeTime")}
            class="text-white cursor-pointer w-full py-3 px-4 bg-blue-600 rounded-lg font-semibold sm:hover:bg-blue-700 transition duration-100 flex items-center justify-center"
          >
            Get Lifetime Now
            <svg
              class="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </label>
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
            <tbody class="text-sm md:">
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
            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex sm:hover:underline sm:hover:underline-offset-4 items-center justify-between w-full text-left py-5"
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

            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex sm:hover:underline sm:hover:underline-offset-4 items-center justify-between w-full text-left py-5"
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
                      class="text-blue-500 dark:text-blue-400 underline"
                    >
                      {emailAddress}
                    </a>
                  </p>
                </div>
              </details>
            </li>

            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex sm:hover:underline sm:hover:underline-offset-4 items-center justify-between w-full text-left py-5"
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
            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex sm:hover:underline sm:hover:underline-offset-4 items-center justify-between w-full text-left py-5"
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
                      class="text-blue-500 dark:text-blue-400 underline"
                      >{emailAddress}</a
                    > and you will get a full refund.
                  </p>
                </div>
              </details>
            </li>

            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex sm:hover:underline sm:hover:underline-offset-4 items-center justify-between w-full text-left py-5"
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

            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex sm:hover:underline sm:hover:underline-offset-4 items-center justify-between w-full text-left py-5"
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
            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="font-semibold collapse-title text-[1rem] sm:text-xl flex sm:hover:underline sm:hover:underline-offset-4 items-center justify-between w-full text-left py-5"
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
