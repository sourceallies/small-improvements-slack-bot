const AWS = require('aws-sdk');
const region = 'us-east-1';
const secretName = 'SmallImprovemtsSlackBot-Tokens';

async function getSecret() {
  const client = new AWS.SecretsManager({
    region
  });
  const response = client.getSecretValue({ SecretId: secretName });
  const data = await response.promise();
  let Tout = data.SecretString;
  Tout = JSON.parse(data.SecretString);

  return Tout;
}

exports.getSecret = getSecret;
