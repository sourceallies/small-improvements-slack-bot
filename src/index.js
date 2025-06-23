'use strict';

const secretsClient = require('./secrets');
const smallImprovementsClient = require('./small-improvements');
const dynamodbClient = require('./dynamodb');
const slackService = require('./slack-service');
const filter = require('./filter');

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
  const recentlyCompletedObjectives = filter.filterActivities(objectiveActivities, new Date(event.time));
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
