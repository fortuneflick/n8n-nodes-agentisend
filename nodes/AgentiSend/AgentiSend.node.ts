import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { emailDescription } from './resources/email';
import { contactDescription } from './resources/contact';
import { domainDescription } from './resources/domain';
import { withRefusals } from './shared/refusal';

export class AgentiSend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AgentiSend',
		name: 'agentiSend',
		icon: { light: 'file:../../icons/agentisend.svg', dark: 'file:../../icons/agentisend.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Send transactional email from your own verified domain, check a send before it goes out, and see why an email was not delivered',
		defaults: {
			name: 'AgentiSend',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'agentiSendApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.agentisend.com',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			ignoreHttpStatusErrors: true,
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Domain',
						value: 'domain',
					},
					{
						name: 'Email',
						value: 'email',
					},
				],
				default: 'email',
			},
			...withRefusals([...emailDescription, ...contactDescription, ...domainDescription]),
		],
	};
}
