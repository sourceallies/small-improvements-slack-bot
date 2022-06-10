const AWS = require('aws-sdk');
const region = 'us-east-1';
const secretName = 'SIBot-Tokens';

async function getSecret() {
  const client = new AWS.SecretsManager({
    region
  });
  const response = client.getSecretValue({ SecretId: secretName });
  const data = await response.promise();

  return JSON.parse(data.SecretString);
}

exports.getSecret = getSecret;
