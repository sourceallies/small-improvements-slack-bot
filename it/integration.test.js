const index = require('../src/index');

describe('integration', () => {
  const event = {
    time: '2022-06-16T00:00:00Z'
  }

  test('process event', async () => {
    const result = await index.handler(event);
  })
})