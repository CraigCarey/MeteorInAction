// Only executed when the server starts
Meteor.startup(function () {

    // Check if collection is empty
    if (HousesCollection.find().count() === 0) {

        // Define all fixtures as array elements
        var houses = [{
            name: 'Stephan',
            plants: [
                {color: "red", instructions: "3 pots/week"},
                {color: "white", instructions: "keep humid"}
            ]
        }];

        // Insert all objects from the houses array into the database
        while (houses.length > 0) {
            HousesCollection.insert(houses.pop());
        }

        console.log("Added fixtures");
    }
});
