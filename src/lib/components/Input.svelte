<script lang="ts">
  //import { linkTitle } from '$lib/store';

  export let value = "";
  export let placeholder = "";
  export let id;
  export let label;
  export let type = "text";
  export let disabled = false;
  export let required = false;
  export let maxLength = 100;
  export let showCounter = false;
  export let hidden = false;
  export let errors;
  export let useTitle = false; // new prop

  let showVideo = false;

  let inputValue = value;

  //$: value = useTitle === false ? $linkTitle : '';

  let counterColor;

  $: {
    if (inputValue.length > maxLength) {
      counterColor = "text-error";
    } else {
      counterColor = "text-white";
    }
  }

  function handleInput(event) {
    inputValue = event.target.value;
    if (inputValue?.toLowerCase()?.includes(".mp4")) {
      showVideo = true;
    }
    /*
		if (useTitle) {
			// Check if the input value is a valid URL
			try {
			const urlObject = new URL(inputValue);
			const url = urlObject.href;
			getTitle(url);
			

			
			} catch (error) {
			// The URL is not valid, so don't do anything
			console.error(error);
			}
		}

		$: value = useTitle === false ? $linkTitle : '';
		*/
  }

  /*
	async function getTitle(url) {
		try {

		
		const response = await fetch('/api/create-post', {
			method: 'POST',
			body: JSON.stringify(url)
		});

		const output = await response.json();
		linkTitle.update( value => output);
		

		}
		catch(e)
		{
			console.log(e)
		}
	}
	*/

  $: {
    if (inputValue) {
      errors = null;
    }
  }
</script>

<div class="form-control w-full max-w-2xl mb-2 {hidden ? 'hidden' : ''}">
  <label for={id} class="label pb-1">
    <span class="text-white label-text">{label}</span>
  </label>
  <div class="relative">
    <input
      class="input input-bordered border border-gray-600 focus:outline-none w-full bg-secondary placeholder-gray-300 text-white whitespace-normal"
      {type}
      {placeholder}
      {required}
      {disabled}
      {id}
      name={id}
      value={inputValue}
      on:input={handleInput}
      autocomplete="off"
    />
  </div>

  {#if errors}
    <label for={id} class="label py-0 pt-1">
      <span class="label-text-alt text-error">
        {errors}
      </span>
    </label>
  {/if}
</div>
