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





function getObjectives(earliest){
    return new Promise((accept,reject)=>{
        const req = https.request(httpsOptions, res => {
            var toReturn = "";
            if(res.statusCode != 200&&res.statusCode != 307){
                reject(res.statusCode);
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

function workWithDatabase(){
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
    getObjectives(earliestTime).then((objectivesJSON)=>{
        
    },(httpErr)=>{
        console.log(httpErr);
    });
    //console.log('Received event:', JSON.stringify(event, null, 2));
    //callback(null, 'Finished');
}

exports.handler = main;
exports.main = main;

// schedule with cloudwatch rule -> cron(0 */12 * * *);

//For DynamoDB, reference the following:
// https://docs.amplify.aws/guides/functions/dynamodb-from-js-lambda/q/platform/js/#scanning-a-table