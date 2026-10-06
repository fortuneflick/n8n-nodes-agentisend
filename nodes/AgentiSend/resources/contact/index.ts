import type { INodeProperties } from 'n8n-workflow';
import { cursorPagination } from '../../shared/pagination';

const showOnlyForContact = { resource: ['contact'] };
const showForCreate = { resource: ['contact'], operation: ['create'] };
const showForUpdate = { resource: ['contact'], operation: ['update'] };
const showForGetMany = { resource: ['contact'], operation: ['getAll'] };

const jsonObject = '={{ typeof $value === "string" ? JSON.parse($value) : $value }}';

// Fields Create and Update share. Each one is only sent when it is set.
function contactFields(show: { resource: string[]; operation: string[] }): INodeProperties {
	return {
		displayName: show.operation[0] === 'create' ? 'Additional Fields' : 'Update Fields',
		name: show.operation[0] === 'create' ? 'additionalFields' : 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show },
		options: [
			...(show.operation[0] === 'update'
				? [
						{
							displayName: 'Email',
							name: 'email',
							type: 'string' as const,
							placeholder: 'e.g. name@email.com',
							default: '',
							description: 'New email address for the contact',
							routing: { send: { type: 'body' as const, property: 'email' } },
						},
					]
				: []),
			{
				displayName: 'Consent Source',
				name: 'consentSource',
				type: 'string',
				default: '',
				placeholder: 'e.g. signup form',
				description: 'Where and how this person agreed to hear from you. Stored and exported with the contact.',
				routing: {
					send: { type: 'body', property: 'consent', value: '={{ { source: $value } }}' },
				},
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'first_name' } },
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'last_name' } },
			},
			{
				displayName: 'Properties (JSON)',
				name: 'properties',
				type: 'json',
				default: '{}',
				description: 'Named values stored on the contact, for example {"plan": "pro"}',
				routing: { send: { type: 'body', property: 'properties', value: jsonObject } },
			},
			{
				displayName: 'Unsubscribed',
				name: 'unsubscribed',
				type: 'boolean',
				default: false,
				description: 'Whether to stop marketing email to this address',
				routing: { send: { type: 'body', property: 'unsubscribed' } },
			},
		],
	};
}

export const contactDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForContact },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create contact',
				description: 'Add a contact to your audience',
				routing: { request: { method: 'POST', url: '/contacts' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete contact',
				description: 'Delete a contact',
				routing: { request: { method: 'DELETE', url: '=/contacts/{{$parameter.contactId}}' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get contact',
				description: 'Get one contact',
				routing: { request: { method: 'GET', url: '=/contacts/{{$parameter.contactId}}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many contacts',
				description: 'List contacts',
				routing: {
					request: { method: 'GET', url: '/contacts' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update contact',
				description: 'Change a contact’s name, properties or subscription',
				routing: { request: { method: 'PATCH', url: '=/contacts/{{$parameter.contactId}}' } },
			},
		],
		default: 'create',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'e.g. name@email.com',
		default: '',
		required: true,
		displayOptions: { show: showForCreate },
		routing: { send: { type: 'body', property: 'email' } },
	},
	contactFields(showForCreate),
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		default: '',
		required: true,
		description: 'The contact’s ID',
		displayOptions: { show: { resource: ['contact'], operation: ['delete', 'get', 'update'] } },
	},
	contactFields(showForUpdate),
	...cursorPagination(showForGetMany),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: showForGetMany },
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'e.g. name@email.com',
				default: '',
				description: 'Only the contact with this address',
				routing: { send: { type: 'query', property: 'email' } },
			},
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Text to match in the address or name',
				routing: { send: { type: 'query', property: 'q' } },
			},
		],
	},
];
