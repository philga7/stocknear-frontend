<script lang="ts">
  import { onMount } from "svelte";
  import Chat from "lucide-svelte/icons/message-circle";
  import Arrow from "lucide-svelte/icons/arrow-up";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { EditorState, Plugin } from "prosemirror-state";
  import { EditorView, Decoration, DecorationSet } from "prosemirror-view";
  import { keymap } from "prosemirror-keymap";
  import { agentOptions } from "$lib/utils";

  import { schema } from "prosemirror-schema-basic";

  import SEO from "$lib/components/SEO.svelte";

  export let data;
  export let form;

  let editorDiv;
  let editorView;
  let editorText = "";

  let suggestions = [];
  let showSuggestions = false;
  let suggestionPos = { top: 0, left: 0 };
  let selectedSuggestion = 0;
  let currentQuery = "";
  let isLoading = false;

  let defaultChats = [
    {
      chat: "@OptionsFlow summary of nvda options activity for today",
    },
    {
      chat: "@DarkPoolFlow summary of nvda dark pool activity for today",
    },
    { chat: "@RealtimeData Tell me everything about Tesla." },
    { chat: "@News What happened today for AMD?" },
    { chat: "How's the market flowing today?" },
    { chat: "How does Google make money?" },
  ];

  const editorHighlighter = new Plugin({
    props: {
      decorations(state) {
        const decorations = [];
        const regex = /\@([a-zA-Z0-9_]+)/g;

        state.doc.descendants((node, pos) => {
          if (!node.isText) return;

          const text = node.text;
          if (!text) return;

          let match;
          while ((match = regex.exec(text)) !== null) {
            const mention = match[1];
            if (agentOptions?.includes(mention)) {
              decorations?.push(
                Decoration?.inline(
                  pos + match.index,
                  pos + match.index + match[0]?.length,
                  {
                    class: "text-blue-800 dark:text-blue-400",
                  },
                ),
              );
            }
          }
        });

        return DecorationSet.create(state.doc, decorations);
      },
    },
  });

  function getCaretCoordinates(view) {
    const { from } = view.state.selection;
    const start = view.coordsAtPos(from);
    return start;
  }

  function checkAutocomplete(view) {
    const { from } = view.state.selection;
    const before = view.state.doc.textBetween(
      Math.max(0, from - 20),
      from,
      "\n",
      "\n",
    );
    const match = /\@([a-zA-Z0-9_]*)$/.exec(before);

    if (match) {
      currentQuery = match[1];
      suggestions = agentOptions?.filter((s) =>
        s.toLowerCase().startsWith(currentQuery.toLowerCase()),
      );

      const coords = getCaretCoordinates(view);
      suggestionPos = { top: coords.bottom + 4, left: coords.left };
      showSuggestions = suggestions.length > 0;
    } else {
      showSuggestions = false;
    }
  }

  const placeholderPlugin = new Plugin({
    props: {
      decorations(state) {
        // only show if empty
        if (state.doc.textContent.length > 0) return null;

        const widget = Decoration.widget(1, () => {
          const span = document.createElement("span");
          span.className =
            "text-gray-800 dark:text-gray-400 pointer-events-none";
          span.textContent = "Ask anything";
          return span;
        });

        return DecorationSet.create(state.doc, [widget]);
      },
    },
  });

  onMount(() => {
    editorView = new EditorView(editorDiv, {
      state: EditorState.create({
        schema,
        plugins: [
          editorHighlighter,
          placeholderPlugin,
          agentMentionDeletePlugin(agentOptions),
        ],
      }),
      attributes: {
        style: "outline: none !important; border: none !important;",
      },
      dispatchTransaction(transaction) {
        const newState = editorView.state.apply(transaction);
        editorView.updateState(newState);
        editorText = editorView?.state.doc?.textContent;
        checkAutocomplete(editorView);
      },
    });

    // Force remove outline after creation
    const proseMirrorEl = editorDiv.querySelector(".ProseMirror");
    if (proseMirrorEl) {
      proseMirrorEl.style.outline = "none";
      proseMirrorEl.style.border = "none";
      proseMirrorEl.style.boxShadow = "none";
    }

    // Autofocus the editor
    // Autofocus the editor with a small delay
    setTimeout(() => {
      editorView.focus();
    }, 100);

    editorText = editorView.state.doc.textContent;
  });

  function insertSuggestion(suggestion) {
    const { from } = editorView.state.selection;
    const before = editorView.state.doc.textBetween(
      Math.max(0, from - 20),
      from,
      "\n",
      "\n",
    );
    const match = /\@([a-zA-Z0-9_]*)$/.exec(before);

    if (match) {
      const start = from - match[0].length;

      // First, create transaction
      const tr = editorView.state.tr.insertText(`@${suggestion} `, start, from);

      // Then set selection on the new transaction
      const resolvedPos = tr.doc.resolve(start + suggestion.length + 2);
      const newSelection =
        editorView.state.selection.constructor.near(resolvedPos);
      tr.setSelection(newSelection);

      editorView.dispatch(tr);
      showSuggestions = false;
    }
  }

  function handleKeyDown(event) {
    if (showSuggestions) {
      if (event.key === "ArrowDown") {
        selectedSuggestion = (selectedSuggestion + 1) % suggestions.length;
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        selectedSuggestion =
          (selectedSuggestion - 1 + suggestions.length) % suggestions.length;
        event.preventDefault();
      } else if (event.key === "Enter") {
        insertSuggestion(suggestions[selectedSuggestion]);
        event.preventDefault();
      } else if (event.key === "Escape") {
        showSuggestions = false;
      }
    } else {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (data?.user) {
          createChat();
        } else {
          const closePopup = document.getElementById("userLogin");
          closePopup?.dispatchEvent(new MouseEvent("click"));
        }
      }
    }
  }

  async function createChat() {
    if (isLoading) {
      return;
    }

    isLoading = true;
    /*
    if (!["Pro", "Plus"].includes(data?.user?.tier)) {
      toast.error("Upgrade your account to unlock this feature", {
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      });
      isLoading = false;
      return;
    }
      */

    if (data?.user?.credits < 1) {
      toast.error(
        `Insufficient credits. Your current balance is ${data?.user?.credits}.`,
        {
          style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
        },
      );
      isLoading = false;
      return;
    }

    if (editorText?.trim()?.length > 0) {
      const response = await fetch("/api/create-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: editorText }),
      });

      const output = await response.json();
      goto(`/chat/${output.id}`);
    }
    isLoading = false;
  }

  function insertAgentOption(option) {
    const { from, to } = editorView.state.selection;
    const text = `@${option} `;

    const tr = editorView.state.tr.insertText(text, from, to);
    const resolvedPos = tr.doc.resolve(from + text.length);
    const newSelection =
      editorView.state.selection.constructor.near(resolvedPos);
    tr.setSelection(newSelection);

    editorView?.dispatch(tr);
    editorView?.focus();
  }

  function insertDefaultChat(option) {
    const emptyDoc = schema?.topNodeType?.createAndFill();
    const trBefore = editorView?.state?.tr?.replaceWith(
      0,
      editorView?.state?.doc?.content?.size,
      emptyDoc?.content,
    );
    editorView?.dispatch(trBefore);
    editorText = "";

    const { from, to } = editorView.state.selection;
    const text = `${option} `;

    const tr = editorView.state.tr.insertText(text, from, to);
    const resolvedPos = tr.doc.resolve(from + text.length);
    const newSelection =
      editorView.state.selection.constructor.near(resolvedPos);
    tr.setSelection(newSelection);

    editorView?.dispatch(tr);
    editorView?.focus();
  }
  function agentMentionDeletePlugin(agentOptions: string[]) {
    return keymap({
      Backspace: (state, dispatch, view) => {
        const { $cursor } = state.selection as any;

        if (!$cursor) return false;

        const { pos } = $cursor;
        const textBefore = state.doc.textBetween(
          Math.max(0, pos - 30),
          pos,
          "\n",
          "\n",
        );

        const regex = /\@([a-zA-Z0-9_]+)$/;
        const match = regex.exec(textBefore);

        if (match && agentOptions.includes(match[1])) {
          const start = pos - match[0].length;

          if (dispatch) {
            dispatch(state.tr.delete(start, pos));
          }
          return true;
        }

        return false;
      },

      // Optional: support Delete key too
      Delete: (state, dispatch, view) => {
        const { $cursor } = state.selection as any;
        if (!$cursor) return false;

        const { pos } = $cursor;
        const textAfter = state.doc.textBetween(
          pos,
          Math.min(pos + 30, state.doc.content.size),
          "\n",
          "\n",
        );

        const regex = /^\@([a-zA-Z0-9_]+)/;
        const match = regex.exec(textAfter);

        if (match && agentOptions.includes(match[1])) {
          const end = pos + match[0].length;

          if (dispatch) {
            dispatch(state.tr.delete(pos, end));
          }
          return true;
        }

        return false;
      },
    });
  }
