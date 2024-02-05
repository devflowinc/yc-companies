/// <reference lib="dom" />

import { Window } from 'happy-dom';

const window = new Window();
const document = window.document;

export interface ChunkData {
  chunk_html: string;
  group_id: string;
  link: string;
  tag_set: string;
  tracking_id: string;
  metadata: Object;
}

const createChunkGroup = async (name: string, description: string) => {
  const response = await fetch('https://api.trieve.ai/chunk_group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '',
      'TR-Dataset': '',
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  const responseJson = await response.json();
  const id = responseJson.id;
  return id;
}

const companyGroupId = await createChunkGroup('YC Companies', 'Y Combinator companies');
const foundersGroupId = await createChunkGroup('YC Founders', 'Y Combinator founders');

const addChunkToGroup = (chunkId: string, groupId: string) => {
  fetch('https://api.trieve.ai/chunk_group/' + groupId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '',
      'TR-Dataset': '',
    },
    body: JSON.stringify({
      chunk_id: chunkId,
    }),
  });
}

const createChunk = async (chunkData: ChunkData) => {
  const response = await fetch('https://api.trieve.ai/chunk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '',
      'TR-Dataset': '',
    },
    body: JSON.stringify(chunkData),
  });
  const responseJson = await response.json();
  const chunkId = responseJson.chunk_metadata.id;

  return chunkId;
}

const processCompanyChunk = async (bulkDataCompany: any) => {
  const group_id = await createChunkGroup(bulkDataCompany.name, bulkDataCompany.one_liner);

  const companyName = "<h1>" + bulkDataCompany.name + "</h1>";
  const companyOneLiner = "<h3>" + bulkDataCompany.one_liner + "</h3>";
  const companyLongDescription = "<p>" + bulkDataCompany.long_description + "</p>";
  const companyLocation = "<p>" + "Located in " + bulkDataCompany.location + ", " + bulkDataCompany.country + " and founded in " + bulkDataCompany.year_founded + "</p>";
  const chunk_html = "<div>" + companyName + companyOneLiner + companyLongDescription + companyLocation + "</div>";

  const link = bulkDataCompany.ycdc_company_url;

  const tag_set = bulkDataCompany.tags.join(', ') + ", " + bulkDataCompany.batch_name;

  const tracking_id = bulkDataCompany.id;

  const batch = bulkDataCompany.batch_name;
  const company_country = bulkDataCompany.country;
  const company_year_founded = bulkDataCompany.year_founded;
  const company_linkedin = bulkDataCompany.linkedin_url;
  const company_twitter = bulkDataCompany.twitter_url;
  const company_facebook = bulkDataCompany.facebook_url;
  const company_crunchbase = bulkDataCompany.crunchbase_url;
  const company_logo_url = bulkDataCompany.small_logo_url;
  const metadata = {
    batch,
    company_country,
    company_year_founded,
    company_linkedin,
    company_twitter,
    company_facebook,
    company_crunchbase,
    company_logo_url,
  };

  const chunkData: ChunkData = {
    chunk_html,
    group_id,
    link,
    tag_set,
    tracking_id,
    metadata,
  };

  const chunkId = await createChunk(chunkData);
  addChunkToGroup(chunkId, companyGroupId);

  return group_id;
}

const processFounderChunk = async (bulkDataFounder: any, companyGroupId: string) => {
  const fullName = "<h1>" + bulkDataFounder.name + "</h1>";
  const founderTitle = "<h3>" + bulkDataFounder.title + "</h3>";
  const founderBio = "<p>" + bulkDataFounder.founder_bio + "</p>";
  const chunk_html = "<div>" + fullName + founderTitle + founderBio + "</div>";

  const link = bulkDataFounder.latest_yc_company.href;

  const tag_set = '';

  const tracking_id = bulkDataFounder.user_id;

  const avatar_thumb_url = bulkDataFounder.avatar_thumb_url;
  const twitter_url = bulkDataFounder.twitter_url;
  const linkedin_url = bulkDataFounder.linkedin_url;
  const metadata = {
    avatar_thumb_url,
    twitter_url,
    linkedin_url,
  };

  const chunkData: ChunkData = {
    chunk_html,
    group_id: companyGroupId,
    link,
    tag_set,
    tracking_id,
    metadata,
  };

  const chunkId = await createChunk(chunkData);
  addChunkToGroup(chunkId, foundersGroupId);
}



const processLink = async (companyUrl: string) => {
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
    const companyData = JSON.parse(bulkData).company;
    const companyGroupId = await processCompanyChunk(companyData);

    const foundersData = companyData.founders;
    await processFounderChunk(foundersData, companyGroupId);
  });

}

processLink('https://www.ycombinator.com/companies/ramen-vr');



