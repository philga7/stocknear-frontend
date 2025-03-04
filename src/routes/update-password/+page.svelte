<script ts="lang">
  import { pb } from "$lib/pocketbase";
  import { toast } from "svelte-sonner";

  import Input from "$lib/components/Input.svelte";
  import { updatePasswordSchema } from "$lib/schemas";
  import { goto } from "$app/navigation";
  import { z } from "zod";

  let zodErrors = [];
  export let data;

  let errorOldPassword = "";
  let errorPassword = "";
  let errorPasswordConfirm = "";
  let loading = false;
  async function updatePassword(event) {
    loading = true;
    event.preventDefault(); // prevent the default form submission behavior
    errorOldPassword = "";
    errorPassword = "";
    errorPasswordConfirm = "";

    const formData = new FormData(event.target); // create a FormData object from the form
    const postData = {};

    for (const [key, value] of formData.entries()) {
      postData[key] = value;
    }

    try {
      // Use Zod validation
      const cleanedData = updatePasswordSchema.parse(postData);
      await pb.collection("users").update(data?.user?.id, cleanedData);
      toast.success("Password updated!", {
        style: "border-radius: 200px; background: #2A2E39; color: #fff;",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        zodErrors = error.errors;

        errorOldPassword =
          zodErrors?.find((err) => err.path[0] === "oldPassword")?.message ??
          "";
        errorPassword =
          zodErrors?.find((err) => err.path[0] === "password")?.message ?? "";
        errorPasswordConfirm =
          zodErrors?.find((err) => err.path[0] === "passwordConfirm")
            ?.message ?? "";

        toast.error("Invalid credentials", {
          style:
            "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
        });
      } else {
        // Handle other errors
        console.error("Unexpected error during registration:", error);

        toast.error("An unexpected error occurred", {
          style:
            "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
        });
      }
    }
    loading = false;
  }
</script>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <form
            on:submit={updatePassword}
            class="flex flex-col space-y-2 w-full max-w-lg m-auto"
          >
            <h1
              class="mb-1 text-white text-2xl sm:text-3xl font-bold mb-6 text-center"
            >
              Set a new password
            </h1>

            <Input
              id="oldPassword"
              label="Old Password"
              type="password"
              required
              errors={errorOldPassword}
            />
            <Input
              id="password"
              label="New Password"
              type="password"
              required
              errors={errorPassword}
            />
            <Input
              id="passwordConfirm"
              label="Confirm New Password"
              type="password"
              required
              errors={errorPasswordConfirm}
            />

            <div class="w-full max-w-lg pt-3">
              <button
                type="submit"
                class="btn bg-[#fff] text-black font-semibold sm:hover:bg-gray-300 w-full max-w-lg normal-case text-md"
                >Update Password</button
              >
            </div>
          </form>
        </main>
      </div>
    </div>
  </div>
</section>
