import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

const API = 'https://api.apify.com/v2';

// One entry per Rowfeed Actor: the input field that takes the list, and whether it accepts location + language.
interface Op { name: string; actor: string; field: string; label: string; placeholder: string; geo: boolean; description: string }
export const OPS: Record<string, Op> = {
	keywordVolume: { name: 'Keyword Search Volume', actor: 'keyword-search-volume', field: 'keywords', label: 'Keywords', placeholder: 'running shoes\ntrail running shoes', geo: true, description: 'Google/Bing monthly search volume, CPC, competition and trend. Best for small lists ($0.04 per lookup + $0.003 per keyword).' },
	keywordVolumeBulk: { name: 'Keyword Search Volume (Bulk)', actor: 'keyword-search-volume-bulk', field: 'keywords', label: 'Keywords', placeholder: 'running shoes\ntrail running shoes', geo: true, description: 'Same data for big lists: $0.60 per batch of up to 1,000 keywords' },
	googleMaps: { name: 'Google Maps Leads', actor: 'google-maps-scraper', field: 'searches', label: 'Searches', placeholder: 'dentist in Austin, TX', geo: false, description: 'Businesses from Google Maps with phone, website, rating; optional e-mails' },
	websiteContacts: { name: 'Website Contacts (E-mails, Phones)', actor: 'website-contact-finder', field: 'websites', label: 'Websites', placeholder: 'example.com', geo: false, description: 'Company e-mails, phones, social profiles and contact forms from websites' },
	companyEnrichment: { name: 'Company Enrichment by Domain', actor: 'company-enrichment-by-domain', field: 'domains', label: 'Domains', placeholder: 'stripe.com', geo: false, description: 'Company profile from a domain: name, socials, tech stack, mail provider' },
	impressum: { name: 'Impressum / Company Data (DE, AT, CH)', actor: 'impressum-scraper', field: 'websites', label: 'Websites', placeholder: 'zalando.de', geo: false, description: 'Legal name, address, HRB number, VAT ID (VIES-checked), managing directors' },
	serp: { name: 'Google Search Results', actor: 'google-serp-api', field: 'queries', label: 'Queries', placeholder: 'best crm for small business', geo: true, description: 'Google organic results for any query and country' },
	backlinks: { name: 'Backlinks', actor: 'backlink-checker', field: 'targets', label: 'Domains or URLs', placeholder: 'example.com', geo: false, description: 'Backlinks with anchors and link strength' },
	domainAuthority: { name: 'Domain Authority (DA/PA)', actor: 'da-pa-checker', field: 'targets', label: 'Domains or URLs', placeholder: 'example.com', geo: false, description: 'Domain and page authority, spam score, referring domains' },
	websiteTraffic: { name: 'Website Traffic', actor: 'website-traffic-checker', field: 'domains', label: 'Domains', placeholder: 'example.com', geo: true, description: 'Estimated organic traffic, keywords and authority per domain' },
	siteAudit: { name: 'SEO Site Audit', actor: 'seo-site-audit', field: 'startUrls', label: 'Website URLs', placeholder: 'https://example.com', geo: false, description: 'Technical SEO issues per page' },
	googleReviews: { name: 'Google Maps Reviews', actor: 'google-maps-reviews-scraper', field: 'places', label: 'Places', placeholder: 'Eiffel Tower, Paris', geo: false, description: 'Reviews with text, stars, date and owner reply' },
	youtubeTranscript: { name: 'YouTube Transcript', actor: 'youtube-transcript-api', field: 'videos', label: 'Videos', placeholder: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', geo: false, description: 'Full transcript of YouTube videos' },
	competitorKeywords: { name: 'Competitor Keywords', actor: 'competitor-keywords', field: 'domains', label: 'Domains', placeholder: 'competitor.com', geo: true, description: 'The keywords a domain ranks for, with position and volume' },
};


const properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: "Backlinks",
				value: "backlinks",
				description: "Backlinks with anchors and link strength",
				action: "Backlinks",
			},
			{
				name: "Company Enrichment by Domain",
				value: "companyEnrichment",
				description: "Company profile from a domain: name, socials, tech stack, mail provider",
				action: "Company enrichment by domain",
			},
			{
				name: "Competitor Keywords",
				value: "competitorKeywords",
				description: "The keywords a domain ranks for, with position and volume",
				action: "Competitor keywords",
			},
			{
				name: "Domain Authority (DA/PA)",
				value: "domainAuthority",
				description: "Domain and page authority, spam score, referring domains",
				action: "Domain authority (DA/PA)",
			},
			{
				name: "Google Maps Leads",
				value: "googleMaps",
				description: "Businesses from Google Maps with phone, website, rating; optional e-mails",
				action: "Google maps leads",
			},
			{
				name: "Google Maps Reviews",
				value: "googleReviews",
				description: "Reviews with text, stars, date and owner reply",
				action: "Google maps reviews",
			},
			{
				name: "Google Search Results",
				value: "serp",
				description: "Google organic results for any query and country",
				action: "Google search results",
			},
			{
				name: "Impressum / Company Data (DE, AT, CH)",
				value: "impressum",
				description: "Legal name, address, HRB number, VAT ID (VIES-checked), managing directors",
				action: "Impressum / company data (DE, AT, CH)",
			},
			{
				name: "Keyword Search Volume",
				value: "keywordVolume",
				description: "Google/Bing monthly search volume, CPC, competition and trend. Best for small lists ($0.04 per lookup + $0.003 per keyword).",
				action: "Keyword search volume",
			},
			{
				name: "Keyword Search Volume (Bulk)",
				value: "keywordVolumeBulk",
				description: "Same data for big lists: $0.60 per batch of up to 1,000 keywords",
				action: 'Keyword search volume bulk',
			},
			{
				name: "Run Any Rowfeed Actor",
				value: "custom",
				description: "Any Actor from apify.com/rowfeed with your own JSON input",
				action: 'Run any rowfeed actor',
			},
			{
				name: "SEO Site Audit",
				value: "siteAudit",
				description: "Technical SEO issues per page",
				action: 'Seo site audit',
			},
			{
				name: 'Website Contacts (E-Mails, Phones)',
				value: "websiteContacts",
				description: "Company e-mails, phones, social profiles and contact forms from websites",
				action: 'Website contacts e mails phones',
			},
			{
				name: "Website Traffic",
				value: "websiteTraffic",
				description: "Estimated organic traffic, keywords and authority per domain",
				action: "Website traffic",
			},
			{
				name: "YouTube Transcript",
				value: "youtubeTranscript",
				description: "Full transcript of YouTube videos",
				action: 'You tube transcript',
			},
		],
		default: 'keywordVolume',
	},
	{
		displayName: 'Items',
		name: 'list',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		placeholder: 'One per line (or comma-separated)',
		description: 'The keywords, websites, domains, searches or URLs to look up, one per line',
		displayOptions: { hide: { operation: ['custom'] } },
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'string',
		default: 'United States',
		description: 'Country, region or city, e.g. Germany or London',
		displayOptions: { show: { operation: ["keywordVolume", "keywordVolumeBulk", "serp", "websiteTraffic", "competitorKeywords"] } },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'English',
		description: 'Language name, e.g. English or German',
		displayOptions: { show: { operation: ["keywordVolume", "keywordVolumeBulk", "serp", "websiteTraffic", "competitorKeywords"] } },
	},
	{
		displayName: 'Actor Name',
		name: 'actor',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'luma-events-scraper',
		description: 'The part after apify.com/rowfeed/',
		displayOptions: { show: { operation: ['custom'] } },
	},
	{
		displayName: 'Additional Input (JSON)',
		name: 'extraInput',
		type: 'json',
		default: '{}',
		description: 'More input fields of the Actor (see its Input tab on apify.com/rowfeed). Overrides the fields above.',
	},
	{
		displayName: 'Max Wait (Seconds)',
		name: 'maxWait',
		type: 'number',
		default: 600,
		description: 'How long to wait for the run to finish before giving up (the run keeps going in Apify)',
	},
];

