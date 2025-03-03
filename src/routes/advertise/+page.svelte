<script>
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
  title="Advertise
    With Us"
  description="Advertise with Stocknear, the first fully open-source financial research platform for retail investors. Gain unparalleled visibility among traders, analysts, and investors worldwide with our high-engagement newsletter and dynamic investment tools."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Advertise</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5 text-white">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Advertise With Us
            </h1>
          </div>

          <div class="w-full bg-default m-auto">
            <div>
              <p class="text-white mb-3 text-lg">
                At Stocknear, we’re redefining financial research with the first
                fully open-source platform designed to help small retail
                investors. With our user-first approach, we ensure
                lightning-fast performance and an intuitive experience for every
                visitor.
              </p>

              <p class="text-white mb-3 text-lg">
                By advertising with us, your brand gains unparalleled visibility
                in a dynamic, innovative space where your message resonates
                deeply. Our diverse audience includes long-term investors,
                options traders, dividend investors, value investors, swing
                traders, and data-driven analysts. Stocknear’s versatility makes
                it a go-to platform for investors worldwide, catering to a broad
                range of financial strategies and interests. This global reach
                ensures your campaign connects with the right audience and
                maximizes its impact.
              </p>

              <p class="text-lg mb-2">
                <strong>Why advertise in our newsletter?</strong>
              </p>
              <ul class="list-disc pl-7 md:pl-5 text-lg">
                <li>
                  Reach a focused audience of over <strong
                    >+3000 active subscribers</strong
                  >.
                </li>
                <li>
                  Enjoy an impressive <strong>30% open rate</strong>, far above
                  industry averages.
                </li>
                <li>
                  Benefit from consistent visibility with newsletters sent <strong
                    >Monday to Friday</strong
                  > (holidays excluded).
                </li>
              </ul>

              <h2 class="font-bold text-xl mt-10">Let’s Collaborate!</h2>
              <p class="mt-3 text-lg">
                Ready to showcase your brand to a highly targeted and engaged
                audience?
                <br />Contact us today at
                <a
                  class="text-blue-400 sm:hover:underline sm:hover:underline-offset-4"
                  href="mailto:contact@stocknear.com">contact@stocknear.com</a
                >. We’d love to discuss how we can help your business grow.
              </p>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
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
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
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
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
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
