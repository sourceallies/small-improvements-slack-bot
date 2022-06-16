const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;

/*
  Achieved status == 100
  Partially achieved status == 103
*/
function filterActivities(activities, eventDate) {
  const publicObjectiveStatusChanges = activities.items.flatMap(i => i.items)
    .flatMap(i => i.activities)
    .filter(a => a.type === 'OBJECTIVE_STATUS_CHANGED')
    .filter(a => a.content.objective.visibility === 'PUBLIC')
    .filter(a => a.occurredAt >= eventDate.getTime() - threeDaysInMillis);

  const groupedObjectiveStatusChanges = publicObjectiveStatusChanges.reduce((acc, activity) => {
    acc[activity.content.objective.id] = acc[activity.content.objective.id] || [];
    acc[activity.content.objective.id].push(activity);
    return acc;
  }, {});

  return Object.entries(groupedObjectiveStatusChanges)
    .flatMap(([objectiveId, activities]) => {
      const mostRecentObjectiveChange = activities.sort((a, b) => b.occurredAt - a.occurredAt)[0];
      if (mostRecentObjectiveChange.change.newStatus.status === 100 || mostRecentObjectiveChange.change.newStatus.status === 103) {
        return [mostRecentObjectiveChange];
      }
      return [];
    });
}

exports.filterActivities = filterActivities;
