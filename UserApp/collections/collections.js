MessagesCollection = new Mongo.Collection("messages");

// only 1 allow needs to return true to allow
MessagesCollection.allow({

    insert: function (userId, doc) {
        return userId;
    },

    update: function (userId, doc) {
        return true;
    },

    remove: function (userId, doc) {
        return true;
    }
});

// only 1 deny needs to return true for denial to happen
MessagesCollection.deny({

    // validate fields before allowing input
    insert: function (userId, doc) {

        // use underscoreJS to put all document field names into an aray
        var fieldsInDoc = _.keys(doc);
        var validFields = ['sender', 'recipient', 'timestamp', 'message', '_id'];

        // check for valid or missing fields
        if (_.difference(fieldsInDoc, validFields).length > 0) {
            console.log("additional fields found");
            return true;
        }
        else {
            console.log("all fields good");
            return false
        }
    },

    // only allow the recipient to remove messages
    // userId provided by the accounts packages directly, not possible to change this value from the browser console
    remove: function (userId, doc) {
        return doc.recipient !== userId;
    }
});

// allow users to delete their own accounts
Meteor.users.allow({
    remove: function (userId, doc) {
        return doc._id === userId;
    }
});