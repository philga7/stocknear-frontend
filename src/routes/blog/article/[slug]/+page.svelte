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
  image={article?.comver
    ? getImageURL(article?.collectionId, article?.id, article?.cover)
    : ""}
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
    </div>
  </div>
</section>
