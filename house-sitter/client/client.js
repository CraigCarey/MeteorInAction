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

Template.showHouse.events({
    'click button#delete': function (evt) {
        // 'this' is the current data context: the selected house document
        var id = this._id;
        // show a confirmation dialog
        var deleteConfirmation = confirm("Really delete this house?");
        if (deleteConfirmation) {
            // removes the document from both client and server
            HousesCollection.remove(id);
        }
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

        // insert current timestamp
        var lastvisit = new Date();

        // Since calling from the client, can only update a single _id
        HousesCollection.update({_id: Session.get("selectedHouse")},{$set: {lastvisit:lastvisit }});
    }
});

Template.houseForm.events({
    'click button#saveHouse': function (evt) {
        // suppress page's default submit behaviour
        evt.preventDefault();

        // Use jQuery to retrieve input field values and put them in local variables
        var houseName = $('input[id=house-name]').val();
        var plantColor = $('input[id=plant-color]').val();
        var plantInstructions = $('input[id=plant-instructions]').val();
        Session.set('selectedHouseId', HousesCollection.insert({
            name: houseName,
            plants: [{
                color: plantColor,
                instructions: plantInstructions
            }]
        }));
        // clear the form
        $('input').val('');
    }
});