const AWS = require('aws-sdk');
const mockSecretName = 'SIBot-Tokens';
const mockGetSecretsPromise = jest.fn();

jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn(() => ({
    getSecretValue: jest.fn(() => ({
      promise: mockGetSecretsPromise
    }))
  }))
}));

const secretsClient = require('../src/secrets');

describe('secrets', () => {
  let data;

  beforeEach(() => {
    data = {
      SecretString: `{
        SIToken: 'small-improvements-token',
        SlackToken: 'slack-token'
      }`
    };
  });

  test('secrets', async () => {
    mockGetSecretsPromise.mockResolvedValue(data);
    const result = await secretsClient.getSecret();
    expect(result).toBe(JSON.parse(data.SecretString));
    expect(AWS.SecretsManager).toBeCalledWith({ SecretId: mockSecretName });
  });
});
