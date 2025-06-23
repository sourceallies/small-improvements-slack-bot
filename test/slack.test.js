const slackClient = require('../src/slack');
const httpsMock = require('https');
jest.mock('https');

describe('Slack Requests', () => {
  let token,
    channelID,
    responseBody,
    mockObjective,
    mockStatus,
    mockEmail,
    mockSlackID,
    mockCycleId;

  beforeEach(() => {
    token = 'token';
    channelID = 'channelID';
    mockObjective = {
      title: 'title',
      id: 'objectiveId'
    };
    mockEmail = 'email@email.com';
    mockStatus = 'Achieved';
    mockSlackID = 'Reece';
    mockCycleId = 'CycleId';
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
  describe('Slack formatting', () => {
    test('Formats messages correctly *without* description', async () => {
      const formattedText = await slackClient.formatSlackMessage(mockObjective, mockStatus, mockSlackID, mockCycleId);
      expect(formattedText.text).toStrictEqual(
        `<@${mockSlackID}> has achieved their goal!
*${mockObjective.title}*
<https://allies.small-improvements.com/app/objectives/${mockCycleId}/${mockObjective.id}|Open in Small Improvements>`
      );
    });

    test('Formats messages correctly with description', async () => {
      const description = 'Description of objective';
      mockObjective.description = `<!--MARKUP_VERSION:v3-->${description}`;

      const formattedText = await slackClient.formatSlackMessage(mockObjective, mockStatus, mockSlackID, mockCycleId);
      expect(formattedText.text).toStrictEqual(
        `<@${mockSlackID}> has achieved their goal!
*${mockObjective.title}*
${description}
<https://allies.small-improvements.com/app/objectives/${mockCycleId}/${mockObjective.id}|Open in Small Improvements>`
      );
    });
  });

  describe('format description', () => {
    test('should replace <strong> text with *', () => {
      const description = '<!--MARKUP_VERSION:v3--><strong>bold</strong>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('*bold*');
    });
    test('should replace <p>...</p> text with \\n', () => {
      const description = '<!--MARKUP_VERSION:v3--><p>paragraph</p>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('paragraph\n');
    });
    test('should replace <em> text with _', () => {
      const description = '<!--MARKUP_VERSION:v3--><em>italic</em>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('_italic_');
    });
    test('should remove <u>', () => {
      const description = '<!--MARKUP_VERSION:v3--><u>underline</u>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('underline');
    });
    test('should replace <s> with ~', () => {
      const description = '<!--MARKUP_VERSION:v3--><s>strikethrough</s>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('~strikethrough~');
    });
    test('should replace ordered lists', () => {
      const description = '<!--MARKUP_VERSION:v3--><ol><li>item 1</li><li>item 2</li></ol>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('• item 1\n• item 2\n');
    });
    test('should replace unordered lists', () => {
      const description = '<!--MARKUP_VERSION:v3--><ul><li>item 1</li><li>item 2</li></ul>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('• item 1\n• item 2\n');
    });
    test('should replace indents', () => {
      const description = '<!--MARKUP_VERSION:v3--><p class="ql-indent-1">paragraph</p>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('    paragraph\n');
    });
    test('should replace links', () => {
      const description = '<!--MARKUP_VERSION:v3--><a href="https://example.com" rel="noopener noreferrer" target="_blank">https://example.com</a>';
      const result = slackClient.formatDescription(description);

      expect(result).toStrictEqual('<https://example.com>');
    });
    test('should be blank without markup version', () => {
      const description = '<strong>bold</strong>';
      const result = slackClient.formatDescription(description);
      expect(result).toStrictEqual('');
    });
  });

  describe('Slack Lookup', () => {
    beforeEach(() => {
      mockSlackID = 'Reece';
      token = 'token';
      responseBody = `{
        "user":{
          "id":"${mockSlackID}"
        }
      }`;
    });
    test('Should be able to look up users', async () => {
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

      const response = await slackClient.getSlackID(mockEmail, token);
      const expectedOptions = {
        hostname: 'sourceallies.slack.com',
        port: 443,
        path: '/api/users.lookupByEmail?email=' + mockEmail,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      expect(response).toStrictEqual(mockSlackID);
      expect(httpsMock.request).toHaveBeenCalledWith(expectedOptions, expect.any(Function));
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('SlackPost', () => {
    beforeEach(() => {

    });
    test('Should be able to post messages', async () => {
      const writeMock = jest.fn();
      const endMock = jest.fn();
      const formattedMessage = {};
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

      const response = await slackClient.slackPost(token, channelID, formattedMessage);
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
          channel: channelID
        }
      ));
    });

    test('Should reject any non-200 responses for posting', async () => {
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

    test('Should reject any non-200 responses for slack ID', async () => {
      httpsMock.request = jest.fn((postOption, requestCallBack) => requestCallBack({
        on: (data, dataCallBack) => dataCallBack(Buffer.from('<html>403</html>', 'utf8')),
        statusCode: 403
      }));

      let actualError;
      try {
        await slackClient.getSlackID(mockEmail, token);
      } catch (e) { actualError = e; }

      expect(actualError).toStrictEqual(new Error('Could not get ID: 403'));
    });
  });
});
