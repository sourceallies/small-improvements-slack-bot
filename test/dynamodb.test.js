const AWS = require('aws-sdk');
jest.mock('aws-sdk');
const DynamoDBMock = new AWS.DynamoDB();

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
            S: 'objective-id'
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
      const dynamoPromise = jest.fn();
      DynamoDBMock.query = jest.fn().mockReturnValue({
        promise: dynamoPromise
      });
      dynamoPromise.mockResolvedValue(response);

      const result = await dynamodbClient.getRecord(key);

      expect(result).toBe(responseItems);
    });
  });
});
