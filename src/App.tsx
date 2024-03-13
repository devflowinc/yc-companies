/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  createSignal,
  type Component,
  For,
  createEffect,
  onCleanup,
  Show,
  createMemo,
} from "solid-js";
import { BsX } from "solid-icons/bs";
import { FiExternalLink, FiGithub } from "solid-icons/fi";
import { FaSolidDice } from "solid-icons/fa";
import { VsGlobe } from "solid-icons/vs";
import { SiCrunchbase } from "solid-icons/si";
import { FaBrandsLinkedin } from "solid-icons/fa";

interface SearchAbortController {
  abortController?: AbortController;
  timeout?: NodeJS.Timeout;
}

const regex = /^[WS]\d{2}$/;

const isBatchTag = (tag: string) => {
  return regex.test(tag);
};

const demoSearchQueries = [
  "open source EHR software",
  "issue detection for oil rigs",
  "military defense tech",
  "patient management CRM",
  "gene editing diagnostics",
  "RAG for contract search",
  "Semantic search API",
  "Browser based IDE",
];

const defaultSearchQuery = demoSearchQueries[0];

type SearchType = "semantic" | "hybrid" | "fulltext";

const App: Component = () => {
  const apiUrl = import.meta.env.VITE_API_URL as string;
  const datasetId = import.meta.env.VITE_DATASET_ID as string;
  const apiKey = import.meta.env.VITE_API_KEY as string;

  const urlParams = new URLSearchParams(window.location.search);

  const [searchQuery, setSearchQuery] = createSignal(
    urlParams.get("q") ?? defaultSearchQuery,
  );
  const [resultChunks, setResultChunks] = createSignal<any>();
  // eslint-disable-next-line solid/reactivity
  const [fetching, setFetching] = createSignal(true);
  const [searchType, setSearchType] = createSignal<SearchType>(
    (urlParams.get("search_type") as SearchType) ?? "hybrid",
  );
  const [starCount, setStarCount] = createSignal(275);
  const [sortBy, setSortBy] = createSignal(
    urlParams.get("sort_by") ?? "relevance",
  );
  const [currentPage, setCurrentPage] = createSignal(1);
  const [batchTag, setBatchTag] = createSignal(
    urlParams.get("batch_tag") ?? "all batches",
  );

  const searchCompanies = async (
    curSortBy: string,
    curPage: number,
    curBatchTag: string,
    abortController: AbortController,
  ) => {
    setFetching(true);
    const response = await fetch(`${apiUrl}/chunk/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TR-Dataset": datasetId,
        Authorization: apiKey,
      },
      body: JSON.stringify({
        page: curPage,
        query: searchQuery(),
        search_type: searchType(),
        filters:
          curBatchTag === "all batches"
            ? null
            : {
                must: [
                  {
                    field: "tag_set",
                    match:
                      curBatchTag === "all batches"
                        ? []
                        : [curBatchTag.toUpperCase()],
                  },
                ],
              },
        highlight_results: false,
        get_collisions: false,
      }),
      signal: abortController.signal,
    });

    const data = await response.json();
    const scoreChunks = data.score_chunks;
    if (curSortBy === "recency") {
      scoreChunks.sort(
        (a: any, b: any) =>
          parseInt(b.metadata[0].metadata.batch.slice(-2)) -
          parseInt(a.metadata[0].metadata.batch.slice(-2)),
      );
    }

    if (curPage > 1) {
      setResultChunks((prevChunks) => {
        // filter out duplicates
        const newChunks = scoreChunks.filter(
          (newChunk: any) =>
            !prevChunks.some(
              (prevChunk: any) =>
                prevChunk.metadata[0].metadata.company_name ===
                newChunk.metadata[0].metadata.company_name,
            ),
        );
        return prevChunks.concat(newChunks);
      });
    } else {
      setResultChunks(scoreChunks);
    }
    setFetching(false);
  };

  // create a debounced version of the search function
  createEffect(
    (prevController: SearchAbortController | undefined) => {
      const curSearchQuery = searchQuery();
      if (!curSearchQuery) return;

      urlParams.set("q", curSearchQuery);
      urlParams.set("search_type", searchType());
      urlParams.set("sort_by", sortBy());
      urlParams.set("batch_tag", batchTag());

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${urlParams.toString()}`,
      );

      clearTimeout(prevController?.timeout ?? 0);
      prevController?.abortController?.abort();

      const newController = new AbortController();

      const timeout = setTimeout(
        () =>
          void searchCompanies(
            sortBy(),
            currentPage(),
            batchTag(),
            newController,
          ),
        20,
      );

      onCleanup(() => clearTimeout(timeout));

      return { abortController: newController, timeout };
    },
    { abortController: undefined, timeout: undefined },
  );

  createEffect(() => {
    void fetch("https://api.github.com/repos/devflowinc/trieve").then(
      (response) => {
        if (response.ok) {
          void response.json().then((data) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            setStarCount(data.stargazers_count);
          });
        }
      },
    );
  });

  createEffect((previousSortType) => {
    const sortType = sortBy();
    if (previousSortType === sortType) return;

    const originalResultChunks = resultChunks();
    const newResultChunks = [...originalResultChunks];
    if (sortType === "recency") {
      newResultChunks.sort((a: any, b: any) => {
        return (
          parseInt(b.metadata[0].metadata.batch.slice(-2)) -
          parseInt(a.metadata[0].metadata.batch.slice(-2))
        );
      });
    } else {
      newResultChunks.sort(
        (a: any, b: any) => parseFloat(b.score) - parseFloat(a.score),
      );
    }

    setResultChunks(newResultChunks);

    return sortType;
  }, "relevance");

  createEffect((prevSearchQuery) => {
    const curSearchQuery = searchQuery();
    if (prevSearchQuery === curSearchQuery) return curSearchQuery;
    setCurrentPage(0);
  }, defaultSearchQuery);

  createEffect((prevBatchTag) => {
    const curBatchTag = batchTag();
    if (prevBatchTag === curBatchTag) return curBatchTag;
    setCurrentPage(0);
  }, "all batches");

  createEffect((prevSearchType) => {
    const curSearchType = searchType();
    if (prevSearchType === curSearchType) return curSearchType;
    setCurrentPage(0);
  }, "hybrid");

  // infinite scroll effect to check if the user has scrolled to the bottom of the page and increment the page number to fetch more results
  createEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1000 >
        document.documentElement.offsetHeight
      ) {
        console.log(
          window.innerHeight,
          window.innerHeight + document.documentElement.scrollTop,
          document.documentElement.offsetHeight,
        );
        if (fetching()) return;
        setFetching(true);

        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
  });

  const tryOnAlgoliaUrl = createMemo(() => {
    const query = encodeURIComponent(searchQuery());
    const ret = `https://www.ycombinator.com/companies?query=${query}`;
    return ret;
  });

  return (
    <main class="min-h-screen bg-[#F5F5EE] px-[13px]">
      <div class="border-b pb-6 pt-6 sm:pr-[13px] lg:pb-9 lg:pt-9">
        <div class="prose prose-sm sm:prose-base flex max-w-full flex-col space-y-5">
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
      <section class="relative isolate z-0 border-b pb-6 pt-6 sm:pr-[13px] lg:pb-9 lg:pt-9">
        <div class="flex flex-wrap justify-end gap-x-3 gap-y-2">
          <div class="flex items-center space-x-2 text-base">
            <label class="whitespace-nowrap">Search Type</label>
            <select
              id="location"
              name="location"
              class="block w-fit min-w-[130px] rounded-md border border-neutral-300 bg-white px-3 py-2"
              onChange={(e) =>
                setSearchType(e.currentTarget.value.toLowerCase() as SearchType)
              }
              value={searchType()}
            >
              <option selected value="hybrid">
                Hybrid
              </option>
              <option value="semantic">Semantic</option>
              <option value="fulltext">Fulltext</option>
            </select>
          </div>
          <div class="flex items-center space-x-2 text-base">
            <label class="whitespace-nowrap">Sort by</label>
            <select
              id="location"
              name="location"
              class="block w-fit min-w-[130px] rounded-md border border-neutral-300 bg-white px-3 py-2"
              onChange={(e) => setSortBy(e.currentTarget.value.toLowerCase())}
              value={sortBy()}
            >
              <option selected value="relevance">
                Relevance
              </option>
              <option value="recency">Recency</option>
            </select>
          </div>
          <div class="flex items-center space-x-2 text-base">
            <label class="whitespace-nowrap">Batch</label>
            <select
              id="location"
              name="location"
              class="block w-fit min-w-[130px] rounded-md border border-neutral-300 bg-white px-3 py-2"
              onChange={(e) => setBatchTag(e.currentTarget.value.toLowerCase())}
              value={batchTag()}
            >
              <option selected value="all batches">
                All Batches
              </option>
              <option value="w24">W24</option>
              <For each={Array.from({ length: 18 }, (_, i) => i + 1)}>
                {(i) => (
                  <>
                    <option value={`S${24 - i}`.toLowerCase()}>{`S${
                      24 - i
                    }`}</option>
                    <option value={`S${24 - i}`.toLowerCase()}>{`W${
                      24 - i
                    }`}</option>
                  </>
                )}
              </For>
              <option>S05</option>
            </select>
          </div>
        </div>
        <div class="mb-6 mt-2 w-full rounded-md border border-neutral-300 bg-[#FDFDF8] p-5">
          <input
            class="w-full rounded-md border border-neutral-300 bg-white p-[10px]"
            placeholder="Search..."
            autofocus
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            value={searchQuery()}
          />
          <div class="flex flex-wrap items-center gap-x-2">
            <Show when={searchQuery()}>
              <div class="mt-2 flex w-fit items-center space-x-2 rounded-full border px-3 py-1">
                <p class="text-sm">{searchQuery()}</p>
                <button
                  aria-label="clear search query"
                  onClick={() => setSearchQuery("")}
                >
                  <BsX class="h-3 w-3" />
                </button>
              </div>
            </Show>
            <Show when={searchQuery()}>
              <a
                class="mt-2 flex w-fit items-center space-x-2 rounded-full border px-3 py-1"
                href={tryOnAlgoliaUrl()}
                target="_blank"
                aria-label="try search with Algolia"
              >
                <p class="text-sm">Try With Algolia</p>
                <FiExternalLink
                  class="h-3 w-3"
                  onClick={() => setSearchQuery("")}
                />
              </a>
            </Show>
            <button
              class="mt-2 flex w-fit items-center space-x-2 rounded-full border px-3 py-1"
              onClick={() =>
                setSearchQuery((prevQuery) => {
                  let randomQuery = prevQuery;
                  while (randomQuery === prevQuery) {
                    randomQuery =
                      demoSearchQueries[
                        Math.floor(Math.random() * demoSearchQueries.length)
                      ];
                  }
                  return randomQuery;
                })
              }
            >
              <p class="text-sm">Random Search</p>
              <FaSolidDice class="h-3 w-3" />
            </button>
            <a
              class="mt-2 flex w-fit items-center space-x-2 rounded-full border px-3 py-1"
              href="https://github.com/devflowinc/trieve"
              target="_blank"
              aria-label="trieve github"
            >
              <p class="text-sm">Star Trieve | {starCount()}</p>
              <FiGithub class="h-3 w-3" onClick={() => setSearchQuery("")} />
            </a>
          </div>
        </div>
        <p
          classList={{
            "text-sm font-extralight text-[##4E4E4E]": true,
            "animate-pulse": fetching(),
          }}
        >
          Showing {fetching() ? "..." : resultChunks()?.length ?? 0} of 4611
          companies
        </p>
        <div
          classList={{
            "mt-2 overflow-hidden rounded-md": true,
            "border border-neutral-300": resultChunks()?.length ?? 0 > 0,
          }}
        >
          <For each={resultChunks()}>
            {(chunk, idx) => {
              return (
                <a
                  classList={{
                    "p-5 flex space-x-4 bg-[#FDFDF8] hover:bg-white": true,
                    "border-t border-neutral-300": idx() > 0,
                  }}
                  href={`https://www.ycombinator.com${chunk.metadata[0].link}`}
                  target="_blank"
                >
                  <img
                    class="block h-20 w-20 rounded-full bg-gray-100 object-contain"
                    src={
                      chunk.metadata[0].metadata.company_logo_url ||
                      "https://cdn.iconscout.com/icon/free/png-256/free-404-error-1-529717.png?f=webp"
                    }
                  />
                  <div class="flex flex-col space-y-1">
                    <div class="flex items-end space-x-2">
                      <p class="text-lg font-bold">
                        {chunk.metadata[0].metadata.company_name}
                      </p>
                      <p class="text-sm font-extralight text-neutral-700">
                        {chunk.metadata[0].metadata.company_location
                          ? chunk.metadata[0].metadata.company_location + ", "
                          : ""}
                        {chunk.metadata[0].metadata.company_country}
                      </p>
                    </div>
                    <p>{chunk.metadata[0].metadata.company_one_liner}</p>
                    <div class="flex flex-wrap gap-x-2 gap-y-1">
                      <For each={chunk.metadata[0].tag_set.split(",")}>
                        {(tag) =>
                          tag &&
                          tag !== "null" && (
                            <>
                              <p class="flex space-x-1 rounded-md bg-[#E6E6DD] px-[10px] py-1 text-xs font-extralight">
                                <Show when={isBatchTag(tag)}>
                                  <svg
                                    aria-hidden="true"
                                    data-prefix="fab"
                                    data-icon="y-combinator"
                                    class="h-4 w-4 text-orange-500"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M448 32v448H0V32h448zM236 287.5L313.5 142h-32.7L235 233c-4.7 9.3-9 18.3-12.8 26.8L210 233l-45.2-91h-35l76.7 143.8v94.5H236v-92.8z"
                                    />
                                  </svg>
                                </Show>
                                <span>{tag}</span>
                              </p>
                            </>
                          )
                        }
                      </For>
                    </div>
                    <div>
                      <div class="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                        <Show when={chunk.metadata[0].metadata.company_website}>
                          {(website) => (
                            <a href={website()} target="_blank">
                              <VsGlobe class="h-5 w-5 fill-current text-blue-500" />
                            </a>
                          )}
                        </Show>
                        <Show when={chunk.metadata[0].metadata.company_twitter}>
                          {(twitter) => (
                            <a href={twitter()} target="_blank">
                              <span class="icon-[mingcute--social-x-line] h-5 w-5" />
                            </a>
                          )}
                        </Show>
                        <Show
                          when={chunk.metadata[0].metadata.company_linkedin}
                        >
                          {(linkedin) => (
                            <a href={linkedin()} target="_blank">
                              <FaBrandsLinkedin class="h-5 w-5 fill-current text-[#0a66c2]" />
                            </a>
                          )}
                        </Show>
                        <Show
                          when={chunk.metadata[0].metadata.company_crunchbase}
                        >
                          {(crunchbase) => (
                            <a href={crunchbase()} target="_blank">
                              <SiCrunchbase class="h-5 w-5 fill-current text-[#146aff]" />
                            </a>
                          )}
                        </Show>
                      </div>
                    </div>
                  </div>
                </a>
              );
            }}
          </For>
        </div>
      </section>
    </main>
  );
};

export default App;
