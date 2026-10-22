# n8n-nodes-capacities

This is an n8n community node for the [Capacities API](https://developers.capacities.io). It lets you read space structure, read and create objects, and delete objects in a Capacities space from an n8n workflow.

[n8n](https://n8n.io) is a fair-code workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, go to **Settings → Community Nodes**, choose **Install**, enter `n8n-nodes-capacities`, and confirm.

## Credentials

The node supports two credential types. Choose one in the node's **Authentication** field.

- **Capacities OAuth2 API** (recommended): authorization code flow with PKCE, using the client ID issued by Capacities. The node requests `api:read`, `api:write`, and `offline_access`, and refreshes tokens automatically.
- **Capacities API Token**: a personal token (starting with `cap-api-`) generated in the Capacities desktop app under Settings → Capacities API, plus the base URL, which defaults to `https://api.capacities.io`.

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

```bash
npm install
npm run build
npm run lint
```

Load the built package into a local n8n instance with `npm run dev` for live reload.

## License

[MIT](./LICENSE)
