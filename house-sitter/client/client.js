Template.selectHouse.helpers({

    // anything defined in a template is reactive
    housesNameId: function () {
        // return all documents from collection (for now)
        return HousesCollection.find({}, {});
    },

    isSelected: function () {
        // return selected if the _id for the currently processed house is the same as that in the session
        return Session.equals('selectedHouse', this._id) ? 'selected' : '';
    }
});

Template.selectHouse.events = {

    // need to pass the event as an argument so the function can access the selection value
    'change #selectHouse': function (evt) {

        // selectedHouse is a Session variable used to store the current dropdown selection
        Session.set("selectedHouse", evt.currentTarget.value);
    }
};