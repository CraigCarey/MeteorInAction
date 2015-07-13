// called every time a new user is created and enables you to control the content of new user documents
Accounts.onCreateUser(function (options, user) {

    // no profile with username/email, but provided by facebook / twitter OAuth
    if (options.profile) {
        user.profile = options.profile;
    }
    else {
        // add as a blank object, so we can add our own profile fields
        user.profile = {};
    }
    user.profile.rank = "White belt";
    return user;
}); 