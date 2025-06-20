const slackClient = require('./slack');

// Get Slack ID, Format Message, Post
async function PostCompletedObjective(token, channelName, content, newStatus, email) {
  const slackID = await slackClient.getSlackID(email, token);
  const formattedMessage = await slackClient.formatSlackMessageForCompleted(content.objective, newStatus, slackID, content.cycle.id);
  return await slackClient.slackPost(token, channelName, formattedMessage);
}
async function PostCreatedObjective(token, channelName, content, email) {
  const slackID = await slackClient.getSlackID(email, token);
  const formattedMessage = await slackClient.formatSlackMessageForCreated(content.objective, slackID, content.cycle.id);
  return await slackClient.slackPost(token, channelName, formattedMessage);
}

exports.PostCompletedObjective = PostCompletedObjective
exports.PostCreatedObjective = PostCreatedObjective
