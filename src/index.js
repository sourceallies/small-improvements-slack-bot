const axios = require('axios');//Axios for http requests
const AWS = require('aws-sdk');//AWS SDK for DynamoDB
const docClient = new AWS.DynamoDB.DocumentClient();
// Put lambda function in here :)

'use strict';

exports.handler = (event, context, callback) => {
    let rightNow = new Date(event.time);
    let earliestTime = rightNow - (1000*60*12);
    getObjectives(earliestTime);
    //console.log('Received event:', JSON.stringify(event, null, 2));
    //callback(null, 'Finished');
};

function getObjectives(earliest){
    axios.get('https://allies.small-improvements.com/api/v2/activities?modules=OBJECTIVE').then(res => {
        console.log(`statusCode: ${res.status}`);
        console.log(res);
    }).catch(error => {
        console.error(error);
    });
}

function workWithDatabase(){
    //pull whole database?
}

function postToSlack(posts){//posts are an array

}

// schedule with cloudwatch rule -> cron(0 */12 * * *);

//For DynamoDB, reference the following:
// https://docs.amplify.aws/guides/functions/dynamodb-from-js-lambda/q/platform/js/#scanning-a-table