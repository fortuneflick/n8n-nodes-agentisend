import { createHmac, timingSafeEqual } from 'crypto';
import {
	NodeApiError,
	NodeConnectionTypes,
	type JsonObject,
	type IDataObject,
	type IHookFunctions,
	type IHttpRequestMethods,
	type IHttpRequestOptions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

const BASE_URL = 'https://api.agentisend.com';

// AgentiSend rejects a signature more than five minutes from its own clock;
// the receiving side applies the same window so a captured delivery cannot be
// replayed later.
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

function isNotFound(error: unknown): boolean {
	const failure = error as { httpCode?: string | number; response?: { status?: number } };
	return String(failure.httpCode) === '404' || failure.response?.status === 404;
}

async function agentiSendRequest(
	this: IHookFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${path}`,
		json: true,
		...(body ? { body } : {}),
	};
	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'agentiSendApi',
		options,
	)) as IDataObject;
}

// Header: t=<unix seconds>,v1=<hex>[,v1=<hex>]. HMAC-SHA256 of the signing
// secret over `${t}.${rawBody}`. During a secret rotation there is one v1 per
// live secret and any one of them verifies.
export function verifySignature(
	secret: string,
	header: string,
	rawBody: string,
	nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
	let timestamp: number | undefined;
	const signatures: string[] = [];
	for (const part of header.split(',')) {
		const eq = part.indexOf('=');
		if (eq === -1) continue;
		const key = part.slice(0, eq).trim();
		const value = part.slice(eq + 1).trim();
		if (key === 't') timestamp = Number.parseInt(value, 10);
		else if (key === 'v1' && value !== '') signatures.push(value);
	}
	if (timestamp === undefined || !Number.isFinite(timestamp) || timestamp <= 0) return false;
	if (signatures.length === 0) return false;
	if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

	const expected = Buffer.from(
		createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex'),
		'hex',
	);
	let matched = false;
	for (const signature of signatures) {
		const provided = Buffer.from(signature, 'hex');
		if (provided.length === expected.length && timingSafeEqual(provided, expected)) matched = true;
	}
	return matched;
}

export class AgentiSendTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AgentiSend Trigger',
		name: 'agentiSendTrigger',
		icon: { light: 'file:../../icons/agentisend.svg', dark: 'file:../../icons/agentisend.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description:
			'Starts the workflow when AgentiSend reports an email event, such as delivered, bounced, opened or clicked',
		defaults: {
			name: 'AgentiSend Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'agentiSendApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'AgentiSend only delivers to https URLs, so this trigger needs an n8n instance reachable over https (n8n Cloud, or a self-hosted instance behind TLS)',
				name: 'httpsNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['email.delivered', 'email.bounced'],
				description: 'The events that start this workflow',
				options: [
					{ name: 'Agent Approval Requested', value: 'agent.approval_requested', description: 'A send was held for a person to approve' },
					{ name: 'All Events', value: '*', description: 'Every event type, including ones added later' },
					{ name: 'Contact Created', value: 'contact.created' },
					{ name: 'Contact Unsubscribed', value: 'contact.unsubscribed' },
					{ name: 'Domain Failed', value: 'domain.failed', description: 'A domain failed its DNS check' },
					{ name: 'Domain Verified', value: 'domain.verified' },
					{ name: 'Email Bounced', value: 'email.bounced' },
					{ name: 'Email Clicked', value: 'email.clicked' },
					{ name: 'Email Complained', value: 'email.complained', description: 'The recipient marked the email as spam' },
					{ name: 'Email Delivered', value: 'email.delivered' },
					{ name: 'Email Delivery Delayed', value: 'email.delivery_delayed' },
					{ name: 'Email Failed', value: 'email.failed' },
					{ name: 'Email Opened', value: 'email.opened' },
					{ name: 'Email Received', value: 'email.received', description: 'Mail arrived at one of your receiving addresses' },
					{ name: 'Email Sent', value: 'email.sent' },
					{ name: 'Email Suppressed', value: 'email.suppressed', description: 'A send was skipped because the address is on your suppression list' },
					{ name: 'Limit Exceeded', value: 'limit.exceeded', description: 'A spend budget was used up' },
					{ name: 'Limit Warning', value: 'limit.warning', description: 'A spend budget is nearly used up' },
					{ name: 'Suppression Added', value: 'suppression.added' },
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const webhookId = staticData.webhookId as string | undefined;
				if (!webhookId) return false;
				try {
					const endpoint = await agentiSendRequest.call(this, 'GET', `/webhooks/${webhookId}`);
					if (endpoint.url === this.getNodeWebhookUrl('default') && endpoint.disabled !== true) {
						return true;
					}
				} catch (error) {
					// Deleted in the console: create a fresh one. Anything else is a real failure.
					if (!isNotFound(error)) throw new NodeApiError(this.getNode(), error as JsonObject);
				}
				delete staticData.webhookId;
				delete staticData.signingSecret;
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const url = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events', []) as string[];
				const endpoint = await agentiSendRequest.call(this, 'POST', '/webhooks', {
					url,
					events: events.includes('*') ? ['*'] : events,
					payload_format: 'native',
				});
				const secret = (endpoint.signing_secret ?? endpoint.secret) as string | undefined;
				if (!endpoint.id || !secret) return false;
				const staticData = this.getWorkflowStaticData('node');
				staticData.webhookId = endpoint.id as string;
				staticData.signingSecret = secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const webhookId = staticData.webhookId as string | undefined;
				if (webhookId) {
					try {
						await agentiSendRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
					} catch (error) {
						// Already gone is fine. Anything else is a real failure.
						if (!isNotFound(error)) throw new NodeApiError(this.getNode(), error as JsonObject);
					}
				}
				delete staticData.webhookId;
				delete staticData.signingSecret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const request = this.getRequestObject();
		const staticData = this.getWorkflowStaticData('node');
		const secret = staticData.signingSecret as string | undefined;
		const header = this.getHeaderData()['x-agentisend-signature'];
		const rawBody = request.rawBody ? request.rawBody.toString('utf8') : JSON.stringify(request.body);

		if (
			!secret ||
			typeof header !== 'string' ||
			!verifySignature(secret, header, rawBody)
		) {
			const response = this.getResponseObject();
			response.status(401).send('Signature did not verify');
			return { noWebhookResponse: true };
		}

		return {
			workflowData: [this.helpers.returnJsonArray(this.getBodyData() as IDataObject)],
		};
	}
}
