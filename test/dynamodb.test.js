require('aws-sdk');
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

      const now = new Date().getTime();
      const nowInSeconds = now / 1000;

      responseItems = [
        {
          ID: {
            S: key
          },
          TIMESTAMP: {
            N: now
          },
          TTL: {
            N: nowInSeconds
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
      });
    });
  });

  describe('putRecord', () => {
    let activity,
      activityTime,
      objectiveId;

    beforeEach(() => {
      activityTime = 1654539707081;
      objectiveId = 'objective-id';
      activity = {
        occurredAt: activityTime,
        content: {
          objective: {
            id: objectiveId
          }
        }
      };
    });

    test('should call dynamodb', async () => {
      const activityTimePlusSevenDaysInSeconds = activityTime / 1000 + (7 * 24 * 3600);
      const putItemPromise = jest.fn();
      mockPutItem.mockReturnValue({
        promise: putItemPromise
      });
      putItemPromise.mockResolvedValue({});

      const result = await dynamodbClient.insertRecord(activity, '');

      expect(result).toStrictEqual({});
      expect(mockPutItem).toBeCalledWith({
        TableName: 'small-improvements-goals',
        Item: {
          ID: { S: objectiveId },
          TIMESTAMP: { N: String(activityTime) },
          TTL: { N: String(activityTimePlusSevenDaysInSeconds) }
        }
      });
    });
  });
});
