const https = require('https');
const messageVariables = {
  username: 'Mastery Path Bot',
  icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png',
  link_names: 1
};

// Post a message to a channel your app is in using ID and message text
async function slackPost(authToken, channelName, formattedMessage) { // postData should be JSON, e.g. { channel:"#channel", text:'message' }
  formattedMessage.channel = '' + channelName;

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

async function formatSlackMessage(objectiveItem, newStatus, slackUID, cycleId) {
  const toSend = messageVariables;
  toSend.text = `<@${slackUID}> has ${newStatus.toLowerCase()} their goal!\n*${objectiveItem.title}*\n`;
  if (objectiveItem.description) {
    toSend.text += `${objectiveItem.description}\n`;
  }
  toSend.text += `<https://allies.small-improvements.com/app/objectives/${cycleId}/${objectiveItem.id}|Open in Small Improvements>`;
  return toSend;// return JSON format
}

function getSlackID(email, token) {
  const options = {
    hostname: 'sourceallies.slack.com',
    port: 443,
    path: '/api/users.lookupByEmail?email=' + email,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let responsePayload = '';
      if (res.statusCode !== 200) {
        console.log(`status logged ${res.statusCode}`);
        reject(new Error(`Could not get ID: ${res.statusCode}`));
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
