const AWS = require('aws-sdk');
const region = 'us-east-1';
const secretName = 'SIBot-Tokens';

async function getSecret() {
  const client = new AWS.SecretsManager({
    region
  });
  const data = await client.getSecretValue({ SecretId: secretName }).promise();

  console.log('Retireved secrets');
  if ('SecretString' in data) {
    return JSON.parse(data.SecretString);
  } else {
    const buff = Buffer.from(data.SecretBinary, 'base64');
    return JSON.parse(buff.toString('ascii'));
  }
}

exports.getSecret = getSecret;
