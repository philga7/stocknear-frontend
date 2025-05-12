<script lang="ts">
  import * as Card from "$lib/components/shadcn/card/index.ts";
</script>

<Card.Root
  class=" overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar mb-4"
>
  <Card.Header class="flex flex-row items-center">
    <div class="flex flex-col items-start w-full">
      <div class="flex flex-row w-full items-center">
        <Card.Title
          ><a
            href="/pricing"
            class="text-xl sm:text-2xl text-muted dark:text-white font-semibold cursor-pointer sm:hover:underline sm:hover:underline-offset-4"
          >
            Stop Guessing, Start Knowing
            <svg
              class="h-5 w-5 inline-block"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="max-width:40px"
              aria-hidden="true"
              ><path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              ></path></svg
            ></a
          >
        </Card.Title>
      </div>
    </div>
  </Card.Header>
  <!-- make the content container relative, flex to center, with fixed height -->
  <Card.Content class="relative flex items-center justify-center h-48 px-6">
    <!-- background image on the right half -->
    <img
      src="/img/astronaut.png"
      alt="astronaut"
      loading="eager"
      class="absolute mask mask-circle -top-8 -right-5 h-full w-1/2 object-cover opacity-40"
    />

    <!-- overlay content, centered both ways -->
    <div class="relative z-10 max-w-md text-center space-y-4">
      <p class="">
        Stocknear Delivers Real-Time Market Intelligence — 10× More Insight,
        Right in Your Pocket.
      </p>
      <a
        href="/pricing"
        class="inline-flex items-center px-4 py-2 text-[1rem] border-none rounded-md btn btn-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out"
      >
        Unlock All Features
        <span
          class="ml-2 transform group-hover:translate-x-1 transition-transform duration-150 ease-in-out"
        >
          <!-- arrow icon -->
          <svg
            class="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g transform="rotate(90 12 12)">
              <g fill="none">
                <path
                  d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
                />
                <path
                  fill="currentColor"
                  d="M13.06 3.283a1.5 1.5 0 0 0-2.12 0L5.281 8.939a1.5 1.5 0 0 0 2.122 2.122L10.5 7.965V19.5a1.5 1.5 0 0 0 3 0V7.965l3.096 3.096a1.5 1.5 0 1 0 2.122-2.122L13.06 3.283Z"
                />
              </g>
            </g>
          </svg>
        </span>
      </a>
    </div>
  </Card.Content>
</Card.Root>
