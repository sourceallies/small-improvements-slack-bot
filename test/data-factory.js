const defaultNewStatus = {
  color: '#2ecd72',
  description: 'Achieved',
  status: 100
};

exports.createActivity = (activityProps, objectiveProps, newStatus = defaultNewStatus) => {
  return {
    actor: {
      firstName: 'Developer'
    },
    occurredAt: 1651856682326,
    change: {
      newStatus,
      oldStatus: {
        color: '#eee',
        description: 'Open',
        status: 0
      }
    },
    id: 'w02bdXSdzFNre*n3plJOgQ',
    type: 'OBJECTIVE_STATUS_CHANGED',
    targets: [
      {
        firstName: 'Developer'
      }
    ],
    content: {
      cycle: {
        id: 'E0hlMiEuRi7T7Md8PWy1uQ',
        name: 'Objective Cycle 2022'
      },
      objective: {
        id: 'w02bdXSdzFNre*n3plJkll',
        icon: 'o_3goldstars',
        title: 'Objective Title',
        description: '<!--MARKUP_VERSION:v3--><p>Description</p>',
        dueDate: '2022-06-30T05:00:00.000Z',
        owner: {
          firstName: 'Developer',
          id: 'V*jArA9pQbaK0U7grc9frw',
          email: 'rappling@sourceallies.com'
        },
        visibility: 'PUBLIC',
        visibleTo: [],
        ...objectiveProps
      }
    },
    ...activityProps
  };
};
