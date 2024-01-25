import { createSignal, type Component, For } from 'solid-js';

const App: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [resultChunks, setResultChunks] = createSignal<any>();
  const [searchResults, setSearchResults] = createSignal([]);
  const [totalPages, setTotalPages] = createSignal(0);
  const [fetching, setFetching] = createSignal(false);

  const datasetId = import.meta.env.VITE_DATASET_ID;
  const apiKey = import.meta.env.VITE_API_KEY;

  const searchCompanies = () => {
    setFetching(true);
    void fetch("https://api.trieve.ai/api/chunk/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TR-Dataset": datasetId,
        "Authorization": apiKey,
      },
      body: JSON.stringify({
        page: 0,
        query: searchQuery(),
        search_type: "semantic",
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
  }

  return (
    <main class="bg-[#F5F5EE] flex h-screen px-20 pt-40 flex-col space-y-5">
      <p class="text-3xl"> Startup Directory Search </p>
      <div class="flex space-x-2">
        <input
          type="text"
          placeholder="Search"
          value={searchResults()}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchCompanies();
            }
          }}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <button onClick={searchCompanies}>Search</button>
      </div>

      <p>Results:</p>
      <For each={resultChunks()}>
        {(resultChunk) => (
          <div class="flex flex-col space-y-2">
            <For each={resultChunk.metadata}>
              {(metadata) => {
                let matchedOn = "";
                console.log(metadata);
                if (metadata.tracking_id.includes("founder")) {
                  matchedOn = "Company Founders";
                } else if (metadata.tracking_id.includes("description")) {
                  matchedOn = "Company Description";
                }

                return (
                  <a class="bg-[#fdfdf8] p-5 border-b border-[#ccc] text-lg flex items-center relative" href={metadata.link}>
                    <div class="relative flex w-full items-center justify-start">
                      <div class="flex w-20 shrink-0 grow-0 basis-20 items-center pr-4">
                        <img src={metadata.metadata.image_url} alt="" role="presentation" class="rounded-full bg-gray-100" />
                      </div>
                      <div class="flex flex-1 items-center justify-between">
                        <div class="lg:max-w-[90%]">
                          <div>
                            <span class="text-xl font-bold">{metadata.metadata.company}</span>
                            <span class="text-base font-thin"> Similatrity {resultChunk.score}</span>
                          </div>
                          <div class="flex">
                            <span class="text-base font-thin">{metadata.metadata.title}</span>
                          </div>
                        </div>
                      </div>
                      <div class="">
                        <p class="text-sm">Matched On: {matchedOn}</p>
                      </div>
                    </div>
                  </a>
                );
              }}
            </For>
          </div>
        )}
      </For>
    </main>
  );
};

export default App;
