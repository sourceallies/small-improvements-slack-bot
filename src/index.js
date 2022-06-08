'use strict';

const https = require('https');
const { rawListeners } = require('process');
// Load the AWS SDK
var AWS = require('aws-sdk'),
    region = "us-east-1",
    secretName = "arn:aws:secretsmanager:us-east-1:729161019481:secret:SIBot-Tokens-J4t6Af",/* API Tokens */
    secret,
    decodedBinarySecret;
// Create DynamoDB document client
const docClient = new AWS.DynamoDB.DocumentClient();
// Create a Secrets Manager client
var client = new AWS.SecretsManager({
    region: region
});

var data;


function getSecret(secretName){
    return new Promise((accept,reject)=>{
        client.getSecretValue({SecretId: secretName}, function(err, data) {
            if(err){reject(`Could not get Secret: ${err.code}`);}
            else{
                // Decrypts secret using the associated KMS key.
                // Depending on whether the secret is a string or binary, one of these fields will be populated.
                if('SecretString' in data){accept(data.SecretString);}
                else{
                    let buff = new Buffer(data.SecretBinary, 'base64');
                    accept(buff.toString('ascii'));
                }
            }
        });
    });
}




var httpsOptions = {
    hostname: 'allies.small-improvements.com',
    port: 443,
    path: '/api/v2/activities?modules=OBJECTIVE',
    method: 'GET',
    headers: {
        Accept: `application/json`,
        'User-Agent': 'SIBot' /*IF YOU REMOVE THIS LINE I WILL BREAK*/
    }
};

const dynamoParams = {
    TableName : "small-improvements-goals",
    /* Item properties will depend on your application concerns 
    Item: {
       id: '12345',
       price: 100.00
    }
    */
}





function getObjectives(opts){
    return new Promise((accept,reject)=>{
        const req = https.request(opts, res => {
            var toReturn = "";
            if(res.statusCode != 200){
                console.log(`status logged ${res.statusCode}`);
                reject(`Could not get objectives: ${res.statusCode}`);
                return;
            }
            res.on('data', d => { //Concat new string onto old string
                toReturn += d;
            });
            res.on('close',()=>{
                accept(formatJSON(JSON.parse(toReturn)));
            });
        });
        req.on('error', err => {
            reject(`https error: ${err}`);
        });
        req.end();
    });
    
}

function formatJSON(json){
    let toOut = json;
    toOut.items.flatMap(i => i.items)
    .flatMap(i => i.activities)
    .filter(a => a.type === "OBJECTIVE_STATUS_CHANGED")
    .filter(a => a.change.newStatus.status === 100 || a.change.newStatus.status === 103)
    .filter(a => a.content.objective.visibility === "PUBLIC")
    return toOut.items;
}

async function getDatabase(){
    //pull whole database?
}

function postToSlack(posts){//posts are an array
    for(var i=0;i<posts.length;i++){
        //--------------------------------------------------
    }
}

async function main(event,context,callback){
    var secrets, SIToken, objectives, slackToken;
    let rightNow = new Date(event.time);
    let earliestTime = rightNow - (1000*60*12);
    let tryDB = false;
    try{
        let secrets = await getSecret(secretName);
        let SIToken = secrets.SIToken;
        httpsOptions.headers.Authorization = `Bearer ${SIToken}`;
        let slackToken = secrets.SlackToken;
        let objectives = await getObjectives(httpsOptions);
        objectives = objectives.items;
        tryDB = true;
    }catch(err){console.log(err);}
    if(tryDB){
        console.log(objectives);//----------------------------------------
        // Try to get DB entries
    }
    //console.log('Received event:', JSON.stringify(event, null, 2));
    //callback(null, 'Finished');
}

exports.handler = main;
exports.main = main;
exports.getObjectives = getObjectives;

// schedule with cloudwatch rule -> cron(0 */12 * * *);

//For DynamoDB, reference the following:
// https://docs.amplify.aws/guides/functions/dynamodb-from-js-lambda/q/platform/js/#scanning-a-table


// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/


// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.

