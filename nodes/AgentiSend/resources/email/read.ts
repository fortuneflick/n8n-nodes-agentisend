import type { INodeProperties } from 'n8n-workflow';
import { cursorPagination } from '../../shared/pagination';

export const emailIdField: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'emailId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID that Send returned',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['get', 'cancel', 'explain'],
			},
		},
	},
];

const showOnlyForEmailGetMany = {
	resource: ['email'],
	operation: ['getAll'],
};

export const emailGetManyFields: INodeProperties[] = [
	...cursorPagination(showOnlyForEmailGetMany),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: showOnlyForEmailGetMany },
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				description: 'Only emails sent from this address',
				routing: { request: { qs: { from: '={{ $value }}' } } },
			},
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Text to match in the subject or an address',
				routing: { request: { qs: { q: '={{ $value }}' } } },
			},
			{
				displayName: 'Since',
				name: 'since',
				type: 'dateTime',
				default: '',
				description: 'Only emails created at or after this time',
				routing: { request: { qs: { since: '={{ $value }}' } } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				default: [],
				description: 'Only emails whose current status is one of these',
				options: [
					{ name: 'Bounced', value: 'bounced' },
					{ name: 'Canceled', value: 'canceled' },
					{ name: 'Clicked', value: 'clicked' },
					{ name: 'Complained', value: 'complained' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Delivery Delayed', value: 'delivery_delayed' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Opened', value: 'opened' },
					{ name: 'Queued', value: 'queued' },
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Suppressed', value: 'suppressed' },
				],
				routing: {
					request: { qs: { status: '={{ $value.join(",") }}' } },
				},
			},
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				default: '',
				placeholder: 'e.g. campaign:welcome',
				description: 'Only emails carrying this tag',
				routing: { request: { qs: { tag: '={{ $value }}' } } },
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
				description: 'Only emails sent to this address',
				routing: { request: { qs: { to: '={{ $value }}' } } },
			},
			{
				displayName: 'Until',
				name: 'until',
				type: 'dateTime',
				default: '',
				description: 'Only emails created before this time',
				routing: { request: { qs: { until: '={{ $value }}' } } },
			},
		],
	},
];
