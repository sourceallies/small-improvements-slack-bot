const smallImprovementsClient = require('../src/small-improvements');// request
require('https');
const apiResponseBody = `{
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

jest.mock('https', () => ({
  ...jest.requireActual('https'), // import and retain the original functionalities
  request: (postOption, callback) => callback({
    on: (data, callback) => callback(Buffer.from(apiResponseBody, 'utf8')),
    statusCode: 200,
    statusMessage: 'API Success'
  }),
  on: jest.fn(),
  write: jest.fn(),
  end: jest.fn()
}));

describe('small-improvements', () => {
  let token, activitiesBody;
  beforeEach(() => {
    token = 'token';
    activitiesBody = apiResponseBody;
  });
  test('Should get objectives', async () => {
    const response = await smallImprovementsClient.getObjectives(token);
    expect('items' in response).toEqual('items' in JSON.parse(activitiesBody));
  });
});
