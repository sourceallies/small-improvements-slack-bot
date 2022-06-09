'use strict'

// Load the AWS SDK
const AWS = require('aws-sdk')
const secretsClient = require('./secrets')
const smallImprovementsClient = require('./small-improvements')
const dynamodbClient = require('./dynamodb')
const region = 'us-east-1'
// Create DynamoDB document client
const docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region
})

const screeningHours = 24 * 30

const dynamoParams = {
  TableName: 'small-improvements-goals' // As found in template.yaml
}

function formatJSON (json) {
  const now = new Date()
  return json.items.flatMap(i => i.items)
    .flatMap(i => i.activities)
    .filter(a => a.type === 'OBJECTIVE_STATUS_CHANGED')
    .filter(a => a.change.newStatus.status === 100 || a.change.newStatus.status === 103)
    .filter(a => a.content.objective.visibility === 'PUBLIC')
    .filter(a => a.occurredAt >= now - (screeningHours * 3660 * 1000))
}

async function getDatabase () {
  // pull whole database?
}

function postToSlack (posts) { // posts are an array
  for (let i = 0; i < posts.length; i++) {
    // --------------------------------------------------
  }
}

async function main (event, context, callback) {
  // let secrets, SIToken, objectives, slackToken
  // const rightNow = new Date(event.time)
  // const earliestTime = rightNow - (1000 * 60 * 12)
  // let tryDB = false
  // try {
  //   const secrets = await secretsClient.getSecret()
  //   const SIToken = secrets.SIToken
  //   httpsOptions.headers.Authorization = `Bearer ${SIToken}`
  //   const slackToken = secrets.SlackToken
  //   let objectives = await smallImprovementsClient.getObjectives(SIToken)
  //   objectives = objectives.items
  //   if (objectives.length > 0) { tryDB = true }
  // } catch (err) { console.log(err) }
  // if (tryDB) {
  //   // Get list of eligible ids
  //   const ids = []
  //   for (let i = 0; i < objectives.length; i++) {
  //     ids.push(objectives[i].content.objectives.id)
  //   }
  //   // Get All DB Entries
  //   const dbEntries = await scanTable()
  //   const dbIDs = dbEntries.map(entry => entry.ID) // Is now just an array of ID's
  //   const newEntries = []
  //   ids.forEach(entry => {
  //     if (!dbIDs.includes(entry)) {
  //       newEntries.push(entry)
  //     }
  //   })
  //   // -----------------Push all updates to slack
  //   // -----------------Loop through new entries, put them in DB
  // }
  // // console.log('Received event:', JSON.stringify(event, null, 2));
  // // callback(null, 'Finished');

  /*
    Get secrets
    Get SI objectives
    Filter to recently completed objectives
    For each recently completed objective
      Query for record in dynamodb
      No record
        Post message to Slack
        Put record in dynamodb
  */
}

const dbQuery = async (pid) => {
  const paramss = {
    TableName: dynamoParams.TableName,
    region: 'us-east-1'
  }

  const toOut = await docClient.query(paramss).promise()
  return toOut
}

const putItem = async (pid) => {
  const paramss = {
    TableName: dynamoParams.TableName,
    region: 'us-east-1'
  }
}

const scanTable = async () => {
  const paramss = {
    TableName: dynamoParams.TableName,
    region: 'us-east-1'
  }
  const scanResults = []
  let itemss
  do {
    itemss = await docClient.scan(paramss).promise()
    itemss.Items.forEach((item) => scanResults.push(item))
    paramss.ExclusiveStartKey = itemss.LastEvaluatedKey
  } while (typeof itemss.LastEvaluatedKey !== 'undefined')
  return scanResults
}

exports.handler = main
exports.main = main
exports.getObjectives = getObjectives

// schedule with cloudwatch rule -> cron(0 */12 * * *);

// For DynamoDB, reference the following:
// https://docs.amplify.aws/guides/functions/dynamodb-from-js-lambda/q/platform/js/#scanning-a-table

// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.
