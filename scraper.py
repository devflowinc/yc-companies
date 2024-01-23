import bs4 as bs
import urllib.request
import time
import trieve_python_client as trieve
from trieve_python_client.api_client import ApiClient
from trieve_python_client.rest import ApiException
from trieve_python_client.configuration import Configuration

api_key = "tr-********************************"
dataset_id = "************************************"
api_client = ApiClient(Configuration(host="https://api.trieve.ai"))
api_client.default_headers = {
    "Authorization": api_key,
    "TR-Dataset": dataset_id,
}

class Company:
    def __init__(self, title, link, company, description, founders):
        self.title = title
        self.link = link
        self.company = company
        self.description = description
        self.founders = founders

    def send_to_trieve(self):
        # Create an instance of the API class
        api_instance = trieve.ChunkApi(api_client)

        data = trieve.CreateChunkData(chunk_html=self.description, metadata={"title": self.title}, link=self.link, tracking_id=self.link)
        try:
            # Create a Chunk
            api_response = api_instance.create_chunk(data)
        except ApiException as e:
            print("Exception when calling AuthApi->create_chunk: %s\n" % e)

    def __str__(self):
        return f"Title: {self.title}\nLink: {self.link}\nCompany: {self.company}\nDescription: {self.description}\nFounders: {self.founders}\n"


links = [
    "https://www.ycombinator.com/companies/powder",
    "https://www.ycombinator.com/companies/fume",
    "https://www.ycombinator.com/companies/nuanced-inc",
    "https://www.ycombinator.com/companies/pocketpod",
    "https://www.ycombinator.com/companies/aidy",
    "https://www.ycombinator.com/companies/shepherd-2",
    "https://www.ycombinator.com/companies/roe-ai",
    "https://www.ycombinator.com/companies/syncup-ai",
    "https://www.ycombinator.com/companies/circleback",
    "https://www.ycombinator.com/companies/forge",
    "https://www.ycombinator.com/companies/starlight-charging",
    "https://www.ycombinator.com/companies/hazel-2",
    "https://www.ycombinator.com/companies/retailready",
    "https://www.ycombinator.com/companies/elodin",
    "https://www.ycombinator.com/companies/fluently",
    "https://www.ycombinator.com/companies/dalmatian",
    "https://www.ycombinator.com/companies/octolane-ai",
    "https://www.ycombinator.com/companies/marblism",
    "https://www.ycombinator.com/companies/pointone",
    "https://www.ycombinator.com/companies/inspectmind-ai",
    "https://www.ycombinator.com/companies/lucite",
    "https://www.ycombinator.com/companies/speck",
    "https://www.ycombinator.com/companies/draftaid",
    "https://www.ycombinator.com/companies/just-words",
    "https://www.ycombinator.com/companies/lumina-2",
    "https://www.ycombinator.com/companies/openmart",
    "https://www.ycombinator.com/companies/inquery-2",
    "https://www.ycombinator.com/companies/danswer",
    "https://www.ycombinator.com/companies/reducto",
    "https://www.ycombinator.com/companies/cleva",
    "https://www.ycombinator.com/companies/trueclaim",
    "https://www.ycombinator.com/companies/phospho",
    "https://www.ycombinator.com/companies/senso",
    "https://www.ycombinator.com/companies/delve",
    "https://www.ycombinator.com/companies/yoneda-labs",
    "https://www.ycombinator.com/companies/tracecat",
    "https://www.ycombinator.com/companies/basepilot",
    "https://www.ycombinator.com/companies/terrakotta",
    "https://www.ycombinator.com/companies/hemingway",
    "https://www.ycombinator.com/companies/lumona",
    "https://www.ycombinator.com/companies/sevnai",
    "https://www.ycombinator.com/companies/million-js",
    "https://www.ycombinator.com/companies/silogy",
    "https://www.ycombinator.com/companies/konstructly",
    "https://www.ycombinator.com/companies/precip",
    "https://www.ycombinator.com/companies/assembly-2",
    "https://www.ycombinator.com/companies/apriora",
    "https://www.ycombinator.com/companies/abel",
    "https://www.ycombinator.com/companies/tamarind-bio",
    "https://www.ycombinator.com/companies/preloop",
    "https://www.ycombinator.com/companies/voicepanel",
    "https://www.ycombinator.com/companies/shiboleth",
    "https://www.ycombinator.com/companies/convey",
    "https://www.ycombinator.com/companies/toma",
    "https://www.ycombinator.com/companies/stacksync",
    "https://www.ycombinator.com/companies/paradigm",
    "https://www.ycombinator.com/companies/codemuse",
    "https://www.ycombinator.com/companies/magic-hour",
    "https://www.ycombinator.com/companies/promptarmor",
    "https://www.ycombinator.com/companies/celest",
    "https://www.ycombinator.com/companies/double-2",
    "https://www.ycombinator.com/companies/stackwise",
    "https://www.ycombinator.com/companies/stitch-technologies",
    "https://www.ycombinator.com/companies/rove",
    "https://www.ycombinator.com/companies/camelqa",
    "https://www.ycombinator.com/companies/superagent-sh",
    "https://www.ycombinator.com/companies/zaymo",
    "https://www.ycombinator.com/companies/opencopilot",
    "https://www.ycombinator.com/companies/recipe",
    "https://www.ycombinator.com/companies/drymerge",
    "https://www.ycombinator.com/companies/bilanc",
    "https://www.ycombinator.com/companies/carma",
    "https://www.ycombinator.com/companies/markprompt",
    "https://www.ycombinator.com/companies/codeant-ai",
    "https://www.ycombinator.com/companies/retell-ai",
    "https://www.ycombinator.com/companies/greenboard",
    "https://www.ycombinator.com/companies/topo-io",
    "https://www.ycombinator.com/companies/ubicloud",
    "https://www.ycombinator.com/companies/momentic",
    "https://www.ycombinator.com/companies/tusk",
    "https://www.ycombinator.com/companies/omniai",
    "https://www.ycombinator.com/companies/governgpt",
    "https://www.ycombinator.com/companies/collate",
    "https://www.ycombinator.com/companies/vectorview",
    "https://www.ycombinator.com/companies/upsolve-ai",
    "https://www.ycombinator.com/companies/salvy",
    "https://www.ycombinator.com/companies/ion-design",
    "https://www.ycombinator.com/companies/buster",
    "https://www.ycombinator.com/companies/artisan-ai",
    "https://www.ycombinator.com/companies/duckie",
    "https://www.ycombinator.com/companies/onboard-ai",
    "https://www.ycombinator.com/companies/leya",
    "https://www.ycombinator.com/companies/lantern-2",
    "https://www.ycombinator.com/companies/agenthub"
]

https://www.ycombinator.com/companies/roe-ai,
https://www.ycombinator.com/companies/starlight-charging,
https://www.ycombinator.com/companies/octolane-ai,
https://www.ycombinator.com/companies/just-words,

companies = []

for url in links:
    source = urllib.request.urlopen(url).read()
    soup = bs.BeautifulSoup(source,'html.parser')
    time.sleep(0.05)

    founders = list(map(lambda x:x.text, soup.find_all("div", {"class": "flex flex-row flex-col items-start gap-3 md:flex-row"})))

    try:
        company = {
            "title": soup.find("div", {"class": "text-xl"}).text,
            "link": url,
            "company": soup.find("h1", {"class": "font-extralight"}).text,
            "description": soup.find("p", {"class": "whitespace-pre-line"}).text,
            "founders": founders
        }

        companies.append(Company(**company))
    except AttributeError as e:
        print("Error with: " + url + " " + str(e))

for company in companies:
    company.send_to_trieve()
