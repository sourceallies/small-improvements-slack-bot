const postClient = require('../src/slack-service');
const slackClient = require('../src/slack');
jest.mock('../src/slack');

describe('postObjective', () => {
  let token,
    channelID,
    responseBody,
    mockObjective,
    mockStatus,
    mockEmail,
    mockSlackID,
    mockObjectiveCycleId;

  beforeEach(() => {
    token = 'token';
    channelID = 'channelID';
    mockObjective = {
      title: 'title',
      owner: { name: 'Reece' }
    };
    mockStatus = 'Achieved';
    mockSlackID = 'Reece';
    mockEmail = 'email@email.com';
    mockObjectiveCycleId = 'abcdef';
    responseBody = `{
      ok: true,
      channel: 'C0179PL5K8E',
      ts: '1595354927.001300',
      message: {
        bot_id: 'B017GED1UEN',
        type: 'message',
        text: 'Hello, World!',
        user: 'U0171MZ51E3',
        ts: '1595354927.001300',
        team: 'T2CA1AURM',
        bot_profile: {
          id: 'B017GED1UEN',
          deleted: false,
          name: 'My Test App',
          updated: 1595353545,
          app_id: 'A017NKGAKHA',
          icons: [Object],
          team_id: 'T2CA1AURM'
        }
      }
    }`;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('postObjective', async () => {
    const mockFormattedMessage = {};
    slackClient.getSlackID.mockResolvedValue(mockSlackID);
    slackClient.formatSlackMessage.mockResolvedValue(mockFormattedMessage);
    slackClient.slackPost.mockResolvedValue(responseBody);
    const mockContent = {
      cycle: {
        id: mockObjectiveCycleId
      },
      objective: mockObjective
    };

    const response = await postClient.postObjective(token, channelID, mockContent, mockStatus, mockEmail);
    expect(response).toStrictEqual(responseBody);
    expect(slackClient.getSlackID).toHaveBeenCalledWith(mockEmail, token);
    expect(slackClient.formatSlackMessage).toHaveBeenCalledWith(mockObjective, mockStatus, mockSlackID, mockObjectiveCycleId);
    expect(slackClient.slackPost).toHaveBeenCalledWith(token, channelID, mockFormattedMessage);
  });
});
