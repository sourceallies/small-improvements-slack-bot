const https = require('https');

const messageVariables = {
  username: 'ChangeMe! I am the username of the bot!',
  icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png'
  //icon_emoji: ':+1:', /* :+1: = thumbs up emoji as avatar */
};

// Post a message to a channel your app is in using ID and message text
async function slackPost(authToken, channelID, objective, status) { //postData should be JSON { channel:"#channel", text:'message' } (may need to be JSON string?)
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
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = [];
      if (res.statusCode !== 200) {
        reject(new Error(`Could not post to Slack: ${res.statusCode}`));
        return;
      }
      res.on('data', (d) => {
        body.push(d);
      });
      res.on('end', () => {
        let responseBody = Buffer.concat(body).toString()
        resolve(responseBody)
      })
    });
    req.on('error', (e) => {
      reject(e);
      return;
    });
    req.write(formattedMessage);
    req.end();
  });
}

function formatSlackMessage(objectiveItem, newStatus) {//activity?
  let toSend = messageVariables;
  toSend.text = "@" + objectiveItem.owner.name + " has " + newStatus.toLowerCase() + " their goal: *" + objectiveItem.title + "!*";
  return toSend;//return JSON format
  //return JSON.stringify(toSend);//if the return would ideally be in string format
}

exports.formatSlackMessage = formatSlackMessage;
exports.slackPost = slackPost;

/* ACTIVITY
"actor": {
            "firstName": "Jonathan",
            "task": false,
            "deleted": false,
            "gender": "male",
            "name": "Jonathan Stoner",
            "anonymous": false,
            "active": true,
            "logo": "/api/avatars/15/JS.svg?v=3",
            "id": "I0cB7W8ZMbMx9yWWEE82jg"
        },
        "occurredAt": 1654539707081,
        "change": {
            "newStatus": {
                "color": "#2ecd72",
                "description": "Achieved",
                "status": 100
            },
            "oldStatus": {
                "color": "#eee",
                "description": "Open",
                "status": 0
            }
        },
        "id": "gU0rYVyufgaut7cdXOpBnQ",
        "type": "OBJECTIVE_STATUS_CHANGED",
        "targets": [
            {
                "firstName": "Jonathan",
                "task": false,
                "deleted": false,
                "gender": "male",
                "name": "Jonathan Stoner",
                "anonymous": false,
                "active": true,
                "logo": "/api/avatars/15/JS.svg?v=3",
                "id": "I0cB7W8ZMbMx9yWWEE82jg"
            }
        ],
        "content": {
            "cycle": {
                "id": "E0hlMiEuRi7T7Md8PWy1uQ",
                "name": "Objective Cycle 2022"
            },
            "objective": {
                "id": "XEXIMghhDXciRVs6kW0*ug",
                "icon": "o_target_alt",
                "title": "Weekly updates to Blob's Day Off",
                "description": null,
                "dueDate": "2022-05-01T05:00:00.000Z",
                "owner": {
                    "firstName": "Jonathan",
                    "task": false,
                    "deleted": false,
                    "gender": "male",
                    "name": "Jonathan Stoner",
                    "anonymous": false,
                    "active": true,
                    "logo": "/api/avatars/15/JS.svg?v=3",
                    "id": "I0cB7W8ZMbMx9yWWEE82jg"
                },
                "visibility": "PUBLIC",
                "visibleTo": []
            }
        }
    }
*/

/*"objective": {
  "id": "XEXIMghhDXciRVs6kW0*ug",
  "icon": "o_target_alt",
  "title": "Weekly updates to Blob's Day Off",
  "description": null,
  "dueDate": "2022-05-01T05:00:00.000Z",
  "owner": {
      "firstName": "Jonathan",
      "task": false,
      "deleted": false,
      "gender": "male",
      "name": "Jonathan Stoner",
      "anonymous": false,
      "active": true,
      "logo": "/api/avatars/15/JS.svg?v=3",
      "id": "I0cB7W8ZMbMx9yWWEE82jg"
  },
  "visibility": "PUBLIC",
  "visibleTo": []
}
*/


/* 
a normal requeat response:
{
  ok: true,
  channel: 'C0179PL5K8E',
  ts: '1595354927.001300',
  message: {
    bot_id: 'B017GED1UEN',
    type: 'message',
    text: 'Hello, World!',
    user: 'U0171MZ51E3',
    ts: '1595354927.001300',
    team: 'T2CA1AURM',
    bot_profile: {
      id: 'B017GED1UEN',
      deleted: false,
      name: 'My Test App',
      updated: 1595353545,
      app_id: 'A017NKGAKHA',
      icons: [Object],
      team_id: 'T2CA1AURM'
    }
  }
}
 */