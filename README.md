# n8n-nodes-agentisend

This is an n8n community node. It lets you use [AgentiSend](https://agentisend.com) in your n8n workflows.

AgentiSend is a transactional email API: receipts, password resets, sign-in codes and alerts sent from your own verified domain, with a message log, spend budgets and a kill switch. Every refusal says what went wrong and how to fix it.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

In n8n, open **Settings → Community Nodes → Install**, enter `n8n-nodes-agentisend` and install. The full steps are in n8n's [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Operations

The package has two nodes.

**AgentiSend**

| Resource | Operation | What it does |
|---|---|---|
| Email | Send | Send an email from a verified domain. One recipient or several, HTML or text or a published template, CC, BCC, reply-to, tags, custom headers, scheduled sending ("tomorrow 9am" works), and an idempotency key so an n8n retry never sends twice. |
| Email | Preflight | Run every check a send runs (domain, suppression list, budget, content) and send nothing. Free. |
| Email | Get | One email with its current status and last event. |
| Email | Get Many | List emails, newest first. Filter by status, sender, recipient, tag, text or date. |
| Email | Explain | What happened to an email, the evidence, and the steps that fix it when it was not delivered. |
| Email | Cancel | Cancel a scheduled or queued email. |
| Contact | Create, Get, Get Many, Update, Delete | Manage your audience, including consent source and custom properties. |
| Domain | Get, Get Many | Your sending domains with their verification status and DNS records. |

The AgentiSend node can also be used as a tool by n8n's AI Agent node.

**AgentiSend Trigger**

Starts a workflow when AgentiSend reports an event: delivered, bounced, opened, clicked, complained, failed, delayed, suppressed, received, a domain verified or failed, a budget warning, or a send held for approval. Choose **All Events** to receive every type, including ones added later. The trigger registers its own webhook when you activate the workflow, removes it when you deactivate it, and rejects any delivery whose signature does not verify.

## Credentials

1. Create an AgentiSend account at [agentisend.com](https://agentisend.com). The Free plan needs no card.
2. In the console, open **API Keys** and create a key ([how](https://agentisend.com/docs/guides/console-api-keys)). It starts with `as_`.
   - A **sending** key can send, preflight and read emails.
   - The Trigger, Contact and Domain operations need a **full access** key.
3. In n8n, add an **AgentiSend API** credential and paste the key. **Test** runs a free preflight that sends nothing.

## Compatibility

Built with `@n8n/node-cli` 0.51 for the n8n 1.x and 2.x node API (`n8nNodesApiVersion` 1). Tested against n8n 2.42.3. No runtime dependencies.

## Usage

**Test without delivering anything.** Send to `delivered@simulator.agentisend.com`, `bounced@simulator.agentisend.com` or `complained@simulator.agentisend.com`. These produce the matching webhook events, cost nothing and reach nobody, and they work before your domain is verified.

**Before your domain is verified.** Send from `onboarding@agentisend.com` to your own sign-in address (20 a day) while DNS propagates.

**Retries.** Set **Idempotency Key** to something unique for the send, such as an order ID. If the step runs again, AgentiSend returns the first result instead of sending a second email.

**Trigger needs https.** AgentiSend only delivers webhooks to `https` URLs. n8n Cloud works as is. A self-hosted n8n needs a public https address (set `WEBHOOK_URL`).

**When a send is refused**, the error shows AgentiSend's message and its `fix`. Run **Email → Explain** on the email ID for the full story.

## Example workflows

Import any of these in n8n (**Workflows → Import from File**), then pick your credential in each node:

* [Daily report of bounced and complained emails from AgentiSend](examples/daily-bounce-report.json)
* [Check an email with AgentiSend, then send it only if every check passes](examples/preflight-then-send.json)

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [AgentiSend quickstart](https://agentisend.com/docs/guides/quickstart)
* [Webhooks and signature verification](https://agentisend.com/docs/guides/webhooks)
* [Test addresses](https://agentisend.com/docs/guides/test-addresses)
* [API reference](https://agentisend.com/docs/api)

## Version history

### 0.1.1

Get Many with Return All now keeps your filters on every page (before, Return All ignored them). Example workflows added.

### 0.1.0

First release: Email (Send, Preflight, Get, Get Many, Explain, Cancel), Contact, Domain, and the AgentiSend Trigger.
