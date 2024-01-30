## YC JOBS DEMO

```bash
npm install # or pnpm install or yarn install
python -m venv venv
. venv/bin/activate 
pip install -r requirements.txt

```

Running frontend
```bash
npm dev
```

### ENV file
```bash
cp .env.example .env
```

| Key             | Value                                  | Desc                                  |
| ----------------| ---------------------------------------|---------------------------------------|
| VITE_DATASET_ID | "************************************" | id provided when you create a dataset |
| VITE_API_KEY    | "tr-********************************"  | read/write api key                    |

### Ingestion

First run `scraper.py` to populate the `exports/` folder
```bash
python scraper.py
```

Then run `uploader.py` to upload all data to your trieve Dataset
```bash
python scraper.py
```
