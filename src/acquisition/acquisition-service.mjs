import { isIP } from 'node:net';
import { ProviderExecutionError } from '../providers/contracts.mjs';

function validatePublicUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new ProviderExecutionError('policy', 'Invalid fetch URL'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new ProviderExecutionError('policy', 'Fetch URL is not allowed');
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new ProviderExecutionError('policy', 'Private fetch target is not allowed');
  const ipVersion = isIP(host);
  if (ipVersion === 4 && (/^10\./.test(host) || /^127\./.test(host) || /^169\.254\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || /^0\./.test(host))) {
    throw new ProviderExecutionError('policy', 'Private fetch target is not allowed');
  }
  if (ipVersion === 6 && (host === '::1' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd'))) throw new ProviderExecutionError('policy', 'Private fetch target is not allowed');
  return url;
}

function boundedText(value, field, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ProviderExecutionError('malformed_response', `Invalid ${field}`);
  return value.trim();
}

export class AcquisitionService {
  constructor(router) {
    this.router = router;
  }

  async search({ query, language = 'en', region = 'OM', maxResults = 8 }) {
    boundedText(query, 'search query', 500);
    if (!['ar', 'en'].includes(language) || !/^[A-Z]{2}$/.test(region) || !Number.isInteger(maxResults) || maxResults < 1 || maxResults > 20) {
      throw new ProviderExecutionError('policy', 'Invalid search bounds');
    }
    const response = await this.router.execute('search', { task: 'targeted_source_search', schema_version: 1, input: { query, language, region, max_results: maxResults } });
    if (!Array.isArray(response.data.results) || response.data.results.length > maxResults) throw new ProviderExecutionError('malformed_response', 'Invalid search results');
    const results = response.data.results.map((result) => {
      const url = validatePublicUrl(result.url);
      return {
        url: url.href,
        title: boundedText(result.title, 'search title', 500),
        snippet: typeof result.snippet === 'string' ? result.snippet.slice(0, 2000) : '',
        language: ['ar', 'en'].includes(result.language) ? result.language : language,
        published_at: typeof result.published_at === 'string' ? result.published_at : null,
        snippet_is_evidence: false,
      };
    });
    return { results, usage: response.usage, run_id: response.run_id };
  }

  async fetchPage({ url, maxBytes = 250_000 }) {
    const target = validatePublicUrl(url);
    if (!Number.isInteger(maxBytes) || maxBytes < 1_000 || maxBytes > 1_000_000) throw new ProviderExecutionError('policy', 'Invalid fetch size');
    const response = await this.router.execute('fetch', { task: 'fetch_source_page', schema_version: 1, input: { url: target.href, max_bytes: maxBytes } });
    const finalUrl = validatePublicUrl(response.data.final_url ?? response.data.url);
    const body = boundedText(response.data.body, 'fetched body', maxBytes);
    const status = Number(response.data.status);
    if (!Number.isInteger(status) || status < 200 || status >= 300) throw new ProviderExecutionError('unavailable', 'Fetched source did not return success');
    return {
      requested_url: target.href,
      final_url: finalUrl.href,
      status,
      content_type: typeof response.data.content_type === 'string' ? response.data.content_type.slice(0, 200) : 'text/plain',
      body,
      retrieved_at: typeof response.data.retrieved_at === 'string' ? response.data.retrieved_at : null,
      body_is_evidence_candidate: true,
      usage: response.usage,
      run_id: response.run_id,
    };
  }
}

export { validatePublicUrl };
