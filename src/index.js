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
  const objectiveActivities = await smallImprovementsClient.GetObjectives(secrets.SIToken);
  const { completed, created } = filter.filterActivities(objectiveActivities, new Date(event.time));
  console.log(`Found ${completed.length} recently completed and ${created.length} recently created objectives.`);
  const completedResults = await Promise.allSettled(
    completed.map(async (activity) => {
      const exisingEntry = await dynamodbClient.getRecord(activity.content.objective.id);
      if (!exisingEntry?.length) {
        const SIEmail = await smallImprovementsClient.GetEmail(activity.content.objective.owner.id, secrets.SIToken);
        await slackService.PostCompletedObjective(
          secrets.SlackToken,
          slackChannel,
          activity.content,
          activity.change.newStatus.description,
          SIEmail
        );
        await dynamodbClient.insertRecord(activity, '');
        return activity.content.objective;
      }
      return undefined;
    })
  );
  const createdResults = await Promise.allSettled(
    created.map(async (activity) => {
      const exisingEntry = await dynamodbClient.getRecord(activity.content.objective.id + 'CREATED');
      if (!exisingEntry?.length) {
        const SIEmail = await smallImprovementsClient.GetEmail(activity.content.objective.owner.id, secrets.SIToken);
        await slackService.PostCreatedObjective(
          secrets.SlackToken,
          slackChannel,
          activity.content,
          SIEmail
        );
        await dynamodbClient.insertRecord(activity, 'CREATED');
        return activity.content.objective;
      }
      return undefined;
    })
  );
  const allPostResults = completedResults.concat(createdResults);
  const successfulPosts = allPostResults.filter(x => x.value);
  const failedPosts = allPostResults.filter(x => x.status === 'rejected');

  failedPosts.forEach(fail => console.log(fail.reason));
  const message = `Finished ${successfulPosts.length} successfully. Failed ${failedPosts.length}`;
  console.log(message);
  return message;
}

exports.handler = main;
exports.main = main;
