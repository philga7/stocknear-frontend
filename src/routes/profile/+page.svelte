<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import { toast } from "svelte-sonner";
  import { mode } from "mode-watcher";

  import { enhance } from "$app/forms";
  import { isPWAInstalled } from "$lib/utils";
  import {
    requestNotificationPermission,
    checkSubscriptionStatus,
    unsubscribe,
    subscribeUser,
  } from "$lib/notifications";
  import { onMount } from "svelte";
  import InfoModal from "$lib/components/InfoModal.svelte";

  export let data;
  export let form;

  let pwaInstalled;
  let loading = false;

  let nottifPermGranted: boolean | null = null;
  let isPushSubscribed = data?.getPushSubscriptionData !== null ? true : false;
  let notificationChannels = data?.getNotificationChannels;

  const modeStatus = Object?.entries(notificationChannels)
    .filter(([key, value]) => typeof value === "boolean") // Filter boolean properties
    .reduce((acc, [key, value]) => {
      acc[key] = value; // Add to mode object
      return acc;
    }, {});

  let subscriptionData = data?.getSubscriptionData;
  let isClicked = false;
  const emailAddress = "support@stocknear.com";

  const submitCancellation = () => {
    return async ({ result, update }) => {
      switch (result.type) {
        case "success":
          toast.success("Subscription Cancelled successfully!", {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          await update();
          break;
        case "redirect":
          toast.success("Subscription Cancelled successfully!", {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          await update();
          break;
        case "failure":
          toast.error("Something went wrong.", {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          await update();
          break;
        case "error":
          toast.error(result.error.message, {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          break;
        default:
          await update();
      }

      setTimeout(() => {
        if (result.type === "redirect") {
          const anchor = document.createElement("a");
          anchor.href = "/profile";
          anchor.dataset.sveltekitReload = true;
          document.body.appendChild(anchor);
          anchor.dispatchEvent(new MouseEvent("click"));
        }
      }, 1500);
    };
  };

  const submitReactivate = () => {
    return async ({ result, update }) => {
      switch (result.type) {
        case "success":
          toast.success("Subscription Reactivate successfully!", {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          await update();
          break;
        case "redirect":
          toast.success("Subscription Reactivate successfully!", {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          await update();
          break;
        case "failure":
          toast.error("Something went wrong.", {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          await update();
          break;
        case "error":
          toast.error(result.error.message, {
            style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
          });
          break;
        default:
          await update();
      }

      setTimeout(() => {
        if (result.type === "redirect") {
          const anchor = document.createElement("a");
          anchor.href = "/profile";
          anchor.dataset.sveltekitReload = true;
          document.body.appendChild(anchor);
          anchor.dispatchEvent(new MouseEvent("click"));
        }
      }, 1500);
    };
  };

  onMount(async () => {
    pwaInstalled = isPWAInstalled();
    nottifPermGranted = await requestNotificationPermission();
    if (nottifPermGranted) {
      isPushSubscribed =
        ((await checkSubscriptionStatus()) &&
          data?.getPushSubscriptionData !== null) ||
        false;
    }
  });

  async function handlePushUnsubscribe() {
    unsubscribe();
    isPushSubscribed = false;
    toast.success("Push notification deactivated successfully!", {
      style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
    });
  }

  async function handlePushSubscribe() {
    loading = true;
    const output = await subscribeUser();
    if (output?.success === true) {
      isPushSubscribed = true;
      toast.success("Push notification activated successfully!", {
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      });
    } else {
      toast.error("Your browser does not support push notifications...", {
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      });
    }
    loading = false;
  }

  async function updateNotificationChannels() {
    const postData = {
      id: notificationChannels?.id,
      ...modeStatus,
    };

    const response = await fetch("/api/update-notification-channels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
  }

  async function toggleMode(state) {
    modeStatus[state] = !modeStatus[state];
    await updateNotificationChannels();
  }
</script>

<SEO
  title="My Account - Stocknear | Manage Your Profile, Password, Subscriptions & Notifications"
  description="Easily manage your profile, change your password, update subscription plans, and customize notifications on Stocknear. Stay in control of your stock analysis and alerts."
/>

<section
  class="text-muted dark:text-white w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">My Account</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:mr-auto">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-2xl sm:text-3xl font-bold">My Account</h1>
          </div>

          <div
            class="rounded shadow-sm border border-gray-300 dark:border-gray-600 p-4 xs:p-4 xs:text-lg"
          >
            <h2 class=" text-2xl font-semibold mb-3">User Information</h2>
            <div class="mt-1">
              <strong>Email:</strong>
              {data?.user?.email}
            </div>
            <div class="mt-1 mb-1">
              <strong>Registered Date:</strong>
              {new Date(data?.user?.created ?? null)?.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <a
              href="/update-password"
              class="sm:hover:text-muted dark:sm:hover:text-white text-blue-700 dark:text-blue-400"
              >Update Password</a
            >
          </div>

          <div
            class="mt-6 rounded shadow-sm border border-gray-300 dark:border-gray-600 p-4 xs:p-4 xs:text-lg"
          >
            <h2 class=" text-2xl font-semibold mb-3">Notification</h2>
            Customize your notification alerts based on your preferences.

            <div class="flex flex-col items-start w-full mt-4 mb-4">
              <div class="flex w-full md:w-1/3 justify-between items-center">
                <div class="flex flex-row items-center">
                  <label
                    for="earningsSurpriseInfo"
                    class=" cursor-pointer flex flex-row items-center"
                  >
                    <h4>Earnings Surprise</h4>
                  </label>
                  <InfoModal
                    title={"Earnings Surprise"}
                    content={"Earnings Surprise occurs when a company’s reported earnings differ from analyst expectations, impacting stock prices based on positive or negative results."}
                    id={"earningsSurpriseInfo"}
                  />
                </div>
                <label class="inline-flex cursor-pointer relative">
                  <input
                    on:click={() => toggleMode("earningsSurprise")}
                    type="checkbox"
                    checked={modeStatus["earningsSurprise"]}
                    value={modeStatus["earningsSurprise"]}
                    class="sr-only peer"
                  />
                  <div
                    class="w-10 h-5 bg-gray-600 rounded-full peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[0.25rem] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C64F2]"
                  ></div>
                </label>
              </div>
              <div
                class=" mt-2 flex w-full md:w-1/3 justify-between items-center"
              >
                <div class="flex flex-row items-center">
                  <label
                    for="whyPriceMovedInfo"
                    class=" cursor-pointer flex flex-row items-center"
                  >
                    <h4>Why Price Moved</h4>
                  </label>
                  <InfoModal
                    title={"Why Price Moved"}
                    content={"Why Price Moved is a one-sentence explanation of why a stock is moving higher or down. By removing noise and collecting signals from news, press releases and SEC filings, we can pinpoint the trigger for price movements."}
                    id={"whyPriceMovedInfo"}
                  />
                </div>
                <label class="inline-flex cursor-pointer relative">
                  <input
                    on:click={() => toggleMode("wiim")}
                    type="checkbox"
                    checked={modeStatus["wiim"]}
                    value={modeStatus["wiim"]}
                    class="sr-only peer"
                  />
                  <div
                    class="w-10 h-5 bg-gray-600 rounded-full peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[0.25rem] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C64F2]"
                  ></div>
                </label>
              </div>
              <div
                class=" mt-2 flex w-full md:w-1/3 justify-between items-center"
              >
                <div class="flex flex-row items-center">
                  <label
                    for="topAnalystInfo"
                    class=" cursor-pointer flex flex-row items-center"
                  >
                    <h4>Top Analyst Rating</h4>
                  </label>
                  <InfoModal
                    title={"Top Analysts"}
                    content={" Filter for analysts rated 4+ stars focusing on their win rate and average return per rating. Analysts with 4+ stars typically exhibit both high accuracy and high return per rating."}
                    id={"topAnalystInfo"}
                  />
                </div>
                <label class="inline-flex cursor-pointer relative">
                  <input
                    on:click={() => toggleMode("topAnalyst")}
                    type="checkbox"
                    checked={modeStatus["topAnalyst"]}
                    value={modeStatus["topAnalyst"]}
                    class="sr-only peer"
                  />
                  <div
                    class="w-10 h-5 bg-gray-600 rounded-full peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[0.25rem] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C64F2]"
                  ></div>
                </label>
              </div>
            </div>

            <h3 class=" text-xl font-semibold mb-2 mt-4">Push Notification</h3>
            {#if pwaInstalled}
              <div class="mt-3">
                {#if nottifPermGranted === null}
                  <p>Checking permissions...</p>
                {:else if nottifPermGranted === true}
                  {#if isPushSubscribed}
                    <p class="mb-3">Push notifications are currently active.</p>
                    <div class="mt-3">
                      <button
                        class="shadow-sm border border-gray-300 dark:border-gray-600 w-fit px-5 py-1.5 bg-white text-black text-sm font-semibold rounded sm:hover:bg-white/80 transition ease-out duration-100"
                        type="button"
                        on:click={handlePushUnsubscribe}
                        >Disable notifications</button
                      >
                    </div>
                  {:else}
                    <p class="mb-3">
                      Stay up-to-date with real-time price alerts, the latest
                      stock news, and earnings calls delivered straight to your
                      device.
                    </p>
                    {#if !loading}
                      <button
                        class="shadow-sm border border-gray-300 dark:border-gray-600 w-fit px-5 py-1.5 bg-white text-black text-sm font-semibold rounded sm:hover:bg-white/80 transition ease-out duration-100"
                        type="button"
                        on:click={handlePushSubscribe}
                        >Enable notifications</button
                      >
                    {:else}
                      <button
                        class="cursor-not-allowed shadow-sm border border-gray-300 dark:border-gray-600 w-fit px-5 py-1.5 bg-white/60 text-black text-sm font-semibold rounded sm:hover:bg-white/80 transition ease-out duration-100"
                        ><div class="flex flex-row m-auto items-center">
                          <span class="loading loading-infinity"></span>
                          <span class=" ml-1.5">Activating...</span>
                        </div></button
                      >
                    {/if}
                  {/if}
                {:else if nottifPermGranted === false}
                  <p class="">
                    Review your settings and enable notifications to stay
                    updated with Stocknear alerts.
                  </p>
                {/if}
              </div>
            {:else}
              <div class="mt-2">
                <p class="mb-3">
                  You can activate the push notification only if you downloaded
                  the app.
                </p>
                <label
                  for="installModal"
                  class="cursor-pointer border border-gray-300 shadow-sshadow-sm m dark:border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-default sm:hover:bg-gray-200 dark:sm:hover:bg-primary text-sm sm:text-[1rem] px-4 py-2 rounded mt-5"
                >
                  Install the App
                </label>
              </div>
            {/if}
          </div>

          <div
            class="mt-6 rounded shadow-sm border border-gray-300 dark:border-gray-600 p-4 xs:p-4 xs:text-lg"
          >
            <h2 class=" text-2xl font-semibold mb-3">Manage Subscription</h2>
            <div class="flex flex-row items-center">
              <span class=" text-[1rem] sm:text-lg"> Status: </span>
              <div class="ml-2 flex flex-row items-center">
                <span class="relative flex h-2 w-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full {subscriptionData?.status_formatted ===
                      'Active' ||
                    subscriptionData?.status_formatted === 'Paid' ||
                    subscriptionData?.status_formatted === 'On Trial'
                      ? 'bg-[#00FC50]'
                      : 'bg-[#FF3131]'} opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-2 w-2 {subscriptionData?.status_formatted ===
                      'Active' ||
                    subscriptionData?.status_formatted === 'Paid' ||
                    subscriptionData?.status_formatted === 'On Trial' ||
                    data?.user?.freeTrial === true
                      ? 'bg-[#00FC50]'
                      : 'bg-[#FF3131]'}"
                  ></span>
                </span>

                <span class="ml-2 text-[1rem] dark:text-slate-200">
                  {#if data?.user?.freeTrial === true}
                    Active
                  {:else}
                    {subscriptionData?.status_formatted ??
                      "No Active Subscription"}
                  {/if}
                </span>
              </div>
            </div>
            {#if subscriptionData?.status_formatted === "Active"}
              <span class=" text-sm pr-5">
                Your subscription will automatically renew on {new Date(
                  subscriptionData?.renews_at,
                )?.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            {:else if subscriptionData?.status_formatted === "Cancelled"}
              <span class=" text-sm">
                Your subscription will remain active until {new Date(
                  subscriptionData?.ends_at,
                )?.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            {/if}
            <div class="flex flex-col justify-start items-start mt-4 mb-4">
              <span class=" mr-2 text-lg"> Current Plan: </span>
              <span class="text-[1rem]">
                {#if subscriptionData?.first_order_item?.product_name === "Pro Subscription (Life Time Access)"}
                  Lifetime Access
                {:else if data?.user?.freeTrial === true}
                  Pro Subscription (Free Trial)
                {:else}
                  {["Active", "Paid", "Cancelled"]?.includes(
                    subscriptionData?.status_formatted,
                  )
                    ? subscriptionData?.product_name
                    : "Free Subscription"}
                {/if}
              </span>
            </div>

            {#if subscriptionData?.status_formatted === "Active"}
              <div
                class="flex flex-col items-start sm:flex-row sm:items-center"
              >
                <label
                  for="cancelSubscriptionModal"
                  class="cursor-pointer border border-gray-300 shadow-sshadow-sm m dark:border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-default sm:hover:bg-gray-200 dark:sm:hover:bg-primary text-sm sm:text-[1rem] px-4 py-2 rounded mt-5"
                >
                  Cancel Subscription
                </label>
              </div>
            {:else if subscriptionData?.status_formatted === "Cancelled"}
              <label
                for="reactivateSubscriptionModal"
                class="cursor-pointer text-black bg-[#fff] sm:hover:bg-gray-300 text-sm sm:text-[1rem] px-4 py-2 rounded"
              >
                Reactivate Subscription
              </label>
            {:else if subscriptionData?.status_formatted === "Paid" && !subscriptionData?.first_order_item?.product_name === "Pro Subscription (Life Time Access)"}
              <span class=" mt-5">
                Please wait a moment; you will be updated to Pro in a second.
              </span>
            {:else if subscriptionData?.first_order_item?.product_name?.includes("Life Time")}{:else}
              <a
                href="/pricing"
                class="sm:hover:text-muted dark:sm:hover:text-white text-blue-700 dark:text-blue-400"
              >
                Get Full Access with Pro Subscription.
              </a>
            {/if}
          </div>

          <div
            class="mt-6 rounded shadow-sm border border-gray-300 dark:border-gray-600 p-4 xs:p-4 xs:text-lg"
          >
            <h2 class=" text-2xl font-semibold mb-3">Need help?</h2>
            <div class="mt-1">
              <strong>Here's how to get support:</strong>
            </div>
            <div class="mt-2 mb-1">
              <ul class="list-disc pl-5">
                <li>
                  Send an email to <a
                    href={`mailto:${emailAddress}`}
                    class="sm:hover:text-muted dark:sm:hover:text-white text-blue-700 dark:text-blue-400"
                    >{emailAddress}</a
                  >
                </li>
                <li>
                  Join our official Subreddit
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.reddit.com/r/stocknear/"
                    class="sm:hover:text-muted dark:sm:hover:text-white text-blue-700 dark:text-blue-400"
                  >
                    r/stocknear</a
                  >.
                </li>
                <li>
                  Join our official <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://discord.com/invite/hCwZMMZ2MT"
                    class="sm:hover:text-muted dark:sm:hover:text-white text-blue-700 dark:text-blue-400"
                    >Discord Channel</a
                  >.
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>

<!-- Start Cancel Subscription Modal -->
<input type="checkbox" id="cancelSubscriptionModal" class="modal-toggle" />

<dialog id="cancelSubscriptionModal" class="modal modal-bottom sm:modal-middle">
  <label
    for="cancelSubscriptionModal"
    class="cursor-pointer modal-backdrop bg-[#000]/40"
  ></label>

  <!-- Desktop modal content -->
  <form
    method="POST"
    action="?/cancelSubscription"
    use:enhance={submitCancellation}
    class="modal-box w-full bg-secondary shadow-sm border border-gray-300 dark:border-gray-600 flex flex-col items-center"
  >
    <div class="mx-auto mb-8 h-1.5 w-20 shrink-0 rounded-full bg-gray-500" />
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">Are you sure?</h3>
      <span class=" text-[1rem] font-normal">
        You will no longer be charged for this subscription, and at the end of
        the billing period, your account will transfer to the Free Plan.
      </span>
    </div>

    <button
      on:click={() => (isClicked = !isClicked)}
      class="{!isClicked
        ? ''
        : 'hidden'} cursor-pointer px-7 py-2 mb-5 rounded bg-white dark:sm:hover:bg-white/80 ease-out duration-50 text-center text-black text-[1rem] font-normal"
    >
      Cancel Subscription
      <input
        class="hidden"
        name="subscriptionId"
        value={subscriptionData?.first_subscription_item?.subscription_id}
      />
    </button>
    {#if isClicked === true}
      <label
        class="cursor-pointer px-7 py-2 mb-5 rounded bg-white dark:sm:hover:bg-white/80 ease-out duration-50 text-center text-black text-[1rem] font-normal"
      >
        <div class="flex flex-row m-auto">
          <span class="loading loading-infinity"></span>
          <span class="text-black ml-2">Proceeding</span>
        </div>
      </label>
    {/if}
  </form>
</dialog>
<!-- End Cancel Subscription Modal -->

<!-- Start Reactivate Subscription Modal -->
<input type="checkbox" id="reactivateSubscriptionModal" class="modal-toggle" />

<dialog
  id="reactivateSubscriptionModal"
  class="modal modal-bottom sm:modal-middle"
>
  <label
    for="reactivateSubscriptionModal"
    class="cursor-pointer modal-backdrop bg-[#000]/40"
  ></label>

  <!-- Desktop modal content -->
  <form
    method="POST"
    action="?/reactivateSubscription"
    use:enhance={submitReactivate}
    class="modal-box w-full bg-secondary flex flex-col items-center"
  >
    <div class="mx-auto mb-8 h-1.5 w-20 shrink-0 rounded-full bg-gray-500" />
    <div class=" mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">Reactivate Subscription</h3>
      <span class=" text-[1rem] font-normal">
        Reactivate your Pro Subscription now to unlock unlimited features and
        gain the edge over the competition.
      </span>
    </div>

    <button
      on:click={() => (isClicked = !isClicked)}
      class="{!isClicked
        ? ''
        : 'hidden'} cursor-pointer px-7 py-2 mb-5 rounded bg-white sm:hover:bg-white/80 ease-out duration-50 text-center text-black text-[1rem] font-normal"
    >
      Proceed
      <input
        class="hidden"
        name="subscriptionId"
        value={subscriptionData?.first_subscription_item?.subscription_id}
      />
    </button>
    {#if isClicked === true}
      <label
        class="cursor-pointer px-7 py-2 mb-5 rounded bg-white sm:hover:bg-white/80 ease-out duration-50 text-center text-black text-[1rem] font-normal"
      >
        <div class="flex flex-row m-auto">
          <span class="loading loading-infinity"></span>
          <span class="text-black ml-2">Proceeding</span>
        </div>
      </label>
    {/if}
  </form>
</dialog>
<!-- End Reactivate Subscription Modal -->

<!-- Start Cancel Subscription Modal -->
<input type="checkbox" id="errorSubscriptionModal" class="modal-toggle" />

<dialog id="errorSubscriptionModal" class="modal modal-bottom sm:modal-middle">
  <label
    for="errorSubscriptionModal"
    class="cursor-pointer modal-backdrop bg-[#000]/40"
  ></label>

  <!-- Desktop modal content -->
  <div class="modal-box w-full bg-secondary flex flex-col items-center">
    <div class="mx-auto mb-8 h-1.5 w-20 shrink-0 rounded-full bg-gray-500" />
    <div class=" mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">Paypal not supported</h3>
      <span class=" text-[1rem] font-normal">
        Apologies, our payment provider currently only supports credit cards for
        changing plans from monthly to annual. We are working to expand this to
        other payment methods.
      </span>
    </div>

    <label
      for="errorSubscriptionModal"
      class="cursor-pointer px-7 py-2 mb-5 rounded-full bg-[#0DDE00] text-center text-black text-[1rem] font-normal"
    >
      OK
    </label>
  </div>
</dialog>
<!-- End Cancel Subscription Modal -->

<!--Start Create Watchlist Modal-->
<input type="checkbox" id="installModal" class="modal-toggle" />

<dialog id="installModal" class="modal overflow-hidden p-3 sm:p-0">
  <label for="installModal" class="cursor-pointer modal-backdrop"></label>

  <div
    class="modal-box rounded w-full bg-white dark:bg-secondary shadow-sm border border-gray-300 dark:border-gray-600"
  >
    <div class="flex flex-row items-center pt-5">
      <h4 class=" text-2xl font-bold text-center m-auto">Steps to install</h4>
      <label
        for="installModal"
        class="inline-block cursor-pointer absolute right-3 top-3 text-[1.3rem] sm:text-[1.8rem]"
      >
        <svg
          class="w-6 h-6 sm:w-8 sm:h-8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
          /></svg
        >
      </label>
    </div>

    <div class=" flex flex-col justify-center items-center text-xl h-full">
      <ul class="list-decimal list-inside text-left mt-5">
        <li class="mb-2">Tap on the Safari share button.</li>
        <li class="mb-2">Tap on "Add to Home Screen."</li>
        <li class="mb-4">Tap on "Add."</li>

        <p class="text-lg mb-4">
          Note that web apps on iOS can only be installed using Safari.
        </p>
      </ul>
    </div>

    <div class=" border-t border-gray-300 dark:border-gray-600 mt-2">
      <label
        for="installModal"
        class="mt-4 font-semibold text-xl m-auto flex justify-center cursor-pointer"
      >
        Close
      </label>
    </div>
  </div>
</dialog>
