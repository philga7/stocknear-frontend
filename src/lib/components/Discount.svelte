<script lang="ts">
  import { onMount } from "svelte";

  let targetDate = new Date("2025-04-25");

  let days = "-";
  let hours = "-";
  let minutes = "-";
  let seconds = "-";

  const updateTime = () => {
    // Get the current time in the Berlin timezone
    const berlinTimeZone = "Europe/Berlin";
    const berlinCurrentTime = new Date().toLocaleString("en-US", {
      timeZone: berlinTimeZone,
    });
    const currentTime = new Date(berlinCurrentTime);

    // Calculate the time difference between the current time and the target date
    const timeDiff = targetDate - currentTime;

    // Calculate the remaining days, hours, minutes, and seconds
    const totalSeconds = Math.floor(timeDiff / 1000);
    seconds = totalSeconds % 60;
    minutes = Math.floor((totalSeconds % 3600) / 60);
    hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    days = Math.floor(totalSeconds / (3600 * 24));
  };

  updateTime();

  onMount(() => {
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

<div class="lg:max-w-xl w-full rounded-none sm:rounded-md m-auto mb-10">
  <div class="container">
    <h2 class="text-2xl font-bold text-center text-pink-700 dark:text-pink-500">
      50% OFF Your Subscription!
    </h2>
  </div>
  <div class="container text-center">
    <p class=" font-bold text-xl">
      Use Promo Code: <span class="font-extrabold">EASTER25</span>
    </p>
    <div
      class="grid grid-flow-col gap-5 font-bold text-center m-auto auto-cols-max justify-center mt-6"
    >
      <div class="flex flex-col text-xs">
        <span class="countdown font-mono text-xl sm:text-2xl">
          <span style="--value:{days};"></span>
        </span>
        days
      </div>
      <div class="flex flex-col text-xs">
        <span class="countdown font-mono text-xl sm:text-2xl">
          <span style="--value:{hours};"></span>
        </span>
        hours
      </div>
      <div class="flex flex-col text-xs">
        <span class="countdown font-mono text-xl sm:text-2xl">
          <span style="--value:{minutes};"></span>
        </span>
        min
      </div>
      <div class="flex flex-col text-xs">
        <span class="countdown font-mono text-xl sm:text-2xl">
          <span style="--value:{seconds};"></span>
        </span>
        sec
      </div>
    </div>
  </div>
</div>
