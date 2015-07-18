// gets data from custom aggregation publication
DistanceByMonth = new Mongo.Collection('distanceByMonth');

// For the limit parameter of the subscription, a Session variable with a default value of 10 is initialised first
Session.setDefault('limit', 10);

// Autorun creates a reactive context that renews the subscription if the limit changes.
Tracker.autorun(function(computation)
{
    // subscribe to the publication of the same name (in server/publications.js)
    Meteor.subscribe('workouts', {
        // the session object is passed as the value for limit
        limit: Session.get('limit')
    });
});

// event handler to increase the limit by 10
Template.workoutList.events({
    'click button.show-more': function(evt, tpl)
    {
        var newLimit = Session.get('limit') + 10;
        // changing the limit in the reactive session variable will update the subscription automatically
        Session.set('limit', newLimit);
    }
});

Template.addWorkout.events({
    'submit form': function (evt, tpl) {
        evt.preventDefault();

        // Use jQuery to extract the data from the distance input field and make it an integer
        var distance = parseInt(tpl.$('input[name="distance"]').val());

        // call a shared method by name, and optional parameters
        Meteor.call('CreateWorkout', {
            distance: distance
        },
        // passed in a callback for return values or errors
        function (error, result) {
            if (error) return alert('Error: ' + error.error);
        });
    }
});