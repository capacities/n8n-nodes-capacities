import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class CapacitiesApi implements ICredentialType {
  name = 'capacitiesApi';

  displayName = 'Capacities API';

  icon = 'file:../nodes/Capacities/capacities.svg' as const;

  documentationUrl = 'https://developers.capacities.io';

  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Static API token issued from Capacities Settings',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.capacities.io',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiToken}}',
        'x-capacities-api-version': '1.0.0',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/space',
    },
  };

}
