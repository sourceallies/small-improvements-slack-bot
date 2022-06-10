const AWS = require('aws-sdk')
const mockRegion = 'us-east-1'
const mockSecretName = 'SIBot-Tokens'
const mockGetSecrets = jest.fn()

const secretsClient = require('../src/secrets')

jest.mock('../src/secrets');


jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn(() => ({
    getSecretValue: jest.fn(() => ({
      promise: mockSecrets
    }))
  }))
}))



describe('secrets',()=>{
  let region, outputs, secretName

  beforeEach(()=>{
    region = 'us-east-1'
    outputs = {
      SIToken: 'small-improvements-token',
      SlackToken: 'slack-token'
    }
    secretName = 'SIBot-Tokens'
  })

  test('secrets', async () => {
    const secretsPromise = jest.fn();
    mockGetSecrets.mockResolvedValue({
      promise: secretsPromise
    });
    secretsPromise.mockResolvedValue(outputs);
    const result = await secretsClient.getSecret();
    expect(result.SIToken).toStrictEqual(outputs.SIToken);
    
  });
});
/*
const { DynamoDB } = require('aws-sdk');
const AWS = require('aws-sdk');
const mockQuery = jest.fn();
const mockPutItem = jest.fn();

jest.mock('aws-sdk', () => ({
  DynamoDB: jest.fn(() => ({
    query: mockQuery,
    putItem: mockPutItem
  }))
}));

const dynamodbClient = require('../src/dynamodb');

describe('dynamodb', () => {
  describe('getRecord', () => {
    let key,
      response,
      responseItems;

    beforeEach(() => {
      key = 'objective-id';

      responseItems = [
        {
          ID: {
            S: key
          }
        }
      ];

      response = {
        Items: responseItems,
        Count: 1,
        ScannedCount: 1
      };
    });

    test('should call dynamodb', async () => {
      const queryPromise = jest.fn();
      mockQuery.mockReturnValue({
        promise: queryPromise
      });
      queryPromise.mockResolvedValue(response);

      const result = await dynamodbClient.getRecord(key);

      expect(result).toBe(responseItems);
      expect(mockQuery).toBeCalledWith({
        ExpressionAttributeValues: {
          ':id': { S: key }
        },
        KeyConditionExpression: 'ID = :id',
        TableName: 'small-improvements-goals'
      })
    });
  });

  describe('putRecord', () => {
    let activity,
      activityTime,
      objectiveId;

    beforeEach(() => {
      activityTime = 1654539707081
      objectiveId = 'objective-id'
      activity = {
        occurredAt: activityTime,
        content: {
          objective: {
            id: objectiveId
          }
        }
      }
    });

    test('should call dynamodb', async () => {
      const putItemPromise = jest.fn();
      mockPutItem.mockReturnValue({
        promise: putItemPromise
      });
      putItemPromise.mockResolvedValue({});

      const result = await dynamodbClient.insertRecord(activity);

      expect(result).toStrictEqual({});
      expect(mockPutItem).toBeCalledWith({
        TableName: 'small-improvements-goals',
        Item: {
          ID: { S: objectiveId},
          TIMESTAMP: {N: activityTime},
          TTL: {N: activityTime/1000 + (7 * 24 * 3600)}
        }
      })
    });
  });
});
*/