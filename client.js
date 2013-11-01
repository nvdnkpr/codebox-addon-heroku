define([], function() {
    var commands = require("core/commands");
    var settings = require("utils/settings");

    // Add settings page
    settings.add({
        'namespace': "heroku",
        'section': "deployment",
        'title': "Heroku",
        'fields': {
            'key': {
                'label': "Key",
                'type': "text",
                "help": "You can find your api key in your settings Heroku.",
                "default": ""
            }
        }
    });

    // Add opening command
    commands.register("deploy.heroku", {
        title: "Deploy to Heroku",
        icon: "cloud"
    }, function(args) {
        
    });
});