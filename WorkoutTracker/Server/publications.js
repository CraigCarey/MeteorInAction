// Publications are one-way streets that send data from the server to the client
// publications are named the same as subscriptions
Meteor.publish('workouts', function () {
    // publications return data, same as helpers
    return WorkoutsCollection.find({});
});