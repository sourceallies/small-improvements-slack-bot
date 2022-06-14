const index = require('../src/index');
const secretsClient = require('../src/secrets');
const smallImprovementsClient = require('../src/small-improvements');
const dynamodbClient = require('../src/dynamodb');
const slackClient = require('../src/slack');
const dataFactory = require('./data-factory');

jest.mock('../src/secrets');
jest.mock('../src/small-improvements');
jest.mock('../src/dynamodb');
jest.mock('../src/slack');

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
                dataFactory.createActivity(
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
    smallImprovementsClient.getObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue(dynamoRecords);

    const result = await index.handler(event);

    expect(result).toBe('Finished 0 successfully. Failed 0');
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId);
    expect(dynamodbClient.insertRecord).not.toHaveBeenCalled();
  });

  test('should not post objective status change to in progress', async () => {
    activities.items[0].items[0].activities[0].change.newStatus = {
      color: '#eee',
      description: 'In Progress',
      status: 1
    };

    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.getObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue([]);

    const result = await index.handler(event);

    expect(result).toBe('Finished 0 successfully. Failed 0');
    expect(dynamodbClient.getRecord).not.toHaveBeenCalled();
  });

  test('should not post private objectives', async () => {
    activities.items[0].items[0].activities[0].content.objective.visibility = 'PRIVATE';

    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.getObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue([]);

    const result = await index.handler(event);

    expect(result).toBe('Finished 0 successfully. Failed 0');
    expect(dynamodbClient.getRecord).not.toHaveBeenCalled();
  });

  test('should not post old objective changes', async () => {
    activities.items[0].items[0].activities[0].occurredAt = new Date(eventDateString).getTime() - (3 * 24 * 60 * 60 * 1000) - 1;

    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.getObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue([]);

    const result = await index.handler(event);

    expect(result).toBe('Finished 0 successfully. Failed 0');
    expect(dynamodbClient.getRecord).not.toHaveBeenCalled();
  });

  test('should post objective achieved', async () => {
    activities.items[0].items[0].activities[0].occurredAt = new Date(eventDateString).getTime() - (3 * 24 * 60 * 60 * 1000);

    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.getObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue([]);
    dynamodbClient.insertRecord.mockResolvedValue({});
    //slackClient.slackPost.mockResolvedValue({});
    slackClient.postObjective.mockResolvedValue({});

    const result = await index.handler(event);

    expect(result).toBe('Finished 1 successfully. Failed 0');
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId);
    expect(dynamodbClient.insertRecord).toHaveBeenCalledWith(activities.items[0].items[0].activities[0]);
    expect(slackClient.postObjective).toHaveBeenCalledWith(
      secrets.SlackToken,
      slackChannel,
      activities.items[0].items[0].activities[0].content.objective,
      activities.items[0].items[0].activities[0].change.newStatus.description,
      mockEmail
    );
    /* 
    expect(slackClient.slackPost).toHaveBeenCalledWith(
      secrets.SlackToken,
      slackChannel,
      activities.items[0].items[0].activities[0].content.objective,
      activities.items[0].items[0].activities[0].change.newStatus.description,
    );
    */
  });

  test('should complete other posts after failure', async () => {
    const secondObjectiveId = 'second-objective-id';

    activities.items[0].items[0].activities[0].occurredAt = new Date(eventDateString).getTime() - (3 * 24 * 60 * 60 * 1000);
    activities.items[0].items[0].activities.push(dataFactory.createActivity(
      { occurredAt: new Date(eventDateString).getTime() },
      { id: secondObjectiveId }
    ));

    secretsClient.getSecret.mockResolvedValue(secrets);
    smallImprovementsClient.getObjectives.mockResolvedValue(activities);
    dynamodbClient.getRecord.mockResolvedValue([]);
    slackClient.postObjective
      .mockRejectedValueOnce(new Error('failed to post to slack'))
      .mockResolvedValue({});
    /*
    slackClient.slackPost
      .mockRejectedValueOnce(new Error('failed to post to slack'))
      .mockResolvedValue({});
      */
    dynamodbClient.insertRecord.mockResolvedValue({});

    const result = await index.handler(event);

    expect(result).toBe('Finished 1 successfully. Failed 1');
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(objectiveId);
    expect(dynamodbClient.getRecord).toHaveBeenCalledWith(secondObjectiveId);
    expect(dynamodbClient.insertRecord).not.toHaveBeenCalledWith(activities.items[0].items[0].activities[0]);
    expect(dynamodbClient.insertRecord).toHaveBeenCalledWith(activities.items[0].items[0].activities[1]);
    /* expect(slackClient.slackPost).toHaveBeenCalledWith(
      secrets.SlackToken,
      slackChannel,
      activities.items[0].items[0].activities[0].content.objective,
      activities.items[0].items[0].activities[0].change.newStatus.description
    );*/
    expect(slackClient.postObjective).toHaveBeenCalledWith(
      secrets.SlackToken,
      slackChannel,
      activities.items[0].items[0].activities[1].content.objective,
      activities.items[0].items[0].activities[1].change.newStatus.description,
      mockEmail
    );
  });
});
