<script lang="ts">
  let discordURL = import.meta.env.VITE_DISCORD_URL;
</script>

<!--Footer-->

<footer
  class="clear-both mt-auto bg-gray-800 dark:bg-default border-t border-gray-600"
>
  <div class="mx-auto max-w-7xl px-5 pt-12 sm:px-6 lg:px-8 lg:pb-8 lg:pt-16">
    <div class="xl:grid xl:grid-cols-2 xl:gap-8">
      <div class="grid grid-cols-2 gap-8 xl:col-span-2">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h4
              class="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400"
            >
              Sections
            </h4>
            <ul class="mt-4 space-y-4 text-gray-300 hover:text-white">
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/stocks/">Stocks</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/ipos/">IPOs</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/etf/">ETFs</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/blog/">Blog</a
                >
              </li>
            </ul>
          </div>
          <div class="mt-12 md:mt-0">
            <h4
              class="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400"
            >
              Services
            </h4>
            <ul class="mt-4 space-y-4">
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/pricing/">Pricing Plan</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/newsletter/">Free Newsletter</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/support/">Get Support</a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h4
              class="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400"
            >
              Website
            </h4>
            <ul class="mt-4 space-y-4">
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/login/">Login</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/faq/">FAQ</a
                >
              </li>

              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/sitemap/">Sitemap</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/learning-center/">Learning Center</a
                >
              </li>
            </ul>
          </div>
          <div class="mt-12 md:mt-0">
            <h4
              class="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400"
            >
              Company
            </h4>
            <ul class="mt-4 space-y-4">
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/about/">About</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/contact/">Contact Us</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/terms-of-use/">Terms of Use</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/privacy-policy/">Privacy Policy</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/data-disclaimer/">Data Disclaimer</a
                >
              </li>
              <li>
                <a
                  class="text-gray-300 hover:text-white dark:text-neutral-200 hover:dark:underline"
                  href="/affiliate-program/">Affiliate Program</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div
      class="mt-8 border-t border-gray-700 pt-8 dark:border-dark-700 md:flex md:items-center md:justify-between"
    >
      <div class="flex space-x-6 md:order-1">
        <a
          href="https://www.reddit.com/r/stocknear/"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="Join us on Reddit"
          class="text-gray-400 hover:text-gray-300 dark:text-dark-400 dark:hover:text-dark-300"
        >
          <svg
            class="pointer-events-none h-6 w-6 sm:h-8 sm:w-8"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          aria-label="Join us on Discord"
          class="text-gray-400 hover:text-gray-300 dark:text-dark-400 dark:hover:text-dark-300"
        >
          <svg
            class="pointer-events-none h-6 w-6 sm:h-8 sm:w-8"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
            /></svg
          >
        </a>

        <a
          href="https://twitter.com/intent/follow?screen_name=stocknear"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-400 hover:text-gray-300 dark:text-dark-400 dark:hover:text-dark-300"
          aria-label="Follow on X"
          ><svg
            class="pointer-events-none h-6 w-6 sm:h-8 sm:w-8"
            fill="currentColor"
            viewBox="0 0 24 24"
            style="max-width:40px"
            aria-hidden="true"
            ><path
              d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
            ></path></svg
          ></a
        >
      </div>
      <p class="my-8 text-gray-400 dark:text-dark-400 md:order-2 md:my-0">
        © 2025 Stocknear. All rights reserved.
      </p>
    </div>
  </div>
</footer>
