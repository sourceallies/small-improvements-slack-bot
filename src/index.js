'use strict';

const secretsClient = require('./secrets');
const smallImprovementsClient = require('./small-improvements');
const dynamodbClient = require('./dynamodb');
const slackClient = require('./slack');
const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;
const slackChannel = 'si-sandbox';

/*
  Achieved status == 100
  Partially achieved status == 103
*/
function filterActivities(activities, eventDate) {
  return activities.items.flatMap(i => i.items)
    .flatMap(i => i.activities)
    .filter(a => a.type === 'OBJECTIVE_STATUS_CHANGED')
    .filter(a => a.change.newStatus.status === 100 || a.change.newStatus.status === 103)
    .filter(a => a.content.objective.visibility === 'PUBLIC')
    .filter(a => a.occurredAt >= eventDate.getTime() - threeDaysInMillis);
}

async function main(event, context) {
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
  const secrets = await secretsClient.getSecret();
  const objectiveActivities = await smallImprovementsClient.getObjectives(secrets.SIToken);
  const recentlyCompletedObjectives = filterActivities(objectiveActivities, new Date(event.time));
  const results = await Promise.allSettled(
    recentlyCompletedObjectives.map(async (activity) => {
      const exisingEntry = await dynamodbClient.getRecord(activity.content.objective.id);
      if (!exisingEntry?.length) {
        await slackClient.slackPost(
          secrets.SlackToken,
          slackChannel,
          activity.content.objective,
          activity.change.newStatus.description
        );
        await dynamodbClient.insertRecord(activity);
        return activity.content.objective;
      }
      return undefined;
    })
  );
  const successfulPosts = results.filter(x => x.value);
  const failedPosts = results.filter(x => x.status === 'rejected');
  return `Finished ${successfulPosts.length} successfully. Failed ${failedPosts.length}`;
}

exports.handler = main;
exports.main = main;

// schedule with cloudwatch rule -> cron(0 */12 * * *);

// For DynamoDB, reference the following:
// https://docs.amplify.aws/guides/functions/dynamodb-from-js-lambda/q/platform/js/#scanning-a-table

// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.
