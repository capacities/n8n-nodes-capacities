# n8n-nodes-capacities

This is an n8n community node for the [Capacities API](https://developers.capacities.io). It lets you read space structure, read and create objects, and delete objects in a Capacities space from an n8n workflow.

[n8n](https://n8n.io) is a fair-code workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, go to **Settings → Community Nodes**, choose **Install**, enter `n8n-nodes-capacities`, and confirm.

## Credentials

The node authenticates with a static API token from Capacities.

1. In Capacities, open Settings and create an API token.
2. In n8n, create a new **Capacities API** credential and paste the token into **API Token**.
3. Leave **Base URL** as `https://api.capacities.io` unless you are testing against another environment.
4. Save. n8n runs a test call to `/space` and reports whether the token works.

The token is stored encrypted by n8n and is sent as a bearer token on every request.

## Operations

| Resource | Operation       | What it does                                    |
| -------- | --------------- | ----------------------------------------------- |
| Space    | Get             | Returns the space associated with the token.    |
| Space    | Get Structures  | Returns the structures in the space.            |
| Object   | Get             | Returns one object by ID.                       |
| Object   | Create          | Creates an object from a JSON body.             |
| Object   | Delete          | Moves one object to trash by ID.                |

The Create operation takes the same JSON body as the Capacities `POST /object` endpoint: `structureId`, optional `collections`, `properties`, and `blocks`. See the [Capacities API reference](https://developers.capacities.io) for the full body schema.

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
