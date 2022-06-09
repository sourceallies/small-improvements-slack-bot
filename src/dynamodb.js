const AWS = require('aws-sdk');
const region = 'us-east-1';
const tableName = 'small-improvements-goals';
const dbClient = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region
});

async function getRecord(key) {
  const params = {
    ExpressionAttributeValues: {
      ':id': { S: key }
    },
    KeyConditionExpression: 'ID = :id',
    ProjectionExpression: 'ID, TIMESTAMP',
    TableName: tableName
  };

  const response = await dbClient.query(params).promise();

  return response.Items;
}

function insertRecord(activity) {
  const params = {
    TableName: tableName,
    Item: {
      ID: { S: activity.content.objective.id },
      TIMESTAMP: { N: activity.occurredAt }
    }
  };

  return dbClient.putItem(params).promise();
}

exports.getRecord = getRecord;
exports.insertRecord = insertRecord;
