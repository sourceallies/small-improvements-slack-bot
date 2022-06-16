'use strict';

const secretsClient = require('./secrets');
const smallImprovementsClient = require('./small-improvements');
const dynamodbClient = require('./dynamodb');
const slackService = require('./slack-service');
const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;

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
  const slackChannel = process.env.SlackChannel;
  const secrets = await secretsClient.getSecret();
  const objectiveActivities = await smallImprovementsClient.getObjectives(secrets.SIToken);
  const recentlyCompletedObjectives = filterActivities(objectiveActivities, new Date(event.time));
  console.log(`Found ${recentlyCompletedObjectives.length} recently completed objectives.`);
  const results = await Promise.allSettled(
    recentlyCompletedObjectives.map(async (activity) => {
      const exisingEntry = await dynamodbClient.getRecord(activity.content.objective.id);
      if (!exisingEntry?.length) {
        const SIEmail = await smallImprovementsClient.getEmail(activity.content.objective.owner.id, secrets.SIToken);
        await slackService.postObjective(
          secrets.SlackToken,
          slackChannel,
          activity.content,
          activity.change.newStatus.description,
          SIEmail
        );
        await dynamodbClient.insertRecord(activity);
        return activity.content.objective;
      }
      return undefined;
    })
  );
  const successfulPosts = results.filter(x => x.value);
  const failedPosts = results.filter(x => x.status === 'rejected');
  failedPosts.forEach(fail => console.log(fail.reason));
  const message = `Finished ${successfulPosts.length} successfully. Failed ${failedPosts.length}`;
  console.log(message);
  return message;
}

exports.handler = main;
exports.main = main;
