const AWS = require('aws-sdk');
const region = 'us-east-1';
const secretName = 'SIBot-Tokens';

function getSecret() {
  const client = new AWS.SecretsManager({
    region
  });
  return new Promise((resolve, reject) => {
    client.getSecretValue({ SecretId: secretName }, function (err, data) {
      if (err) {
        reject(new Error(`Could not get Secret: ${err.code}`));
      } else {
        if ('SecretString' in data) {
          resolve(data.SecretString);
        } else {
          const buff = Buffer.from(data.SecretBinary, 'base64');
          resolve(buff.toString('ascii'));
        }
      }
    });
  });
}

exports.getSecret = getSecret;
