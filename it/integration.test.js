const index = require('../src/index');

describe.only('integration', () => {
  const event = {
    time: '2022-06-01T00:00:00Z'
  }

  test('process event', async () => {
    const result = await index.handler(event);
  })
})