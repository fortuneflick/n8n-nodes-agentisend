import type { INodeProperties } from 'n8n-workflow';

// Send and Preflight take the same body: Preflight answers what Send would do.
const showForSendAndPreflight = {
	resource: ['email'],
	operation: ['send', 'preflight'],
};

const toList = '={{ String($value).split(",").map((address) => address.trim()).filter((address) => address) }}';

export const emailSendFields: INodeProperties[] = [
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Acme <receipts@acme.com>',
		description:
			'Sender address on a domain you verified in AgentiSend. While a domain is pending, use onboarding@agentisend.com to send to your own sign-in address.',
		displayOptions: { show: showForSendAndPreflight },
		routing: {
			send: { type: 'body', property: 'from' },
		},
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. customer@example.com',
		description:
			'One address, or several separated by commas. To test without delivering anything, use delivered@simulator.agentisend.com.',
		displayOptions: { show: showForSendAndPreflight },
		routing: {
			send: { type: 'body', property: 'to', value: toList },
		},
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		description: 'Subject line. Leave empty only when a template supplies one.',
		displayOptions: { show: showForSendAndPreflight },
		routing: {
			send: { type: 'body', property: 'subject', value: '={{ $value || undefined }}' },
		},
	},
	{
		displayName: 'HTML',
		name: 'html',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '',
		description: 'HTML body. Provide HTML, text, or a template.',
		displayOptions: { show: showForSendAndPreflight },
		routing: {
			send: { type: 'body', property: 'html', value: '={{ $value || undefined }}' },
		},
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		description: 'Plain-text body. Sent alongside the HTML when both are set.',
		displayOptions: { show: showForSendAndPreflight },
		routing: {
			send: { type: 'body', property: 'text', value: '={{ $value || undefined }}' },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showForSendAndPreflight },
		options: [
			{
				displayName: 'BCC',
				name: 'bcc',
				type: 'string',
				default: '',
				description: 'Blind copy recipients, separated by commas',
				routing: {
					send: { type: 'body', property: 'bcc', value: toList },
				},
			},
			{
				displayName: 'CC',
				name: 'cc',
				type: 'string',
				default: '',
				description: 'Copy recipients, separated by commas',
				routing: {
					send: { type: 'body', property: 'cc', value: toList },
				},
			},
			{
				displayName: 'Headers (JSON)',
				name: 'headers',
				type: 'json',
				default: '{}',
				description: 'Extra email headers as a JSON object, for example {"X-Entity-Ref-ID": "123"}',
				routing: {
					send: {
						type: 'body',
						property: 'headers',
						value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
					},
				},
			},
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description:
					'A unique value for this send, such as an order ID. If n8n retries the step, the same key and body return the first result instead of sending twice.',
				routing: {
					request: {
						headers: { 'Idempotency-Key': '={{$value}}' },
					},
				},
			},
			{
				displayName: 'Reply To',
				name: 'reply_to',
				type: 'string',
				default: '',
				description: 'Reply-To addresses, separated by commas',
				routing: {
					send: { type: 'body', property: 'reply_to', value: toList },
				},
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduled_at',
				type: 'string',
				default: '',
				placeholder: 'e.g. in 1 hour',
				description:
					'When to send: an ISO 8601 time or a short phrase such as "tomorrow 9am". At most 30 days ahead.',
				routing: {
					send: { type: 'body', property: 'scheduled_at' },
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'fixedCollection',
				placeholder: 'Add Tag',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Name and value pairs stored on the email and sent back on every webhook event',
				options: [
					{
						displayName: 'Tag',
						name: 'tag',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						value: '={{ ($value.tag || []).map((tag) => ({ name: tag.name, value: tag.value })) }}',
					},
				},
			},
			{
				displayName: 'Template ID',
				name: 'template_id',
				type: 'string',
				default: '',
				description: 'A published AgentiSend template to render instead of HTML or text',
				routing: {
					send: { type: 'body', property: 'template_id' },
				},
			},
			{
				displayName: 'Template Values (JSON)',
				name: 'template_values',
				type: 'json',
				default: '{}',
				description: 'Values for the template placeholders, for example {"name": "Ada"}',
				routing: {
					send: {
						type: 'body',
						property: 'template_values',
						value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
					},
				},
			},
			{
				displayName: 'Time Zone',
				name: 'timezone',
				type: 'string',
				default: '',
				placeholder: 'e.g. Europe/London',
				description: 'Time zone for a Scheduled At phrase such as "tomorrow 9am"',
				routing: {
					send: { type: 'body', property: 'timezone' },
				},
			},
			{
				displayName: 'Topic ID',
				name: 'topic_id',
				type: 'string',
				default: '',
				description: 'Subscription topic. Recipients who opted out of it are not sent this email.',
				routing: {
					send: { type: 'body', property: 'topic_id' },
				},
			},
		],
	},
];
