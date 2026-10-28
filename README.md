# @capacities/n8n-nodes-capacities

This is an n8n community node for the [Capacities API](https://developers.capacities.io). It lets you read space structure, read and create objects, and delete objects in a Capacities space from an n8n workflow.

[n8n](https://n8n.io) is a fair-code workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, go to **Settings → Community Nodes**, choose **Install**, enter `@capacities/n8n-nodes-capacities`, and confirm.

The unscoped package `n8n-nodes-capacities` is deprecated. Install this package instead.

## Credentials

Create a **Capacities API** credential with a personal API token. Generate the token in the Capacities desktop app under Settings → Capacities API, choosing the space it can access and whether it is read-only. Tokens start with `cap-api-`. The base URL defaults to `https://api.capacities.io`.

## Operations

| Resource     | Operations                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Space        | Get, Get Structures                                                        |
| Object       | Get, Create, Update, Delete, Create From URL                               |
| Media        | Upload                                                                     |
| Markdown     | Get, Create, Update                                                        |
| Object Query | Search, List by Structure, List by Tag, List by Collection                 |
| Block        | Append, Append to Daily Note, Delete, Update                               |

**Upload** reads the file from an input binary field. The node initializes the upload, sends each part, completes it, and aborts the upload if a step fails. Set the file name, title, and collection IDs on the node. An empty file name or title uses the binary file name.

**Append** and **Append to Daily Note** send exactly one of Markdown or a blocks array. The blocks value is the array itself. A structure id is a built-in id such as `RootPage`, or the UUID of a custom structure from Get Structures. It is not an object id. Other JSON bodies follow the Capacities API reference.

## Example workflow

Read the space structures and then create an object of the first structure:

1. Add a **Capacities** node with the resource set to **Space** and the operation set to **Get Structures**.
2. Add a **Code** node that picks a structure ID from the response.
3. Add a second **Capacities** node with the resource set to **Object** and the operation set to **Create**. Set **Body (JSON)** to an object with the `structureId` from the previous step and the properties you want to set.

## Development

Use Node 24 (`nvm use`). Current n8n requires it, and `isolated-vm` ships a prebuild for Node 24. Node 25 makes `npm run dev` fail while installing n8n. `npm run dev` switches to the Node 24 binary from nvm when the current Node is different.

```bash
npm install
npm run build
npm run lint
npm run scan
npm run check
```

`npm run scan` runs the same `@n8n/scan-community-package@beta` checks as the n8n Creator Portal, against this repo rather than the published package. On Node 25 or newer it switches to Node 24 from nvm.

`npm run check` is the local publish dry run. It uses Node 24, then runs lint, build, scan, and checks the append, structure id, and media upload requests against the public API schemas in the sibling `capacities-portal` checkout. `npm run check:requests` runs only that request check. Neither command publishes.

Load the built package into a local n8n instance with `npm run dev` for live reload.

## Release

Run the **Publish** workflow and enter the version. The job signs in as this repository's GitHub Actions trusted publisher, so it does not use an npm token. It publishes that version, then creates the `v` tag. Running it again for a version already on npm completes without publishing a second time.

## License

[MIT](./LICENSE)
