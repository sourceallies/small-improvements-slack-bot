const smallImprovementsClient = require('../src/small-improvements');
const httpsMock = require('https');
jest.mock('https');

describe('small-improvements', () => {
  let token,
    activitiesBody,
    userBody,
    mockEmail,
    mockSIUID;

  beforeEach(() => {
    mockSIUID = 'SIUID';
    token = 'token';
    mockEmail = 'email@email.com';
    activitiesBody = `{
      "items": [
        {
          "occurredAt": 1654612581248,
          "id": "w02bdXSdzFNre*n3plJOgQ-dUe9W56cXrlucbz4FEV0sw-1k05OwEVexvYONuBmTRcrw-kEFnd6Mqw567tefzzM8Gmg-tUOq3XodR8jeSc6izL1qpg",
          "type": "OBJECTIVES_EDITED",
          "items": [
            {
              "occurredAt": 1651856682326,
              "activities": [
                {
                  "actor": {
                    "firstName": "Developer"
                  },
                  "occurredAt": 1654547027986,
                  "change": {
                    "newStatus": {
                      "color": "#63b5ff",
                      "description": "Achieved",
                      "status": 100
                    },
                    "oldStatus": {
                      "color": "#eee",
                      "description": "In Progress",
                      "status": 1
                    }
                  },
                  "id": "5kz5coPbAQwsrE43TbI*nQ",
                  "type": "OBJECTIVE_STATUS_CHANGED",
                  "targets": [
                    {
                      "firstName": "Developer"
                    }
                  ],
                  "content": {
                    "cycle": {
                      "id": "E0hlMiEuRi7T7Md8PWy1uQ",
                      "name": "Objective Cycle 2022"
                    },
                    "objective": {
                      "id": "l012GZeu9va29MFWpCOzkA",
                      "icon": "o_target_alt",
                      "title": "Objective Title",
                      "description": "<!--MARKUP_VERSION:v3--><p>Description</p>",
                      "dueDate": "2022-12-31T20:00:00.000Z",
                      "owner": {
                        "firstName": "Developer"
                      },
                      "visibility": "PUBLIC",
                      "visibleTo": []
                    }
                  }
                }
              ],
              "content": {
                "cycle": {
                  "id": "E0hlMiEuRi7T7Md8PWy1uQ",
                  "name": "Objective Cycle 2022"
                },
                "objective": {
                  "id": "l012GZeu9va29MFWpCOzkA",
                  "icon": "o_target_alt",
                  "title": "Objective Title",
                  "description": "<!--MARKUP_VERSION:v3--><p>Description</p>",
                  "dueDate": "2022-12-31T20:00:00.000Z",
                  "owner": {
                    "firstName": "Developer"
                  },
                  "visibility": "PUBLIC",
                  "visibleTo": []
                }
              }
            }
          ],
          "target": {
            "firstName": "Developer"
          }
        }
      ]
    }`;
    userBody = `{
      "loginname": "${mockEmail}"
    }`;

    httpsMock.on = jest.fn();
    httpsMock.end = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should get email', async () => {
    const writeMock = jest.fn();
    const endMock = jest.fn();
    httpsMock.request = jest.fn((postOption, requestCallBack) => {
      requestCallBack({
        on: (data, dataCallBack) => dataCallBack(Buffer.from(userBody, 'utf8')),
        statusCode: 200
      });
      return {
        write: writeMock,
        end: endMock,
        on: jest.fn((eventName, errorCallback) => errorCallback(new Error('Call failed')))
      };
    });

    const response = await smallImprovementsClient.GetEmail(mockSIUID, token);

    const expectedOptions = {
      hostname: 'allies.small-improvements.com',
      port: 443,
      path: '/api/v2/users/' + mockSIUID,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'SIBot' /* IF YOU REMOVE THE USER AGENT LINE I (THIS BOT) WILL BREAK */
      }
    };

    expect(response).toStrictEqual(mockEmail);
    expect(httpsMock.request).toHaveBeenCalledWith(expectedOptions, expect.any(Function));
  });

  test('Should get objectives', async () => {
    const writeMock = jest.fn();
    const endMock = jest.fn();
    httpsMock.request = jest.fn((postOption, requestCallBack) => {
      requestCallBack({
        on: (data, dataCallBack) => dataCallBack(Buffer.from(activitiesBody, 'utf8')),
        statusCode: 200
      });
      return {
        write: writeMock,
        end: endMock,
        on: jest.fn((eventName, errorCallback) => errorCallback(new Error('Call failed')))
      };
    });

    const response = await smallImprovementsClient.GetObjectives(token);

    const expectedOptions = {
      hostname: 'allies.small-improvements.com',
      port: 443,
      path: '/api/v2/activities?modules=OBJECTIVE',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'SIBot' /* IF YOU REMOVE THE USER AGENT LINE I (THIS BOT) WILL BREAK */
      }
    };

    expect(response).toStrictEqual(JSON.parse(activitiesBody));
    expect(httpsMock.request).toHaveBeenCalledWith(expectedOptions, expect.any(Function));
  });

  test('Should reject any non-200 responses on objectives', async () => {
    httpsMock.request = jest.fn((postOption, requestCallBack) => requestCallBack({
      on: (data, dataCallBack) => dataCallBack(Buffer.from('<html>403</html>', 'utf8')),
      statusCode: 403
    }));

    let actualError;
    try {
      await smallImprovementsClient.GetObjectives(token);
    } catch (e) {
      actualError = e;
    }

    expect(actualError).toStrictEqual(new Error('Could not get objectives: 403'));
  });

  test('Should reject any non-200 responses on emails', async () => {
    httpsMock.request = jest.fn((postOption, requestCallBack) => requestCallBack({
      on: (data, dataCallBack) => dataCallBack(Buffer.from('<html>403</html>', 'utf8')),
      statusCode: 403
    }));

    let actualError;
    try {
      await smallImprovementsClient.GetEmail(mockEmail, token);
    } catch (e) {
      actualError = e;
    }

    expect(actualError).toStrictEqual(new Error('Could not get email: 403'));
  });
});
