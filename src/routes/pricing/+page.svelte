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
      } else if (mode) {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_ANNUAL_ID;
      } else {
        subId = import.meta.env.VITE_LEMON_SQUEEZY_MONTHLY_ID;
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
  title="Pricing"
  descriptiion="Get unlimited access to all of our data and tools, including full financial history, full ETF holdings, and more."
/>

<svelte:head>
  <script>
    window.lemonSqueezyAffiliateConfig = { store: "stocknear" };
  </script>
  <script src="https://lmsqueezy.com/affiliate.js" defer></script>
</svelte:head>

<section
  class="bg-default min-h-screen mb-40 w-full max-w-3xl sm:max-w-5xl pt-10 m-auto"
>
  <div class="px-3">
    <div class="mx-auto text-center mb-8">
      <h1
        class="text-4xl sm:text-5xl font-bold text-white text-transparent pb-4"
      >
        Save Time & Cut Costs
      </h1>
    </div>

    <!--<Discount/>-->

    <div class="flex flex-row items-center justify-end">
      <span class="text-[1rem] font-semibold text-white mr-3"> Monthly </span>

      <label class="inline-flex cursor-pointer relative">
        <input
          on:click={toggleMode}
          type="checkbox"
          checked={mode}
          value={mode}
          class="sr-only peer"
        />
        <div
          class="w-14 h-7 bg-[#09090B] border border-gray-600 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[0.40rem] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 {mode ===
          false
            ? 'after:translate-x-[-0.2rem]'
            : ''} "
        ></div>
      </label>

      <div class="ml-3 flex flex-col text-[1rem] items-start">Annually</div>
    </div>

    <div
      class="grid max-w-md grid-cols-1 gap-6 mx-auto text-center lg:max-w-full lg:grid-cols-3"
    >
      <div
        style="opacity: 1; transform: translateY(20px);"
        class="flex flex-col relative bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-600 p-6 isolate"
      >
        <h3 class="text-3xl font-bold text-indigo-300">Basic</h3>
        <p class="text-zinc-300 text-sm mt-1">Ideal for Beginners</p>
        <div class="mt-4">
          <span class="text-4xl font-bold text-white">$0</span><span
            class="text-white text-xl ml-1">/Month</span
          >
        </div>

        <ul class="mt-6 mb-6 space-y-2">
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-indigo-300 font-medium"
              >1,000 credits per month</span
            >
            <div class="relative inline-block">
              <svg
                class="w-4 h-4 ml-1 text-gray-300 flex-shrink-0 mt-1 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path></svg
              >
            </div>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">2 tasks waiting in queue</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-indigo-300 font-medium"
              >Standard queue priority</span
            >
            <div class="relative inline-block">
              <svg
                class="w-4 h-4 ml-1 text-gray-300 flex-shrink-0 mt-1 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path></svg
              >
            </div>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400"
              >Assets are private &amp; customer owned</span
            >
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Image AI Studio</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">AI texture editing</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Download community models</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Free Remesh, LODs and all Tools</span>
          </li>
        </ul>
        <div class="mt-auto pt-6 border-t border-zinc-700 mx-4">
          <button
            class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition duration-300 flex items-center justify-center"
            >Unlock Full Access Now<svg
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
            ></button
          >
        </div>
      </div>
      <div
        style="opacity: 1; transform: translateY(20px);"
        class="flex flex-col relative bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-600 p-6 isolate"
      >
        <h3 class="text-3xl font-bold text-indigo-300">Plus</h3>
        <p class="text-zinc-300 text-sm mt-1">Best for intermediate traders</p>
        <div class="mt-4">
          <span class="text-4xl font-bold text-white">$7.50</span><span
            class="text-white text-xl ml-1">/Month</span
          >
        </div>

        <ul class="mt-6 mb-6 space-y-2">
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-indigo-300 font-medium"
              >3,200 credits per month</span
            >
            <div class="relative inline-block">
              <svg
                class="w-4 h-4 ml-1 text-gray-300 flex-shrink-0 mt-1 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path></svg
              >
            </div>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">5 tasks waiting in queue</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-indigo-300 font-medium"
              >Standard queue priority</span
            >
            <div class="relative inline-block">
              <svg
                class="w-4 h-4 ml-1 text-gray-300 flex-shrink-0 mt-1 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path></svg
              >
            </div>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400"
              >Assets are private &amp; customer owned</span
            >
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Image AI Studio</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">AI texture editing</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Download community models</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Free Remesh, LODs and all Tools</span>
          </li>
        </ul>
        <div class="mt-auto pt-6 border-t border-zinc-700 mx-4">
          <button
            class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition duration-300 flex items-center justify-center"
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
            ></button
          >
        </div>
      </div>
      <div
        style="opacity: 1; transform: translateY(20px);"
        class="flex flex-col relative bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-600 p-6 isolate"
      >
        <h3 class="text-3xl font-bold text-indigo-300">Pro</h3>
        <p class="text-zinc-300 text-sm mt-1">Best for serious traders</p>
        <div class="mt-4">
          <span class="text-4xl font-bold text-white">$20</span><span
            class="text-white text-xl ml-1">/Month</span
          >
        </div>

        <ul class="mt-6 mb-6 space-y-2">
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-indigo-300 font-medium"
              >22,000 credits per month</span
            >
            <div class="relative inline-block">
              <svg
                class="w-4 h-4 ml-1 text-gray-300 flex-shrink-0 mt-1 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path></svg
              >
            </div>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">10 tasks waiting in queue</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-indigo-300 font-medium"
              >Maximum queue priority</span
            >
            <div class="relative inline-block">
              <svg
                class="w-4 h-4 ml-1 text-gray-300 flex-shrink-0 mt-1 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path></svg
              >
            </div>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400"
              >Assets are private &amp; customer owned</span
            >
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Image AI Studio</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">AI texture editing</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Download community models</span>
          </li>
          <li class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-indigo-300 flex-shrink-0 mt-0.5"
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
            ><span class="text-gray-400">Free Remesh, LODs and all Tools</span>
          </li>
        </ul>
        <div class="mt-auto pt-6 border-t border-zinc-700 mx-4">
          <button
            class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition duration-300 flex items-center justify-center"
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
            ></button
          >
        </div>
      </div>

      <div
        style="opacity: 1; transform: translateY(20px);"
        class="text-start w-full col-span-1 lg:col-span-3 bg-zinc-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl overflow-visible border border-zinc-600 p-6 isolate"
      >
        <div class="flex flex-row items-center justify-between">
          <h3 class="text-3xl font-bold text-indigo-300">Lifetime</h3>
          <div class="inline-block">
            <span class="text-4xl font-bold text-white">$599</span>
          </div>
        </div>
        <p class="text-lg mt-2">Everything in Pro, pay once, never again!</p>
        <div class="ml-auto flex justify-end w-1/4">
          <button
            class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition duration-300 flex items-center justify-center"
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
            ></button
          >
        </div>
      </div>
    </div>

    <!--Feature Table-->
    <section class="py-12 mt-10">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-white mb-10 text-center">
          Compare plans &amp; features
        </h2>
        <!-- Use an overflow-x container so the table is scrollable on small screens -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <!-- Optionally define column widths and background colors for columns -->
            <colgroup>
              <col class="w-1/3" />
              <!-- 'Free' column -->
              <col class="w-1/6" />
              <!-- 'Premium' column (light blue) -->
              <col class="w-1/6 bg-indigo-500/20" />
              <!-- 'Unlimited' column (slightly darker blue) -->
              <col class="w-1/6 bg-indigo-500/40" />
            </colgroup>

            <thead>
              <tr>
                <th class="py-3 font-semibold text-white">
                  Discover investment opportunities</th
                >
                <th class="py-3 font-semibold text-white text-center">Free</th>
                <th class="py-3 font-semibold text-white text-center">Plus</th>
                <th class="py-3 font-semibold text-white text-center">Pro</th>
              </tr>
            </thead>

            <tbody class="">
              <tr>
                <td class="py-3">Global market access</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>
              <tr>
                <td class="py-3">Curated investment ideas</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>
              <tr>
                <td class="py-3">Sample portfolios</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>
              <tr>
                <td class="py-3">Stock screeners &amp; Alerts</td>
                <td class="py-3 text-center">Limited</td>
                <td class="py-3 text-center">3</td>
                <td class="py-3 text-center">10</td>
              </tr>

              <tr>
                <td colspan="4" class="py-3 font-semibold text-lg text-white">
                  Research company stocks
                </td>
              </tr>
              <tr>
                <td class="py-3">Company stock reports</td>
                <td class="py-3 text-center">5/mo</td>
                <td class="py-3 text-center">30/mo</td>
                <td class="py-3 text-center">Unlimited</td>
              </tr>
              <tr>
                <td class="py-3">Stock comparison tool</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>
              <tr>
                <td class="py-3">Export to Excel &amp; PDF</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>

              <!-- Category 3: Portfolio management & analysis -->
              <tr>
                <td colspan="4" class="py-3 font-semibold text-lg text-white">
                  Portfolio management &amp; analysis
                </td>
              </tr>
              <tr>
                <td class="py-3">No. of portfolios</td>
                <td class="py-3 text-center">1</td>
                <td class="py-3 text-center">3</td>
                <td class="py-3 text-center">5</td>
              </tr>
              <tr>
                <td class="py-3">No. of holdings in each portfolio</td>
                <td class="py-3 text-center">10</td>
                <td class="py-3 text-center">30</td>
                <td class="py-3 text-center">Unlimited</td>
              </tr>
              <tr>
                <td class="py-3">Brokerage linking</td>
                <td class="py-3 text-center"></td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>
              <tr>
                <td class="py-3">Important updates from each holding</td>
                <td class="py-3 text-center">Limited</td>
                <td class="py-3 text-center">Unlimited</td>
                <td class="py-3 text-center">Unlimited</td>
              </tr>
              <tr>
                <td class="py-3">Weekly portfolio update email</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>
              <tr>
                <td class="py-3">Weekly Market insights newsletter</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
                <td class="py-3 text-center">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <!--Feature Table -->

    <!--Start FAQ-->
    <section class="bg-default">
      <div class="mx-auto">
        <div class="py-12 md:py-10">
          <!-- Section header -->
          <div class="max-w-3xl mx-auto text-center pb-12 md:pb-14">
            <h2 class="text-4xl font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <!-- Faqs -->
          <ul class="mx-auto divide-y divide-gray-800">
            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="collapse-title text-white font-semibold text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                  >What are the advantages of Stocknear Service?</summary
                >
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
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
                  class="collapse-title text-white font-semibold text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Can I change my plan at any time?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 text-gray-200 transition-all duration-300 ease-in-out"
                  >
                    Yes! Simply reach out to us via email, and we’ll take care
                    of it for you.
                    <a
                      href={`mailto:${emailAddress}`}
                      class="text-blue-400 underline"
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
                  class="collapse-title text-white font-semibold text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Are there any commissions in addition to the subscription
                  plans?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
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
                  class="collapse-title text-white font-semibold text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Can I request a refund?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    We offer a 30 day money back guarantee, no questions asked.
                    Just send an email to <a
                      href={`mailto:${emailAddress}`}
                      class="text-blue-400 underline">{emailAddress}</a
                    > and you will get a full refund.
                  </p>
                </div>
              </details>
            </li>

            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="collapse-title text-white font-semibold text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  What are my payment options?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    We support Credit Card & Paypal payments.
                  </p>
                </div>
              </details>
            </li>

            <li>
              <details class="collapse collapse-arrow">
                <summary
                  class="collapse-title text-white font-semibold text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Can I cancel at any time?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
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
                  class="collapse-title text-white font-semibold text-[1rem] sm:text-xl flex items-center justify-between w-full text-left py-5"
                >
                  Why is Stocknear so much cheaper than other platforms?
                </summary>
                <div class="collapse-content">
                  <p
                    class="text-sm sm:text-[1rem] pb-5 text-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
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

