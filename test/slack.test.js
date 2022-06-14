const slackClient = require('../src/slack');
const httpsMock = require('https');
jest.mock('https');

describe('Slack Requests', () => {
  let token,
    channelID,
    responseBody,
    mockObjective,
    mockStatus;

  beforeEach(() => {
    token = 'token';
    channelID = 'channelID';
    mockObjective = {
      title: 'title',
      owner: { name: 'Reece' }
    };
    mockStatus = 'Achieved';
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

    httpsMock.on = jest.fn();
    httpsMock.end = jest.fn();
    httpsMock.write = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Formats messages correctly', async () => {
    const formattedText = slackClient.formatSlackMessage(mockObjective, mockStatus);
    expect(formattedText.text).toStrictEqual('<@Reece> has achieved their goal: *title!*');
  });

  test('Should be able to post messages', async () => {
    const writeMock = jest.fn();
    const endMock = jest.fn();
    httpsMock.request = jest.fn((postOption, requestCallBack) => {
      requestCallBack({
        on: (data, dataCallBack) => dataCallBack(Buffer.from(responseBody, 'utf8')),
        statusCode: 200
      });
      return {
        write: writeMock,
        end: endMock,
        on: jest.fn((eventName, errorCallback) => errorCallback(new Error('Call failed')))
      };
    });

    const response = await slackClient.slackPost(token, channelID, mockObjective, mockStatus);
    const formattedMessage = slackClient.formatSlackMessage(mockObjective, mockStatus);
    const expectedOptions = {
      hostname: 'sourceallies.slack.com',
      port: 443,
      path: '/api/chat.postMessage',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    expect(response).toStrictEqual(responseBody);
    expect(httpsMock.request).toHaveBeenCalledWith(expectedOptions, expect.any(Function));
    expect(endMock).toHaveBeenCalled();
    expect(writeMock).toHaveBeenCalledWith(JSON.stringify(
      {
        ...formattedMessage,
        channel: channelID,
        icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2018-10-01/446651996324_48.png',
        username: 'SAI SI Bot',
        link_names: 1
      }
    ));
  });

  test('Should reject any non-200 responses', async () => {
    httpsMock.request = jest.fn((postOption, requestCallBack) => requestCallBack({
      on: (data, dataCallBack) => dataCallBack(Buffer.from('<html>403</html>', 'utf8')),
      statusCode: 403
    }));

    let actualError;
    try {
      await slackClient.slackPost(token, channelID, mockObjective, mockStatus);
    } catch (e) { actualError = e; }

    expect(actualError).toStrictEqual(new Error('Could not post to Slack: 403'));
  });
});
