const slackClient = require('../src/slack');

// Get Slack ID, Format Message, Post
async function postObjective(token, channelName, objective, newStatus, email) {
  const slackID = await slackClient.getSlackID(email, token);
  const formattedMessage = await slackClient.formatSlackMessage(objective, newStatus, slackID);
  const postResp = await slackClient.slackPost(token, channelName, formattedMessage);
  return postResp;
}

exports.postObjective = postObjective;
