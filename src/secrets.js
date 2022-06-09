const AWS = require('aws-sdk');
const region = 'us-east-1';
const secretName = 'SIBot-Tokens';

async function getSecret() {
  const client = new AWS.SecretsManager({
    region
  });
  const data = await client.getSecretValue({ SecretId: secretName }).promise();

  return JSON.parse(data.SecretString);
}

exports.getSecret = getSecret;
