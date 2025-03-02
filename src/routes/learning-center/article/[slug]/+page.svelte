<script>
  import { getImageURL } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";
  export let data;

  let article = data?.getArticle;

  $: {
    if (data?.getParams) {
      article = data?.getArticle;
    }
  }
</script>

<SEO
  title={article?.title}
  description={article?.abstract}
  image={getImageURL(article?.collectionId, article?.id, article?.cover)}
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-white"
>
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <main id="main" class="mt-2 w-full">
        {#if article?.cover}
          <img
            src={getImageURL(
              article?.collectionId,
              article?.id,
              article?.cover,
            )}
            class="h-[200px] w-full object-cover lg:h-[350px] rounded-lg border border-gray-800"
            loading="lazy"
            alt="Wallpaper"
          />
        {/if}
        <div class="lg:flex">
          <article
            class="z-5 relative mx-1 {article?.cover
              ? '-mt-10 lg:-mt-16'
              : 'mt-5'} rounded-t-md bg-default p-3 xs:p-4 lg:ml-3 lg:p-5 xl:mx-4"
          >
            <header
              class="pb-3 border-b-[2px] border-white w-full sm:min-w-[850px] sm:max-w-[850px]"
            >
              <h1
                class="mb-3 text-2xl sm:text-3xl font-bold text-white md:text-4xl"
              >
                {article?.title}
              </h1>
              <div class="text-white">
                <div>
                  Last Updated: {new Date(article?.updated)?.toLocaleString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      daySuffix: "2-digit",
                    },
                  )}
                </div>
              </div>
            </header>

            <div class="text-lg mt-4">
              <div class="content max-w-4xl">
                {@html article?.description}
              </div>
            </div>
          </article>
        </div>
      </main>
      <aside class="hidden lg:block relative fixed w-1/4">
        <div class="mt-5 lg:w-full">
          <div class="flex flex-wrap gap-y-5 justify-center px-5">
            {#if !data?.user}
              <div
                class="w-full text-white border border-gray-600 rounded-md h-fit bg-inherit lg:mx-0 lg:w-[300px] xl:w-[360px]"
              >
                <div class="space-y-6 p-6">
                  <h4 class="text-xl font-semibold sm:text-2xl sm:font-bold">
                    Stay informed in just 2 minutes
                  </h4>
                  <p class="text-base text-white lg:text-lg">
                    Get a daily email with the top market-moving news in bullet
                    point format, for Pro Members only.
                  </p>
                  <div>
                    <a
                      href="/register"
                      class=" btn bg-[#fff] border border-gray-600 sm:hover:bg-gray-300 transition duration-100 btn-md w-full rounded-md m-auto text-black font-semibold text-[1rem]"
                    >
                      <span class="text-[1rem]">Sign Up</span>
                    </a>
                  </div>
                </div>
              </div>
            {/if}
            <a
              href="/watchlist/stocks"
              class="w-full text-white border border-gray-600 rounded-md h-fit bg-inherit sm:hover:bg-secondary transition ease-out duration-100 lg:mx-0 lg:w-[300px] xl:w-[360px]"
            >
              <div class="space-y-3 p-6">
                <h4 class="text-xl font-semibold">Watchlist</h4>
                <p class="text-base text-white lg:text-lg">
                  Build your watchlist to keep track of their performance
                </p>
              </div>
            </a>
            <a
              href="/analysts/top-stocks"
              class="w-full text-white border border-gray-600 rounded-md h-fit bg-inherit sm:hover:bg-secondary transition ease-out duration-100 lg:mx-0 lg:w-[300px] xl:w-[360px]"
            >
              <div class="space-y-3 p-6">
                <h4 class="text-xl font-semibold">Top Stocks</h4>
                <p class="text-base text-white lg:text-lg">
                  Get the latest Top Wall Street Analyst Ratings
                </p>
              </div>
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>
