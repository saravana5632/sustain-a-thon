export interface GroundedWebSource {
  uri: string;
  title: string;
}

export interface SearchGroundingResponse {
  summary: string;
  sources: GroundedWebSource[];
  searchQueries: string[];
  modelUsed: string;
  timestamp: string;
}

export async function fetchBuyerSearchGrounding(params: {
  companyName?: string;
  industry?: string;
  location?: string;
  customQuery?: string;
  contextType?: 'buyer-verification' | 'market-pulse';
}): Promise<SearchGroundingResponse> {
  const response = await fetch('/api/search-grounding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data?.error || 'Unable to complete Google Search Grounding request.'
    );
  }

  return data as SearchGroundingResponse;
}
