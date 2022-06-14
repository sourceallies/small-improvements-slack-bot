require('aws-sdk');
const mockSecretName = 'SmallImprovemtsSlackBot-Tokens';
const mockGetSecretsPromise = jest.fn();
const mockGetSecretValue = jest.fn(() => ({
  promise: mockGetSecretsPromise
}));

jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn(() => ({
    getSecretValue: mockGetSecretValue
  }))
}));

const secretsClient = require('../src/secrets');

describe('secrets', () => {
  let data;

  beforeEach(() => {
    data = {
      SecretString: `{
        "SIToken": "small-improvements-token",
        "SlackToken": "slack-token"
      }`
    };
  });

  test('secrets', async () => {
    mockGetSecretsPromise.mockResolvedValue(data);
    const result = await secretsClient.getSecret();
    expect(result).toStrictEqual(JSON.parse(data.SecretString));
    expect(mockGetSecretValue).toBeCalledWith({ SecretId: mockSecretName });
  });
});
