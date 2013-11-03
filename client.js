define([], function() {
    var commands = require("core/commands");
    var settings = require("utils/settings");
    var api = require("core/api");

    // Add settings page
    settings.add({
        'namespace': "heroku",
        'section': "deployment",
        'title': "Heroku",
        'fields': {
            'key': {
                'label': "Key",
                'type': "text",
                'help': "You can find your api key in your settings Heroku.",
                'default': ""
            },
            'regenerate': {
                'label': "",
                'type': "action",
                'content': "Authorize SSH key on Heroku",
                'help': "Save your settings before authorizing to Heroku.",
                'trigger': function() {
                    return api.rpc("/heroku/update");
                }
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