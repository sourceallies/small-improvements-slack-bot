const https = require('https')

function getObjectives(token) {
  const options = {
    hostname: 'allies.small-improvements.com',
    port: 443,
    path: '/api/v2/activities?modules=OBJECTIVE',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'SIBot' /* IF YOU REMOVE THIS LINE I WILL BREAK */
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let responsePayload = ''
      if (res.statusCode !== 200) {
        console.log(`status logged ${res.statusCode}`)
        reject(new Error(`Could not get objectives: ${res.statusCode}`))
        return
      }
      res.on('data', d => {
        responsePayload += d
      })
      res.on('close', () => {
        resolve(JSON.parse(responsePayload))
      })
    })
    req.on('error', err => {
      reject(new Error(`https error: ${err}`))
    })
    req.end()
  })
}

exports.getObjectives = getObjectives
