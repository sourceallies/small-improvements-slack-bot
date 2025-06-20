const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;

/*
  Achieved status == 100
  Partially achieved status == 103
*/
function filterActivities(activities, eventDate) {
  const allActivities = activities.items.flatMap(i => i.items || [])
    .flatMap(i => i.activities || []);
  const recentPublicActivitesCreatedOrChanged = allActivities.filter(a => a.type === 'OBJECTIVE_STATUS_CHANGED' || a.type === 'OBJECTIVE_CREATED')
    .filter(a => a.content.objective.visibility === 'PUBLIC')
    .filter(a => a.occurredAt >= eventDate.getTime() - threeDaysInMillis);
  const reducer = (acc, activity) => {
    acc[activity.content.objective.id] = acc[activity.content.objective.id] || [];
    acc[activity.content.objective.id].push(activity);
    return acc;
  };
  const groupedObjectivesCreated = recentPublicActivitesCreatedOrChanged.filter(a => a.type === 'OBJECTIVE_CREATED')
    .reduce(reducer, {});
  const groupedObjectiveStatusChanges = recentPublicActivitesCreatedOrChanged.filter(a => a.type === 'OBJECTIVE_STATUS_CHANGED')
    .reduce(reducer, {});

  return {
    completed: Object.entries(groupedObjectiveStatusChanges)
      .flatMap(([objectiveId, activities]) => {
        const mostRecentObjectiveChange = activities.sort((a, b) => b.occurredAt - a.occurredAt)[0];
        if (mostRecentObjectiveChange.change.newStatus.status === 100 || mostRecentObjectiveChange.change.newStatus.status === 103) {
          return [mostRecentObjectiveChange];
        }
        return [];
      }),
    created: Object.entries(groupedObjectivesCreated)
      .flatMap(([objectiveId, activities]) => {
        return [activities.sort((a, b) => b.occurredAt - a.occurredAt)[0]];
      })
  };
}

exports.filterActivities = filterActivities;