function toList(v: unknown): string[] {
	const parts = Array.isArray(v) ? v.map(String) : String(v ?? '').split(/\r?\n|,/);
	return parts.map((p) => p.trim()).filter(Boolean);
}

export class Rowfeed implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rowfeed',
		name: 'rowfeed',
		icon: { light: 'file:../../icons/rowfeed.svg', dark: 'file:../../icons/rowfeed.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'SEO, keyword and lead data from Rowfeed Apify Actors: search volume, Google Maps leads, contacts, company data, SERP, backlinks',
		defaults: { name: 'Rowfeed' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'rowfeedApi', required: true }],
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const out: INodeExecutionData[] = [];
		const items = this.getInputData();
		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const op = OPS[operation];
				const actor = op ? op.actor : String(this.getNodeParameter('actor', i)).trim().replace(/^.*rowfeed[/~]/, '');
				if (!actor) throw new NodeOperationError(this.getNode(), 'Enter the Actor name, e.g. luma-events-scraper', { itemIndex: i });
				const input: IDataObject = {};
				if (op) {
					const list = toList(this.getNodeParameter('list', i));
					if (!list.length) throw new NodeOperationError(this.getNode(), `Add at least one entry to ${op.label}`, { itemIndex: i });
					input[op.field] = list;
					if (op.geo) {
						input.location = this.getNodeParameter('location', i) as string;
						input.language = this.getNodeParameter('language', i) as string;
					}
				}
				const raw = this.getNodeParameter('extraInput', i, '{}');
				let extra: IDataObject = {};
				try {
					extra = typeof raw === 'string' ? (raw.trim() ? JSON.parse(raw) : {}) : (raw as IDataObject);
				} catch {
					throw new NodeOperationError(this.getNode(), 'Additional Input is not valid JSON', { itemIndex: i });
				}
				Object.assign(input, extra);
				const maxWait = Math.max(30, Number(this.getNodeParameter('maxWait', i, 600)) || 600);

				const req = (method: 'GET' | 'POST', url: string, body?: IDataObject, qs?: IDataObject) =>
					this.helpers.httpRequestWithAuthentication.call(this, 'rowfeedApi', { method, url: API + url, body, qs, json: true });
				let run = ((await req('POST', `/acts/rowfeed~${actor}/runs`, input, { waitForFinish: Math.min(60, maxWait) })) as IDataObject).data as IDataObject;
				const started = Date.now();
				while (['READY', 'RUNNING'].includes(String(run.status)) && (Date.now() - started) / 1000 < maxWait) {
					run = ((await req('GET', `/actor-runs/${run.id}`, undefined, { waitForFinish: 60 })) as IDataObject).data as IDataObject;
				}
				if (['READY', 'RUNNING'].includes(String(run.status))) {
					throw new NodeOperationError(this.getNode(), `The run is still going after ${maxWait} s (run ${run.id} in your Apify account). Raise Max Wait or fetch its dataset later.`, { itemIndex: i });
				}
				const rows = (await req('GET', `/datasets/${run.defaultDatasetId}/items`, undefined, { clean: true, format: 'json' })) as IDataObject[];
				if (run.status !== 'SUCCEEDED' && !rows.length) {
					throw new NodeOperationError(this.getNode(), `Run ${run.status}: ${run.statusMessage ?? 'see the run in your Apify account'}`, { itemIndex: i });
				}
				for (const r of rows) out.push({ json: r, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}
		return [out];
	}
}
