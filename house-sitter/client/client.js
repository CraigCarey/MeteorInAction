// 'null' or nameless Mongo collections are local only
LocalHouse = new Mongo.Collection(null);

// default object, used to define the structure of a db entry
var newHouse = {
    name: '',
    plants: [],
    lastsave: 'never',
    status: 'unsaved'
};

Session.setDefault('selectedHouseId', '');

// Dependent on Session "selectedHouse" variable, will run automatically on changes
Tracker.autorun(function() {
    console.log("The selectedHouse ID is: " +
        Session.get("selectedHouse")
    );
});

// global helper, so selectedHouse accessible from all templates
Template.registerHelper('selectedHouse', function () {
    return LocalHouse.findOne(Session.get('selectedHouseId'));
});

// global helper that takes a list and returns it with an index attribute
Template.registerHelper('withIndex', function (list) {

    // Underscore.js’s map function is used to iterate over a list
    var withIndex = _.map(list, function (v, i) {
        if (v === null) return;
        v.index = i;
        return v;
    });
    return withIndex;
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

        var selectedId = evt.currentTarget.value;

        // Insert a new doc or update if the _id exists
        var newId = LocalHouse.upsert(
            selectedId,
            // If no document was found, set reactiveHouseObject to the newHouse object
            HousesCollection.findOne(selectedId) || newHouse
        ).insertedId;

        // If no insert took place you can use selectedId directly
        if (!newId) newId = selectedId;

        Session.set('selectedHouseId', newId);

    }
};

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

    // updates house-name on each change
    'keyup input#house-name': function (evt) {
        evt.preventDefault();
        var modifier = {$set: {'name': evt.currentTarget.value}};
        updateLocalHouse(Session.get('selectedHouseId'), modifier);
    },

    'click button.addPlant': function (evt) {
        evt.preventDefault();
        var newPlant = {color: '', instructions: ''};
        var modifier = {$push: {'plants': newPlant}};
        updateLocalHouse(Session.get('selectedHouseId'), modifier);
    },

    'click button#saveHouse': function (evt) {
        // suppress page's default submit behaviour
        evt.preventDefault();

        var id = Session.get('selectedHouseId');
        var modifier = {$set: {'lastsave': new Date()}};
        updateLocalHouse(id, modifier);
        // persist house document in remote db
        HousesCollection.upsert(
            {_id: id},
            LocalHouse.findOne(id)
        );
    }
});


// called for both color and instructions fields changes
Template.plantFieldset.events({
    'keyup input.color, keyup input.instructions': function (evt) {
        evt.preventDefault();
        var index = evt.target.getAttribute('data-index');
        var field = evt.target.getAttribute('class');

        // concat the exact identifier for the plant and property, i.e. plants.1.color
        var plantProperty = 'plants.' + index + '.' + field;
        var modifier = {$set: {}};

        // Assign the new value using bracket notation
        modifier['$set'][plantProperty] = evt.target.value;
        // perform the update
        updateLocalHouse(Session.get('selectedHouseId'), modifier);
    },

    'click button.removePlant': function (evt) {
        evt.preventDefault();
        var index = evt.target.getAttribute('data-index');

        // get array of plants from parent template (1 level up is default)
        var plants = Template.parentData(1).plants;

        // js splice can be used to remove elements, in this case remove 1 element at index 'index'
        plants.splice(index, 1);
        var modifier = {$set: {'plants': plants}};
        updateLocalHouse(Session.get('selectedHouseId'), modifier);
    },
});

updateLocalHouse = function (id, modifier) {
    LocalHouse.update(
        {
            '_id': id
        },
        modifier
    );
};