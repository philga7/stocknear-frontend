<script>
  import logo from "$lib/images/feedback_logo.png";
  import SEO from "$lib/components/SEO.svelte";

  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  const emailAddress = "support@stocknear.com";
</script>

<SEO
  title="Contact Us"
  description="Need help, found a bug or you have a feature request. Please contact us to resolve any issues."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pt-5 pb-40 text-muted dark:text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Contact Us</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div
            class="w-full m-auto shadow-sm border border-gray-300 dark:border-gray-800 bg-gray-100 dark:sm:bg-primary sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <!-- Start Column -->
              <div>
                <div class="flex flex-row justify-center items-center sm:mt-5">
                  <h1 class="text-3xl sm:text-4xl text-center font-bold mb-5">
                    Sharing is Caring
                  </h1>
                </div>

                <span
                  class=" text-md text-center flex justify-center items-center"
                >
                  unless it's family
                </span>
              </div>
              <!-- End Column -->

              <!-- Start Column -->
              <div class="relative m-auto mb-5 sm:mb-0">
                <svg
                  class="w-40 -my-5"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="5" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    fill="#1E40AF"
                    d="M57.6,-58.7C72.7,-42.6,81.5,-21.3,82,0.5C82.5,22.3,74.7,44.6,59.7,60.1C44.6,75.6,22.3,84.3,0,84.3C-22.3,84.2,-44.6,75.5,-61.1,60.1C-77.6,44.6,-88.3,22.3,-87.6,0.7C-86.9,-20.8,-74.7,-41.6,-58.2,-57.7C-41.6,-73.8,-20.8,-85.2,0.2,-85.4C21.3,-85.6,42.6,-74.7,57.6,-58.7Z"
                    transform="translate(100 100)"
                    filter="url(#glow)"
                  />
                </svg>

                <div class="z-1 absolute top-3">
                  <img class="w-24 ml-9" src={logo} alt="logo" />
                </div>
              </div>
              <!-- End Column -->
            </div>
          </div>

          <div
            class="card w-full rounded-none sm:rounded-xl border-t border-gray-300 dark:border-gray-600 sm:border m-auto"
          >
            <div class="card-body">
              <h2 class="card-title text-2xl mb-5">Support</h2>
              <p class="">
                Please take a moment to share your thoughts on this website with
                us. We welcome any feedback you may have. If there's a feature
                you'd like to see implemented, please let us know and we'll work
                to make the website even better for you. Thank you for your time
                and input!
              </p>
              <p class=" mt-5">
                <!-- svelte-ignore a11y-missing-content -->
                You can contact us at
                <a
                  href={`mailto:${emailAddress}`}
                  class="text-blue-700 dark:text-blue-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:underline"
                  >{emailAddress}</a
                >
              </p>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/donation"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold ml-3">
                  Sponsor Us
                </h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class=" p-3 ml-3 mr-3">
                Learn more about why we're doing this here
              </span>
            </a>
          </div>

          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/about"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold ml-3">About Us</h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class=" p-3 ml-3 mr-3">
                Learn the mission of the company and the team
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
