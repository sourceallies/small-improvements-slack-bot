const https = require('https');
const messageVariables = {
  username: 'Small Improvements Update',
  icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png'
};

// Post a message to a channel your app is in using ID and message text
async function slackPost(authToken, channelName, objective, status) { // postData should be JSON { channel:"#channel", text:'message' } (may need to be JSON string?)
  const formattedMessage = formatSlackMessage(objective, status);
  formattedMessage.channel = '' + channelName;
  formattedMessage.icon_url = 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png';
  formattedMessage.username = 'SIBot';
  formattedMessage.link_names = 1;
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
  // Get email via Small Improvemnts API (using SIUID)
  let SIUID = objectiveItem.owner.id;
  //------------------------------------------------
  // Get SlackUID via email
  //------------------------------------------------
  let slackUID = objectiveItem.owner.name;
  toSend.text = '<@' + slackUID + '> has ' + newStatus.toLowerCase() + ' their goal: *' + objectiveItem.title + '!*';
  return toSend;// return JSON format
  // return JSON.stringify(toSend);
  // use the above if the return would ideally be in string format
}

exports.formatSlackMessage = formatSlackMessage;
exports.slackPost = slackPost;
