import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class RowfeedApi implements ICredentialType {
	name = 'rowfeedApi';
	displayName = 'Rowfeed (Apify) API';
	icon = { light: 'file:../icons/rowfeed.svg', dark: 'file:../icons/rowfeed.dark.svg' } as const;
	documentationUrl = 'https://docs.apify.com/platform/integrations/api#api-token';
	properties: INodeProperties[] = [
		{
			displayName: 'Apify API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Apify API token (Apify Console > Settings > API & Integrations). Runs are billed to your own Apify account at each Actor\'s pay-per-event price.',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: { headers: { Authorization: '=Bearer {{$credentials.apiToken}}' } },
	};
	test: ICredentialTestRequest = { request: { baseURL: 'https://api.apify.com/v2', url: '/users/me', method: 'GET' } };
}
