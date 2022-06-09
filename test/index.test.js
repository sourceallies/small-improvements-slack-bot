const index = require('../src/index');
const secretsClient = require('../src/secrets');
const smallImprovementsClient = require('../src/small-improvements');
const dynamodbClient = require('../src/dynamodb');

jest.mock('../src/secrets');
jest.mock('../src/small-improvements');
jest.mock('../src/dynamodb');

describe('index', () => {
  let event,
    secrets,
    activities,
    dynamoRecord;

  beforeEach(() => {
    event = {
      time: '2022-06-01T00:00:00Z'
    };

    secrets = {
      SIToken: 'small-improvements-token',
      SlackToken: 'slack-token'
    };

    activities = {
      items: []
    };

    dynamoRecord = {

    };
  });

  test('should not post previously existing objective', async () => {
    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.getObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue(undefined);

    const result = await index.handler(event);

    expect(result).toBe('Finished 0 successfully. Failed 0');
  });
});
