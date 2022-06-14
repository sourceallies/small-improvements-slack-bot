const https = require('https');
const messageVariables = {
  username: 'Small Improvements Update',
  icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png'
};

// Post a message to a channel your app is in using ID and message text
async function slackPost(authToken, channelName, objective, status, email) { // postData should be JSON, e.g. { channel:"#channel", text:'message' }
  const formattedMessage = formatSlackMessage(objective, status, email);//Formatted message, may need refactoring for IDs?-------
  formattedMessage.channel = '' + channelName;
  formattedMessage.icon_url = 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png';
  formattedMessage.username = 'SAI SI Bot';
  formattedMessage.link_names = 1;
  const options = {
    hostname: 'sourceallies.slack.com',
    port: 443,
    path: '/api/chat.postMessage',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
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
    req.write(JSON.stringify(formattedMessage));
    req.end();
  });
}

function formatSlackMessage(objectiveItem, newStatus, email) { // activity?
  const toSend = messageVariables;
  const slackUID = await getSlackID(email);
  toSend.text = '<@' + slackUID + '> has ' + newStatus.toLowerCase() + ' their goal: *' + objectiveItem.title + '!*';
  // return JSON format
  return toSend;
}

function getSlackID(email){
  const options = {
    hostname: 'sourceallies.slack.com',
    port: 443,
    path: '/api/users.lookupByEmail',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      email
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let responsePayload = '';
      if (res.statusCode !== 200) {
        console.log(`status logged ${res.statusCode}`);
        reject(new Error(`Could not get objectives: ${res.statusCode}`));
        return;
      }
      res.on('data', d => {
        responsePayload += d;
      });
      res.on('close', () => {
        resolve(JSON.parse(responsePayload).user.id);
      });
    });
    req.on('error', err => {
      reject(new Error(`https error: ${err}`));
    });
    req.end();
  });
}

exports.formatSlackMessage = formatSlackMessage;
exports.slackPost = slackPost;
exports.getSlackID = getSlackID;
