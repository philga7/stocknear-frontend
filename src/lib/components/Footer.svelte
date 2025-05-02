<script lang="ts">
  let discordURL = import.meta.env.VITE_DISCORD_URL;
</script>

<!--Footer-->
<footer
  class="bg-[#1F2937] dark:bg-default border-t border-gray-600 z-20 sm:z-50 relative bottom-0 w-full sm:px-10 m-auto"
>
  <div class="container mx-auto px-5 sm:px-3">
    <div class="w-full flex flex-col md:flex-row py-3">
      <div class="flex-1 mb-8">
        <div class="flex flex-row items-center mt-4 gap-x-1.5">
          <a
            href="https://www.reddit.com/r/stocknear/"
            rel="noopener noreferrer"
            target="_blank"
            class="flex flex-row items-center"
          >
            <svg
              class="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286A.72.72 0 0 0 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0m4.388 3.199a1.999 1.999 0 1 1-1.947 2.46v.002a2.37 2.37 0 0 0-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363a2.802 2.802 0 1 1 2.908 4.753c-.088 3.256-3.637 5.876-7.997 5.876c-4.361 0-7.905-2.617-7.998-5.87a2.8 2.8 0 0 1 1.189-5.34c.645 0 1.239.218 1.712.585c1.275-.79 2.881-1.291 4.64-1.365v-.01a3.23 3.23 0 0 1 2.88-3.207a2 2 0 0 1 1.959-1.595m-8.085 8.376c-.784 0-1.459.78-1.506 1.797s.64 1.429 1.426 1.429s1.371-.369 1.418-1.385s-.553-1.841-1.338-1.841m7.406 0c-.786 0-1.385.824-1.338 1.841s.634 1.385 1.418 1.385c.785 0 1.473-.413 1.426-1.429c-.046-1.017-.721-1.797-1.506-1.797m-3.703 4.013c-.974 0-1.907.048-2.77.135a.222.222 0 0 0-.183.305a3.2 3.2 0 0 0 2.953 1.964a3.2 3.2 0 0 0 2.953-1.964a.222.222 0 0 0-.184-.305a28 28 0 0 0-2.769-.135"
              /></svg
            >
          </a>

          <a
            href={discordURL}
            rel="noopener noreferrer"
            target="_blank"
            class="flex flex-row items-center"
          >
            <svg
              class="w-6 h-6 ml-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path
                fill="white"
                d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
              /></svg
            >
          </a>

          <a
            href="https://twitter.com/intent/follow?screen_name=stocknear"
            rel="noopener noreferrer"
            target="_blank"
            class="flex flex-row items-center"
          >
            <svg
              class="w-5 h-5 ml-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path
                fill="white"
                d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231l5.45-6.231Zm-1.161 17.52h1.833L7.045 4.126H5.078L17.044 19.77Z"
              /></svg
            >
          </a>

          <a
            href="https://github.com/stocknear"
            rel="noopener noreferrer"
            target="_blank"
            class="flex flex-row items-center ml-3"
          >
            <svg
              class="w-6 h-6 ml-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path
                fill="white"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
              /></svg
            >
          </a>
        </div>
      </div>

      <div class="flex-1 mb-2 sm:mb-0">
        <p class="uppercase text-slate-100 md:mb-6">Sections</p>
        <ul class="list-reset mb-6">
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/stocks"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Stocks</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/etf"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >ETFs</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/blog"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Blog</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/learning-center"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Learning Center</a
            >
          </li>
        </ul>
      </div>

      <div class="flex-1 mb-2 sm:mb-0">
        <p class="uppercase text-slate-100 md:mb-6">Services</p>
        <ul class="list-reset mb-6">
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/pricing"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Pricing</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/discord-bot"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Discord Bot</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/newsletter"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Free Newsletter</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/faq"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >FAQ</a
            >
          </li>
        </ul>
      </div>

      <div class="flex-1 mb-2 sm:mb-0">
        <p class="uppercase text-slate-100 md:mb-6">Website</p>
        <ul class="list-reset mb-6">
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/login"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Login</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/sitemap"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
            >
              Sitemap
            </a>
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/advertise"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Advertise</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/data-disclaimer"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Data Disclaimer</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/affiliate-program"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Referral Program</a
            >
          </li>
        </ul>
      </div>

      <div class="flex-1 mb-2 sm:mb-0">
        <p class="uppercase text-slate-100 md:mb-6">Company</p>
        <ul class="list-reset mb-6">
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/about"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
            >
              About Us
            </a>
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/contact"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
            >
              Contact Us
            </a>
          </li>

          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/terms-of-use"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Terms of Use</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/privacy-policy"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Privacy Policy</a
            >
          </li>
          <li class="mt-2 inline-block mr-2 md:block md:mr-0">
            <a
              href="/imprint"
              class="no-underline sm:hover:underline text-gray-300 sm:hover:text-white dark:text-gray-100 dark:sm:hover:text-blue-400"
              >Imprint</a
            >
          </li>
        </ul>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="border-b border-gray-700 w-full"></div>
      <div
        class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-6 text-md text-gray-300 mb-5"
      >
        <span class="mb-2 sm:mb-0 inline-block"> Made in EU 🇪🇺</span>
        <span class="">Stocknear is 100% Open Source⚡ </span>
      </div>
    </div>
  </div>
</footer>
