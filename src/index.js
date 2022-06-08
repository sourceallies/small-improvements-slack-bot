'use strict';

const https = require('https');
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

function getSecret(secretName){
    return new Promise((accept,reject)=>{
        client.getSecretValue({SecretId: secretName}, function(err, data) {
            if(err){reject("Could not get Secret: ",err.code);}
            else{
                // Decrypts secret using the associated KMS key.
                // Depending on whether the secret is a string or binary, one of these fields will be populated.
                if('SecretString' in data){
                    accept(data.SecretString);
                }
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
        Authorization: 'Bearer '+process.env.SIToken
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





function getObjectives(){
    return new Promise((accept,reject)=>{
        const req = https.request(httpsOptions, res => {
            var toReturn = "";
            if(res.statusCode != 200&&res.statusCode != 307){
                reject("Could not get objectives: ",res.statusCode);
            }
            res.on('data', d => { //Concat new string onto old string, is this necessary? Can data be paginated?
                toReturn.concat(d);
            });
            res.on('close',()=>{
                accept(JSON.parse(toReturn));
            });
        });
        req.on('error', error => {
            reject(error);
        });
        req.write("data");
        req.end();
    });
    
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
    let rightNow = new Date(event.time);
    let earliestTime = rightNow - (1000*60*12);
    let tryDB = false;
    var secrets, SIToken, objectives, slackToken;
    try{
        let secrets = await getSecret(secretName);
        let SIToken = secrets.SIBot;
        let slackToken = secrets.SIBot;
        let objectives = await getObjectives();
        tryDB = true;
    }catch(err){console.log("Error with tokens or objectives",err);}
    if(tryDB){
        console.log(objectives);//----------------------------------------
        // Try to get DB entries
    }
    //console.log('Received event:', JSON.stringify(event, null, 2));
    //callback(null, 'Finished');
}

exports.handler = main;
exports.main = main;

// schedule with cloudwatch rule -> cron(0 */12 * * *);

//For DynamoDB, reference the following:
// https://docs.amplify.aws/guides/functions/dynamodb-from-js-lambda/q/platform/js/#scanning-a-table


// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/


// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.

