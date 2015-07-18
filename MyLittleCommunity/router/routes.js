// defines a path and associates it with a function to call if the URL matches ths path
Router.route('/', function()
{
    // renders the specified template
    this.render('home');
});

Router.route('/about', function()
{
    this.render('about');
});

Router.route('/profiles/manuel', function()
{
    // sets a layout
    this.layout('profileLayout');
    // The layout template is used to render the specified profileDetail template
    this.render('profileDetail');
});