/// <reference lib="dom" />

import { Window } from 'happy-dom';

const window = new Window();
const document = window.document;

const API_URL = Bun.env.API_URL;

export interface CreateChunkData {
  chunk_html: string;
  group_ids: string[];
  link: string;
  tag_set: string[];
  tracking_id: string;
  metadata: Object;
}

const createChunkGroup = async (name: string, description: string) => {
  const response = await fetch(`${API_URL}/chunk_group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': Bun.env.API_KEY ?? "",
      'TR-Dataset': Bun.env.DATASET_ID ?? "",
    },
    body: JSON.stringify({
      name,
      description,
    }),
  })

  const responseJson = await response.json();
  if (!response.ok) {
    console.error("error creating chunk_group", responseJson.message);
    return '';
  }
  console.log("success creating chunk_group", responseJson.id);

  const id = responseJson.id;
  return id;
}

const createChunk = async (chunkData: CreateChunkData) => {
  const response = await fetch(`${API_URL}/chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': Bun.env.API_KEY ?? "",
      'TR-Dataset': Bun.env.DATASET_ID ?? "",
    },
    body: JSON.stringify(chunkData),
  });
  if (!response.ok) {
    console.error("error creating chunk", response.status, response.statusText);
    const respText = await response.text();
    console.error("error creating chunk", respText);
    return '';
  }

  const responseJson = await response.json();
  if (!response.ok) {
    console.error("error creating chunk", responseJson.message);
    return '';
  }
  console.log("success creating chunk", responseJson.chunk_metadata.id);
  const chunkId = responseJson.chunk_metadata.id;

  return chunkId;
}

const processCompanyChunk = async (bulkDataCompany: any, groupIds: string[]) => {
  const group_id = await createChunkGroup(bulkDataCompany.name, bulkDataCompany.one_liner);

  const companyName = "<h1>" + bulkDataCompany.name + "</h1>";
  const companyOneLiner = "<h3>" + bulkDataCompany.one_liner + "</h3>";
  const companyLongDescription = "<p>" + bulkDataCompany.long_description + "</p>";
  const companyLocation = "<p>" + "Located in " + bulkDataCompany.location + ", " + bulkDataCompany.country + " and founded in " + bulkDataCompany.year_founded + "</p>";
  const chunk_html = "<div>" + companyName + companyOneLiner + companyLongDescription + companyLocation + "</div>";

  const link = bulkDataCompany.ycdc_company_url;

  const tag_set = bulkDataCompany.tags.join(',') + ',' + bulkDataCompany.batch_name;

  const tracking_id = bulkDataCompany.id.toString();

  const batch = bulkDataCompany.batch_name;
  const company_country = bulkDataCompany.country;
  const company_year_founded = bulkDataCompany.year_founded;
  const company_linkedin = bulkDataCompany.linkedin_url;
  const company_twitter = bulkDataCompany.twitter_url;
  const company_facebook = bulkDataCompany.facebook_url;
  const company_crunchbase = bulkDataCompany.crunchbase_url;
  const company_logo_url = bulkDataCompany.small_logo_url;
  const metadata = {
    companyName,
    companyOneLiner,
    companyLongDescription,
    companyLocation,
    batch,
    company_country,
    company_year_founded,
    company_linkedin,
    company_twitter,
    company_facebook,
    company_crunchbase,
    company_logo_url,
  };

  const chunkData: CreateChunkData = {
    chunk_html,
    group_ids: [group_id, ...groupIds],
    link,
    tag_set: tag_set.split(","),
    tracking_id,
    metadata,
  };

  await createChunk(chunkData);

  return group_id;
}

const processFounderChunk = async (bulkDataFounder: any, groupIds: string[]) => {
  const fullName = bulkDataFounder.full_name ? ("<h1>" + bulkDataFounder.full_name + "</h1>") : "";
  const founderTitle = bulkDataFounder.title ? "<h3>" + bulkDataFounder.title + "</h3>" : "";
  const founderBio = bulkDataFounder.founder_bio ? "<p>" + bulkDataFounder.founder_bio + "</p>" : "";
  const chunk_html = "<div>" + fullName + founderTitle + founderBio + "</div>";

  const link = bulkDataFounder.latest_yc_company.href;

  const tag_set = '';

  const tracking_id = bulkDataFounder.user_id.toString();

  const avatar_thumb_url = bulkDataFounder.avatar_thumb_url;
  const twitter_url = bulkDataFounder.twitter_url;
  const linkedin_url = bulkDataFounder.linkedin_url;
  const metadata = {
    fullName,
    founderTitle,
    founderBio,
    avatar_thumb_url,
    twitter_url,
    linkedin_url,
  };

  const chunkData: CreateChunkData = {
    chunk_html,
    group_ids: groupIds,
    link,
    tag_set: tag_set.split(","),
    tracking_id,
    metadata,
  };

  await createChunk(chunkData);
}

const processLink = async (companyUrl: string, groupIds: string[]) => {
  try {
    const pageRespHtml = await fetch(companyUrl);
    const pageRespText = await pageRespHtml.text();
    document.body.innerHTML = pageRespText;

    // get the first div that has a data-page attribute
    const divs = document.body.querySelectorAll('div');
    divs.forEach(async (div) => {
      const dataPage = div?.getAttribute('data-page');
      if (!dataPage) {
        return;
      }

      const bulkData = JSON.parse(dataPage).props as any;
      const companyData = bulkData.company;
      const companyGroupId = await processCompanyChunk(companyData, groupIds);

      const foundersData = companyData.founders;
      foundersData.forEach(async (founder: any) => {
        await processFounderChunk(founder, [companyGroupId, ...groupIds]);
      });
    });
  } catch (e) {
    console.error("error processing link", companyUrl, e);
    return;
  }
}

const companyGroupId = await createChunkGroup('YC Companies', 'Y Combinator companies');
const foundersGroupId = await createChunkGroup('YC Founders', 'Y Combinator founders');
const companyList = Bun.file("./yc-company-links.json");
const companyLinks = JSON.parse(await companyList.text());

for (const companyUrl of companyLinks) {
  await processLink(companyUrl, [companyGroupId, foundersGroupId]);
}

