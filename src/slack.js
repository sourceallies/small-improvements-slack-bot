const https = require('https');
var querystring = require('node:querystring');
const messageVariables = {
  username: 'Small Improvements Update',
  icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png'
};

// Post a message to a channel your app is in using ID and message text
async function slackPost(authToken, channelName, formattedMessage) { // postData should be JSON, e.g. { channel:"#channel", text:'message' }
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

async function formatSlackMessage(objectiveItem, newStatus, slackUID) { // activity?
  const toSend = messageVariables;
  toSend.text = '<@' + slackUID + '> has ' + newStatus.toLowerCase() + ' their goal: *' + objectiveItem.title + '!*';
  return toSend;// return JSON format
}

function getSlackID(email, token){
  const options = {
    hostname: 'sourceallies.slack.com',
    port: 443,
    path: '/api/users.lookupByEmail',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`
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
    req.write(querystring.stringify({email}));
    req.end();
  });
}

async function postObjective(token, channelName, objective, newStatus, email){
  /* 
    Get Slack ID,
    Format message,
    Post
  */
  const slackID = await getSlackID(email,token);
  const formattedMessage = await formatSlackMessage(objective, newStatus, slackID);
  let postResp = await slackPost(token, channelName, formattedMessage)
  //return postResp;
}

exports.postObjective = postObjective;
exports.formatSlackMessage = formatSlackMessage;
exports.slackPost = slackPost;
exports.getSlackID = getSlackID;