</script>

<SEO
  title="Stocknear AI Agent – Real-Time Market Insights, Options Flow, and News"
  description="Get real-time stock market insights with Stocknear AI Agent. Analyze fundamentals, dark pool activity, options flow, and breaking market news – all in one place."
/>

<div
  class="w-full max-w-5xl overflow-hidden m-auto min-h-screen bg-white dark:bg-default mb-16"
>
  <div class="flex flex-col m-auto justify-center items-center">
    <div class="text-center mb-10 w-full px-4 sm:px-3">
      <main class="flex flex-1 flex-col gap-4 sm:p-4 md:gap-8 text-start">
        <div class="h-full w-full flex">
          <div
            class="w-full flex flex-col justify-center items-center gap-6 pb-4"
          >
            <img
              class="m-auto w-16 sm:w-20 rounded-full pt-4"
              src="/pwa-192x192.png"
              alt="Stocknear Logo"
              loading="lazy"
            />
            <h1
              class="block text-2xl lg:text-4xl font-bold text-center mb-10 relative w-fit flex justify-center m-auto break-words"
            >
              Research your Trading Ideas
            </h1>

            <div
              class="block p-3 w-full border border-gray-300 dark:border-gray-600 shadow-sm rounded-[8px] overflow-hidden"
            >
              <div
                bind:this={editorDiv}
                class="ml-2 bg-white dark:bg-default w-full min-h-[50px]"
                on:keydown={handleKeyDown}
              />

              <!-- Suggestions Dropdown -->
              {#if showSuggestions}
                <ul
                  class="absolute bg-white dark:bg-default rounded shadow-md border border-gray-300 dark:border-gray-600 mt-1 z-60 w-56 h-fit max-h-72 overflow-y-auto scroller"
                  style="top: {suggestionPos?.top}px; left: {suggestionPos?.left}px;"
                >
                  {#each suggestions as suggestion, i}
                    <li
                      class="px-2 py-1 cursor-pointer sm:hover:bg-gray-100 dark:sm:hover:bg-[#1E222D] text-sm {i ===
                      selectedSuggestion
                        ? ' bg-gray-100 dark:bg-[#1E222D]'
                        : ''}"
                      on:click={() => insertSuggestion(suggestion)}
                    >
                      {suggestion}
                    </li>
                  {/each}
                </ul>
              {/if}
              <form
                class="grow rounded relative flex items-center w-full overflow-hidden"
              >
                <div
                  class="relative min-h-12 h-auto overflow-y-hidden w-full outline-none"
                >
                  <div
                    class="absolute bottom-0 flex flex-row justify-end w-full bg:inherit dark:bg-default"
                  >
                    <div class="flex flex-row justify-between w-full">
                      <div
                        class="order-first relative inline-block text-left cursor-pointer shadow-xs"
                      >
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              class="w-full border-gray-300 font-semibold dark:font-normal dark:border-gray-600 border bg-white dark:bg-default sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2  rounded truncate"
                            >
                              <span class="truncate">@Agents</span>
                              <svg
                                class="-mr-1 ml-3 h-5 w-5 xs:ml-2 inline-block"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style="max-width:40px"
                                aria-hidden="true"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clip-rule="evenodd"
                                ></path>
                              </svg>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content
                            class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                          >
                            <DropdownMenu.Group>
                              {#each agentOptions as option}
                                <DropdownMenu.Item
                                  on:click={() => insertAgentOption(option)}
                                  class="cursor-pointer sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                                >
                                  {option}
                                </DropdownMenu.Item>
                              {/each}
                            </DropdownMenu.Group>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </div>
                      {#if data?.user}
                        <label
                          class="ml-auto mr-2 whitespace-nowrap w-auto text-xs border-gray-300 font-semibold dark:font-normal dark:border-gray-600 border bg-white dark:bg-default flex flex-row justify-between items-center px-3 rounded"
                        >
                          <div>
                            {data?.user?.credits?.toLocaleString("en-US")}
                            <span class="hidden sm:inline-block"
                              >AI Prompts</span
                            >
                          </div>
                        </label>
                      {/if}

                      <label
                        for={!data?.user ? "userLogin" : ""}
                        on:click={() => (data?.user ? createChat() : "")}
                        class="{editorText?.trim()?.length > 0
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-60'} py-2 text-white dark:text-black text-[1rem] rounded border border-gray-300 dark:border-gray-700 bg-black dark:bg-white px-3 transition-colors duration-200"
                      >
                        {#if isLoading}
                          <span
                            class="loading loading-spinner loading-xs text-center m-auto flex justify-center items-center text-white dark:text-black"
                          ></span>
                        {:else}
                          <Arrow
                            class="w-4 h-4 text-center m-auto flex justify-center items-center text-white dark:text-black"
                          />
                        {/if}
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div
              class="grid grid-cols-1 gap-2 shrink w-full overflow-y-auto sidenav-scrollbar"
            >
              {#each defaultChats as item}
                <div class="flex flex-col">
                  <div class="block flex-grow">
                    <button
                      type="button"
                      class="text-sm sm:text-[1rem] w-full h-full p-3 group font-sans focus:outline-none outline-none outline-transparent transition duration-50 ease-in-out items-center relative group cursor-pointer shadow border border-gray-300 dark:border-gray-700 rounded-[3px] sm:hover:bg-gray-100 dark:sm:hover:bg-gray-800"
                      on:click={() => insertDefaultChat(item?.chat)}
                    >
                      <div
                        class="flex leading-none items-center h-full flex-grow"
                      >
                        <div
                          class="px-2 py-2 text-left font-medium flex flex-row items-center justify-center box-border relative whitespace-normal break-words"
                        >
                          <Chat
                            class="w-4 h-4 inline-block mr-3 flex-shrink-0"
                          />
                          <span class="break-words">{item?.chat}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</div>

{#await import("$lib/components/LoginPopup.svelte") then { default: Comp }}
  <svelte:component this={Comp} {data} />
{/await}

<style>
  /* Base textarea styling */
  .textarea-base {
    background: transparent;
    position: relative;
    z-index: 1;
    color: currentColor;
    resize: none;
    white-space: pre-wrap;
  }

  :global(.ProseMirror) {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  :global(.ProseMirror:focus) {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  :global(.ProseMirror:focus-visible) {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Target the editor container div */
  .editor-container {
    outline: none !important;
  }

  .editor-container:focus {
    outline: none !important;
  }

  .editor-container:focus-within {
    outline: none !important;
  }

  /* Remove focus from any child elements */
  .editor-container * {
    outline: none !important;
  }

  .editor-container *:focus {
    outline: none !important;
  }
</style>
