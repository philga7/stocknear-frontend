<script lang="ts">
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import Input from "$lib/components/Input.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
  export let form;
  let loading = false;

  const submitUpdatePassword = () => {
    loading = true;
    return async ({ result, update }) => {
      if (result.success) {
        toast.success("Password updated!", {
          style: "border-radius: 200px; background: #2A2E39; color: #fff;",
        });
      } else if (result.error || result.errors) {
        toast.error("Invalid credentials", {
          style:
            "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
        });
      }
      await update();
      loading = false;
    };
  };
</script>

<SEO title="Update Password" description="Update your account password" />

<section
  class="flex flex-col items-center min-h-screen w-full max-w-3xl m-auto"
>
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <form
            action="?/updatePassword"
            method="POST"
            use:enhance={submitUpdatePassword}
            class="flex flex-col space-y-2 w-full max-w-lg m-auto"
          >
            <h1
              class="mb-1 text-white text-2xl sm:text-3xl font-bold mb-6 text-center"
            >
              Reset Your Password
            </h1>

            <Input
              id="oldPassword"
              name="oldPassword"
              label="Old Password"
              type="password"
              required
              errors={form?.errors?.errorOldPassword}
            />
            <Input
              id="password"
              name="password"
              label="New Password"
              type="password"
              required
              errors={form?.errors?.errorPassword}
            />
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              label="Confirm New Password"
              type="password"
              required
              errors={form?.errors?.errorPasswordConfirm}
            />

            <div class="w-full max-w-lg pt-3">
              <button
                type="submit"
                class="py-2.5 cursor-pointer rounded bg-[#fff] text-black font-semibold sm:hover:bg-gray-300 w-full max-w-lg normal-case text-md"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  </div>
</section>
