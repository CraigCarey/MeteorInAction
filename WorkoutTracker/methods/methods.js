// methods in a folder accessible by both client and server are called on each when invoked
// on the client, it is just a simulation, this assists with latency compensation
// on the server, it's called for reals, yo
Meteor.methods({
    'CreateWorkout': function (data) {

        // check is used to restrict the data used in the method call
        check(data, {
            distance: Number
        });

        var distance = data.distance;
        // validate the distance before storing it
        if (distance <= 0 || distance > 45) {
            // Meteor.Error is like a normal Javascript error, but is automatically populated on the client
            throw new Meteor.Error('Invalid distance');
        }

        // userId of the currently logged-in user is accessed via this in a method.
        if (!this.userId) {
            throw new Meteor.Error('You have to login');
        }

        data.workoutAt = new Date();
        data.type = 'jogging';
        data.userId = this.userId;

        // save the data in the collection
        return WorkoutsCollection.insert(data);
    }
});