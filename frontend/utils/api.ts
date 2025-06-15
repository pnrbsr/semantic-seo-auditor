// Placeholder for API helper functions
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(
    `${API_URL}/upload/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.pages;
}

export async function clusterPages(pages: any[]) {
  const response = await axios.post(`${API_URL}/cluster/`, pages);
  return response.data;
}

export async function getInternalLinks(pages: any[], maxLinksPerPage = 3, sameLanguageOnly = false) {
  const response = await axios.post(`${API_URL}/internal-links/`, pages, {
    params: {
      max_links_per_page: maxLinksPerPage,
      same_language_only: sameLanguageOnly,
    },
  });
  return response.data.suggested_links;
}

export async function checkLocalizationConsistency(originals: string[], translations: string[], threshold = 0.7) {
  const response = await axios.post(`${API_URL}/localization-check/`, {
    originals,
    translations,
    threshold,
  });
  return response.data;
}

export async function getAIReadiness(pages: any[]) {
  const response = await axios.post(`${API_URL}/ai-readiness/`, pages);
  return response.data.ai_readiness;
}

export async function fetchPages(urls: string[]) {
  const response = await axios.post(`${API_URL}/fetch-pages/`, urls);
  return response.data.pages;
}

export {};
