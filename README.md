# Trieve YC Company Directory Demo

This is a demonstration of Trieve's source available and self-hostable infrastructure for enterprise search teams on the YC company directory dataset. Trieve combines search language models with tools for human fine-tuning. Find our main repository at [github.com/devflowinc/trieve](https://github.com/devflowinc/trieve).

## Creating the dataset with all of the YC companies

### 1. scrape a list of yc-company links from the offical YC Company Directory Page

Navigate to [ycombinator.com/companies](https://ycombinator.com/companies) and paste the following [gist](https://gist.github.com/skeptrunedev/0e389b6532020f8512180b4f131ceb2b) into the console.

The result will be JSON containing URLs for all public YC companies.

### 2. paste the JSON array of YC companies from the js browser console script into `./bun-scraper/yc-company-links.json` 

The ingest process will use this list to create chunks which get sent to the Trieve API. 

### 3. Get a dataset_id and api key from [dashboard.trieve.ai](https://dashboard.trieve.ai) and add it to the ENV for the scraping process

Within the root directory of this repository, run `cat ./bun-scraper/example.env > ./bun-scraper/.env`. 

1. Navigate to [dashboard.trieve.ai](https://dashboard.trieve.ai) and sign in or make an account
2. On the first page you see, click **create dataset**
3. On the dataset creation page, copy your `dataset_id` and paste it into `./bun-scraper/.env` as the value for `DATASET_ID`
4. Click the button to create an API key
5. Create a Read+Write type API key, copy the value and paste it into `./bun-scraper/.env` as the value for `API_KEY`

### 4. Run the scraper and create your chunks!

1. Run `cd ./bun-scraper` in the root of this repository
2. If you have not already installed it, install [bun](https://bun.sh/) with `npm install -g bun` 
3. Run `bun install`
4. Run `bun index.ts`

## Running the frontend

### 1. Setup the root env file for the frontend

1. Run `cat .env.example > .env` in the root of this repository
2. Set `VITE_DATASET_ID` in the `.env` file to the ID of the dataset for which you added chunks in the dataset creation step
3. Set `VITE_API_KEY` in the `.env` file to a read only API key that you created on [dashboard.trieve.ai](https://dashboard.trieve.ai)

### 2. Build the frontend with your environment variables

Run `yarn build` in the root of this repository

### 3. Start the packaged frontend

Run `yarn serve` in the root of this repository

## Final Notes

You can also navigate to [chat.trieve.ai](https://chat.trieve.ai) or [search.trieve.ai](https://search.trieve.ai) to explore your dataset in both a RAG and search context. 

On [search.trieve.ai](https://search.trieve.ai) you can experiment with manually editing chunks' content and relevance weight to adjust and fine-tune search results. A common use-case is adding weight to top YC companies such that they rank higher in search.