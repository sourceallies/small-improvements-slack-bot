const slackClient = require('./slack');

// Get Slack ID, Format Message, Post
async function postObjective(token, channelName, content, newStatus, email) {
  const slackID = await slackClient.getSlackID(email, token);
  const formattedMessage = await slackClient.formatSlackMessage(content.objective, newStatus, slackID, content.cycle.id);
  const postResp = await slackClient.slackPost(token, channelName, formattedMessage);
  return postResp;
}

exports.postObjective = postObjective;
