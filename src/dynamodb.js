const AWS = require('aws-sdk')
const region = 'us-east-1'
const tableName = 'small-improvements-goals'
const dbClient = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region
})

async function getRecord(key) {

}

async function insertRecord(activity) {

}

exports.getRecord = getRecord
exports.insertRecord = insertRecord
