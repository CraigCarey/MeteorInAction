Meteor.startup(function () {

    // Simple Mail Transfer Protocol
    smtp = {
        username: 'blah@gmail.com',
        password: 'blahblahblah',
        server: 'smtp.gmail.com',
        port: 587
    };

process.env.MAIL_URL = 'smtp://' +
    encodeURIComponent(smtp.username) + ':' +
    encodeURIComponent(smtp.password) + '@' +
    encodeURIComponent(smtp.server) + ':' +
    smtp.port;
}); 