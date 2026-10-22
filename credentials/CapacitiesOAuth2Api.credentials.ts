import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CapacitiesOAuth2Api implements ICredentialType {
  name = 'capacitiesOAuth2Api';

  displayName = 'Capacities OAuth2 API';

  extends = ['oAuth2Api'];

  icon = 'file:../nodes/Capacities/capacities.svg' as const;

  documentationUrl = 'https://developers.capacities.io/api/overview/authentication';

  properties: INodeProperties[] = [
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'OAuth client ID issued by Capacities',
    },
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'pkce',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://api.capacities.io/oauth/authorize',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: 'https://api.capacities.io/oauth/token',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'hidden',
      default: 'api:read api:write offline_access',
    },
    {
      displayName: 'Auth URI Query Parameters',
      name: 'authQueryParameters',
      type: 'hidden',
      default: 'resource=https://api.capacities.io',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'body',
    },
  ];
}
