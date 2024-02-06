import { createSignal, type Component, For } from "solid-js";

type SearchType = "semantic" | "hybrid" | "fulltext";

const App: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [resultChunks, setResultChunks] = createSignal<any>();
  const [totalPages, setTotalPages] = createSignal(0);
  const [fetching, setFetching] = createSignal(false);
  // Really its just SearchType, but I'm not sure how to get the type to work
  const [searchType, setSearchType] = createSignal<string | SearchType>(
    "hybrid"
  );

  const datasetId = import.meta.env.VITE_DATASET_ID;
  const apiKey = import.meta.env.VITE_API_KEY;

  const searchCompanies = () => {
    setFetching(true);
    void fetch("https://api.trieve.ai/api/chunk/search", {
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
        cross_encoder: false,
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
          ></input>
        </div>
      </section>
    </main>
  );
};

export default App;
