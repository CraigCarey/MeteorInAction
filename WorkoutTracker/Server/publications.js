// Publications are one-way streets that send data from the server to the client
// publications are named the same as subscriptions
Meteor.publish('workouts', function(options)
{
    // validate the options object parameter, since it is coming from the client
    check(options,
        {
            // ensure that the limit part of options is a number
            limit: Number
        }
    );

    // query for all workouts that belong to the curretly logged in user
    var qry = {
        userId: this.userId
    };

    var qryOptions = {
        limit: options.limit,

        // Sort all database entries by timestamp to ensure the limit starts from the newest
        sort: {workoutAt: 1}
    }

    // Using the limit query options from MongoDB returns only a limited number of documents
    return WorkoutsCollection.find(qry, qryOptions);
});


Meteor.publish('distanceByMonth', function ()
{
    var subscription = this;
    // used to prevent the first docs from the initial subscription from affecting the added callback
    var initiated = false;
    var distances = {};
    var userId = this.userId;

    // Because there’s no official support for aggregation from Meteor, use the core Mongo driver
    var db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

    // The aggregation settings create documents with the _id field equal to the month of the workoutAt field
    // and the sum of all distances of this month.
    var pipeline = [
        {
            // The aggregation should only be done over documents that match the userId
            $match: { userId: userId }
        },
        {
        $group: {
            _id: {
                $month: '$workoutAt'
            },
            distance: {
                $sum: '$distance'
            }
        }
    }];

    // Creating the aggregation
    db.collection('workouts').aggregate(
        pipeline,
        // Because you can’t use asynchronous code in a publication, use Meteor.bindEnvironment
        Meteor.bindEnvironment(
            function (err, result) {
                console.log('result', result);
                _.each(result, function (r) {
                    // Add the data to the subscription
                    subscription.added('distanceByMonth', r._id, {
                        distance: r.distance
                    });
                })
            }
        )
    )

    var workoutHandle = WorkoutsCollection
        // In this publication there should only the documents with the logged in userId observed
        .find({
            userId: userId
        })
        .observeChanges({
            added: function (id, fields) {
                if (!initiated) return;

                // create the id of the document (jan = 1...)
                idByMonth = new Date(fields.workoutAt).getMonth() + 1;

                // update the month for which a new workout was added
                distances[idByMonth] += fields.distance;

                // inform the client that the subscription has changed
                subscription.changed('distanceByMonth',
                    idByMonth, {
                        distance: distances[idByMonth]
                    }
                )
            }
        });

    initiated = true;

    // onStop callback fired when the clients subscription is closed
    subscription.onStop(function () {
        // The handle that’s returned from the observerChanges() function is used to stop observing.
        workoutHandle.stop();
    });

    // the subscription is ready to send to the client
    subscription.ready();
});