<script lang="ts">
  import { getImageURL, convertToSlug } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  export let data;

  let allBlogPosts = data?.getAllBlogPost;
</script>

<SEO
  title="Learning Center"
  description="Learn and Understand the features and datasets of Stockner to better navigate the stock market."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Learning Center
            </h1>
          </div>

          <div class="w-full grid grid-cols-1 sm:grid-cols-3 gap-y-5 sm:gap-5">
            {#if allBlogPosts?.length !== 0}
              {#each allBlogPosts as item}
                <div
                  class="flex flex-col overflow-hidden rounded border border-gray-700"
                >
                  <div class="shrink-0">
                    <a
                      href={"/learning-center/article/" +
                        convertToSlug(item?.title)}
                      ><img
                        class="h-48 w-full object-cover"
                        src={getImageURL(
                          item?.collectionId,
                          item?.id,
                          item?.cover,
                        )}
                        alt="Stock Analysis Blog Post Wallpaper"
                        loading="lazy"
                      /></a
                    >
                  </div>
                  <div
                    class="flex flex-1 flex-col justify-between bg-table p-3 sm:p-6"
                  >
                    <div class="flex-1">
                      <a
                        href={"/learning-center/article/" +
                          convertToSlug(item?.title)}
                        class="block"
                        ><h2
                          class="text-lg sm:text-xl font-semibold text-white"
                        >
                          {item?.title}
                        </h2>
                        <p class="mt-3 text-sm text-white">
                          {item?.abstract.length > 250
                            ? item?.abstract?.slice(0, 250) + "..."
                            : item?.abstract}
                        </p></a
                      >
                    </div>
                    <div class="mt-3 flex items-center">
                      <div class="flex space-x-1 text-sm text-white">
                        <span class="font-semibold">Published:</span>
                        <time datetime={item?.created} class="ml-1">
                          {new Date(item?.created)?.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            daySuffix: "2-digit",
                          })}</time
                        >
                      </div>
                    </div>
                    <div class="flex flex-col text-white mt-3">
                      <div class="flex flex-wrap gap-x-2 gap-y-3">
                        {#each item?.tags as tags}
                          <label
                            class="px-2 text-sm py-1 text-black rounded bg-white ml-0"
                          >
                            {tags}
                          </label>
                        {/each}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {:else}
              <div class="w-full">
                <Infobox text="No blog posts found" />
              </div>
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
