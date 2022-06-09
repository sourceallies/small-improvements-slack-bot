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
    ProjectionExpression: 'ID, timestamp',
    TableName: tableName
  };

  ddb.query(params, function(err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      // console.log("Success", data.Items);
      data.Items.forEach(function(element, index, array) {
        console.log(element.Title.S + ' (' + element.Subtitle.S + ')');
      });
    }
  });
}

async function insertRecord(activity) {

}

exports.getRecord = getRecord;
exports.insertRecord = insertRecord;
