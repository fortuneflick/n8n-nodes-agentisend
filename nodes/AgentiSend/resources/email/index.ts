import type { INodeProperties } from 'n8n-workflow';
import { emailSendFields } from './send';
import { emailIdField, emailGetManyFields } from './read';

const showOnlyForEmail = {
	resource: ['email'],
};

export const emailDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForEmail,
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				action: 'Cancel scheduled email',
				description: 'Cancel an email that is scheduled or still queued',
				routing: {
					request: {
						method: 'POST',
						url: '=/emails/{{$parameter.emailId}}/cancel',
					},
				},
			},
			{
				name: 'Explain',
				value: 'explain',
				action: 'Explain what happened to email',
				description:
					'What happened to an email, the evidence, and the exact steps that fix it when it was not delivered',
				routing: {
					request: {
						method: 'GET',
						url: '=/emails/{{$parameter.emailId}}/explain',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get email',
				description: 'Get one email with its status and last event',
				routing: {
					request: {
						method: 'GET',
						url: '=/emails/{{$parameter.emailId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many emails',
				description: 'List emails, newest first, with optional filters',
				routing: {
					request: {
						method: 'GET',
						url: '/emails',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Preflight',
				value: 'preflight',
				action: 'Check email without sending it',
				description:
					'Run every check a send runs (domain, suppression list, budget, content) and send nothing. Free.',
				routing: {
					request: {
						method: 'POST',
						url: '/emails/preflight',
					},
				},
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send email',
				description: 'Send an email from a verified domain',
				routing: {
					request: {
						method: 'POST',
						url: '/emails',
					},
				},
			},
		],
		default: 'send',
	},
	...emailSendFields,
	...emailIdField,
	...emailGetManyFields,
];
