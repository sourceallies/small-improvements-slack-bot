const index = require('../src/index');

describe('integration', () => {
  const event = {
    time: '2025-10-30T00:00:00Z'
  };

  test('process event', async () => {
    await index.handler(event);
  });
});
