const https = require('https');
const messageVariables = {
  username: 'Small Improvements Update',
  icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png'
  // icon_emoji: ':+1:', /* :+1: = thumbs up emoji as avatar */
};

// Post a message to a channel your app is in using ID and message text
async function slackPost(authToken, channelID, objective, status) { // postData should be JSON { channel:"#channel", text:'message' } (may need to be JSON string?)
  const formattedMessage = formatSlackMessage(objective, status);
  formattedMessage.channel = '#' + channelID;
  const options = {
    hostname: 'https://slack.com/api',
    port: 443,
    path: '/chat.postMessage',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
      'Content-Length': formattedMessage.length
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const body = [];
      if (res.statusCode !== 200) {
        reject(new Error(`Could not post to Slack: ${res.statusCode}`));
        return;
      }
      res.on('data', (d) => {
        body.push(d);
      });
      res.on('end', () => {
        const responseBody = Buffer.concat(body).toString();
        resolve(responseBody);
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.write(formattedMessage);
    req.end();
  });
}

function formatSlackMessage(objectiveItem, newStatus) { // activity?
  const toSend = messageVariables;
  toSend.text = '@' + objectiveItem.owner.name + ' has ' + newStatus.toLowerCase() + ' their goal: *' + objectiveItem.title + '!*';
  return toSend;// return JSON format
  // return JSON.stringify(toSend);
  // use the above if the return would ideally be in string format
}

exports.formatSlackMessage = formatSlackMessage;
exports.slackPost = slackPost;
