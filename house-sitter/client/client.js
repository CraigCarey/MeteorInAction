// Dependent on Session "selectedHouse" variable, will run automatically on changes
Tracker.autorun(function() {
    console.log("The selectedHouse ID is: " +
        Session.get("selectedHouse")
    );
});

Template.selectHouse.helpers({

    // anything defined in a template is reactive
    housesNameId: function () {
        // return the name and _id fields for all documents in collection
        return HousesCollection.find({}, {fields: {name: 1, _id: 1} });
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

Template.showHouse.helpers({
    // Return full document based on Session variable "selectedHouse"
    house: function () {
        return HousesCollection.findOne({
            _id: Session.get("selectedHouse")
        });
    }
});

Template.plantDetails.helpers({
    // disable button when a plant has been watered
    isWatered: function () {
        // plantId is derived from the data-id
        var plantId = Session.get("selectedHouse") + '-' + this.color;
        return Session.get(plantId) ? 'disabled' : '';
    }
});

Template.plantDetails.events({
    'click button.water': function (evt) {
        // data-id is a unique, template generated ID for each color of plant in a house
        var plantId = $(evt.currentTarget).attr('data-id');
        Session.set(plantId, true);
    }
});