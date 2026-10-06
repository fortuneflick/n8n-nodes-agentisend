import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AgentiSendApi implements ICredentialType {
	name = 'agentiSendApi';

	displayName = 'AgentiSend API';

	icon: Icon = { light: 'file:../icons/agentisend.svg', dark: 'file:../icons/agentisend.dark.svg' };

	documentationUrl = 'https://github.com/fortuneflick/n8n-nodes-agentisend#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'An API key from the AgentiSend console (API Keys page). It starts with as_. A sending-only key can send, preflight and read emails.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Preflight runs every check a send would run and sends nothing, stores
	// nothing and costs nothing. Any key that can send can call it, so it tests
	// a sending-only key as well as a full-access one.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.agentisend.com',
			url: '/emails/preflight',
			method: 'POST',
			body: {
				from: 'onboarding@agentisend.com',
				to: 'delivered@simulator.agentisend.com',
				subject: 'n8n credential check',
				text: 'n8n credential check',
			},
		},
	};
}
