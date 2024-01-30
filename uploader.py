import os
import json
from dotenv import load_dotenv
import glob
import trieve_python_client as trieve
from trieve_python_client.api_client import ApiClient
from trieve_python_client.rest import ApiException
from trieve_python_client.configuration import Configuration

def send_to_trieve(id, company):
    # Create an instance of the API class
    api_instance = trieve.ChunkApi(api_client)

    metadata = {
        "title": company["title"],
        "company": company["company"],
        "image_url": company["image_url"],
    }

    data = trieve.CreateChunkData(chunk_html=f"{company['title']}\n\n\n{company['description']}", metadata=metadata, link=company["link"], tracking_id=id)
    if company["description"] != "":
        try:
            # Create a Chunk
            api_response = api_instance.create_chunk(data)
        except ApiException as e:
            print("Exception when calling AuthApi->create_chunk: %s\n" % e)

if __name__ == "__main__":
    load_dotenv()
    api_key = os.getenv("VITE_API_KEY")
    dataset_id = os.getenv("VITE_DATASET_ID")
    print(api_key, dataset_id)
    api_client = ApiClient(Configuration(host="https://api.trieve.ai"))

    api_client.default_headers = {
        "Authorization": api_key,
        "TR-Dataset": dataset_id,
    }

    for filename in reversed(glob.glob('exports/*.json')):
        id = filename.split('/')[1].split('.')[0]
        with open(filename, 'r') as f:
            data = json.load(f)
            send_to_trieve(id, data)
