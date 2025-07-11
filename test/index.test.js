const index = require('../src/index');
const secretsClient = require('../src/secrets');
const smallImprovementsClient = require('../src/small-improvements');
const dynamodbClient = require('../src/dynamodb');
const slackClient = require('../src/slack-service');
const dataFactory = require('./data-factory');

jest.mock('../src/secrets');
jest.mock('../src/small-improvements');
jest.mock('../src/dynamodb');
jest.mock('../src/slack-service');

describe('index', () => {
  let eventDateString,
    event,
    secrets,
    activities,
    dynamoRecords,
    objectiveId,
    slackChannel,
    mockEmail;

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    slackChannel = 'si-sandbox';
    process.env.SlackChannel = slackChannel;

    eventDateString = '2022-06-02T00:00:00Z';
    event = {
      time: eventDateString
    };

    secrets = {
      SIToken: 'small-improvements-token',
      SlackToken: 'slack-token'
    };

    mockEmail = 'email@email.com';

    objectiveId = 'objective-id';

    const activityDateMillis = new Date(eventDateString).setDate(1);

    activities = {
      items: [
        {
          occurredAt: 1654612581248,
          id: 'w02bdXSdzFNre*n3plJOgQ-dUe9W56cXrlucbz4FEV0sw-1k05OwEVexvYONuBmTRcrw-kEFnd6Mqw567tefzzM8Gmg-tUOq3XodR8jeSc6izL1qpg',
          items: [
            {
              occurredAt: 1651856682326,
              activities: [
                dataFactory.createCompletedActivity(
                  { occurredAt: activityDateMillis },
                  { id: objectiveId }
                ),
                dataFactory.createCreatedActivity(
                  { occurredAt: activityDateMillis },
                  { id: objectiveId }
                )
              ]
            }
          ]
        }
      ]
    };

    dynamoRecords = [{
      ID: {
        S: objectiveId
      },
      TIMESTAMP: {
        N: activityDateMillis
      },
      TTL: {
        N: (activityDateMillis / 1000) + (7 * 24 * 60 * 60)
      }
    }];
  });

  test('should not post previously existing objective', async () => {
    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.GetObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue(dynamoRecords);

    const result = await index.handler(event);

    expect(result).toBe('Finished 0 successfully. Failed 0');
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId);
    expect(dynamodbClient.insertRecord).not.toHaveBeenCalled();
  });

  test('should post objective achieved', async () => {
    activities.items[0].items[0].activities[0].occurredAt = new Date(eventDateString).getTime() - (3 * 24 * 60 * 60 * 1000);

    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.GetObjectives.mockResolvedValue(activities);
    smallImprovementsClient.GetEmail.mockResolvedValue(mockEmail);
    dynamodbClient.getRecord.mockResolvedValue([]);
    dynamodbClient.insertRecord.mockResolvedValue({});
    slackClient.PostCompletedObjective.mockResolvedValue({});

    const result = await index.handler(event);

    expect(result).toBe('Finished 2 successfully. Failed 0');
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId);
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId + 'CREATED');
    expect(dynamodbClient.insertRecord).toHaveBeenCalledWith(activities.items[0].items[0].activities[0], '');
    expect(dynamodbClient.insertRecord).toHaveBeenCalledWith(activities.items[0].items[0].activities[1], 'CREATED');
    expect(slackClient.PostCompletedObjective).toHaveBeenCalledWith(
      secrets.SlackToken,
      slackChannel,
      activities.items[0].items[0].activities[0].content,
      activities.items[0].items[0].activities[0].change.newStatus.description,
      mockEmail
    );
  });

  test('should complete other posts after failure', async () => {
    const secondObjectiveId = 'second-objective-id';

    activities.items[0].items[0].activities[0].occurredAt = new Date(eventDateString).getTime() - (3 * 24 * 60 * 60 * 1000);
    activities.items[0].items[0].activities.push(dataFactory.createCompletedActivity(
      { occurredAt: new Date(eventDateString).getTime() },
      { id: secondObjectiveId }
    ));

    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.GetObjectives.mockResolvedValue(activities);
    smallImprovementsClient.GetEmail.mockResolvedValue(mockEmail);
    dynamodbClient.getRecord.mockResolvedValue([]);
    slackClient.PostCompletedObjective
      .mockRejectedValueOnce(new Error('failed to post to slack'))
      .mockResolvedValue({});
    dynamodbClient.insertRecord.mockResolvedValue({});

    const result = await index.handler(event);

    expect(result).toBe('Finished 2 successfully. Failed 1');
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId);
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(secondObjectiveId);
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId + 'CREATED');
    expect(dynamodbClient.insertRecord).not.toHaveBeenCalledWith(activities.items[0].items[0].activities[0], '');
    expect(dynamodbClient.insertRecord).toHaveBeenCalledWith(activities.items[0].items[0].activities[1], 'CREATED');
    expect(slackClient.PostCompletedObjective).toHaveBeenCalledWith(
      secrets.SlackToken,
      slackChannel,
      activities.items[0].items[0].activities[2].content,
      activities.items[0].items[0].activities[2].change.newStatus.description,
      mockEmail
    );
    expect(slackClient.PostCreatedObjective).toHaveBeenCalledWith(
      secrets.SlackToken,
      slackChannel,
      activities.items[0].items[0].activities[1].content,
      mockEmail
    );
  });
});
