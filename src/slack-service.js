const slackClient = require('./slack');

// Get Slack ID, Format Message, Post
async function PostCompletedObjective(token, channelId, content, newStatus, email) {
  const slackID = await slackClient.getSlackID(email, token);
  const formattedMessage = await slackClient.formatSlackMessageForCompleted(content.objective, newStatus, slackID, content.cycle.id);
  return await slackClient.slackPost(token, channelId, formattedMessage);
}
async function PostCreatedObjective(token, channelId, content, email) {
  const slackID = await slackClient.getSlackID(email, token);
  const formattedMessage = await slackClient.formatSlackMessageForCreated(content.objective, slackID, content.cycle.id);
  return await slackClient.slackPost(token, channelId, formattedMessage);
}

exports.PostCompletedObjective = PostCompletedObjective;
exports.PostCreatedObjective = PostCreatedObjective;
