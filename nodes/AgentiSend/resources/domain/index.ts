import type { INodeProperties } from 'n8n-workflow';
import { cursorPagination } from '../../shared/pagination';

const showOnlyForDomain = { resource: ['domain'] };

export const domainDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForDomain },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get domain',
				description: 'Get one sending domain with its verification status and DNS records',
				routing: { request: { method: 'GET', url: '=/domains/{{$parameter.domainId}}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many domains',
				description: 'List your sending domains',
				routing: {
					request: { method: 'GET', url: '/domains' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Domain ID',
		name: 'domainId',
		type: 'string',
		default: '',
		required: true,
		description: 'The domain’s ID',
		displayOptions: { show: { resource: ['domain'], operation: ['get'] } },
	},
	...cursorPagination({ resource: ['domain'], operation: ['getAll'] }),
];
