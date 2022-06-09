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
});
