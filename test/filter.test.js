const filter = require('../src/filter');
const dataFactory = require('./data-factory');

describe('filter activities', () => {
  let activities,
    eventDateString,
    objectiveId;

  beforeEach(() => {
    objectiveId = 'objective-id';
    eventDateString = '2022-06-02T00:00:00Z';

    activities = {
      items: [
        {
          occurredAt: 1654612581248,
          id: 'w02bdXSdzFNre*n3plJOgQ-dUe9W56cXrlucbz4FEV0sw-1k05OwEVexvYONuBmTRcrw-kEFnd6Mqw567tefzzM8Gmg-tUOq3XodR8jeSc6izL1qpg',
          items: [
            {
              occurredAt: 1651856682326,
              activities: [
                dataFactory.createActivity(
                  { occurredAt: new Date(eventDateString).getTime() - (60 * 1000) },
                  { id: objectiveId }
                )
              ]
            }
          ]
        }
      ]
    };
  });

  test('should ignore items with no items', () => {
    activities.items.push({});

    const result = filter.filterActivities(activities, new Date(eventDateString));

    expect(result).toHaveLength(1);
  });

  test('should ignore items with no activities', () => {
    activities.items.push({
      items: [{}]
    });

    const result = filter.filterActivities(activities, new Date(eventDateString));

    expect(result).toHaveLength(1);
  });

  test('should remove activity with status change to in progress', () => {
    activities.items[0].items[0].activities[0].change.newStatus = {
      color: '#eee',
      description: 'In Progress',
      status: 1
    };

    const result = filter.filterActivities(activities, new Date(eventDateString));

    expect(result).toHaveLength(0);
  });

  test('should remove private objectives', () => {
    activities.items[0].items[0].activities[0].content.objective.visibility = 'PRIVATE';

    const result = filter.filterActivities(activities, new Date(eventDateString));

    expect(result).toHaveLength(0);
  });

  test('should remove old objective changes', () => {
    activities.items[0].items[0].activities[0].occurredAt = new Date(eventDateString).getTime() - (3 * 24 * 60 * 60 * 1000) - 1;

    const result = filter.filterActivities(activities, new Date(eventDateString));

    expect(result).toHaveLength(0);
  });

  test('should keep objective when most recent activity is achieved', () => {
    const pastTime = activities.items[0].items[0].activities[0].occurredAt - (2 * 60 * 1000);

    activities.items.push({
      occurredAt: 1654612581248,
      id: 'w02bdXSdzFNre*n3plJOgQ-dUe9W56cXrlucbz4FEV0sw-jlfewnsjjdfslkfwqew',
      items: [
        {
          occurredAt: 1651856682326,
          activities: [
            dataFactory.createActivity(
              { occurredAt: pastTime },
              { id: objectiveId },
              {
                color: '#2ecd72',
                description: 'In Progress',
                status: 1
              }
            )
          ]
        }
      ]
    });

    const result = filter.filterActivities(activities, new Date(eventDateString));

    expect(result).toHaveLength(1);
  });

  test('should remove objective when most recent activity is not achieved or partially achieved', () => {
    const futureTime = activities.items[0].items[0].activities[0].occurredAt + (60 * 1000);

    activities.items.push({
      occurredAt: 1654612581248,
      id: 'w02bdXSdzFNre*n3plJOgQ-dUe9W56cXrlucbz4FEV0sw-jlfewnsjjdfslkfwqew',
      items: [
        {
          occurredAt: 1651856682326,
          activities: [
            dataFactory.createActivity(
              { occurredAt: futureTime },
              { id: objectiveId },
              {
                color: '#2ecd72',
                description: 'In Progress',
                status: 1
              }
            )
          ]
        }
      ]
    });

    const result = filter.filterActivities(activities, new Date(eventDateString));

    expect(result).toHaveLength(0);
  });
});
