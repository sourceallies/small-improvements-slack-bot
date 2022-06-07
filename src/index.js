'use strict';

const https = require('https');//Axios for http requests
const AWS = require('aws-sdk');//AWS SDK for DynamoDB
const docClient = new AWS.DynamoDB.DocumentClient();
// Put lambda function in here :)

const httpsOptions = {
    hostname: 'allies.small-improvements.com',
    port: 443,
    path: '/api/v2/activities?modules=OBJECTIVE',
    method: 'GET',
};

const dynamoParams = {
    TableName : 'your-table-name',
    /* Item properties will depend on your application concerns */
    Item: {
       id: '12345',
       price: 100.00
    }
}

exports.handler = (event, context, callback) => {
    let rightNow = new Date(event.time);
    let earliestTime = rightNow - (1000*60*12);
    getObjectives(earliestTime);
    //console.log('Received event:', JSON.stringify(event, null, 2));
    //callback(null, 'Finished');
};

function getObjectives(earliest){
    const req = https.request(httpsOptions, res => {
        console.log(`statusCode: ${res.statusCode}`);
      
        res.on('data', d => {
          process.stdout.write(d);
        });
    });
    req.on('error', error => {
        console.error(error);
    });
      
    req.write("data");
    req.end();
}

function workWithDatabase(){
    //pull whole database?
}

function postToSlack(posts){//posts are an array

}

// schedule with cloudwatch rule -> cron(0 */12 * * *);

//For DynamoDB, reference the following:
// https://docs.amplify.aws/guides/functions/dynamodb-from-js-lambda/q/platform/js/#scanning-a-table