import {
  createSignal,
  type Component,
  For,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";

const regex = /^[WS]\d{2}$/;

const isBatchTag = (tag: string) => {
  return regex.test(tag);
};

type SearchType = "semantic" | "hybrid" | "fulltext";

const App: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [resultChunks, setResultChunks] = createSignal<any>();
  const [totalPages, setTotalPages] = createSignal(0);
  const [fetching, setFetching] = createSignal(false);
  // Really its just SearchType, but I'm not sure how to get the type to work
  const [searchType, setSearchType] = createSignal<string | SearchType>("hybrid");

  const apiUrl = import.meta.env.VITE_API_URL;
  const datasetId = import.meta.env.VITE_DATASET_ID;
  const apiKey = import.meta.env.VITE_API_KEY;

  const searchCompanies = () => {
    setFetching(true);
    void fetch(`${apiUrl}/chunk/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TR-Dataset": datasetId,
        Authorization: apiKey,
      },
      body: JSON.stringify({
        page: 0,
        query: searchQuery(),
        search_type: searchType(),
      }),
    }).then((response) => {
      if (response.ok) {
        void response.json().then((data) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const result = data.score_chunks;
          setResultChunks(result);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setTotalPages(data.total_chunk_pages);
          setFetching(false);
        });
      }
    });
  };

  // create a debounced version of the search function
  createEffect((prevTimeout) => {
    const curSearchQuery = searchQuery();
    if (!curSearchQuery) return;

    clearTimeout((prevTimeout ?? 0) as number);

    const timeout = setTimeout(searchCompanies, 300);

    onCleanup(() => clearTimeout(timeout));
  }, null);

  return (
    <main class="bg-[#F5F5EE] min-h-screen px-[13px]">
      <div class="sm:pr-[13px] border-b pt-6 lg:pt-9 pb-6 lg:pb-9">
        <div class="prose prose-sm sm:prose-base max-w-full flex flex-col space-y-5">
          <h1 class="text-3xl">Trieve Search for YC Startup Directory</h1>
          <p>
            <a
              href="https://github.com/devflowinc/trieve"
              class="text-[#268bd2] underline"
            >
              Trieve
            </a>{" "}
            offers a new way to build search. Compare to{" "}
            <a href="https://www.algolia.com/" class="text-[#268bd2] underline">
              Algolia
            </a>{" "}
            on the official Directory search at{" "}
            <a
              href="https://www.ycombinator.com/companies"
              class="text-[#268bd2] underline"
            >
              ycombinator.com/companies
            </a>
            .
          </p>
          <p>
            Since 2005, YC has invested in over 4,000 companies that have a
            combined valuation of over $600B.
          </p>
          <p>
            In this directory, you can search for YC companies by industry,
            region, company size, and more.
          </p>
          <p>
            To find jobs at these startups, visit{" "}
            <a
              href="https://ycombinator.com/jobs"
              class="text-[#268bd2] underline"
            >
              Work at a Startup
            </a>
            .
          </p>
        </div>
      </div>
      <section class="relative isolate z-0 sm:pr-[13px] border-b pt-6 lg:pt-9 pb-6 lg:pb-9">
        <div class="flex justify-end">
          <div class="flex space-x-2 items-center text-base">
            <label class="whitespace-nowrap">Sort by</label>
            <select
              id="location"
              name="location"
              class="bg-white block w-fit rounded-md py-2 pl-3 pr-6 border border-neutral-300 min-w-[150px]"
            >
              <option selected>Relevance</option>
              <option>Launch Date</option>
            </select>
          </div>
        </div>
        <div class="p-5 mb-6 border bg-[#FDFDF8] rounded-md w-full mt-2 border-neutral-300">
          <input
            class="border-neutral-300 bg-white p-[10px] border rounded-md w-full"
            placeholder="Search..."
            autofocus
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            value={searchQuery()}
          ></input>
        </div>
        <div class="mt-2 border border-neutral-300 rounded-md">
          <For each={resultChunks()}>
            {(chunk, idx) => {
              console.log(chunk);
              return (
                <div
                  classList={{
                    "p-5 flex space-x-4": true,
                    "border-t border-neutral-300": idx() > 0,
                  }}
                >
                  <img
                    alt="logo"
                    class="block w-20 h-20 object-contain rounded-full bg-gray-100"
                    src={chunk.metadata[0].metadata.company_logo_url}
                  />
                  <div class="flex flex-col space-y-1">
                    <div class="flex space-x-2 items-end">
                      <p class="text-lg font-bold">
                        {chunk.metadata[0].metadata.company_name}
                      </p>
                      <p class="font-extralight text-neutral-700 text-sm">
                        {chunk.metadata[0].metadata.company_location
                          ? chunk.metadata[0].metadata.company_location + ", "
                          : ""}
                        {chunk.metadata[0].metadata.company_country}
                      </p>
                    </div>
                    <p>{chunk.metadata[0].metadata.company_one_liner}</p>
                    <div class="flex space-x-2">
                      <For each={chunk.metadata[0].tag_set.split(",")}>
                        {(tag) => (
                          <>
                            <p class="px-[10px] py-1 bg-[#E6E6DD] text-xs rounded-md font-extralight flex space-x-1">
                              <Show when={isBatchTag(tag)}>
                                <svg
                                  aria-hidden="true"
                                  data-prefix="fab"
                                  data-icon="y-combinator"
                                  class="text-orange-500 w-4 h-4"
                                  role="img"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M448 32v448H0V32h448zM236 287.5L313.5 142h-32.7L235 233c-4.7 9.3-9 18.3-12.8 26.8L210 233l-45.2-91h-35l76.7 143.8v94.5H236v-92.8z"
                                  ></path>
                                </svg>
                              </Show>
                              <span>{tag}</span>
                            </p>
                          </>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </section>
    </main>
  );
};

export default App;
