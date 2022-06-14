'use strict';

const secretsClient = require('./secrets');
const smallImprovementsClient = require('./small-improvements');
const dynamodbClient = require('./dynamodb');
const slackClient = require('./slack');
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
        let SIEmail = await smallImprovementsClient.getEmail(activity.content.owner.id);
        await slackClient.slackPost(
          secrets.SlackToken,
          slackChannel,
          activity.content.objective,
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
  failedPosts.forEach(fail => console.error(fail.reason));
  const message = `Finished ${successfulPosts.length} successfully. Failed ${failedPosts.length}`;
  console.log(message);
  return message;
}

exports.handler = main;
exports.main = main;

/*
      Crontab rule for cloudwatch
        cron(0 8,20 * * MON-FRI *);//?
        8,20 = 3,10 for Central
        Run on the 0th minute
        on hours 8 and 20 (UTC)
        every week,
        of every month,
        Monday through friday,
        on all years
*/

