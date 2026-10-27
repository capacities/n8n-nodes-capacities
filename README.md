# @capacities/n8n-nodes-capacities

This is an n8n community node for the [Capacities API](https://developers.capacities.io). It lets you read space structure, read and create objects, and delete objects in a Capacities space from an n8n workflow.

[n8n](https://n8n.io) is a fair-code workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, go to **Settings → Community Nodes**, choose **Install**, enter `@capacities/n8n-nodes-capacities`, and confirm.

The unscoped package `n8n-nodes-capacities` is deprecated. Install this package instead.

## Credentials

Create a **Capacities API** credential with a personal API token. Generate the token in the Capacities desktop app under Settings → Capacities API, choosing the space it can access and whether it is read-only. Tokens start with `cap-api-`. The base URL defaults to `https://api.capacities.io`.

## Operations

The node covers every method of the Capacities TypeScript SDK (`@capacities/api`).

| Resource     | Operations                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------- |
| Space        | Get, Get Structures                                                                          |
| Object       | Get, Create, Update, Delete, Create From URL, Create From Media                             |
| Media        | Initialize Upload, Upload Part, Complete Upload, Abort Upload                                |
| Markdown     | Get, Create, Update                                                                          |
| Object Query | Search, List by Structure, List by Tag, List by Collection                                   |
| Block        | Append, Append to Daily Note, Delete, Update                                                 |

Create From Media takes a binary property and runs the full upload flow: it initializes the upload, sends each part, completes it, and aborts if any step fails. The request bodies for JSON operations follow the Capacities API reference.

## Example workflow

Read the space structures and then create an object of the first structure:

1. Add a **Capacities** node with the resource set to **Space** and the operation set to **Get Structures**.
2. Add a **Code** node that picks a structure ID from the response.
3. Add a second **Capacities** node with the resource set to **Object** and the operation set to **Create**. Set **Body (JSON)** to an object with the `structureId` from the previous step and the properties you want to set.

## Development

Use Node 22 (`nvm use`). The n8n vetting scanner depends on `isolated-vm`, which ships prebuilds for Node 22 and 24 only.

```bash
npm install
npm run build
npm run lint
npm run scan
```

`npm run scan` runs the same `@n8n/scan-community-package@beta` checks as the n8n Creator Portal, against this repo rather than the published package. On Node 25 or newer it switches to the Node 22 binary from nvm.

Load the built package into a local n8n instance with `npm run dev` for live reload.

## License

[MIT](./LICENSE)