<style lang="scss">
  @import url(https://fonts.googleapis.com/css?family=Lato:700);
  @import url(https://fonts.googleapis.com/css?family=Lato:700);

  .box {
    position: relative;
    width: 100%;
  }
  /* common */
  .ribbon {
    width: 100px; /* Adjusted width for mobile */
    height: 100px; /* Adjusted height for mobile */
    overflow: hidden;
    position: absolute;
  }
  .ribbon::before,
  .ribbon::after {
    position: absolute;
    z-index: -1;
    content: "";
    display: block;
    border: 3px solid #e1341e; /* Reduced border thickness for mobile */
  }
  .ribbon span {
    position: absolute;
    display: block;
    width: 150px; /* Adjusted width for mobile */
    padding: 10px 0; /* Reduced padding for mobile */
    background-color: #e1341e;
    box: 0 3px 6px rgba(0, 0, 0, 0.6); /* Reduced box for mobile */
    color: #fff;
    font:
      700 10px/1 "Lato",
      sans-serif; /* Reduced font size for mobile */
    text-transform: normalcase;
    text-align: center;
  }

  /* top right*/
  .ribbon-top-right {
    top: -5px; /* Adjusted positioning for mobile */
    right: -5px; /* Adjusted positioning for mobile */
  }
  .ribbon-top-right::before,
  .ribbon-top-right::after {
    border-top-color: transparent;
    border-right-color: transparent;
  }
  .ribbon-top-right::before {
    top: 0;
    left: 0;
  }
  .ribbon-top-right::after {
    bottom: 0;
    right: 0;
  }
  .ribbon-top-right span {
    left: -15px; /* Adjusted positioning for mobile */
    top: 20px; /* Adjusted positioning for mobile */
    transform: rotate(45deg);
    font-size: 0.97rem;
  }
</style>
